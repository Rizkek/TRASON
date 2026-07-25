'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Button, Badge, Loading, Modal, Input, Alert, ErrorAlert, ConfirmModal } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useInvestment } from '@/hooks/useInvestment';
import { validateTransaction, sanitizeError } from '@/libs/validation';
import { InvestmentPosition } from '@/types/database';
import { Briefcase, Coins, Bank as Landmark, Plus, ArrowsClockwise, Shield, Trash as Trash2, TrendUp as TrendingUp, TrendDown as TrendingDown, WifiHigh as Wifi, WifiX as WifiOff } from '@phosphor-icons/react';
import { formatCurrency, formatNumber, getLocalISODate } from '@/libs/format';
import { formatSignedCurrency, formatSignedPercent } from '@/services/finance/investmentService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTranslation } from '@/libs/i18n/useTranslation';

type AssetType = 'stock' | 'crypto' | 'gold' | 'property' | 'debt' | 'vehicle' | 'other';

interface InvestmentFormState {
  asset_type: AssetType;
  symbol: string;
  display_name: string;
  amount: string;
  buy_price: string;
  buy_date: string;
  external_id: string;
  manual_current_price: string;
  notes: string;
  rationale_type: 'long_term' | 'dividend' | 'trading' | 'hedging' | 'fomo' | 'dca' | 'other' | '';
}

const defaultForm: InvestmentFormState = {
  asset_type: 'stock',
  symbol: '',
  display_name: '',
  amount: '',
  buy_price: '',
  buy_date: getLocalISODate(),
  external_id: '',
  manual_current_price: '',
  notes: '',
  rationale_type: '',
};

const getAssetBadgeVariant = (type: AssetType) => {
  if (type === 'stock') return 'info';
  if (type === 'crypto') return 'activity';
  return 'warning';
};

