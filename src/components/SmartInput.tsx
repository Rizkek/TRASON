'use client';

import React, { useState, useEffect } from 'react';
import { PaperPlaneRight } from '@phosphor-icons/react';
import { Modal } from './Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { getLocalISODate } from '@/libs/format';
import { ApiError } from '@/libs/apiErrors';
import { useTranslation } from '@/libs/i18n/useTranslation';
import {
  createTransactionWithInvalidation,
  createActivityWithInvalidation,
  createReminderWithInvalidation
} from '@/libs/mutations';

const OPEN_EVENT = 'trason:open-smart-input';

/** Opens Smart Input from anywhere in the shell. Ctrl/Cmd+K does the same on a keyboard. */
export const openSmartInput = () => window.dispatchEvent(new Event(OPEN_EVENT));

/** "dueTime" becomes "due time" for the draft preview. */
const fieldLabel = (key: string) => key.replace(/([A-Z])/g, ' $1').toLowerCase();

export function SmartInput() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener(OPEN_EVENT, handleOpen);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener(OPEN_EVENT, handleOpen);
    };
  }, []);

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
      setResult({ error: t('smart_input.error_process') });
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
          ? t('smart_input.error_past_due')
          : t('smart_input.error_save');
      setResult({ ...result, error: message });
    } finally {
      setIsLoading(false);
    }
  };

  const draftFields = result?.data
    ? Object.entries(result.data as Record<string, unknown>).filter(([, value]) => value !== null && value !== undefined && value !== '')
    : [];

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={t('nav.quick_add')} maxWidth="2xl">
      <form onSubmit={handleSubmit} className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <Input
            aria-label={t('nav.quick_add')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('smart_input.placeholder')}
            disabled={isLoading}
          />
        </div>
        <Button
          type="submit"
          disabled={!input.trim()}
          isLoading={isLoading}
          aria-label={t('smart_input.submit')}
          title={t('smart_input.submit')}
          className="w-11 shrink-0 px-0"
        >
          <PaperPlaneRight size={18} aria-hidden="true" />
        </Button>
      </form>

      {result && !result.error && (
        <div className="mt-4 space-y-4 border-t border-foreground/10 pt-4">
          {result.message && <p className="text-sm text-muted-foreground">{result.message}</p>}

          {draftFields.length > 0 && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-lg bg-foreground/5 p-4 text-sm">
              {draftFields.map(([key, value]) => (
                <React.Fragment key={key}>
                  <dt className="text-muted-foreground first-letter:uppercase">{fieldLabel(key)}</dt>
                  <dd className="min-w-0 break-words text-foreground">{String(value)}</dd>
                </React.Fragment>
              ))}
            </dl>
          )}

          {result.confidence > 0.7 && result.action === 'create' && (
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setResult(null)}>
                {t('common.cancel')}
              </Button>
              <Button size="sm" onClick={handleConfirm} isLoading={isLoading}>
                {t('smart_input.save')}
              </Button>
            </div>
          )}
        </div>
      )}

      {result?.error && (
        <p role="alert" className="mt-4 rounded-lg bg-danger/10 p-4 text-sm text-danger">
          {result.error}
        </p>
      )}
    </Modal>
  );
}
