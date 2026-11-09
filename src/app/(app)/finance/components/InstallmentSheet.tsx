'use client';

import React, { useState } from 'react';
import { BottomSheet, Button, Input, DatePicker } from '@/components';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useInstallment } from '@/hooks/useInstallment';
import { getLocalISODate } from '@/libs/format';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface InstallmentSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstallmentSheet({ isOpen, onClose }: InstallmentSheetProps) {
  const { t } = useTranslation();
  const { createInstallment } = useInstallment();
  const { currency, language: locale } = useUserPreferences();

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    total_amount: '',
    down_payment: '',
    monthly_amount: '',
    total_months: '',
    start_date: getLocalISODate(),
    creditor: ''
  });

  const handleSave = async () => {
    if (!form.title || !form.total_amount || !form.monthly_amount || !form.total_months) {
      setError(t('installments.required'));
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await createInstallment({
        title: form.title,
        total_amount: Number(form.total_amount),
        down_payment: Number(form.down_payment || 0),
        monthly_amount: Number(form.monthly_amount),
        total_months: Number(form.total_months),
        paid_months: 0,
        start_date: form.start_date,
        creditor: form.creditor,
        currency: currency || 'IDR',
        status: 'active'
      });
      onClose();
    } catch (err: any) {
      setError(t('installments.save_failed'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={t('installments.form_title')}
      footer={
        <div className="flex gap-4 justify-end">
          <Button variant="ghost" size="md" onClick={onClose} disabled={isSaving}>{t('common.cancel')}</Button>
          <Button variant="primary" onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? t('common.saving') : t('installments.save')}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-danger/10 text-danger p-3 rounded-md text-xs">
            {error}
          </div>
        )}

        <Input
          label={t('installments.title_label')}
          placeholder={t('installments.title_placeholder')}
          value={form.title}
          onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
        />
        
        <Input
          label={t('installments.creditor_label')}
          placeholder={t('installments.creditor_placeholder')}
          value={form.creditor}
          onChange={(e) => setForm(f => ({ ...f, creditor: e.target.value }))}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('installments.total_label')}
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={form.total_amount}
            onChange={(e) => setForm(f => ({ ...f, total_amount: e.target.value.replace(/\D/g, '') }))}
          />
          <Input
            label={t('installments.down_payment_label')}
            type="text"
            inputMode="numeric"
            placeholder={t('installments.down_payment_placeholder')}
            value={form.down_payment}
            onChange={(e) => setForm(f => ({ ...f, down_payment: e.target.value.replace(/\D/g, '') }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('installments.monthly_label')}
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={form.monthly_amount}
            onChange={(e) => setForm(f => ({ ...f, monthly_amount: e.target.value.replace(/\D/g, '') }))}
          />
          <Input
            label={t('installments.months_label')}
            type="text"
            inputMode="numeric"
            placeholder={t('installments.months_placeholder')}
            value={form.total_months}
            onChange={(e) => setForm(f => ({ ...f, total_months: e.target.value.replace(/\D/g, '') }))}
          />
        </div>

        <DatePicker
          label={t('installments.start_date_label')}
          value={form.start_date}
          onChange={(val) => setForm(f => ({ ...f, start_date: val }))}
        />

        {form.monthly_amount && form.total_months && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center mt-4">
            <p className="text-xs text-primary mb-1">{t('installments.total_payable')}</p>
            <p className="text-lg font-bold text-foreground">
              {(Number(form.monthly_amount) * Number(form.total_months)).toLocaleString(locale)}
            </p>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