export default function InvestmentsPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const { currency, locale, timezone } = useUserPreferences();
  const { t } = useTranslation();
  const {
    calculatedPositions,
    summary,
    insights,
    isLoading,
    isRefreshing,
    error,
    refreshPortfolio,
    createPosition,
    updatePosition,
    deletePosition,
  } = useInvestment();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<InvestmentPosition | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState<InvestmentFormState>(defaultForm);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // SWR automatically handles portfolio fetching on mount



  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const openNewModal = () => {
    setEditingPosition(null);
    setForm(defaultForm);
    setIsModalOpen(true);
  };

  const openEditModal = (position: InvestmentPosition) => {
    setEditingPosition(position);
    setForm({
      asset_type: position.asset_type,
      symbol: position.symbol,
      display_name: position.display_name || '',
      amount: String(position.amount),
      buy_price: String(position.buy_price),
      buy_date: position.buy_date,
      external_id: position.external_id || '',
      manual_current_price: position.manual_current_price ? String(position.manual_current_price) : '',
      notes: position.notes || '',
      rationale_type: '', // Will be saved in InvestmentTransaction, not Position for MVP, or we can just keep it blank on edit.
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    // Basic validation
    setFormError(null);
    setFormErrors({});

    const errors: Record<string, string> = {};
    if (!form.symbol.trim()) errors.symbol = 'Symbol is required';
    if (!form.amount) errors.amount = 'Amount is required';
    else if (isNaN(Number(form.amount.replace(/,/g, '')))) errors.amount = 'Amount must be a valid number';
    
    if (!form.buy_price) errors.buy_price = 'Buy price is required';
    else if (isNaN(Number(form.buy_price.replace(/,/g, '')))) errors.buy_price = 'Buy price must be a valid number';

    if (form.manual_current_price && isNaN(Number(form.manual_current_price.replace(/,/g, '')))) {
      errors.manual_current_price = 'Must be a valid number';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Remove the annoying asset prefix validation

    setIsSaving(true);
    try {
      const payload = {
        asset_type: form.asset_type,
        symbol: form.symbol.trim().toUpperCase(),
        display_name: form.display_name.trim() || null,
        amount: Number(form.amount.replace(/,/g, '')),
        buy_price: Number(form.buy_price.replace(/,/g, '')),
        buy_date: form.buy_date,
        quote_currency: 'USD',
        price_source: form.manual_current_price
          ? 'manual'
          : form.asset_type === 'crypto'
            ? 'coingecko'
            : 'alphavantage',
        external_id: form.asset_type === 'crypto' ? form.external_id.trim().toLowerCase() || null : null,
        manual_current_price: form.manual_current_price ? Number(form.manual_current_price.replace(/,/g, '')) : null,
        notes: form.notes.trim() || null,
        is_active: true,
        // rationale_type is part of the form and will be used when we create an InvestmentTransaction in the backend
        // We'll log it if createPosition accepts it in the payload. Let's add it to payload as a custom metadata for now if not typed.
      };

      if (editingPosition) {
        await updatePosition(editingPosition.id, payload);
      } else {
        await createPosition(payload);
      }

      setIsModalOpen(false);
      setForm(defaultForm);
    } catch (err) {
      const errorMessage = sanitizeError(err);
      setFormError(errorMessage);
      console.error('Failed to save investment:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deletePosition(deleteConfirmId);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const headerInsight = useMemo(() => {
    if (insights?.headline) return insights.headline;
    if (!summary) return t('investment_page.default_insight');
    return t('investment_page.portfolio_worth')
      .replace('{value}', formatCurrency(summary.totalValue, currency, locale))
      .replace('{count}', String(summary.positionsCount));
  }, [currency, insights, locale, summary, t]);

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loading text={t('dashboard.checking_session')} />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <>
      {formError && <ErrorAlert error={formError} onDismiss={() => setFormError(null)} />}
      <Layout>
        <div className="space-y-xl animate-fade-in">
          <div className="flex items-start justify-between gap-md flex-wrap">
          <div className="space-y-sm max-w-2xl">
            <h1 className="text-display font-serif text-gradient">{t('investment_page.investment_analyst_title')}</h1>
            <p className="text-subtext flex items-center gap-sm">
              {t('investment_page.investment_analyst_desc')}
            </p>
          </div>
          <div className="hidden md:flex gap-md">
            <Button variant="ghost" size="md" onClick={() => refreshPortfolio()} disabled={isRefreshing}>
              <ArrowsClockwise size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {t('investment_page.refresh_prices')}
            </Button>
            <Button variant="primary" size="md" onClick={openNewModal}>
              <Plus size={16} className="mr-2" />
              {t('investment_page.add_position')}
            </Button>
          </div>
        </div>

        {error && (
          <Alert type="error" title={t('investment_page.investment_analyst_title')}>
            {error?.message || String(error)}
          </Alert>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-md md:gap-lg">
          <Card className="p-xl">
            <p className="text-micro text-gray-light mb-sm">{t('investment_page.portfolio_value')}</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(summary?.totalValue || 0, currency, locale)}</p>
          </Card>
          <Card className="p-xl">
            <p className="text-micro text-gray-light mb-sm">{t('investment_page.unrealized_pl')}</p>
            <p className={`text-2xl font-bold ${(summary?.totalProfitLoss || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatSignedCurrency(summary?.totalProfitLoss || 0, currency, locale)}
            </p>
          </Card>
          <Card className="p-xl">
            <p className="text-micro text-gray-light mb-sm">{t('dashboard.today')}</p>
            <p className={`text-2xl font-bold ${(summary?.dailyChangeValue || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatSignedCurrency(summary?.dailyChangeValue || 0, currency, locale)}
            </p>
            <p className="text-xs text-gray-light mt-1">{formatSignedPercent(summary?.dailyChangePercent || 0)}</p>
          </Card>
          <Card className="p-xl">
            <p className="text-micro text-gray-light mb-sm">{t('investment_page.allocation_mix')}</p>
            <div className="space-y-3 text-xs text-gray-light">
              {['stock', 'crypto', 'gold'].map((type) => {
                const value = summary?.allocationByType[type as keyof typeof summary['allocationByType']] || 0;
                const percent = summary?.totalValue ? (value / summary.totalValue) * 100 : 0;
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span>{t(`dashboard.${type === 'stock' ? 'stocks' : type === 'crypto' ? 'crypto' : 'gold'}`)}</span>
                      <span>{percent.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                      <div
                        style={{ width: `${Math.min(percent, 100)}%` }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="px-lg py-md border-b border-black/5 dark:border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold tracking-tight">{t('investment_page.portfolio_tracker')}</h3>
              <p className="text-xs text-gray-light mt-1">{t('investment_page.portfolio_tracker_desc')}</p>
            </div>
            {summary?.topPerformer ? (
              <Badge variant="success" size="sm">
                <TrendingUp size={12} className="mr-1" />
                {t('investment_page.top_performer')} {summary.topPerformer.symbol}
              </Badge>
            ) : null}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-2xl"><Loading /></div>
          ) : calculatedPositions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/5 text-[10px] uppercase tracking-widest text-gray-light">
                    <th className="px-sm py-sm">{t('investment_page.asset')}</th>
                    <th className="px-sm py-sm">{t('investment_page.amount')}</th>
                    <th className="px-sm py-sm">{t('investment_page.avg_cost')}</th>
                    <th className="px-sm py-sm">{t('investment_page.current_price')}</th>
                    <th className="px-sm py-sm">{t('investment_page.day_chg')}</th>
                    <th className="px-sm py-sm">{t('investment_page.value')}</th>
                    <th className="px-sm py-sm">{t('investment_page.pl')}</th>
                    <th className="px-sm py-sm">{t('investment_page.risk')}</th>
                    <th className="px-sm py-sm text-right">{t('investment_page.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {calculatedPositions.map((position) => {
                    const isLive = !!position.last_valued_at;
                    const lastUpdated = position.last_valued_at
                      ? new Date(position.last_valued_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZone: timezone })
                      : null;
                    return (
                    <tr key={position.id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:bg-white/5 transition-colors">
                      <td className="px-sm py-md">
                        <div className="space-y-1">
                          <div className="flex items-center gap-xs">
                            <p className="font-bold text-white text-xs">{position.symbol}</p>
                            <Badge variant={getAssetBadgeVariant(position.asset_type)} size="sm" className="text-[9px] px-1 py-0">
                              {position.asset_type}
                            </Badge>
                            {isLive ? (
                              <span title={`Harga live, update ${lastUpdated}`}>
                                <Wifi size={10} className="text-success" />
                              </span>
                            ) : (
                              <span title="Harga belum direfresh">
                                <WifiOff size={10} className="text-gray-light" />
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-light truncate max-w-[120px]">{position.display_name || t('investment_page.tracked_position')}</p>
                        </div>
                      </td>
                      <td className="px-sm py-md text-xs text-soft-cream">{formatNumber(position.amount, 4)}</td>
                      <td className="px-sm py-md text-xs text-soft-cream">{formatCurrency(position.buy_price, currency, locale)}</td>
                      <td className="px-sm py-md">
                        <p className="text-xs text-soft-cream">{formatCurrency(position.current_price, currency, locale)}</p>
                        {lastUpdated && (
                          <p className="text-[9px] text-gray-light mt-1">{t('investment_page.update_label')} {lastUpdated}</p>
                        )}
                      </td>
                      <td className="px-sm py-md">
                        <div className={`flex items-center gap-1 text-xs font-semibold ${
                          position.day_change_percent >= 0 ? 'text-success' : 'text-danger'
                        }`}>
                          {position.day_change_percent >= 0
                            ? <TrendingUp size={10} />
                            : <TrendingDown size={10} />
                          }
                          {formatSignedPercent(position.day_change_percent)}
                        </div>
                        <div className="text-[10px] text-gray-light">{formatSignedCurrency(position.day_change_value, currency, locale)}</div>
                      </td>
                      <td className="px-sm py-md text-xs font-semibold text-white">{formatCurrency(position.current_value, currency, locale)}</td>
                      <td className="px-sm py-md">
                        <div className={`${position.profit_loss >= 0 ? 'text-success' : 'text-danger'} text-xs font-semibold`}>
                          {formatSignedCurrency(position.profit_loss, currency, locale)}
                        </div>
                        <div className="text-[10px] text-gray-light">{formatSignedPercent(position.percentage_change)}</div>
                      </td>
                      <td className="px-sm py-md align-top">
                        <div className="space-y-1">
                          <Badge
                            variant={position.risk_category === 'high' ? 'danger' : position.risk_category === 'moderate' ? 'warning' : 'success'}
                            size="sm"
                            className="text-[9px] px-1 py-0"
                          >
                            {position.risk_category.toUpperCase()}
                          </Badge>
                          <p className="text-[10px] text-gray-light">
                            {position.risk_status === 'overweight'
                              ? t('investment_page.overweight')
                              : position.risk_status === 'underweight'
                              ? t('investment_page.underweight')
                              : t('investment_page.balanced')}
                          </p>
                        </div>
                      </td>
                      <td className="px-sm py-md">
                        <div className="flex items-center justify-end gap-xs">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(position)} className="h-6 text-xs px-2">{t('investment_page.edit')}</Button>
                          <button
                            onClick={() => setDeleteConfirmId(position.id)}
                            className="p-1 text-danger hover:bg-danger/10 rounded-md transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-2xl text-center">
              <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-lg text-primary">
                <Shield size={28} />
              </div>
              <h3 className="text-lg font-bold text-white">{t('dashboard.start_with_one_position')}</h3>
              <p className="text-sm text-gray-light max-w-lg mx-auto mt-sm">
                {t('investment_page.investment_empty_state_desc')}
              </p>
              <Button variant="primary" size="md" className="mt-lg" onClick={openNewModal}>{t('investment_page.add_first_position')}</Button>
            </div>
          )}
        </Card>

        {calculatedPositions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            <Card className="p-xl">
              <div className="flex items-center gap-sm mb-md text-secondary">
                <Landmark size={16} />
                <p className="text-micro">{t('investment_page.stocks_upper')}</p>
              </div>
              <p className="text-lg font-bold text-white">{formatCurrency(summary?.allocationByType.stock || 0, currency, locale)}</p>
            </Card>
            <Card className="p-xl">
              <div className="flex items-center gap-sm mb-md text-primary">
                <Coins size={16} />
                <p className="text-micro">{t('investment_page.crypto_upper')}</p>
              </div>
              <p className="text-lg font-bold text-white">{formatCurrency(summary?.allocationByType.crypto || 0, currency, locale)}</p>
            </Card>
            <Card className="p-xl">
              <div className="flex items-center gap-sm mb-md text-warning">
                <Shield size={16} />
                <p className="text-micro">{t('investment_page.gold_upper')}</p>
              </div>
              <p className="text-lg font-bold text-white">{formatCurrency(summary?.allocationByType.gold || 0, currency, locale)}</p>
            </Card>
          </div>
        )}
      </div>

      {/* Mobile-only FAB for Add Position */}
      <div className="md:hidden fixed bottom-24 right-4 z-40 flex flex-col gap-sm">
        <Button 
          variant="ghost" 
          onClick={() => refreshPortfolio()} 
          disabled={isRefreshing}
          className="rounded-full w-12 h-12 flex items-center justify-center shadow-lg bg-black/80 dark:bg-white/10 text-white"
          aria-label={t('investment_page.refresh_prices')}
        >
          <ArrowsClockwise size={20} className={isRefreshing ? 'animate-spin' : ''} />
        </Button>
        <Button 
          variant="primary" 
          onClick={openNewModal} 
          className="rounded-full w-14 h-14 flex items-center justify-center shadow-[0_4px_20px_rgba(244,201,93,0.4)]"
          aria-label={t('investment_page.add_position')}
        >
          <Plus size={24} />
        </Button>
      </div>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPosition ? t('investment_page.edit_position') : t('investment_page.add_position_title')}
        footer={
          <div className="flex justify-end gap-md">
            <Button variant="ghost" size="md" onClick={() => setIsModalOpen(false)} disabled={isSaving}>{t('investment_page.cancel_upper')}</Button>
            <Button variant="primary" size="md" onClick={handleSave} isLoading={isSaving} disabled={isSaving}>
              {isSaving ? t('investment_page.saving_upper') : editingPosition ? t('investment_page.update_position_upper') : t('investment_page.save_position_upper')}
            </Button>
          </div>
        }

      >
        <div className="space-y-lg">
          <Alert type="warning" title="System Notice: Real-time Sync">
            Modul sinkronisasi <i>real-time</i> saat ini dioptimalkan untuk instrumen <strong>Stock (Saham) global</strong> dan <strong>Gold (Emas)</strong>. Untuk menjaga integritas arsitektur sistem, koneksi otomatis ke bursa <strong>Cryptocurrency</strong> sedang dalam fase audit dan peningkatan stabilitas. Anda tetap dapat mencatat portofolio Crypto secara presisi menggunakan fitur <strong>Manual Price</strong>.
          </Alert>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="space-y-sm">
              <label className="text-[10px] font-bold text-gray-light tracking-widest uppercase">{t('investment_page.asset_type')}</label>
              <select
                value={form.asset_type}
                onChange={(e) => setForm((prev) => ({ ...prev, asset_type: e.target.value as AssetType }))}
                className="w-full h-12 bg-gray-strong border border-black/5 dark:border-white/5 rounded-md px-md text-sm text-white focus:border-primary focus:outline-none"
              >
                <option value="stock">Stock</option>
                <option value="crypto">Crypto</option>
                <option value="gold">Gold</option>
              </select>
            </div>
            <Input
              label={t('investment_page.symbol')}
              placeholder={form.asset_type === 'gold' ? 'XAU' : 'AAPL / BTC'}
              value={form.symbol}
              onChange={(e) => setForm((prev) => ({ ...prev, symbol: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <Input
              label={t('investment_page.display_name')}
              placeholder="Apple Inc. / Bitcoin / Gold"
              value={form.display_name}
              onChange={(e) => setForm((prev) => ({ ...prev, display_name: e.target.value }))}
            />
            <Input
              label={t('investment_page.buy_date')}
              type="date"
              value={form.buy_date}
              onChange={(e) => setForm((prev) => ({ ...prev, buy_date: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <Input
              label={t('investment_page.amount_upper')}
              type="number"
              step="0.0001"
              placeholder="1.25"
              value={form.amount}
              onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
            />
            <Input
              label={t('investment_page.buy_price_usd')}
              type="number"
              step="0.0001"
              placeholder="0.00"
              value={form.buy_price}
              onChange={(e) => setForm((prev) => ({ ...prev, buy_price: e.target.value }))}
            />
          </div>

          {form.asset_type === 'crypto' && (
            <Input
              label={t('investment_page.coingecko_id')}
              placeholder="bitcoin / ethereum / solana"
              value={form.external_id}
              onChange={(e) => setForm((prev) => ({ ...prev, external_id: e.target.value }))}
              helpText={t('investment_page.coingecko_help')}
            />
          )}

          <Input
            label={t('investment_page.manual_price')}
            type="number"
            step="0.01"
            placeholder="Useful if API pricing is unavailable (e.g., IPOs)"
            value={form.manual_current_price}
            onChange={(e) => setForm((prev) => ({ ...prev, manual_current_price: e.target.value }))}
            helpText={t('investment_page.manual_price_help')}
          />

          {/* Investment Journal Section */}
          <div className="pt-sm border-t border-white/5 space-y-md">
            <div>
              <label className="text-[10px] font-bold text-gray-light tracking-widest uppercase mb-sm block">
                Investment Journal: Kenapa Membeli?
              </label>
              <div className="flex flex-wrap gap-xs">
                {[
                  { value: 'long_term', label: 'Long Term' },
                  { value: 'dividend', label: 'Dividend' },
                  { value: 'trading', label: 'Trading' },
                  { value: 'hedging', label: 'Hedging' },
                  { value: 'fomo', label: 'FOMO' },
                  { value: 'dca', label: 'DCA' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, rationale_type: prev.rationale_type === option.value ? '' : option.value as any }))}
                    className={`px-sm py-xs rounded-full border text-xs transition-colors ${
                      form.rationale_type === option.value
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'border-white/10 text-gray-light hover:border-white/30'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-sm">
            <label className="text-[10px] font-bold text-gray-light tracking-widest uppercase">{t('investment_page.notes_upper')}</label>
            <textarea
              rows={4}
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder={t('investment_page.notes_placeholder')}
              className="w-full bg-gray-strong border border-black/5 dark:border-white/5 rounded-md p-lg text-sm text-soft-cream focus:border-primary focus:outline-none resize-none"
            />
          </div>
        </div>
        </Modal>
      )}

      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title={t('investment_page.archive_position')}
        description={t('investment_page.archive_desc')}
        confirmText={t('investment_page.archive_btn')}
        isDangerous={true}
        onConfirm={handleConfirmDelete}
      />
      </Layout>
    </>
  );
}
