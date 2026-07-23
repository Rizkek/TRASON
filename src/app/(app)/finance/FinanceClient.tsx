'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Layout, Card, Button, Badge, Loading, Modal, Input, ErrorAlert, ConfirmModal, CategoryIcon, BottomSheet } from '@/components';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { BudgetManagerModal } from './components/BudgetManagerModal';
import { TransactionFeed } from './components/TransactionFeed';
import { useAuthStore } from '@/store/authStore';
import { useTransaction } from '@/hooks/useTransaction';
import { useCategory } from '@/hooks/useCategory';
import { useSubscription } from '@/hooks/useSubscription';
import { useBudget } from '@/hooks/useBudget';
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
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatCurrency, formatDate, getLocalISODate } from '@/libs/format';
import { fetchExchangeRates } from '@/libs/exchange';
import { formatDateOnly, getDateRange } from '@/libs/date';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTranslation } from '@/libs/i18n/useTranslation';
import type { CategoryJoin } from '@/types/database';

/** Safely get the category object regardless of whether Supabase returns an array or single object */
function resolveCategory(categories: CategoryJoin | CategoryJoin[] | null | undefined): CategoryJoin | null {
  if (!categories) return null;
  if (Array.isArray(categories)) return categories[0] ?? null;
  return categories;
}

interface Props {
  initialTransactions?: Transaction[];
}

