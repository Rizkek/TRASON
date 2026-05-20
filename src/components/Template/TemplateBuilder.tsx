'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Card, Modal, Loading } from '@/components';
import { useWeeklyTemplate, useTemplateActivities } from '@/hooks/useWeeklyTemplate';
import { TemplateActivity } from '@/types/database';
import { getDayName, formatTime, formatDuration, getCategoryIcon } from '@/libs/template';
import { Plus, Trash2, Edit2, X } from 'lucide-react';

interface TemplateBuilderProps {
  templateId?: string;
  onClose?: () => void;
}

const CATEGORIES = ['Work', 'Study', 'Exercise', 'Meals', 'Social', 'Rest', 'Personal', 'Other'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TemplateBuilder({ templateId, onClose }: TemplateBuilderProps) {
  const { templates, createTemplate, updateTemplate } = useWeeklyTemplate();
  const [createdTemplateId, setCreatedTemplateId] = useState<string | undefined>();
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');

  const activeTemplateId = templateId || createdTemplateId;
  const isCreating = !activeTemplateId;
  const current = templates.find((t) => t.id === activeTemplateId);

  useEffect(() => {
    if (current) {
      setTemplateName(current.name);
      setTemplateDesc(current.description || '');
    }
  }, [current]);

  const handleCreate = async () => {
    if (!templateName.trim()) return;
    const created = await createTemplate(templateName, templateDesc);
    if (created) {
      setCreatedTemplateId(created.id);
      setTemplateName(created.name);
      setTemplateDesc(created.description || '');
    }
  };

  const handleUpdate = async () => {
    if (!activeTemplateId || !templateName.trim()) return;
    await updateTemplate(activeTemplateId, {
      name: templateName,
      description: templateDesc,
    });
    onClose?.();
  };

  return (
    <div className="space-y-6">
      {/* Template Info */}
      <Card>
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-soft-cream">Weekly Routine</h3>
            <p className="text-sm text-gray-light">
              This is your default weekly plan. Reminders are layered on top of it in the weekly schedule.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-light mb-1">Routine Name</label>
            <Input
              placeholder="e.g., Workweek Routine"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-light mb-1">Notes</label>
            <Input
              placeholder="Optional context for this routine"
              value={templateDesc}
              onChange={(e) => setTemplateDesc(e.target.value)}
            />
          </div>

          <Button onClick={isCreating ? handleCreate : handleUpdate} className="w-full">
            {isCreating ? 'Create Weekly Routine' : 'Save Routine Details'}
          </Button>
        </div>
      </Card>

      {/* Activities */}
      {!isCreating && activeTemplateId && (
        <TemplateActivitiesEditor templateId={activeTemplateId} />
      )}
    </div>
  );
}

function TemplateActivitiesEditor({ templateId }: { templateId: string }) {
  const { activities, isLoading, createActivity, updateActivity, deleteActivity } =
    useTemplateActivities(templateId);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<TemplateActivity>>({
    day_of_week: 1,
    start_time: '09:00:00',
    duration_minutes: 60,
    title: '',
    category: 'Work',
  });

  const resetForm = () => {
    setForm({
      day_of_week: 1,
      start_time: '09:00:00',
      duration_minutes: 60,
      title: '',
      category: 'Work',
    });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!form.title?.trim()) return;

    const data = {
      ...form,
      weekly_template_id: templateId,
    } as Omit<TemplateActivity, 'id' | 'created_at' | 'updated_at'>;

    if (editingId) {
      await updateActivity(editingId, form);
    } else {
      await createActivity(data);
    }

    resetForm();
    setShowForm(false);
  };

  const handleEdit = (activity: TemplateActivity) => {
    setForm(activity);
    setEditingId(activity.id);
    setShowForm(true);
  };

  if (isLoading) return <Loading />;

  // Group by day
  const byDay: Record<number, TemplateActivity[]> = {};
  for (let i = 0; i <= 6; i++) {
    byDay[i] = activities.filter((a) => a.day_of_week === i);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Default Weekly Plan</h3>
          <p className="text-sm text-gray-light">
            Add the activities that normally repeat each week.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Routine Activity
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <Modal
          isOpen={showForm}
          title={editingId ? 'Edit Routine Activity' : 'Add Routine Activity'}
          onClose={() => {
            setShowForm(false);
            resetForm();
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
              <select
                value={form.day_of_week || 1}
                onChange={(e) => setForm({ ...form, day_of_week: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DAY_NAMES.map((day, i) => (
                  <option key={i} value={i}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <Input
                placeholder="Activity title"
                value={form.title || ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={(form.start_time || '09:00').slice(0, 5)}
                  onChange={(e) => setForm({ ...form, start_time: `${e.target.value}:00` })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                <Input
                  type="number"
                  value={form.duration_minutes || 60}
                  onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) })}
                  min="15"
                  step="15"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={form.category || 'Work'}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Input
                placeholder="Optional description"
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                {editingId ? 'Update' : 'Create'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Day Sections */}
      <div className="space-y-4">
        {DAY_NAMES.map((dayName, dayNum) => {
          const dayActivities = byDay[dayNum];

          return (
            <Card key={dayNum}>
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3">{dayName}</h4>

                {dayActivities.length === 0 ? (
                  <p className="text-sm text-gray-500">No activities</p>
                ) : (
                  <div className="space-y-2">
                    {dayActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {getCategoryIcon(activity.category)} {activity.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTime(activity.start_time)} - {formatDuration(activity.duration_minutes)}
                          </p>
                        </div>

                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(activity)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Edit2 className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => deleteActivity(activity.id)}
                            className="p-1 hover:bg-red-200 rounded"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
