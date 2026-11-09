'use client';

import { EmptyState } from '@/components/ui/EmptyState';
import { StatCard } from '@/components/ui/StatCard';
import { Textarea } from '@/components/ui/Textarea';
import { Fab } from '@/components/ui/Fab';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Card, Button, Badge, Loading, Modal, Input, ErrorAlert, ConfirmModal, CategoryIcon, Select, DatePicker } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useSubscription } from '@/hooks/useSubscription';
import { useCategory } from '@/hooks/useCategory';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { convertCurrency } from '@/libs/exchange';
import { sanitizeError } from '@/libs/validation';
import { Plus, ArrowLeft, CreditCard, Calendar, Info } from '@phosphor-icons/react';
import { formatCurrency, formatDate, getLocalISODate } from '@/libs/format';
import { formatDateOnly } from '@/libs/date';
import { Subscription } from '@/types/database';
import { Heading, Paragraph } from '@/components/ui/typography';
import { AppPageHeader } from '@/components/layout/AppPageHeader';

const SUB_PAGE_SIZE = 5;

export function SubscriptionsClient() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const { t } = useTranslation();
  const { currency, locale, timezone } = useUserPreferences();
  
  const { subscriptions, isLoading: isSubscriptionsLoading, createSubscription, updateSubscription, deleteSubscription, markAsPaid, cancelSubscription } = useSubscription();
  const { categories } = useCategory();
  const { rates } = useExchangeRates();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [visibleCount, setVisibleCount] = useState(SUB_PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  
  const [form, setForm] = useState({
    name: '',
    amount: '',
    currency: currency || 'USD',
    billing_cycle: 'monthly' as 'monthly' | 'yearly' | 'weekly',
    next_billing_date: getLocalISODate(new Date(), timezone),
    category_id: '',
    notes: '',
  });

  const handleSave = async () => {
    if (!form.name || !form.amount || !form.next_billing_date) {
      setError(t('finance_ui.fill_required'));
      return;
    }

    setError(null);
    setIsSaving(true);
    
    const payload = {
      name: form.name,
      amount: parseFloat(form.amount),
      currency: form.currency,
      billing_cycle: form.billing_cycle,
      next_billing_date: form.next_billing_date,
      category_id: form.category_id || null,
      notes: form.notes || undefined,
      is_active: true,
    };

    try {
      if (editingSub) {
        await updateSubscription(editingSub.id, payload);
      } else {
        await createSubscription(payload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setError(sanitizeError(err));
      console.error('Failed to save subscription:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteSubscription(deleteConfirmId);
      setIsModalOpen(false);
    } catch (err: any) {
      setError(sanitizeError(err));
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelConfirmId) return;
    try {
      await cancelSubscription(cancelConfirmId);
      setIsModalOpen(false);
    } catch (err) {
      setError(sanitizeError(err));
    } finally {
      setCancelConfirmId(null);
    }
  };

  const handleMarkAsPaid = async (subscription: Subscription) => {
    setError(null);
    try {
      await markAsPaid(subscription);
    } catch (err) {
      setError(sanitizeError(err));
    }
  };

  const openAddModal = () => {
    setEditingSub(null);
    setForm({
      name: '',
      amount: '',
      currency: currency || 'USD',
      billing_cycle: 'monthly',
      next_billing_date: getLocalISODate(new Date(), timezone),
      category_id: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (s: Subscription) => {
    setEditingSub(s);
    setForm({
      name: s.name,
      amount: s.amount.toString(),
      currency: s.currency,
      billing_cycle: s.billing_cycle,
      next_billing_date: formatDateOnly(s.next_billing_date),
      category_id: s.category_id || '',
      notes: s.notes || '',
    });
    setIsModalOpen(true);
  };

  // Approximate monthly cost in the profile currency. A subscription without an exchange rate is left
  // out and counted, because adding its amount as-is would mix currencies in the total.
  const { totalMonthlyCost, unconvertedCount } = subscriptions.reduce(
    (acc, sub) => {
      if (!sub.is_active) return acc;
      let monthlyAmount = sub.amount;
      if (sub.billing_cycle === 'yearly') monthlyAmount = sub.amount / 12;
      if (sub.billing_cycle === 'weekly') monthlyAmount = sub.amount * 4.33;
      const converted = convertCurrency(monthlyAmount, sub.currency, currency, rates);
      return converted === null
        ? { ...acc, unconvertedCount: acc.unconvertedCount + 1 }
        : { ...acc, totalMonthlyCost: acc.totalMonthlyCost + converted };
    },
    { totalMonthlyCost: 0, unconvertedCount: 0 }
  );

  const hasMore = visibleCount < subscriptions.length;
  const visibleSubs = subscriptions.slice(0, visibleCount);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + SUB_PAGE_SIZE, subscriptions.length));
  }, [subscriptions.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: '100px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  if (authLoading) {
    return (
      <>
        <div className="flex justify-center py-12"><Loading text={t('dashboard.checking_session')} /></div>
      </>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <>
      <ErrorAlert error={error} onDismiss={() => setError(null)} />
      <>
      <div className="space-y-8 animate-fade-in">
        
        <Link href="/finance" className="flex min-h-11 w-fit items-center gap-2 text-label-md text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft size={14} /> {t('finance.backToFinance')}
        </Link>

        <AppPageHeader
          title={t('finance.subscriptions')}
          description={t('finance.manageSubscriptions')}
          actions={
            <Button variant="primary" size="sm" onClick={openAddModal} leftIcon={<Plus size={16} />} className="hidden md:inline-flex">
              {t('finance.addSubscription')}
            </Button>
          }
        />

        <StatCard
          label={t('finance.estimatedMonthlyCost')}
          value={formatCurrency(totalMonthlyCost, currency, locale)}
          hint={
            unconvertedCount > 0 && (
              <span className="text-warning">{t('common.rates_unavailable_total').replace('{count}', String(unconvertedCount))}</span>
            )
          }
        />

        {/* Desktop table */}
        <Card className="hidden md:block overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-foreground/[0.02] border-b border-foreground/[0.05]">
                  <th className="px-4 py-4 md:px-8 md:py-3 text-xs font-bold text-muted-foreground">{t('finance.service')}</th>
                  <th className="px-4 py-4 md:px-8 md:py-3 text-xs font-bold text-muted-foreground">{t('finance.nextBilling')}</th>
                  <th className="px-4 py-4 md:px-8 md:py-3 text-xs font-bold text-muted-foreground">{t('finance.cycle')}</th>
                  <th className="px-4 py-4 md:px-8 md:py-3 text-right text-xs font-bold text-muted-foreground">{t('finance.amount')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {isSubscriptionsLoading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center"><Loading /></td>
                  </tr>
                ) : subscriptions.length > 0 ? (
                  subscriptions.map((s) => (
                    <tr 
                      key={s.id} 
                      className={`group hover:bg-foreground/[0.02] transition-colors cursor-pointer ${!s.is_active ? 'opacity-50' : ''}`}
                      onClick={() => openEditModal(s)}
                    >
                      <td className="px-4 py-4 md:px-8 md:py-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <Paragraph className="text-sm font-bold text-foreground group-hover:text-primary transition-colors underline-offset-4 decoration-primary">{s.name}</Paragraph>
                            {s.notes && <Paragraph className="text-xs text-muted-foreground truncate max-w-[200px] mt-1">{s.notes}</Paragraph>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 md:px-8 md:py-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar size={12} />
                          <span className="text-xs font-medium">{formatDate(s.next_billing_date)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 md:px-8 md:py-4">
                        <Badge variant="default" size="sm">
                          {t(`finance_ui.cycle_${s.billing_cycle}`)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 md:px-8 md:py-4">
                        <div className="flex items-center justify-end gap-4">
                          <Paragraph className="text-sm font-bold text-foreground">
                            {formatCurrency(s.amount, s.currency, locale)}
                          </Paragraph>
                          {s.is_active && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={(e) => { 
                                e.stopPropagation();
                                handleMarkAsPaid(s);
                              }}
                              className="whitespace-nowrap"
                            >
                              {t('finance.markAsPaid')}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4}>
                      <EmptyState icon={Info} title={t('finance.noSubscriptions')} description={t('finance.trackSubscriptions')} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Mobile card list with infinite scroll */}
        <div className="md:hidden">
          {isSubscriptionsLoading ? (
            <div className="py-12 flex justify-center"><Loading /></div>
          ) : subscriptions.length === 0 ? (
            <Card className="overflow-hidden">
              <EmptyState icon={Info} title={t('finance.noSubscriptions')} description={t('finance.trackSubscriptions')} />
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="px-4 pt-4 pb-1 flex items-center justify-between">
                <Heading as="h3" size="h3" className="text-xs font-bold text-muted-foreground">{t('finance.activeSubscriptions')}</Heading>
                <span className="text-xs text-muted-foreground">{subscriptions.length} {t('finance.servicesCount')}</span>
              </div>
              {visibleSubs.map((s) => (
                <div
                  key={s.id}
                  className={`flex items-center gap-4 px-4 py-2 border-b border-foreground/[0.03] last:border-0 ${!s.is_active ? 'opacity-50' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => openEditModal(s)}
                    className="flex min-w-0 flex-1 items-center gap-4 text-left"
                  >
                    {/* Icon */}
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <CreditCard size={16} />
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Paragraph className="text-sm font-semibold text-foreground truncate">{s.name}</Paragraph>
                      <div className="flex items-center gap-1 mt-[2px]">
                        <Calendar size={12} className="text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">
                          {formatDate(s.next_billing_date)} · {t(`finance_ui.cycle_${s.billing_cycle}`)}
                        </span>
                      </div>
                    </div>
                  </button>
                  {/* Amount + paid button */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Paragraph className="text-sm font-bold text-foreground tabular-nums">
                      {formatCurrency(s.amount, s.currency, locale)}
                    </Paragraph>
                    {s.is_active && (
                      <Button variant="outline" size="sm" onClick={() => handleMarkAsPaid(s)}>
                        {t('finance.paid')}
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {/* Infinite scroll sentinel */}
              {hasMore && (
                <div ref={sentinelRef} className="flex justify-center py-6">
                  <Loading />
                </div>
              )}

              {!hasMore && subscriptions.length > SUB_PAGE_SIZE && (
                <Paragraph className="text-center text-xs text-muted-foreground py-6">
                  {t('finance.allShown')}
                </Paragraph>
              )}
            </Card>
          )}
        </div>
      </div>

      <Fab label={t('finance.addSubscription')} onClick={openAddModal} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSub ? (t('finance.editSubscription')) : (t('finance.addSubscription'))}
        footer={
          <div className="flex gap-4 justify-end">
            <Button variant="ghost" size="md" onClick={() => setIsModalOpen(false)} disabled={isSaving}>{t('common.cancel')}</Button>
            <Button variant="primary" onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? (t('common.saving')) : (t('finance.saveSubscription'))}
            </Button>
          </div>
        }
      >
        <div className="space-y-8">
          <Input
            label={t('finance_ui.service_name')}
            placeholder={t('finance.subs_placeholder')}
            value={form.name}
            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('finance.amount_label')}
              type="number"
              step="any"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
            />
            <Select
              label={t('finance.currency_label')}
              value={form.currency}
              onValueChange={(val) => setForm(f => ({ ...f, currency: val }))}
              options={['USD', 'IDR', 'EUR', 'GBP'].map(c => ({
                value: c,
                label: c,
              }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label={t('finance.billing_cycle_label')}
              value={form.billing_cycle}
              onValueChange={(val) => setForm(f => ({ ...f, billing_cycle: val as any }))}
              options={[
                { value: 'monthly', label: t('finance_ui.cycle_monthly') },
                { value: 'yearly', label: t('finance_ui.cycle_yearly') },
                { value: 'weekly', label: t('finance_ui.cycle_weekly') },
              ]}
            />
            <DatePicker
              label={t('finance.next_billing_label')}
              value={form.next_billing_date}
              onChange={(val) => setForm(f => ({ ...f, next_billing_date: val }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground block">{t('finance_ui.category_optional')}</label>
            <div className="grid grid-cols-3 gap-2 max-h-[150px] overflow-y-auto">
              {categories.filter(c => c.type === 'expense').map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, category_id: f.category_id === cat.id ? '' : cat.id }))}
                  className={`flex flex-col items-center gap-1 p-2 rounded-md border transition-all ${
                    form.category_id === cat.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-foreground/5 bg-surface/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <CategoryIcon name={cat.icon || 'ShoppingCart'} />
                  <span className="text-xs font-bold truncate w-full text-center">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground block">{t('finance.notes_label')}</label>
            <Textarea
              placeholder={t('finance_ui.notes_placeholder')}
              rows={2}
              value={form.notes}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>

          {editingSub && (
            <div className="flex flex-col gap-2">
              {editingSub.is_active && (
                <button 
                  type="button"
                  onClick={() => setCancelConfirmId(editingSub.id)}
                  className="w-full py-4 text-warning text-xs font-bold border border-warning/20 hover:bg-warning/5 rounded-md transition-all"
                >
                  {t('finance.cancelSubscription')}
                </button>
              )}
              <button 
                type="button"
                onClick={() => setDeleteConfirmId(editingSub.id)}
                className="w-full py-4 text-danger text-xs font-bold border border-danger/20 hover:bg-danger/5 rounded-md transition-all"
              >
                {t('finance.deleteSubscription')}
              </button>
            </div>
          )}
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title={t('finance.deleteSubscriptionTitle')}
        description={t('finance.deleteSubscriptionDesc')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        isDangerous={true}
        onConfirm={handleConfirmDelete}
      />

      <ConfirmModal
        isOpen={!!cancelConfirmId}
        onClose={() => setCancelConfirmId(null)}
        title={t('finance.cancelSubscriptionTitle')}
        description={t('finance.cancelSubscriptionDesc')}
        confirmText={t('finance.cancelSubscription')}
        cancelText={t('finance.keepSubscription')}
        isDangerous={true}
        onConfirm={handleConfirmCancel}
      />
      </>
    </>
  );
}
