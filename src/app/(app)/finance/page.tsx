'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Button, Badge, Loading, Modal, Input, ErrorAlert, ConfirmModal } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useTransaction } from '@/hooks/useTransaction';
import { useCategory } from '@/hooks/useCategory';
import { validateTransaction, sanitizeError } from '@/libs/validation';
import { Transaction } from '@/types/database';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Search, 
  Filter, 
  MoreVertical,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  RefreshCcw,
  Sparkles
} from 'lucide-react';
import { formatCurrency, formatDate, getLocalISODate } from '@/libs/format';
import { fetchExchangeRates } from '@/libs/exchange';
import { getDateRange } from '@/libs/date';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTranslation } from '@/libs/i18n/useTranslation';

export default function FinancePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const { t } = useTranslation();
  const { currency, locale, timezone } = useUserPreferences();
  const now = new Date();
  const { start, end } = getDateRange(now.getMonth(), now.getFullYear());
  
  const { transactions, isLoading: isTransactionsLoading, createTransaction, updateTransaction, deleteTransaction } = useTransaction(start, end);
  const { categories } = useCategory();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category_id: '',
    date: getLocalISODate(new Date(), timezone),
    description: '',
    original_currency: currency || 'USD',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSave = async () => {
    const validation = validateTransaction(form);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setFormErrors({});
    setError(null);
    setIsSaving(true);
    
    let exchangeRate = 1.0;
    const ratesData = await fetchExchangeRates();
    if (ratesData && ratesData.rates[form.original_currency]) {
      // Exchange rate to USD (base)
      exchangeRate = 1 / ratesData.rates[form.original_currency];
    }
    
    // We store the base amount in USD by default if you want amount to be base currency,
    // OR we store amount as original amount and handle display in Dashboard.
    // The instructions: "Semua nominal transaksi yang diinput akan disimpan dalam mata uang aslinya, beserta exchange rate saat transaksi terjadi, dan otomatis dikonversi ke Base Currency di Dashboard."
    // So 'amount' remains the original amount, but we save original_currency and exchange_rate_to_base.
    
    const payload = {
      title: form.title,
      amount: parseFloat(form.amount),
      type: form.type,
      date: form.date,
      category_id: form.category_id || null,
      description: form.description || undefined,
      original_amount: parseFloat(form.amount),
      original_currency: form.original_currency,
      exchange_rate_to_base: exchangeRate,
    };

    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, payload);
      } else {
        await createTransaction(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      const errorMessage = sanitizeError(err);
      setError(errorMessage);
      console.error('Failed to save transaction:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteTransaction(deleteConfirmId);
      setIsModalOpen(false);
    } catch (err) {
      const errorMessage = sanitizeError(err);
      setError(errorMessage);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const openAddModal = () => {
    setEditingTransaction(null);
    setForm({
      title: '',
      amount: '',
      type: 'expense' as const,
      category_id: '',
      date: getLocalISODate(new Date(), timezone),
      description: '',
      original_currency: currency || 'USD',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (t: Transaction) => {
    setEditingTransaction(t);
    setForm({
      title: t.title,
      amount: t.amount.toString(),
      type: t.type,
      category_id: t.category_id || '',
      date: new Date(t.date).toISOString().split('T')[0],
      description: t.description || '',
      original_currency: t.original_currency || currency || 'USD',
    });
    setIsModalOpen(true);
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

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
        <div className="flex items-start justify-between flex-wrap gap-md">
          <div className="space-y-sm">
            <h1 className="text-display font-serif text-gradient">{t('finance.title')}</h1>
            <p className="text-subtext flex items-center gap-sm">
              <Wallet size={14} className="text-primary" />
              {t('finance.subtitle')}
            </p>
          </div>
          <div className="hidden md:flex gap-md">
            <Button variant="primary" size="md" onClick={openAddModal} leftIcon={<Plus size={18} />}>
              {t('finance.newEntry')}
            </Button>
          </div>
        </div>

        <div className="flex md:grid md:grid-cols-3 gap-md md:gap-lg overflow-x-auto snap-x no-scrollbar pb-2">
          <Card className="p-xl relative overflow-hidden group min-w-[280px] md:min-w-0 snap-center shrink-0">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-success/5 rounded-full blur-2xl group-hover:bg-success/10 transition-all" />
            <p className="text-micro text-gray-light mb-md tracking-widest">{t('finance.totalIncome')}</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-success">{formatCurrency(totalIncome, currency, locale)}</p>
              <div className="p-sm bg-success/10 rounded-md text-success"><ArrowUpRight size={20} /></div>
            </div>
          </Card>
          
          <Card className="p-xl relative overflow-hidden group min-w-[280px] md:min-w-0 snap-center shrink-0">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-danger/5 rounded-full blur-2xl group-hover:bg-danger/10 transition-all" />
            <p className="text-micro text-gray-light mb-md tracking-widest">{t('finance.totalExpense')}</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-danger">{formatCurrency(totalExpense, currency, locale)}</p>
              <div className="p-sm bg-danger/10 rounded-md text-danger"><ArrowDownLeft size={20} /></div>
            </div>
          </Card>

          <Card className="p-xl relative overflow-hidden group border-b-2 border-primary/20 min-w-[280px] md:min-w-0 snap-center shrink-0">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
            <p className="text-micro text-gray-light mb-md tracking-widest">{t('finance.netBalance')}</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-white">{formatCurrency(totalIncome - totalExpense, currency, locale)}</p>
              <div className="p-sm bg-primary/10 rounded-md text-primary"><TrendingUp size={20} /></div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-md items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search size={18} className="absolute left-md top-1/2 -translate-y-1/2 text-gray-light group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder={t('finance.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-2xl pr-md py-md bg-gray-strong/40 border border-black/[0.05] dark:border-white/[0.05] rounded-md text-sm focus:border-primary focus:outline-none transition-all"
            />
          </div>
          
          <div className="flex bg-gray-strong/40 p-1 rounded-md border border-black/[0.05] dark:border-white/[0.05]">
            {(['all', 'income', 'expense'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={`px-xl py-sm text-[10px] font-bold rounded-sm transition-all uppercase tracking-widest ${
                  filterType === type 
                    ? 'bg-primary text-warm-black shadow-lg shadow-primary/20' 
                    : 'text-gray-light hover:text-soft-cream'
                }`}
              >
                {t(`finance.filter${type.charAt(0).toUpperCase() + type.slice(1)}` as any)}
              </button>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden border-none shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/[0.05] dark:border-white/[0.05]">
                  <th className="px-xl py-lg text-[10px] font-bold text-gray-light tracking-widest uppercase">{t('finance.table.transaction')}</th>
                  <th className="px-xl py-lg text-[10px] font-bold text-gray-light tracking-widest uppercase">{t('finance.table.date')}</th>
                  <th className="px-xl py-lg text-[10px] font-bold text-gray-light tracking-widest uppercase">{t('finance.table.category')}</th>
                  <th className="px-xl py-lg text-right text-[10px] font-bold text-gray-light tracking-widest uppercase">{t('finance.table.amount')}</th>
                  <th className="px-xl py-lg text-right text-[10px] font-bold text-gray-light tracking-widest uppercase">{t('finance.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white divide-opacity-[0.03]">
                {isTransactionsLoading ? (
                  <tr>
                    <td colSpan={5} className="py-2xl text-center"><Loading /></td>
                  </tr>
                ) : filteredTransactions.length > 0 ? (
                  filteredTransactions.map((t) => (
                    <tr 
                      key={t.id} 
                      className="group hover:bg-black/[0.02] dark:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => openEditModal(t)}
                    >
                      <td className="px-xl py-xl">
                        <div className="flex items-center gap-md">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            t.type === 'income' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                          }`}>
                            {t.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-soft-cream group-hover:text-primary transition-colors underline-offset-4 decoration-primary">{t.title}</p>
                            {t.description && <p className="text-[10px] text-gray-light truncate max-w-[200px] mt-1">{t.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-xl py-xl">
                        <div className="flex items-center gap-sm text-gray-light">
                          <Calendar size={12} />
                          <span className="text-xs font-medium">{formatDate(t.date)}</span>
                        </div>
                      </td>
                      <td className="px-xl py-xl">
                        <Badge variant={t.type === 'income' ? 'success' : 'danger'} size="sm">
                          {(t.categories?.[0])?.name || 'Uncategorized'}
                        </Badge>
                      </td>
                      <td className="px-xl py-xl text-right">
                        <p className={`text-sm font-bold ${t.type === 'income' ? 'text-success' : 'text-soft-cream'}`}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, t.original_currency || currency, locale)}
                        </p>
                      </td>
                      <td className="px-xl py-xl text-right">
                        <button type="button" title="More options" aria-label="More options" className="p-sm text-gray-light hover:text-soft-cream rounded-md hover:bg-black/5 dark:bg-white/5 transition-all">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-2xl text-center">
                      <div className="flex flex-col items-center justify-center opacity-50">
                        <Sparkles size={32} className="text-gray-light mb-md" />
                        <p className="text-sm text-soft-cream">{t('moduleCommon.emptyTitle')}</p>
                        <p className="text-xs text-gray-light">{t('moduleCommon.emptyDesc')}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Mobile-only FAB for New Entry */}
      <div className="md:hidden fixed bottom-24 right-4 z-40">
        <Button 
          variant="primary" 
          onClick={openAddModal} 
          className="rounded-full w-14 h-14 flex items-center justify-center shadow-[0_4px_20px_rgba(78,79,235,0.4)]"
          aria-label={t('finance.newEntry')}
        >
          <Plus size={24} />
        </Button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTransaction ? t('finance.modal.editTitle') : t('finance.modal.addTitle')}
        footer={
          <div className="flex gap-md justify-end">
            <Button variant="ghost" size="md" onClick={() => setIsModalOpen(false)} disabled={isSaving}>{t('common.cancel')}</Button>
            <Button variant="primary" onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? t('finance.modal.savingBtn') : t('finance.modal.saveBtn')}
            </Button>
          </div>
        }
      >
        <div className="space-y-xl">
          <div className="flex bg-gray-strong p-1 rounded-md border border-black/[0.05] dark:border-white/[0.05]">
            {(['income', 'expense'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setForm(f => ({ ...f, type }))}
                className={`flex-1 py-md text-[10px] font-bold rounded-sm transition-all uppercase tracking-widest ${
                  form.type === type 
                    ? type === 'income' ? 'bg-success text-white' : 'bg-danger text-white'
                    : 'text-gray-light hover:text-soft-cream'
                }`}
              >
                {t(`finance.modal.type.${type}`)}
              </button>
            ))}
          </div>

          <Input
            label="TITLE"
            placeholder="Coffee, Subscription, Freelance..."
            value={form.title}
            onChange={(e) => {
              setForm(f => ({ ...f, title: e.target.value }));
              if (formErrors.title) {
                setFormErrors(prev => {
                  const copy = { ...prev };
                  delete copy.title;
                  return copy;
                });
              }
            }}
            error={formErrors.title}
          />

          <div className="grid grid-cols-2 gap-md">
            <Input
              label="AMOUNT"
              type="number"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => {
                setForm(f => ({ ...f, amount: e.target.value }));
                if (formErrors.amount) {
                  setFormErrors(prev => {
                    const copy = { ...prev };
                    delete copy.amount;
                    return copy;
                  });
                }
              }}
              error={formErrors.amount}
            />
            <div className="space-y-sm">
              <label className="text-[10px] font-bold text-gray-light tracking-widest block">DATE</label>
              <input 
                type="date" 
                title="Select date"
                value={form.date}
                onChange={(e) => {
                  setForm(f => ({ ...f, date: e.target.value }));
                  if (formErrors.date) {
                    setFormErrors(prev => {
                      const copy = { ...prev };
                      delete copy.date;
                      return copy;
                    });
                  }
                }}
                className="w-full h-10 bg-gray-strong border border-black/5 dark:border-white/5 rounded-sm px-md text-sm text-soft-cream focus:border-primary focus:outline-none"
              />
              {formErrors.date && <p className="text-xs text-danger">{formErrors.date}</p>}
            </div>
          </div>

          <div className="space-y-sm">
            <label className="text-[10px] font-bold text-gray-light tracking-widest block">CATEGORY</label>
            <div className="grid grid-cols-3 gap-sm">
              {categories.filter(c => c.type === form.type).map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, category_id: cat.id }))}
                  className={`flex flex-col items-center gap-xs p-md rounded-md border transition-all ${
                    form.category_id === cat.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-black/5 dark:border-white/5 bg-gray-strong/40 text-gray-light hover:text-soft-cream hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider truncate w-full text-center">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-sm">
            <label className="text-[10px] font-bold text-gray-light tracking-widest block">DESCRIPTION / NOTES</label>
            <textarea
              placeholder="Context or tags..."
              rows={4}
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full bg-gray-strong/40 border border-black/[0.05] dark:border-white/[0.05] rounded-md p-lg text-sm text-soft-cream focus:border-primary focus:outline-none resize-none"
            />
          </div>

          {editingTransaction && (
            <button 
              type="button"
              onClick={() => setDeleteConfirmId(editingTransaction.id)}
              className="w-full py-md text-danger text-[10px] font-bold uppercase tracking-widest border border-danger/20 hover:bg-danger/5 rounded-md transition-all"
            >
              DELETE THIS TRANSACTION
            </button>
          )}
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title={t('finance.modal.deleteConfirmTitle')}
        description={t('finance.modal.deleteConfirmDesc')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        isDangerous={true}
        onConfirm={handleConfirmDelete}
      />
      </Layout>
    </>
  );
}
