'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Card, Button, buttonClassName, Badge, Loading, Modal, Input, ErrorAlert, InlineError, ConfirmModal, CategoryIcon, BottomSheet, DatePicker } from '@/components';
import { AppPageHeader } from '@/components/layout/AppPageHeader';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { BudgetManagerModal } from './components/BudgetManagerModal';
import { TransactionFeed } from './components/TransactionFeed';
import { TextCaptureForm } from './components/TextCaptureForm';
import { InstallmentList } from './components/InstallmentList';
import { InstallmentSheet } from './components/InstallmentSheet';
const ReceiptUpload = dynamic(() => import('./components/ReceiptUpload').then(m => m.ReceiptUpload), { ssr: false });
const DriverPayoutImport = dynamic(() => import('./components/DriverPayoutImport').then(m => m.DriverPayoutImport), { ssr: false });
const ReceiptReviewSheet = dynamic(() => import('./components/ReceiptReviewSheet').then(m => m.ReceiptReviewSheet), { ssr: false });
import { DuplicateAlert } from './components/DuplicateAlert';
import { FinanceTabBar, FinanceTab } from './components/FinanceTabBar';
import { detectDuplicates } from '@/services/finance/capture/duplicateDetector';
import { useAuthStore } from '@/store/authStore';
import { useTransaction } from '@/hooks/useTransaction';
import { useCategory } from '@/hooks/useCategory';
import { useSubscription } from '@/hooks/useSubscription';
import { useBudget } from '@/hooks/useBudget';
import { useInstallment } from '@/hooks/useInstallment';
import { validateTransaction, sanitizeError } from '@/libs/validation';
import { Transaction, InstallmentPayment, Installment } from '@/types/database';
import { Plus, Wallet, Funnel, MagnifyingGlass as Search, Info, Target, Swap, X, Bell, TrendUp as TrendingUp, TrendDown as TrendingDown, DotsThreeVertical as MoreVertical, ArrowUpRight, ArrowDownLeft, Calendar, ArrowsClockwise, CaretLeft as ChevronLeft, CaretRight as ChevronRight, Coins, Receipt, Bank as Landmark } from '@phosphor-icons/react';
import { formatCurrency, formatDate, getLocalISODate } from '@/libs/format';
import { fetchExchangeRates } from '@/libs/exchange';
import { addBillingCycle, formatDateOnly, getDateRange } from '@/libs/date';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTranslation } from '@/libs/i18n/useTranslation';
import type { CategoryJoin } from '@/types/database';
import { DEFAULT_FINANCE_CATEGORIES } from '@/libs/defaultCategories';
import { categoryQueries } from '@/services/activity/categoryQueries';
import { Heading, Paragraph } from '@/components/ui/typography';
import { resolveCategory } from '@/libs/finance/categoryHelpers';


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
  
  const { transactions, isLoading: isTransactionsLoading, userErrorMessage: transactionsError, createTransaction, updateTransaction, deleteTransaction, mutate: mutateTransactions } = useTransaction(
    start, 
    end, 
    undefined, 
    isCurrentMonth ? initialTransactions : undefined
  );
  // Fetch all transactions BEFORE selected month to compute opening balance (carry-forward)
  const { transactions: prevTransactions, isLoading: isPrevLoading } = useTransaction(carryStart, carryEnd);
  
  // Carry-forward: net balance of all past months
  const carryForwardBalance = prevTransactions.reduce((sum: number, t: Transaction) => {
    return t.type === 'income' ? sum + t.amount : sum - t.amount;
  }, 0);
  const { categories, mutate: mutateCategories } = useCategory();
  const { createSubscription } = useSubscription();
  const { globalBudget, budgets } = useBudget();
  const { payInstallment } = useInstallment();
  
  const categorySpending = React.useMemo(() => {
    const spending: Record<string, number> = {};
    transactions.forEach((t: Transaction) => {
      if (t.type === 'expense' && t.category_id) {
        spending[t.category_id] = (spending[t.category_id] || 0) + t.amount;
      }
    });
    return spending;
  }, [transactions]);
  
  const categoryBudgets = budgets.filter(b => b.category_id !== null);
  
  const [page, setPage] = useState(1);
  const limit = 20;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isInstallmentSheetOpen, setIsInstallmentSheetOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [reviewTransactionId, setReviewTransactionId] = useState<string | null>(null);
  const [duplicateMatches, setDuplicateMatches] = useState<any[]>([]);
  const [ignoreDuplicates, setIgnoreDuplicates] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FinanceTab>('transactions');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category_id: '',
    date: getLocalISODate(new Date(), timezone),
    original_currency: currency || 'USD',
    decision_notes: '',
    expected_impact: '',
    is_recurring: false,
    billing_cycle: 'monthly' as 'monthly' | 'yearly' | 'weekly',
    source: 'manual' as 'manual' | 'text' | 'receipt' | 'import' | 'api'
  });

  // Auto-seed default categories for users who have none (skip onboarding / old accounts)
  useEffect(() => {
    if (!isAuthenticated || categories.length > 0) return;
    // Wait until SWR has finished the first fetch (categories is [] but not yet loading)
    const timer = setTimeout(async () => {
      try {
        const existing = await categoryQueries.getCategories();
        if (!existing || existing.length === 0) {
          await categoryQueries.seedDefaultCategories(DEFAULT_FINANCE_CATEGORIES);
          mutateCategories();
        }
      } catch (e) {
        console.warn('[Finance] Auto-seed categories failed:', e);
      }
    }, 1500); // small delay to let SWR settle
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, categories.length]);

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
      source: form.source as 'manual' | 'text' | 'receipt' | 'import' | 'api',
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

    if (!editingTransaction && !ignoreDuplicates) {
      const matches = detectDuplicates(
        {
          amount: safeAmount,
          title: form.title,
          date: form.date,
          type: form.type as 'income' | 'expense',
          source: 'manual',
        } as any,
        transactions
      );

      if (matches.length > 0) {
        setDuplicateMatches(matches);
        setIsSaving(false);
        return;
      }
    }

    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, payload);
      } else {
        await createTransaction(payload);
        
        // Handle subscription creation
        if (form.is_recurring) {
          await createSubscription({
            name: form.title,
            amount: safeAmount,
            currency: form.original_currency,
            billing_cycle: form.billing_cycle,
            next_billing_date: addBillingCycle(form.date, form.billing_cycle),
            category_id: form.category_id || null,
            is_active: true,
          });
        }
      }
      setIsModalOpen(false);
      setDuplicateMatches([]);
      setIgnoreDuplicates(false);
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
    setDuplicateMatches([]);
    setIgnoreDuplicates(false);
  };

  const handlePayInstallment = async (payment: InstallmentPayment, installment: Installment) => {
    try {
      const tx = await createTransaction({
        title: `Cicilan: ${installment.title}`,
        amount: payment.amount,
        type: 'expense' as const,
        date: getLocalISODate(new Date(), timezone),
        category_id: installment.category_id || null,
        source: 'manual',
        original_currency: installment.currency || currency || 'IDR'
      });
      if (tx && tx.id) {
        await payInstallment(payment.id, tx.id);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal membayar cicilan');
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
      source: 'manual',
      original_currency: currency || 'USD',
      decision_notes: '',
      expected_impact: '',
      is_recurring: false,
      billing_cycle: 'monthly',
    });
    setDuplicateMatches([]);
    setIgnoreDuplicates(false);
    setIsModalOpen(true);
  };

  const openCaptureModal = (parsed: any) => {
    setEditingTransaction(null);
    
    let matchedCatId = '';
    if (parsed.category_name) {
      const matchedCat = categories.find((c: any) => c.name.toLowerCase() === parsed.category_name?.toLowerCase());
      if (matchedCat) {
        matchedCatId = matchedCat.id;
      }
    }

    setForm({
      title: parsed.title,
      amount: parsed.amount.toString(),
      type: parsed.type,
      category_id: matchedCatId,
      date: parsed.date,
      source: 'text',
      original_currency: currency || 'USD',
      decision_notes: '',
      expected_impact: '',
      is_recurring: false,
      billing_cycle: 'monthly',
    });
    setDuplicateMatches([]);
    setIgnoreDuplicates(false);
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
      original_currency: t.original_currency || currency || 'USD',
      decision_notes: (t.metadata?.decision_notes as string) || '',
      expected_impact: (t.metadata?.expected_impact as string) || '',
      is_recurring: false, // Editing doesn't re-create subscription
      billing_cycle: 'monthly' as 'monthly' | 'yearly' | 'weekly',
      source: (t.source as 'manual' | 'text' | 'receipt' | 'import' | 'api') || 'manual',
    });
    setIsModalOpen(true);
  };

  const totalIncome = transactions
    .filter((t: Transaction) => t.type === 'income')
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
    
  const totalExpense = transactions
    .filter((t: Transaction) => t.type === 'expense')
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
  
  // Closing balance = carry-forward + this month's net
  const closingBalance = carryForwardBalance + (totalIncome - totalExpense);
  const isFirstMonth = prevTransactions.length === 0;

  const filteredTransactions = transactions.filter((t: Transaction) => {
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
      <>
        <div className="flex justify-center py-12"><Loading text="Checking your session..." /></div>
      </>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <>
      <ErrorAlert error={error} onDismiss={() => setError(null)} />
      {transactionsError && (
        <InlineError message={transactionsError} retryLabel={t('common.try_again')} onRetry={() => mutateTransactions()} className="mb-4" />
      )}
      <>
      <div className="space-y-8 animate-fade-in">
        <AppPageHeader
          title={t('finance.title')}
          description={t('finance.subtitle')}
          actions={
            <>
              <Link
                href="/finance/subscriptions"
                aria-label={t('finance.activeSubscriptions')}
                className={buttonClassName({ variant: 'outline', size: 'sm', iconOnlyOnMobile: true })}
              >
                <Calendar size={16} aria-hidden="true" />
                <span className="hidden sm:inline">{t('finance.activeSubscriptions')}</span>
              </Link>
              <Button variant="primary" size="sm" onClick={openAddModal} leftIcon={<Plus size={16} />} className="hidden md:inline-flex">
                {t('finance.newEntry')}
              </Button>
            </>
          }
        >
          <div className="inline-flex items-center rounded-full border border-foreground/5 bg-foreground/[0.02]">
            <button onClick={handlePrevMonth} aria-label={t('dashboard.prev_month')} className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground">
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <span className="min-w-32 text-center text-label-md text-foreground" aria-live="polite">
              {monthName} {selectedYear}
            </span>
            <button onClick={handleNextMonth} aria-label={t('dashboard.next_month')} className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground">
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </AppPageHeader>

        {/* --- GLOBAL OVERVIEW CARDS --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-6 w-full">
          {/* Income */}
          <Card className="p-2 md:p-8 relative overflow-hidden group">
            <div className="flex items-center gap-1 mb-1 md:mb-4 text-muted-foreground">
              <div className="p-1 bg-success/10 rounded-md shrink-0 text-success">
                <Coins size={12} />
              </div>
              <Paragraph className="text-xs md:text-micro tracking-widest uppercase truncate">{t('finance.totalIncome')}</Paragraph>
            </div>
            <div className="flex items-end justify-between mt-2">
              <Paragraph className="text-sm md:text-2xl font-semibold text-success truncate">
                {isTransactionsLoading ? (
                  <span className="text-muted-foreground">...</span>
                ) : (
                  formatCurrency(totalIncome, currency, locale)
                )}
              </Paragraph>
            </div>
          </Card>
          
          {/* Expense */}
          <Card className="p-2 md:p-8 relative overflow-hidden group">
            <div className="flex items-center gap-1 mb-1 md:mb-4 text-muted-foreground">
              <div className="p-1 bg-danger/10 rounded-md shrink-0 text-danger">
                <Receipt size={12} />
              </div>
              <Paragraph className="text-xs md:text-micro tracking-widest uppercase truncate">{t('finance.totalExpense')}</Paragraph>
            </div>
            <div className="flex items-end justify-between mt-2">
              <Paragraph className="text-sm md:text-2xl font-semibold text-danger truncate">
                {isTransactionsLoading ? (
                  <span className="text-muted-foreground">...</span>
                ) : (
                  formatCurrency(totalExpense, currency, locale)
                )}
              </Paragraph>
            </div>
          </Card>

          {/* Net Balance */}
          <Card className="p-2 md:p-8 relative overflow-hidden group border-b-2 border-primary/20">
            <div className="flex items-center gap-1 mb-1 md:mb-4 text-muted-foreground">
              <div className="p-1 bg-primary/10 rounded-md shrink-0 text-primary">
                <Landmark size={12} />
              </div>
              <Paragraph className="text-xs md:text-micro tracking-widest uppercase truncate">{t('finance.netBalance')}</Paragraph>
            </div>
            <div className="flex items-end justify-between mt-2">
              <Paragraph className="text-sm md:text-2xl font-semibold text-foreground truncate">
                {isTransactionsLoading ? (
                  <span className="text-muted-foreground">...</span>
                ) : (
                  formatCurrency(totalIncome - totalExpense, currency, locale)
                )}
              </Paragraph>
            </div>
          </Card>

          {/* Wallet / Closing Balance card — always visible */}
          <Card className="p-2 md:p-8 relative overflow-hidden group border-b-2 border-primary/30">
            <div className="flex items-center gap-1 mb-1 md:mb-4 text-muted-foreground">
              <div className="p-1 bg-primary/10 rounded-md shrink-0 text-primary">
                <Wallet size={12} />
              </div>
              <Paragraph className="text-xs md:text-micro tracking-widest uppercase truncate">{t('finance.wallet')}</Paragraph>
            </div>
            <div className="flex items-end justify-between mt-2">
              <div className="min-w-0">
                <Paragraph className={`text-sm md:text-2xl font-semibold truncate ${(isTransactionsLoading || isPrevLoading) ? 'text-muted-foreground' : (closingBalance >= 0 ? 'text-primary' : 'text-danger')}`}>
                  {(isTransactionsLoading || isPrevLoading) ? (
                    <span>...</span>
                  ) : (
                    formatCurrency(closingBalance, currency, locale)
                  )}
                </Paragraph>
              </div>
            </div>
          </Card>
        </div>

        {/* --- TABS --- */}
        <FinanceTabBar activeTab={activeTab} onChange={(tab) => {
          if (tab === 'subscriptions') {
            router.push('/finance/subscriptions');
          } else {
            setActiveTab(tab);
          }
        }} />

        {activeTab === 'transactions' && (
          <>
            <div className="flex gap-2 items-start w-full">
              <div className="flex-1 min-w-0">
                <TextCaptureForm onCaptureSuccess={openCaptureModal} />
              </div>
              <ReceiptUpload 
                onUploadSuccess={(txId) => setReviewTransactionId(txId)} 
                onError={(err) => setError(err)} 
              />
              <DriverPayoutImport onSaved={() => setError(null)} onError={setError} />
            </div>

        {/* Budget Progress Bar */}
        {globalBudget && (
          <div className="bg-surface border border-foreground/5 rounded-2xl p-6 relative overflow-hidden group">
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <Wallet size={16} className="text-primary" />
                  <Heading as="h3" size="h3" className="text-sm font-semibold text-foreground">{t('finance.budget.globalMonthly')}</Heading>
                </div>
                <Paragraph className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(totalExpense, currency || 'USD', locale)} / {formatCurrency(globalBudget.amount, currency || 'USD', locale)}
                </Paragraph>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsBudgetModalOpen(true)}>
                {t('finance.budget.set_target')}
              </Button>
            </div>
            
            <div className="h-2 w-full bg-foreground/5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  (totalExpense / globalBudget.amount) > 0.9 ? 'bg-danger' : 
                  (totalExpense / globalBudget.amount) > 0.75 ? 'bg-warning' : 'bg-primary'
                }`}
                style={{ width: `${Math.min((totalExpense / globalBudget.amount) * 100, 100)}%` }}
              ></div>
            </div>
            <Paragraph className="text-xs text-right mt-2 font-mono text-muted-foreground">
              {t('finance.budget.used_percentage').replace('{percent}', String(Math.round((totalExpense / globalBudget.amount) * 100)))}
            </Paragraph>
          </div>
        )}

        {!globalBudget && (
          <div className="bg-surface border border-foreground/5 border-dashed rounded-2xl p-2 md:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <Paragraph className="text-xs md:text-sm text-muted-foreground flex items-center gap-2">
              <Wallet size={14} className="shrink-0" /> {t('finance.budget.no_target_set')}
            </Paragraph>
            <Button variant="outline" size="sm" onClick={() => setIsBudgetModalOpen(true)} className="w-full sm:w-auto">
              {t('finance.budget.set_target')}
            </Button>
          </div>
        )}

        {/* Category Budget Progress Bars (Predictive Budgeting) */}
        {categoryBudgets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryBudgets.map(budget => {
              const spent = categorySpending[budget.category_id!] || 0;
              const cat = categories.find(c => c.id === budget.category_id);
              const percentage = Math.min((spent / budget.amount) * 100, 100);
              
              return (
                <div key={budget.id} className="bg-foreground/[0.02] border border-foreground/5 rounded-2xl p-4 relative overflow-hidden group">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-surface/40 flex items-center justify-center text-xs text-foreground">
                        <CategoryIcon name={cat?.icon || 'Box'} />
                      </div>
                      <Heading as="h3" size="h3" className="text-xs font-medium text-foreground">{cat?.name || 'Kategori'}</Heading>
                    </div>
                    <Paragraph className="text-xs font-mono text-muted-foreground">
                      {Math.round(percentage)}%
                    </Paragraph>
                  </div>
                  
                  <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        percentage > 90 ? 'bg-danger' : 
                        percentage > 75 ? 'bg-warning' : 'bg-primary'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <Paragraph className="text-xs text-muted-foreground">
                      {formatCurrency(spent, currency || 'USD', locale)}
                    </Paragraph>
                    <Paragraph className="text-xs text-muted-foreground">
                      {formatCurrency(budget.amount, currency || 'USD', locale)}
                    </Paragraph>
                  </div>
                </div>
              );
            })}
          </div>
        )}


        <div className="hidden md:flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder={t('finance.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-surface/40 border border-foreground/[0.05] rounded-md text-sm focus:border-primary focus:outline-none transition-all"
            />
          </div>
          
          <div className="flex bg-surface/40 p-1 rounded-md border border-foreground/[0.05]">
            {(['all', 'income', 'expense'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={`px-8 py-2 text-xs font-bold rounded-sm transition-all uppercase tracking-widest ${
                  filterType === type 
                    ? 'bg-primary text-on-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t(`finance.filter${type.charAt(0).toUpperCase() + type.slice(1)}` as any)}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden md:block">
          <Card className="overflow-hidden border-none ">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-foreground/[0.02] border-b border-foreground/[0.05]">
                  <th className="px-4 py-4 md:px-8 md:py-6 text-xs font-medium text-muted-foreground tracking-widest uppercase">{t('finance.table.transaction')}</th>
                  <th className="px-4 py-4 md:px-8 md:py-6 text-xs font-medium text-muted-foreground tracking-widest uppercase">{t('finance.table.date')}</th>
                  <th className="px-4 py-4 md:px-8 md:py-6 text-xs font-medium text-muted-foreground tracking-widest uppercase">{t('finance.table.category')}</th>
                  <th className="px-4 py-4 md:px-8 md:py-6 text-right text-xs font-medium text-muted-foreground tracking-widest uppercase">{t('finance.table.amount')}</th>
                  <th className="px-4 py-4 md:px-8 md:py-6 text-right text-xs font-medium text-muted-foreground tracking-widest uppercase">{t('finance.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {isTransactionsLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center"><Loading /></td>
                  </tr>
                ) : paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((t: Transaction) => (
                    <tr 
                      key={t.id} 
                      className="group hover:bg-foreground/[0.02] transition-colors cursor-pointer"
                      onClick={() => openEditModal(t)}
                    >
                      <td className="px-4 py-4 md:px-8 md:py-8">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            t.type === 'income' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                          }`}>
                            {t.type === 'income' ? <Coins size={18} /> : <Receipt size={18} />}
                          </div>
                          <div>
                            <Paragraph className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors underline-offset-4 decoration-primary">{t.title}</Paragraph>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 md:px-8 md:py-8">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar size={12} />
                          <span className="text-xs font-medium">{formatDate(t.date)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 md:px-8 md:py-8">
                        <Badge variant={t.type === 'income' ? 'success' : 'danger'} size="sm">
                          {resolveCategory(t.categories)?.name || 'Uncategorized'}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 md:px-8 md:py-8 text-right">
                        <Paragraph className={`text-sm font-semibold ${t.type === 'income' ? 'text-success' : 'text-foreground'}`}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, t.original_currency || currency, locale)}
                        </Paragraph>
                      </td>
                      <td className="px-4 py-4 md:px-8 md:py-8 text-right">
                        <div className="flex justify-end gap-2">
                          {(t.source === 'receipt' || t.source === 'text') && (
                            <button 
                              type="button" 
                              title="View Receipt" 
                              onClick={(e) => { e.stopPropagation(); setReviewTransactionId(t.id); }}
                              className="p-2 text-primary hover:bg-primary/10 rounded-md transition-all"
                            >
                              <Receipt size={16} />
                            </button>
                          )}
                          <button 
                            type="button" 
                            title="More options" 
                            onClick={(e) => { e.stopPropagation(); openEditModal(t); }}
                            className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-foreground/5 transition-all"
                          >
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center opacity-50">
                        <Info size={32} className="text-muted-foreground mb-4" />
                        <Paragraph className="text-sm text-foreground">{t('moduleCommon.emptyTitle')}</Paragraph>
                        <Paragraph className="text-xs text-muted-foreground">{t('moduleCommon.emptyDesc')}</Paragraph>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="px-4 py-4 md:px-8 md:py-6 border-t border-foreground/[0.05] flex items-center justify-between bg-foreground/[0.01]">
              <Paragraph className="text-xs text-muted-foreground">
                {t('moduleCommon.showing')} {((page - 1) * limit) + 1} {t('moduleCommon.to')} {Math.min(page * limit, filteredTransactions.length)} {t('moduleCommon.of')} {filteredTransactions.length}
              </Paragraph>
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1}
                >
                  Prev
                </Button>
                <div className="px-2 text-xs font-medium text-foreground min-w-[60px] text-center">
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
            onViewReceipt={setReviewTransactionId}
            currency={currency}
            locale={locale}
          />
        </div>
        </>
        )}

        {activeTab === 'installments' && (
          <InstallmentList 
            onAddClick={() => setIsInstallmentSheetOpen(true)}
            onPayClick={handlePayInstallment}
          />
        )}
      </div>

      {/* Mobile-only FAB for New Entry */}
      {activeTab === 'transactions' && (
        <div className="md:hidden fixed bottom-24 right-4 z-40">
          <Button 
            variant="primary" 
            onClick={openAddModal} 
            className="rounded-full w-14 h-14 flex items-center justify-center "
            aria-label={t('finance.newEntry')}
          >
            <Plus size={24} />
          </Button>
        </div>
      )}

      {isModalOpen && (
        <BottomSheet
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingTransaction ? t('finance.modal.editTitle') : t('finance.modal.addTitle')}
          footer={
            <div className="flex gap-4 justify-end">
              <Button variant="ghost" size="md" onClick={handleCloseModal} disabled={isSaving}>{t('common.cancel')}</Button>
              <Button variant="primary" onClick={handleSave} disabled={isSaving || (duplicateMatches.length > 0 && !ignoreDuplicates)} className="w-full">
                {isSaving ? t('finance.modal.savingBtn') : t('finance.modal.saveBtn')}
              </Button>
            </div>
          }
        >
        <div className="space-y-8 pb-24 md:pb-6">
          <DuplicateAlert 
            matches={duplicateMatches}
            currency={currency}
            locale={locale}
            onIgnore={() => {
              setIgnoreDuplicates(true);
              setTimeout(() => {
                handleSave();
              }, 0);
            }}
            onViewDuplicate={(id) => {
              setIsModalOpen(false);
              const t = transactions.find((tx: any) => tx.id === id);
              if (t) openEditModal(t);
            }}
          />

          <div className="flex bg-surface p-1 rounded-md border border-foreground/[0.05]">
            {(['income', 'expense'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => form.type !== type && setForm(f => ({ ...f, type, category_id: '' }))}
                className={`flex-1 py-4 text-xs font-bold rounded-sm transition-all uppercase tracking-widest ${
                  form.type === type 
                    ? type === 'income' ? 'bg-success text-background' : 'bg-danger text-background'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t(`finance.modal.type.${type}`)}
              </button>
            ))}
          </div>

          <Input
            label={t('finance.modal.title')}
            placeholder={t('finance.modal.titlePlaceholder')}
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

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('finance.modal.amount')}
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={form.amount}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setForm(f => ({ ...f, amount: val }));
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
            <DatePicker
              label={t('finance.modal.date')}
              value={form.date}
              onChange={(val) => {
                setForm(f => ({ ...f, date: val }));
                if (formErrors.date) {
                  setFormErrors(prev => {
                    const copy = { ...prev };
                    delete copy.date;
                    return copy;
                  });
                }
              }}
              error={formErrors.date}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-muted-foreground tracking-widest block">
                {t('finance.modal.category')}
                {form.category_id && (
                  <span className="ml-2 text-primary normal-case font-normal">
                    — {categories.find(c => c.id === form.category_id)?.name || ''}
                  </span>
                )}
              </label>
              <button 
                type="button" 
                onClick={() => setIsCategoryManagerOpen(true)}
                className="text-xs text-primary hover:underline font-bold uppercase tracking-widest"
              >
                {t('finance.modal.manage')}
              </button>
            </div>
            {categories.filter(c => c.type === form.type).length === 0 ? (
              <Paragraph className="text-xs text-muted-foreground italic py-4">
                {t('finance.modal.noCategories')} <button type="button" onClick={() => setIsCategoryManagerOpen(true)} className="text-primary underline">{t('finance.modal.manage')}</button> {t('finance.modal.toAddSome')}
              </Paragraph>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {/* None option */}
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, category_id: '' }))}
                  className={`flex flex-col items-center gap-1 p-4 rounded-md border transition-all ${
                    !form.category_id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-foreground/5 bg-surface/40 text-muted-foreground hover:text-foreground hover:bg-foreground/5'
                  }`}
                >
                  <span className="text-lg">—</span>
                  <span className="text-xs uppercase font-bold tracking-wider truncate w-full text-center">{t('finance.modal.none')}</span>
                </button>
                {categories.filter(c => c.type === form.type).map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, category_id: cat.id }))}
                    className={`flex flex-col items-center gap-1 p-4 rounded-md border transition-all ${
                      form.category_id === cat.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-foreground/5 bg-surface/40 text-muted-foreground hover:text-foreground hover:bg-foreground/5'
                    }`}
                  >
                    <CategoryIcon name={cat.icon || 'ShoppingCart'} className="text-muted-foreground" />
                    <span className="text-xs uppercase font-bold tracking-wider truncate w-full text-center">{cat.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {!editingTransaction && (
            <div className="flex flex-col gap-2 p-4 bg-surface/40 rounded-lg border border-foreground/[0.05]">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_recurring"
                  checked={form.is_recurring}
                  onChange={(e) => setForm(f => ({ ...f, is_recurring: e.target.checked }))}
                  className="w-4 h-4 rounded border-foreground/10 bg-surface text-primary focus:ring-primary accent-primary"
                />
                <label htmlFor="is_recurring" className="text-sm font-semibold text-foreground cursor-pointer">
                  {t('finance.modal.makeRecurring')}
                </label>
              </div>
              {form.is_recurring && (
                <div className="flex items-center gap-4 pl-6">
                  <span className="text-xs text-muted-foreground">{t('finance.modal.cycle')}</span>
                  <div className="flex bg-surface p-1 rounded-md border border-foreground/[0.05]">
                    {(['monthly', 'yearly', 'weekly'] as const).map((cycle) => (
                      <button
                        key={cycle}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, billing_cycle: cycle }))}
                        className={`px-3 py-1 text-xs font-bold rounded-sm transition-all uppercase tracking-widest ${
                          form.billing_cycle === cycle 
                            ? 'bg-primary/20 text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {cycle === 'monthly' ? t('finance.modal.cycleMonthly') : cycle === 'yearly' ? t('finance.modal.cycleYearly') : t('finance.modal.cycleWeekly')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <details className="bg-primary/5 border border-primary/10 rounded-lg group">
            <summary className="p-4 text-sm font-bold text-primary cursor-pointer flex items-center justify-between list-none">
              {t('finance.modal.mindfulSpending')}
              <ChevronRight size={16} className="group-open:rotate-90 transition-transform" />
            </summary>
            
            <div className="px-4 pb-4 space-y-4 border-t border-primary/10 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground tracking-widest block">{t('finance.modal.expenseNature')}</label>
                <div className="flex bg-surface p-1 rounded-md border border-foreground/[0.05]">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, expected_impact: 'Kebutuhan (Need)' }))}
                    className={`flex-1 py-2 text-xs font-bold rounded-sm transition-all ${
                      form.expected_impact === 'Kebutuhan (Need)' 
                        ? 'bg-primary text-on-primary '
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t('finance.modal.need')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, expected_impact: 'Keinginan (Want)' }))}
                    className={`flex-1 py-2 text-xs font-bold rounded-sm transition-all ${
                      form.expected_impact === 'Keinginan (Want)' 
                        ? 'bg-primary text-on-primary '
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t('finance.modal.want')}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground tracking-widest block">
                  {t('finance.modal.reason')} <span className="font-normal opacity-70">({t('common.optional')})</span>
                </label>
                <textarea
                  placeholder={t('finance.modal.reasonPlaceholder')}
                  rows={2}
                  value={form.decision_notes}
                  onChange={(e) => setForm(f => ({ ...f, decision_notes: e.target.value }))}
                  className="w-full bg-surface/40 border border-foreground/[0.05] rounded-md p-4 text-sm text-foreground focus:border-primary focus:outline-none resize-none"
                />
              </div>
            </div>
          </details>

          {editingTransaction && (
            <button 
              type="button"
              onClick={() => setDeleteConfirmId(editingTransaction.id)}
              className="w-full py-4 text-danger text-xs font-bold uppercase tracking-widest border border-danger/20 hover:bg-danger/5 rounded-md transition-all"
            >
              {t('finance.modal.deleteBtn')}
            </button>
          )}
        </div>
      </BottomSheet>
      )}

      {isInstallmentSheetOpen && (
        <InstallmentSheet 
          isOpen={isInstallmentSheetOpen} 
          onClose={() => setIsInstallmentSheetOpen(false)} 
        />
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
      <ReceiptReviewSheet
        transactionId={reviewTransactionId}
        isOpen={!!reviewTransactionId}
        onClose={() => setReviewTransactionId(null)}
        onConfirmSuccess={() => {
          if (typeof mutateTransactions === 'function') mutateTransactions();
        }}
      />
      </>
    </>
  );
}