export default function FinanceClient({ initialTransactions }: Props) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const { t } = useTranslation();
  const { currency, locale, timezone } = useUserPreferences();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  
  const { start, end } = getDateRange(selectedMonth, selectedYear);
  
  // All-time start (far in the past) to fetch carry-forward balance
  const carryStart = new Date(2000, 0, 1);
  const carryEnd = new Date(start.getTime() - 1); // 1ms before start of selected month
  
  const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear();
  
  const { transactions, isLoading: isTransactionsLoading, createTransaction, updateTransaction, deleteTransaction } = useTransaction(
    start, 
    end, 
    undefined, 
    isCurrentMonth ? initialTransactions : undefined
  );
  // Fetch all transactions BEFORE selected month to compute opening balance (carry-forward)
  const { transactions: prevTransactions, isLoading: isPrevLoading } = useTransaction(carryStart, carryEnd);
  
  // Carry-forward: net balance of all past months
  const carryForwardBalance = prevTransactions.reduce((sum, t) => {
    return t.type === 'income' ? sum + t.amount : sum - t.amount;
  }, 0);
  const { categories } = useCategory();
  const { createSubscription } = useSubscription();
  const { globalBudget } = useBudget();
  
  const [page, setPage] = useState(1);
  const limit = 20;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
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
    decision_notes: '',
    expected_impact: '',
    is_recurring: false,
    billing_cycle: 'monthly' as 'monthly' | 'yearly' | 'weekly',
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
    
    const rawAmount = parseFloat(form.amount);
    // Round to avoid float precision loss in DB (PostgreSQL real/float4 has ~7 sig digits)
    const safeAmount = Math.round(rawAmount);

    const payload = {
      title: form.title,
      amount: safeAmount,
      type: form.type,
      date: form.date,
      category_id: form.category_id || null,
      description: form.description || null,
      original_amount: safeAmount,
      original_currency: form.original_currency,
      exchange_rate_to_base: exchangeRate,
      metadata: {
        ...(typeof editingTransaction?.metadata === 'object' ? editingTransaction.metadata : {}),
        decision_notes: form.decision_notes || null,
        expected_impact: form.expected_impact || null,
      }
    };

    console.log('[Finance] handleSave payload:', {
      form_amount_raw: form.amount,
      raw_parsed: rawAmount,
      safe_rounded: safeAmount,
      category_id: form.category_id || null,
      exchange_rate: exchangeRate,
      original_currency: form.original_currency,
      isEdit: !!editingTransaction,
    });

    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, payload);
      } else {
        await createTransaction(payload);
        
        // Handle subscription creation
        if (form.is_recurring) {
          const nextDate = new Date(form.date);
          if (form.billing_cycle === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
          else if (form.billing_cycle === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
          else if (form.billing_cycle === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
          
          await createSubscription({
            name: form.title,
            amount: safeAmount,
            currency: form.original_currency,
            billing_cycle: form.billing_cycle,
            next_billing_date: nextDate.toISOString().split('T')[0],
            category_id: form.category_id || null,
            is_active: true,
            notes: form.description || undefined,
          });
        }
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
    setFormErrors({});
    setError(null);
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
      decision_notes: '',
      expected_impact: '',
      is_recurring: false,
      billing_cycle: 'monthly',
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
      date: formatDateOnly(t.date),
      description: t.description || '',
      original_currency: t.original_currency || currency || 'USD',
      decision_notes: (t.metadata?.decision_notes as string) || '',
      expected_impact: (t.metadata?.expected_impact as string) || '',
      is_recurring: false, // Editing doesn't re-create subscription
      billing_cycle: 'monthly',
    });
    setIsModalOpen(true);
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Closing balance = carry-forward + this month's net
  const closingBalance = carryForwardBalance + (totalIncome - totalExpense);
  const isFirstMonth = prevTransactions.length === 0;

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const paginatedTransactions = filteredTransactions.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(filteredTransactions.length / limit);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterType, selectedMonth, selectedYear]);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  };

  const monthName = new Date(selectedYear, selectedMonth).toLocaleString(locale || 'en-US', { month: 'long' });

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
          <div className="space-y-sm w-full md:w-auto flex-1">
            <h1 className="text-display font-serif text-gradient">{t('finance.title')}</h1>
            <div className="flex items-center gap-md">
              <p className="text-subtext flex items-center gap-sm">
                <Wallet size={14} className="text-primary" />
                {t('finance.subtitle')}
              </p>
              <div className="w-px h-4 bg-white/10 hidden md:block"></div>
              <div className="flex items-center gap-2 bg-black/[0.02] dark:bg-white/[0.02] px-3 py-1.5 rounded-full border border-black/5 dark:border-white/5">
                <button onClick={handlePrevMonth} className="text-gray-light hover:text-soft-cream p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-bold text-soft-cream w-[140px] text-center">
                  {monthName} {selectedYear}
                </span>
                <button onClick={handleNextMonth} className="text-gray-light hover:text-soft-cream p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <div className="md:hidden pt-sm">
              <Link href="/finance/subscriptions">
                <Button variant="outline" size="sm" leftIcon={<Calendar size={14} />} className="w-full justify-center">
                  Subscriptions
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden md:flex gap-md">
            <Link href="/finance/subscriptions">
              <Button variant="outline" size="md" leftIcon={<Calendar size={18} />}>
                Subscriptions
              </Button>
            </Link>
            <Button variant="primary" size="md" onClick={openAddModal} leftIcon={<Plus size={18} />}>
              {t('finance.newEntry')}
            </Button>
          </div>
        </div>

        {/* Budget Progress Bar */}
        {globalBudget && (
          <div className="bg-[#141414] border border-white/5 rounded-2xl p-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-md mb-sm">
              <div>
                <div className="flex items-center gap-sm">
                  <Wallet size={16} className="text-primary" />
                  <h3 className="text-sm font-bold text-soft-cream">Global Monthly Budget</h3>
                </div>
                <p className="text-xs text-gray-light mt-1">
                  {formatCurrency(totalExpense, currency || 'USD', locale)} / {formatCurrency(globalBudget.amount, currency || 'USD', locale)}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsBudgetModalOpen(true)}>
                Ubah Target
              </Button>
            </div>
            
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  (totalExpense / globalBudget.amount) > 0.9 ? 'bg-danger' : 
                  (totalExpense / globalBudget.amount) > 0.75 ? 'bg-warning' : 'bg-primary'
                }`}
                style={{ width: `${Math.min((totalExpense / globalBudget.amount) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-right mt-2 font-mono text-gray-light">
              {Math.round((totalExpense / globalBudget.amount) * 100)}% digunakan
            </p>
          </div>
        )}

        {!globalBudget && (
          <div className="bg-[#141414] border border-white/5 border-dashed rounded-2xl p-md flex items-center justify-between">
            <p className="text-sm text-gray-light flex items-center gap-2">
              <Wallet size={14} /> Belum ada target pengeluaran bulan ini.
            </p>
            <Button variant="outline" size="sm" onClick={() => setIsBudgetModalOpen(true)}>
              Atur Target
            </Button>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-sm md:gap-lg">
          {/* Income */}
          <Card className="p-sm md:p-xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-16 h-16 md:w-24 md:h-24 bg-success/5 rounded-full blur-2xl group-hover:bg-success/10 transition-all" />
            <div className="flex items-center gap-xs mb-1 md:mb-md text-gray-light">
              <div className="p-1 bg-success/10 rounded-md shrink-0 text-success">
                <ArrowUpRight size={12} />
              </div>
              <p className="text-[9px] md:text-micro tracking-widest uppercase truncate">{t('finance.totalIncome')}</p>
            </div>
            <div className="flex items-end justify-between mt-sm">
              <p className="text-sm md:text-2xl font-bold text-success truncate">
                {isTransactionsLoading ? (
                  <span className="animate-pulse text-gray-light">...</span>
                ) : (
                  formatCurrency(totalIncome, currency, locale)
                )}
              </p>
            </div>
          </Card>
          
          {/* Expense */}
          <Card className="p-sm md:p-xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-16 h-16 md:w-24 md:h-24 bg-danger/5 rounded-full blur-2xl group-hover:bg-danger/10 transition-all" />
            <div className="flex items-center gap-xs mb-1 md:mb-md text-gray-light">
              <div className="p-1 bg-danger/10 rounded-md shrink-0 text-danger">
                <ArrowDownLeft size={12} />
              </div>
              <p className="text-[9px] md:text-micro tracking-widest uppercase truncate">{t('finance.totalExpense')}</p>
            </div>
            <div className="flex items-end justify-between mt-sm">
              <p className="text-sm md:text-2xl font-bold text-danger truncate">
                {isTransactionsLoading ? (
                  <span className="animate-pulse text-gray-light">...</span>
                ) : (
                  formatCurrency(totalExpense, currency, locale)
                )}
              </p>
            </div>
          </Card>

          {/* Net Balance */}
          <Card className="p-sm md:p-xl relative overflow-hidden group border-b-2 border-primary/20">
            <div className="absolute -right-4 -bottom-4 w-16 h-16 md:w-24 md:h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
            <div className="flex items-center gap-xs mb-1 md:mb-md text-gray-light">
              <div className="p-1 bg-primary/10 rounded-md shrink-0 text-primary">
                <TrendingUp size={12} />
              </div>
              <p className="text-[9px] md:text-micro tracking-widest uppercase truncate">{t('finance.netBalance')}</p>
            </div>
            <div className="flex items-end justify-between mt-sm">
              <p className="text-sm md:text-2xl font-bold text-white truncate">
                {isTransactionsLoading ? (
                  <span className="animate-pulse text-gray-light">...</span>
                ) : (
                  formatCurrency(totalIncome - totalExpense, currency, locale)
                )}
              </p>
            </div>
          </Card>

          {/* Wallet / Closing Balance card — always visible */}
          <Card className="p-sm md:p-xl relative overflow-hidden group border-b-2 border-accent-gold/30">
            <div className="absolute -right-4 -bottom-4 w-16 h-16 md:w-24 md:h-24 bg-accent-gold/5 rounded-full blur-2xl group-hover:bg-accent-gold/10 transition-all" />
            <div className="flex items-center gap-xs mb-1 md:mb-md text-gray-light">
              <div className="p-1 bg-accent-gold/10 rounded-md shrink-0 text-accent-gold">
                <Wallet size={12} />
              </div>
              <p className="text-[9px] md:text-micro tracking-widest uppercase truncate">Dompet</p>
            </div>
            <div className="flex items-end justify-between mt-sm">
              <div className="min-w-0">
                <p className={`text-sm md:text-2xl font-bold truncate ${(isTransactionsLoading || isPrevLoading) ? 'text-gray-light' : (closingBalance >= 0 ? 'text-accent-gold' : 'text-danger')}`}>
                  {(isTransactionsLoading || isPrevLoading) ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    formatCurrency(closingBalance, currency, locale)
                  )}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="hidden md:flex flex-col md:flex-row gap-md items-center justify-between">
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

        <div className="hidden md:block">
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
                ) : paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((t) => (
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
                          {resolveCategory(t.categories)?.name || 'Uncategorized'}
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
          {totalPages > 1 && (
            <div className="px-xl py-lg border-t border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between bg-black/[0.01] dark:bg-white/[0.01]">
              <p className="text-xs text-gray-light">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, filteredTransactions.length)} of {filteredTransactions.length}
              </p>
              <div className="flex items-center gap-xs">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1}
                >
                  Prev
                </Button>
                <div className="px-sm text-xs font-bold text-soft-cream min-w-[60px] text-center">
                  {page} / {totalPages}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
          </Card>
        </div>

        {/* Mobile Transaction Feed */}
        <div className="md:hidden">
          <TransactionFeed
            transactions={transactions}
            isLoading={isTransactionsLoading}
            searchQuery={searchQuery}
            filterType={filterType}
            onSearchChange={setSearchQuery}
            onFilterChange={setFilterType}
            onEdit={openEditModal}
            onDeleteRequest={setDeleteConfirmId}
            currency={currency}
            locale={locale}
          />
        </div>
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

      {isModalOpen && (
        <BottomSheet
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingTransaction ? t('finance.modal.editTitle') : t('finance.modal.addTitle')}
          footer={
            <div className="flex gap-md justify-end">
              <Button variant="ghost" size="md" onClick={handleCloseModal} disabled={isSaving}>{t('common.cancel')}</Button>
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
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-gray-light tracking-widest block">
                CATEGORY
                {form.category_id && (
                  <span className="ml-2 text-primary normal-case font-normal">
                    — {categories.find(c => c.id === form.category_id)?.name || ''}
                  </span>
                )}
              </label>
              <button 
                type="button" 
                onClick={() => setIsCategoryManagerOpen(true)}
                className="text-[10px] text-primary hover:underline font-bold uppercase tracking-widest"
              >
                Manage
              </button>
            </div>
            {categories.filter(c => c.type === form.type).length === 0 ? (
              <p className="text-xs text-gray-light italic py-md">
                No categories yet. Click <button type="button" onClick={() => setIsCategoryManagerOpen(true)} className="text-primary underline">Manage</button> to add some.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-sm">
                {/* None option */}
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, category_id: '' }))}
                  className={`flex flex-col items-center gap-xs p-md rounded-md border transition-all ${
                    !form.category_id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-black/5 dark:border-white/5 bg-gray-strong/40 text-gray-light hover:text-soft-cream hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="text-lg">—</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider truncate w-full text-center">None</span>
                </button>
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
                    <CategoryIcon name={cat.icon || 'ShoppingCart'} className="text-gray-light" />
                    <span className="text-[10px] uppercase font-bold tracking-wider truncate w-full text-center">{cat.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-sm">
            <label className="text-[10px] font-bold text-gray-light tracking-widest block">DESCRIPTION / NOTES</label>
            <textarea
              placeholder="Context or tags..."
              rows={2}
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full bg-gray-strong/40 border border-black/[0.05] dark:border-white/[0.05] rounded-md p-lg text-sm text-soft-cream focus:border-primary focus:outline-none resize-none"
            />
          </div>

          {!editingTransaction && (
            <div className="flex flex-col gap-sm p-md bg-gray-strong/40 rounded-lg border border-white/[0.05]">
              <div className="flex items-center gap-sm">
                <input
                  type="checkbox"
                  id="is_recurring"
                  checked={form.is_recurring}
                  onChange={(e) => setForm(f => ({ ...f, is_recurring: e.target.checked }))}
                  className="w-4 h-4 rounded border-white/10 bg-gray-strong text-primary focus:ring-primary accent-primary"
                />
                <label htmlFor="is_recurring" className="text-sm font-semibold text-soft-cream cursor-pointer">
                  Jadikan pengeluaran rutin (Langganan)
                </label>
              </div>
              {form.is_recurring && (
                <div className="flex items-center gap-md pl-6">
                  <span className="text-xs text-gray-light">Siklus:</span>
                  <div className="flex bg-gray-strong p-1 rounded-md border border-white/[0.05]">
                    {(['monthly', 'yearly', 'weekly'] as const).map((cycle) => (
                      <button
                        key={cycle}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, billing_cycle: cycle }))}
                        className={`px-3 py-1 text-[10px] font-bold rounded-sm transition-all uppercase tracking-widest ${
                          form.billing_cycle === cycle 
                            ? 'bg-primary/20 text-primary'
                            : 'text-gray-light hover:text-soft-cream'
                        }`}
                      >
                        {cycle === 'monthly' ? 'Bulan' : cycle === 'yearly' ? 'Tahun' : 'Minggu'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <details className="bg-primary/5 border border-primary/10 rounded-lg group">
            <summary className="p-md text-sm font-bold text-primary cursor-pointer flex items-center justify-between list-none">
              ✨ Catatan Evaluasi (Mindful Spending)
              <ChevronRight size={16} className="group-open:rotate-90 transition-transform" />
            </summary>
            
            <div className="px-md pb-md space-y-md border-t border-primary/10 pt-md">
              <div className="space-y-sm">
                <label className="text-[10px] font-bold text-gray-light tracking-widest block">SIFAT PENGELUARAN</label>
                <div className="flex bg-gray-strong p-1 rounded-md border border-black/[0.05] dark:border-white/[0.05]">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, expected_impact: 'Kebutuhan (Need)' }))}
                    className={`flex-1 py-sm text-xs font-bold rounded-sm transition-all ${
                      form.expected_impact === 'Kebutuhan (Need)' 
                        ? 'bg-primary text-white shadow-md'
                        : 'text-gray-light hover:text-soft-cream'
                    }`}
                  >
                    Kebutuhan
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, expected_impact: 'Keinginan (Want)' }))}
                    className={`flex-1 py-sm text-xs font-bold rounded-sm transition-all ${
                      form.expected_impact === 'Keinginan (Want)' 
                        ? 'bg-primary text-white shadow-md'
                        : 'text-gray-light hover:text-soft-cream'
                    }`}
                  >
                    Keinginan
                  </button>
                </div>
              </div>

              <div className="space-y-sm">
                <label className="text-[10px] font-bold text-gray-light tracking-widest block">MANFAAT / ALASAN BELI INI</label>
                <textarea
                  placeholder="Misal: Self-reward setelah gajian, alat kerja, dll..."
                  rows={2}
                  value={form.decision_notes}
                  onChange={(e) => setForm(f => ({ ...f, decision_notes: e.target.value }))}
                  className="w-full bg-gray-strong/40 border border-black/[0.05] dark:border-white/[0.05] rounded-md p-md text-sm text-soft-cream focus:border-primary focus:outline-none resize-none"
                />
              </div>
            </div>
          </details>

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
      </BottomSheet>
      )}

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
      {isCategoryManagerOpen && (
        <CategoryManagerModal
          isOpen={isCategoryManagerOpen}
          onClose={() => setIsCategoryManagerOpen(false)}
          typeFilter={form.type}
        />
      )}
      <BudgetManagerModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
      />
      </Layout>
    </>
  );
}
