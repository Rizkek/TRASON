'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Layout, Card, Button, Badge, Loading, Modal, Input, ErrorAlert, ConfirmModal, CategoryIcon, Select, DatePicker } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useSubscription } from '@/hooks/useSubscription';
import { useCategory } from '@/hooks/useCategory';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { Plus, ArrowLeft, CreditCard, DotsThreeVertical as MoreVertical, Calendar, Info, Repeat } from '@phosphor-icons/react';
import { formatCurrency, formatDate, getLocalISODate } from '@/libs/format';
import { Subscription } from '@/types/database';

const SUB_PAGE_SIZE = 5;

export function SubscriptionsClient() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const { t } = useTranslation();
  const { currency, locale, timezone } = useUserPreferences();
  
  const { subscriptions, isLoading: isSubscriptionsLoading, createSubscription, updateSubscription, deleteSubscription, markAsPaid, cancelSubscription } = useSubscription();
  const { categories } = useCategory();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSave = async () => {
    if (!form.name || !form.amount || !form.next_billing_date) {
      setError('Please fill all required fields');
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
      setError(err.message || 'Failed to save subscription');
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
      setError(err.message || 'Failed to delete subscription');
    } finally {
      setDeleteConfirmId(null);
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
      next_billing_date: new Date(s.next_billing_date).toISOString().split('T')[0],
      category_id: s.category_id || '',
      notes: s.notes || '',
    });
    setIsModalOpen(true);
  };

  // Calculate total monthly cost (approximate)
  const totalMonthlyCost = subscriptions.reduce((sum, sub) => {
    if (!sub.is_active) return sum;
    let monthlyAmount = sub.amount;
    if (sub.billing_cycle === 'yearly') monthlyAmount = sub.amount / 12;
    if (sub.billing_cycle === 'weekly') monthlyAmount = sub.amount * 4.33;
    return sum + monthlyAmount;
  }, 0);

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
      <Layout>
        <div className="flex justify-center py-2xl"><Loading text="Checking your session..." /></div>
      </Layout>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <>
      <ErrorAlert error={error} onDismiss={() => setError(null)} />
      <Layout>
      <div className="space-y-xl animate-fade-in">
        
        <Link href="/finance" className="flex items-center gap-sm text-xs font-bold text-gray-light hover:text-white uppercase tracking-widest transition-colors w-fit">
          <ArrowLeft size={14} /> {t('finance.backToFinance') || 'Back to Finance'}
        </Link>

        <div className="flex items-start justify-between flex-wrap gap-md">
          <div className="space-y-sm">
            <h1 className="text-heading-xl md:text-display-lg font-display font-extrabold tracking-tight text-soft-cream">{t('finance.subscriptions') || 'Subscriptions'}</h1>
            <p className="text-subtext flex items-center gap-sm">
              {t('finance.manageSubscriptions') || 'Manage your recurring payments.'}
            </p>
          </div>
          <div className="hidden md:flex gap-md">
            <Button variant="primary" size="md" onClick={openAddModal} leftIcon={<Plus size={18} />}>
              {t('finance.addSubscription') || 'Add Subscription'}
            </Button>
          </div>
        </div>

        <Card className="p-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all" />
          <div className="flex items-center gap-xs mb-md text-gray-light">
             <Repeat size={16} className="text-primary" />
             <p className="text-xs font-bold uppercase tracking-widest">{t('finance.estimatedMonthlyCost') || 'Estimated Monthly Cost'}</p>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-bold text-white">{formatCurrency(totalMonthlyCost, currency, locale)}</p>
          </div>
        </Card>

        {/* Desktop table */}
        <Card className="hidden md:block overflow-hidden border-none shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/[0.05] dark:border-white/[0.05]">
                  <th className="px-xl py-lg text-[10px] font-bold text-gray-light tracking-widest uppercase">{t('finance.service') || 'Service'}</th>
                  <th className="px-xl py-lg text-[10px] font-bold text-gray-light tracking-widest uppercase">{t('finance.nextBilling') || 'Next Billing'}</th>
                  <th className="px-xl py-lg text-[10px] font-bold text-gray-light tracking-widest uppercase">{t('finance.cycle') || 'Cycle'}</th>
                  <th className="px-xl py-lg text-[10px] font-bold text-gray-light tracking-widest uppercase">{t('finance.amount') || 'Amount'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white divide-opacity-[0.03]">
                {isSubscriptionsLoading ? (
                  <tr>
                    <td colSpan={4} className="py-2xl text-center"><Loading /></td>
                  </tr>
                ) : subscriptions.length > 0 ? (
                  subscriptions.map((s) => (
                    <tr 
                      key={s.id} 
                      className={`group hover:bg-black/[0.02] dark:bg-white/[0.02] transition-colors cursor-pointer ${!s.is_active ? 'opacity-50' : ''}`}
                      onClick={() => openEditModal(s)}
                    >
                      <td className="px-xl py-xl">
                        <div className="flex items-center gap-md">
                          <div>
                            <p className="text-sm font-bold text-soft-cream group-hover:text-primary transition-colors underline-offset-4 decoration-primary">{s.name}</p>
                            {s.notes && <p className="text-[10px] text-gray-light truncate max-w-[200px] mt-1">{s.notes}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-xl py-xl">
                        <div className="flex items-center gap-sm text-gray-light">
                          <Calendar size={12} />
                          <span className="text-xs font-medium">{formatDate(s.next_billing_date)}</span>
                        </div>
                      </td>
                      <td className="px-xl py-xl">
                        <Badge variant="default" size="sm" className="capitalize">
                          {s.billing_cycle}
                        </Badge>
                      </td>
                      <td className="px-xl py-xl">
                        <div className="flex items-center justify-end gap-md">
                          <p className="text-sm font-bold text-soft-cream">
                            {formatCurrency(s.amount, s.currency, locale)}
                          </p>
                          {s.is_active && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                markAsPaid(s); 
                              }}
                              className="whitespace-nowrap"
                            >
                              {t('finance.markAsPaid') || 'Mark as Paid'}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-2xl text-center">
                      <div className="flex flex-col items-center justify-center opacity-50">
                        <Info size={32} className="text-gray-light mb-md" />
                        <p className="text-sm text-soft-cream">{t('finance.noSubscriptions') || 'No subscriptions yet'}</p>
                        <p className="text-xs text-gray-light">{t('finance.trackSubscriptions') || 'Track your recurring payments here.'}</p>
                      </div>
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
            <div className="py-2xl flex justify-center"><Loading /></div>
          ) : subscriptions.length === 0 ? (
            <Card className="overflow-hidden">
              <div className="py-2xl flex flex-col items-center justify-center gap-md opacity-50">
                <Info size={32} className="text-gray-light" />
                <p className="text-sm text-soft-cream">{t('finance.noSubscriptions') || 'No subscriptions yet'}</p>
                <p className="text-xs text-gray-light">{t('finance.trackSubscriptions') || 'Track your recurring payments here.'}</p>
              </div>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="px-md pt-md pb-xs flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-gray-light tracking-widest uppercase">{t('finance.activeSubscriptions')}</h3>
                <span className="text-[9px] text-gray-light">{subscriptions.length} {t('finance.servicesCount')}</span>
              </div>
              {visibleSubs.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => openEditModal(s)}
                  className={`w-full flex items-center gap-md px-md py-sm hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors border-b border-white/[0.03] last:border-0 text-left ${!s.is_active ? 'opacity-50' : ''}`}
                >
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <CreditCard size={16} />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-soft-cream truncate">{s.name}</p>
                    <div className="flex items-center gap-xs mt-[2px]">
                      <Calendar size={9} className="text-gray-light shrink-0" />
                      <span className="text-[10px] text-gray-light truncate">
                        {formatDate(s.next_billing_date)} · <span className="capitalize">{s.billing_cycle}</span>
                      </span>
                    </div>
                  </div>
                  {/* Amount + paid button */}
                  <div className="flex flex-col items-end gap-xs shrink-0">
                    <p className="text-sm font-bold text-soft-cream tabular-nums">
                      {formatCurrency(s.amount, s.currency, locale)}
                    </p>
                    {s.is_active && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); markAsPaid(s); }}
                        className="text-[9px] font-bold uppercase tracking-widest text-primary border border-primary/30 rounded-full px-xs py-[2px] hover:bg-primary/10 transition-all"
                      >
                        Paid
                      </button>
                    )}
                  </div>
                </button>
              ))}

              {/* Infinite scroll sentinel */}
              {hasMore && (
                <div ref={sentinelRef} className="flex justify-center py-lg">
                  <Loading />
                </div>
              )}

              {!hasMore && subscriptions.length > SUB_PAGE_SIZE && (
                <p className="text-center text-[10px] text-gray-light py-lg tracking-widest uppercase">
                  {t('finance.allShown')}
                </p>
              )}
            </Card>
          )}
        </div>
      </div>

      <div className="md:hidden fixed bottom-24 right-4 z-40">
        <Button 
          variant="primary" 
          onClick={openAddModal} 
          className="rounded-full w-14 h-14 flex items-center justify-center shadow-[0_4px_20px_rgba(244,201,93,0.4)]"
          aria-label="Add Subscription"
        >
          <Plus size={24} />
        </Button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSub ? (t('finance.editSubscription') || 'Edit Subscription') : (t('finance.addSubscription') || 'Add Subscription')}
        footer={
          <div className="flex gap-md justify-end">
            <Button variant="ghost" size="md" onClick={() => setIsModalOpen(false)} disabled={isSaving}>{t('common.cancel') || 'Cancel'}</Button>
            <Button variant="primary" onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? (t('common.saving') || 'Saving...') : (t('finance.saveSubscription') || 'Save Subscription')}
            </Button>
          </div>
        }
      >
        <div className="space-y-xl">
          <Input
            label="SERVICE NAME"
            placeholder={t('finance.subs_placeholder')}
            value={form.name}
            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-md">
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

          <div className="grid grid-cols-2 gap-md">
            <Select
              label={t('finance.billing_cycle_label')}
              value={form.billing_cycle}
              onValueChange={(val) => setForm(f => ({ ...f, billing_cycle: val as any }))}
              options={[
                { value: 'monthly', label: 'Monthly' },
                { value: 'yearly', label: 'Yearly' },
                { value: 'weekly', label: 'Weekly' },
              ]}
            />
            <DatePicker
              label={t('finance.next_billing_label')}
              value={form.next_billing_date}
              onChange={(val) => setForm(f => ({ ...f, next_billing_date: val }))}
            />
          </div>

          <div className="space-y-sm">
            <label className="text-[10px] font-bold text-gray-light tracking-widest block">CATEGORY (OPTIONAL)</label>
            <div className="grid grid-cols-3 gap-sm max-h-[150px] overflow-y-auto">
              {categories.filter(c => c.type === 'expense').map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, category_id: f.category_id === cat.id ? '' : cat.id }))}
                  className={`flex flex-col items-center gap-xs p-sm rounded-md border transition-all ${
                    form.category_id === cat.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-black/5 dark:border-white/5 bg-gray-strong/40 text-gray-light hover:text-soft-cream'
                  }`}
                >
                  <CategoryIcon name={cat.icon || 'ShoppingCart'} />
                  <span className="text-[10px] uppercase font-bold tracking-wider truncate w-full text-center">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-sm">
            <label className="text-[10px] font-bold text-gray-light tracking-widest block">{t('finance.notes_label')}</label>
            <textarea
              placeholder="Context or tags..."
              rows={2}
              value={form.notes}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full bg-gray-strong/40 border border-black/[0.05] dark:border-white/[0.05] rounded-md p-lg text-sm text-soft-cream focus:border-primary focus:outline-none resize-none"
            />
          </div>

          {editingSub && (
            <div className="flex flex-col gap-sm">
              {editingSub.is_active && (
                <button 
                  type="button"
                  onClick={async () => {
                    await cancelSubscription(editingSub.id);
                    setIsModalOpen(false);
                  }}
                  className="w-full py-md text-warning text-[10px] font-bold uppercase tracking-widest border border-warning/20 hover:bg-warning/5 rounded-md transition-all"
                >
                  {t('finance.cancelSubscription') || 'CANCEL SUBSCRIPTION'}
                </button>
              )}
              <button 
                type="button"
                onClick={() => setDeleteConfirmId(editingSub.id)}
                className="w-full py-md text-danger text-[10px] font-bold uppercase tracking-widest border border-danger/20 hover:bg-danger/5 rounded-md transition-all"
              >
                {t('finance.deleteSubscription') || 'DELETE THIS SUBSCRIPTION'}
              </button>
            </div>
          )}
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title={t('finance.deleteSubscriptionTitle') || 'Delete Subscription?'}
        description={t('finance.deleteSubscriptionDesc') || 'Are you sure you want to delete this subscription? This action cannot be undone.'}
        confirmText={t('common.delete') || 'Delete'}
        cancelText={t('common.cancel') || 'Cancel'}
        isDangerous={true}
        onConfirm={handleConfirmDelete}
      />
      </Layout>
    </>
  );
}
