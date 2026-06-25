'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Layout, Card, Button, Badge, Loading, Modal, Input, ErrorAlert, ConfirmModal } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useSubscription } from '@/hooks/useSubscription';
import { useCategory } from '@/hooks/useCategory';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { 
  Plus, 
  ArrowLeft,
  CreditCard,
  MoreVertical,
  Calendar,
  Sparkles,
  Repeat
} from 'lucide-react';
import { formatCurrency, formatDate, getLocalISODate } from '@/libs/format';
import { Subscription } from '@/types/database';

export default function SubscriptionsPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const { t } = useTranslation();
  const { currency, locale, timezone } = useUserPreferences();
  
  const { subscriptions, isLoading: isSubscriptionsLoading, createSubscription, updateSubscription, deleteSubscription } = useSubscription();
  const { categories } = useCategory();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
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
          <ArrowLeft size={14} /> Back to Finance
        </Link>

        <div className="flex items-start justify-between flex-wrap gap-md">
          <div className="space-y-sm">
            <h1 className="text-display font-serif text-gradient">Subscriptions</h1>
            <p className="text-subtext flex items-center gap-sm">
              <CreditCard size={14} className="text-primary" />
              Manage your recurring payments.
            </p>
          </div>
          <div className="hidden md:flex gap-md">
            <Button variant="primary" size="md" onClick={openAddModal} leftIcon={<Plus size={18} />}>
              Add Subscription
            </Button>
          </div>
        </div>

        <Card className="p-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all" />
          <div className="flex items-center gap-xs mb-md text-gray-light">
             <Repeat size={16} className="text-primary" />
             <p className="text-xs font-bold uppercase tracking-widest">Estimated Monthly Cost</p>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-bold text-white">{formatCurrency(totalMonthlyCost, currency, locale)}</p>
          </div>
        </Card>

        <Card className="overflow-hidden border-none shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/[0.05] dark:border-white/[0.05]">
                  <th className="px-xl py-lg text-[10px] font-bold text-gray-light tracking-widest uppercase">Service</th>
                  <th className="px-xl py-lg text-[10px] font-bold text-gray-light tracking-widest uppercase">Next Billing</th>
                  <th className="px-xl py-lg text-[10px] font-bold text-gray-light tracking-widest uppercase">Cycle</th>
                  <th className="px-xl py-lg text-right text-[10px] font-bold text-gray-light tracking-widest uppercase">Amount</th>
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
                      <td className="px-xl py-xl text-right">
                        <p className="text-sm font-bold text-soft-cream">
                          {formatCurrency(s.amount, s.currency, locale)}
                        </p>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-2xl text-center">
                      <div className="flex flex-col items-center justify-center opacity-50">
                        <Sparkles size={32} className="text-gray-light mb-md" />
                        <p className="text-sm text-soft-cream">No subscriptions yet</p>
                        <p className="text-xs text-gray-light">Track your recurring payments here.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="md:hidden fixed bottom-24 right-4 z-40">
        <Button 
          variant="primary" 
          onClick={openAddModal} 
          className="rounded-full w-14 h-14 flex items-center justify-center shadow-[0_4px_20px_rgba(78,79,235,0.4)]"
          aria-label="Add Subscription"
        >
          <Plus size={24} />
        </Button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSub ? 'Edit Subscription' : 'Add Subscription'}
        footer={
          <div className="flex gap-md justify-end">
            <Button variant="ghost" size="md" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? 'Saving...' : 'Save Subscription'}
            </Button>
          </div>
        }
      >
        <div className="space-y-xl">
          <Input
            label="SERVICE NAME"
            placeholder="Netflix, Spotify, AWS..."
            value={form.name}
            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-md">
            <Input
              label="AMOUNT"
              type="number"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
            />
            <div className="space-y-sm">
              <label className="text-[10px] font-bold text-gray-light tracking-widest block">CURRENCY</label>
              <select
                value={form.currency}
                onChange={(e) => setForm(f => ({ ...f, currency: e.target.value }))}
                className="w-full h-10 bg-gray-strong border border-black/5 dark:border-white/5 rounded-sm px-md text-sm text-soft-cream focus:border-primary focus:outline-none"
              >
                {['USD', 'IDR', 'EUR', 'GBP'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="space-y-sm">
              <label className="text-[10px] font-bold text-gray-light tracking-widest block">BILLING CYCLE</label>
              <select
                value={form.billing_cycle}
                onChange={(e) => setForm(f => ({ ...f, billing_cycle: e.target.value as any }))}
                className="w-full h-10 bg-gray-strong border border-black/5 dark:border-white/5 rounded-sm px-md text-sm text-soft-cream focus:border-primary focus:outline-none"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div className="space-y-sm">
              <label className="text-[10px] font-bold text-gray-light tracking-widest block">NEXT BILLING DATE</label>
              <input 
                type="date" 
                value={form.next_billing_date}
                onChange={(e) => setForm(f => ({ ...f, next_billing_date: e.target.value }))}
                className="w-full h-10 bg-gray-strong border border-black/5 dark:border-white/5 rounded-sm px-md text-sm text-soft-cream focus:border-primary focus:outline-none"
              />
            </div>
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
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider truncate w-full text-center">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-sm">
            <label className="text-[10px] font-bold text-gray-light tracking-widest block">NOTES</label>
            <textarea
              placeholder="Context or tags..."
              rows={2}
              value={form.notes}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full bg-gray-strong/40 border border-black/[0.05] dark:border-white/[0.05] rounded-md p-lg text-sm text-soft-cream focus:border-primary focus:outline-none resize-none"
            />
          </div>

          {editingSub && (
            <button 
              type="button"
              onClick={() => setDeleteConfirmId(editingSub.id)}
              className="w-full py-md text-danger text-[10px] font-bold uppercase tracking-widest border border-danger/20 hover:bg-danger/5 rounded-md transition-all"
            >
              DELETE THIS SUBSCRIPTION
            </button>
          )}
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Subscription?"
        description="Are you sure you want to delete this subscription? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={handleConfirmDelete}
      />
      </Layout>
    </>
  );
}
