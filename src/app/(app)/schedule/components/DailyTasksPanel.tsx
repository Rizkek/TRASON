'use client';

import React, { useState } from 'react';
import { Loading } from '@/components';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { sanitizeError } from '@/libs/validation';
import { Plus, Trash as Trash2, CheckSquare, Square, ListChecks, ArrowCounterClockwise } from '@phosphor-icons/react';

interface DailyTasksPanelProps {
  locale: string;
  tasks: Array<{ id: string; title: string; completed_today: boolean }>;
  isTasksLoading: boolean;
  completedCount: number;
  totalCount: number;
  pendingToggleIds: Set<string>;
  pendingDeleteIds: Set<string>;
  createTask: (data: { title: string; description?: string; category?: string }) => Promise<any>;
  toggleTask: (id: string, completed: boolean) => Promise<any>;
  deleteTask: (id: string) => Promise<any>;
}

export function DailyTasksPanel({
  locale,
  tasks,
  isTasksLoading,
  completedCount,
  totalCount,
  pendingToggleIds,
  pendingDeleteIds,
  createTask,
  toggleTask,
  deleteTask,
}: DailyTasksPanelProps) {
  const { t } = useTranslation();
  const [newTaskInput, setNewTaskInput] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTaskInput.trim();
    if (!title || isAddingTask) return;
    setIsAddingTask(true);
    setTaskError(null);
    try {
      await createTask({ title, description: undefined, category: undefined });
      setNewTaskInput('');
    } catch (err) {
      setTaskError(sanitizeError(err));
    } finally {
      setIsAddingTask(false);
    }
  };

  return (
    <div className="glass rounded-xl border border-black/[0.05] dark:border-white/[0.05] overflow-hidden">
      {/* Checklist Header */}
      <div className="flex items-center justify-between px-xl py-lg border-b border-black/[0.05] dark:border-white/[0.05] bg-gray-strong/40">
        <div className="space-y-xs">
          <h2 className="text-sm font-bold text-soft-cream uppercase tracking-widest flex items-center gap-sm">
            <ListChecks size={15} className="text-primary" />
            {new Date().toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' })}
          </h2>
          {totalCount > 0 && (
            <div className="flex items-center gap-sm">
              <div className="flex-1 h-1.5 bg-black/[0.05] dark:bg-white/[0.05] rounded-full overflow-hidden" style={{ width: '120px' }}>
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                  style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-light">
                {completedCount === totalCount && totalCount > 0
                  ? `🎉 ${t('timeline_page.all_done')}`
                  : `${completedCount} of ${totalCount}`}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-sm text-[9px] text-gray-light opacity-50">
          <ArrowCounterClockwise size={11} />
          {t('timeline_page.resets_midnight')}
        </div>
      </div>

      {/* Add Task Input */}
      <div className="px-xl py-lg border-b border-black/[0.05] dark:border-white/[0.05]">
        <form onSubmit={handleAddTask} className="flex gap-sm">
          <input
            value={newTaskInput}
            onChange={(e) => setNewTaskInput(e.target.value)}
            placeholder={t('timeline_page.add_task_placeholder')}
            disabled={isAddingTask}
            className="flex-1 bg-gray-strong/40 border border-black/5 dark:border-white/5 rounded-md px-lg py-sm text-sm text-soft-cream placeholder-gray-light/40 focus:border-primary focus:outline-none transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!newTaskInput.trim() || isAddingTask}
            className="flex items-center gap-sm px-lg py-sm bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary rounded-md text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus size={14} />
            {t('timeline_page.add')}
          </button>
        </form>
        {taskError && <p className="text-[11px] text-expense mt-sm">{taskError}</p>}
      </div>

      {/* Task List */}
      <div className="divide-y divide-white/[0.03]">
        {isTasksLoading ? (
          <div className="flex justify-center py-2xl">
            <Loading />
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center py-3xl gap-md text-center px-xl">
            <ListChecks size={40} className="text-gray-light opacity-20" />
            <p className="text-sm text-gray-light opacity-60 font-light italic">
              {t('dailyTasks.empty')}
            </p>
            <p className="text-[10px] text-gray-light opacity-40">
              {t('timeline_page.resets_midnight')}
            </p>
          </div>
        ) : (
          tasks.map((task) => {
            const isToggling = pendingToggleIds.has(task.id);
            const isDeleting = pendingDeleteIds.has(task.id);
            return (
              <div
                key={task.id}
                className={`flex items-center gap-lg px-xl py-lg group transition-all hover:bg-black/[0.01] dark:bg-white/[0.01] ${
                  task.completed_today ? 'opacity-60' : ''
                } ${isDeleting ? 'opacity-30 pointer-events-none' : ''}`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleTask(task.id, !task.completed_today)}
                  disabled={isToggling || isDeleting}
                  className={`flex-shrink-0 transition-all ${
                    task.completed_today ? 'text-income' : 'text-gray-light hover:text-primary'
                  } ${isToggling ? 'opacity-50 cursor-wait' : ''}`}
                  aria-label={task.completed_today ? 'Mark as not done' : 'Mark as done'}
                >
                  {task.completed_today ? (
                    <CheckSquare size={20} className="drop-shadow-[0_0_6px_rgba(0,200,100,0.4)]" />
                  ) : (
                    <Square size={20} />
                  )}
                </button>

                {/* Title */}
                <span
                  className={`flex-1 text-sm transition-all ${
                    task.completed_today ? 'line-through text-gray-light' : 'text-soft-cream'
                  }`}
                >
                  {task.title}
                </span>

                {/* Delete (hover) */}
                <button
                  onClick={() => deleteTask(task.id)}
                  disabled={isDeleting || isToggling}
                  className={`opacity-0 group-hover:opacity-100 text-gray-light hover:text-expense transition-all p-sm ${
                    isDeleting ? 'opacity-50 cursor-wait' : ''
                  }`}
                  aria-label={`Delete ${task.title}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
