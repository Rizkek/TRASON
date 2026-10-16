'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlass as Search, PaperPlaneRight } from '@phosphor-icons/react';
import { getLocalISODate } from '@/libs/format';
import { ApiError } from '@/libs/apiErrors';
import { 
  createTransactionWithInvalidation,
  createActivityWithInvalidation,
  createReminderWithInvalidation
} from '@/libs/mutations';

export function SmartInput() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setResult(data);
    } catch (error) {
      console.error(error);
      setResult({ error: 'Failed to process input. Try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!result || result.action !== 'create' || !result.data) return;

    try {
      setIsLoading(true);
      
      if (result.type === 'transaction') {
        await createTransactionWithInvalidation({
          title: result.data.title || 'Untitled Transaction',
          amount: result.data.amount || 0,
          type: result.data.transactionType || 'expense',
          date: result.data.date || getLocalISODate(),
          category_id: null as any,
          time: '00:00:00',
          payment_method: 'cash',
          tags: []
        });
      } else if (result.type === 'activity') {
        await createActivityWithInvalidation({
          title: result.data.title || 'Untitled Activity',
          category: result.data.activityCategory || 'general',
          duration_minutes: result.data.durationMinutes || 0,
          start_time: result.data.startTime || new Date().toISOString(),
          tags: []
        }, result.data.date || getLocalISODate());
      } else if (result.type === 'reminder') {
        const datePart = result.data.date || getLocalISODate();
        const timePart = result.data.dueTime || '00:00:00';
        await createReminderWithInvalidation({
          title: result.data.title || 'Untitled Reminder',
          priority: result.data.priority || 'medium',
          due_date: datePart,
          due_time: timePart,
          due_datetime: result.data.dueDatetime || new Date(`${datePart}T${timePart}`).toISOString(),
          status: 'pending',
          is_recurring: false,
          tags: []
        });
      } else {
        throw new Error('Unsupported item type.');
      }
      
      setIsOpen(false);
      setInput('');
      setResult(null);
    } catch (error) {
      console.error('Failed to save:', error);
      const message =
        error instanceof ApiError && error.code === 'REMINDER_PAST_DUE'
          ? 'That time has already passed. Add a later date or time, for example "tomorrow at 9".'
          : 'Failed to save to database.';
      setResult({ ...result, error: message });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[20vh]">
      <div className="bg-surface border border-foreground/10 w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col">
        
        <form onSubmit={handleSubmit} className="relative flex items-center p-4 border-b border-foreground/10">
          <Search className="absolute left-6 text-muted-foreground" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type 'Spent $15 on lunch' or 'Remind me to run tomorrow'..."
            className="w-full bg-transparent text-foreground text-lg pl-16 pr-8 py-4 focus:outline-none placeholder-muted-foreground/50"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            aria-busy={isLoading}
            className="absolute right-6 text-primary hover:text-foreground disabled:opacity-50"
          >
            <PaperPlaneRight size={20} />
          </button>
        </form>

        {result && !result.error && (
          <div className="p-8 bg-background/60">
            <p className="text-sm text-muted-foreground mb-4">{result.message}</p>
            
            {result.data && (
              <div className="bg-foreground/5 rounded-lg p-4 mb-4 font-mono text-xs text-foreground/80">
                {JSON.stringify(result.data, null, 2)}
              </div>
            )}

            {result.confidence > 0.7 && result.action === 'create' && (
              <div className="flex justify-end gap-4 mt-6">
                <button 
                  onClick={() => setResult(null)} 
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm bg-primary text-on-primary font-semibold rounded hover:opacity-90 disabled:opacity-50"
                >
                  Confirm & Save
                </button>
              </div>
            )}
          </div>
        )}
        
        {result?.error && (
          <div className="p-8 bg-danger/10 text-danger text-sm">
            {result.error}
          </div>
        )}
        
        <div className="p-4 text-xs text-muted-foreground/40 flex justify-between bg-background/80">
          <span>Smart Input Engine (Powered by AI)</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
