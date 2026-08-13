'use client';

import React, { useState } from 'react';
import { Card, Button, Input, ConfirmModal } from '@/components';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { supabase } from '@/services/supabase/supabaseClient';
import { sanitizeError } from '@/libs/validation';
import { Warning as AlertTriangle } from '@phosphor-icons/react';

interface SecuritySectionProps {
  showMessage: (type: 'success' | 'error', text: string) => void;
  setError: (err: string | null) => void;
  onDeleteAccount: () => Promise<void>;
}

export function SecuritySection({
  showMessage,
  setError,
  onDeleteAccount,
}: SecuritySectionProps) {
  const { t } = useTranslation();
  const [security, setSecurity] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleChangePassword = async () => {
    setError(null);
    setFormErrors({});

    const errors: Record<string, string> = {};
    if (!security.new_password) errors.new_password = (t('settings.messages.password_error_required') as string) || 'New password is required';
    if (security.new_password.length < 8)
      errors.new_password = (t('settings.messages.password_error_length') as string) || 'Password must be at least 8 characters';
    if (security.new_password !== security.confirm_password)
      errors.confirm_password = (t('settings.messages.password_error_match') as string) || 'Passwords do not match';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showMessage('error', (t('settings.messages.validation_error') as string) || 'Validation failed');
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error: pwError } = await supabase.auth.updateUser({
        password: security.new_password,
      });
      if (pwError) throw pwError;
      setSecurity({ current_password: '', new_password: '', confirm_password: '' });
      showMessage('success', (t('settings.messages.password_success') as string) || 'Password updated');
    } catch (err) {
      setError(sanitizeError(err));
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <>
      <div className="space-y-xl">
        <Card
          className="glass border-none border-t border-danger"
          title={t('settings.security.sectionTitle')}
        >
          <div className="space-y-xl max-w-md">
            <Input
              label={t('settings.security.currentPass')}
              type="password"
              value={security.current_password}
              onChange={(e) => setSecurity((s) => ({ ...s, current_password: e.target.value }))}
              error={formErrors.current_password}
            />
            <Input
              label={t('settings.security.newPass')}
              type="password"
              value={security.new_password}
              onChange={(e) => setSecurity((s) => ({ ...s, new_password: e.target.value }))}
              error={formErrors.new_password}
            />
            <Input
              label={t('settings.security.confirmPass')}
              type="password"
              value={security.confirm_password}
              onChange={(e) => setSecurity((s) => ({ ...s, confirm_password: e.target.value }))}
              error={formErrors.confirm_password}
            />
            <Button
              variant="primary"
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              className="w-full"
            >
              {isChangingPassword
                ? t('settings.security.updatingBtn')
                : t('settings.security.updateBtn')}
            </Button>
          </div>
        </Card>

        <Card className="glass border-none bg-danger/5 border-danger/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-xl">
            <div>
              <h3 className="text-lg font-bold text-danger flex items-center gap-2">
                <AlertTriangle size={20} /> {t('settings.security.deleteAccount')}
              </h3>
              <p className="text-sm text-gray-light mt-1">{t('settings.security.deleteDesc')}</p>
            </div>
            <Button variant="danger" size="md" onClick={() => setDeleteConfirmOpen(true)}>
              {t('settings.security.deleteBtn')}
            </Button>
          </div>
        </Card>
      </div>

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={onDeleteAccount}
        title={t('settings.security.deleteConfirmTitle')}
        description={t('settings.security.deleteConfirmDesc')}
        confirmText={t('settings.security.confirmDeleteBtn')}
        cancelText={t('nav.cancel')}
        isDangerous={true}
        requireInput="TRASON"
      />
    </>
  );
}
