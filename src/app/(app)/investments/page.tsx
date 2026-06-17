'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Button, Badge, Loading, Modal, Input, Alert, ErrorAlert, ConfirmModal } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useInvestment } from '@/hooks/useInvestment';
import { validateTransaction, sanitizeError } from '@/libs/validation';
import { InvestmentPosition } from '@/types/database';
import {
  BriefcaseBusiness,
  Coins,
  Landmark,
  Plus,
  RefreshCcw,
  Shield,
  Trash2,
  TrendingUp,
  TrendingDown,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { formatCurrency, formatNumber, getLocalISODate } from '@/libs/format';
import { formatSignedCurrency, formatSignedPercent } from '@/services/investmentService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTranslation } from '@/libs/i18n/useTranslation';

type AssetType = 'stock' | 'crypto' | 'gold';

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
        price_source:
          form.asset_type === 'crypto'
            ? 'coingecko'
            : form.asset_type === 'stock'
              ? 'alphavantage'
              : form.manual_current_price
                ? 'manual'
                : 'alphavantage',
        external_id: form.asset_type === 'crypto' ? form.external_id.trim().toLowerCase() || null : null,
        manual_current_price: form.manual_current_price ? Number(form.manual_current_price.replace(/,/g, '')) : null,
        notes: form.notes.trim() || null,
        is_active: true,
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
              <BriefcaseBusiness size={14} className="text-primary" />
              {t('investment_page.investment_analyst_desc')}
            </p>
          </div>
          <div className="flex gap-md">
            <Button variant="ghost" size="md" onClick={() => refreshPortfolio()} disabled={isRefreshing}>
              <RefreshCcw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
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

        <Card className="p-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-44 h-44 bg-primary/10 blur-3xl rounded-full" />
          <div className="relative z-10 space-y-sm">
            <p className="text-sm text-soft-cream italic">"{headerInsight}"</p>
            <div className="flex flex-wrap gap-sm pt-sm">
              {insights?.scenario ? (
                <Badge variant="info" size="sm">{t(`investment_page.scenario_${insights.scenario}`)}</Badge>
              ) : null}
              {insights?.confidence ? (
                <Badge variant={insights.confidence === 'low' ? 'danger' : insights.confidence === 'moderate' ? 'warning' : 'success'} size="sm">
                  {t(`investment_page.confidence_${insights.confidence}`)}
                </Badge>
              ) : null}
            </div>
            {insights?.riskWarning ? (
              <p className="text-xs text-warning mt-2">{insights.riskWarning}</p>
            ) : null}
            {insights?.recommendation ? (
              <p className="text-sm text-gray-light mt-2">{insights.recommendation}</p>
            ) : null}
            {insights?.observations?.length ? (
              <div className="flex flex-wrap gap-sm pt-sm">
                {insights.observations.map((item) => (
                  <Badge key={item} variant="insight" size="sm">{item}</Badge>
                ))}
              </div>
            ) : null}
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-lg">
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
                        className={`h-full rounded-full ${type === 'stock' ? 'bg-info' : type === 'crypto' ? 'bg-activity' : 'bg-warning'}`}
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
                    <th className="px-lg py-md">{t('investment_page.asset')}</th>
                    <th className="px-lg py-md">{t('investment_page.amount')}</th>
                    <th className="px-lg py-md">{t('investment_page.avg_cost')}</th>
                    <th className="px-lg py-md">{t('investment_page.current_price')}</th>
                    <th className="px-lg py-md">{t('investment_page.day_chg')}</th>
                    <th className="px-lg py-md">{t('investment_page.value')}</th>
                    <th className="px-lg py-md">{t('investment_page.pl')}</th>
                    <th className="px-lg py-md">{t('investment_page.risk')}</th>
                    <th className="px-lg py-md text-right">{t('investment_page.actions')}</th>
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
                      <td className="px-lg py-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-sm">
                            <p className="font-bold text-white">{position.symbol}</p>
                            <Badge variant={getAssetBadgeVariant(position.asset_type)} size="sm">
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
                          <p className="text-xs text-gray-light">{position.display_name || t('investment_page.tracked_position')}</p>
                        </div>
                      </td>
                      <td className="px-lg py-lg text-sm text-soft-cream">{formatNumber(position.amount, 4)}</td>
                      <td className="px-lg py-lg text-sm text-soft-cream">{formatCurrency(position.buy_price, currency, locale)}</td>
                      <td className="px-lg py-lg">
                        <p className="text-sm text-soft-cream">{formatCurrency(position.current_price, currency, locale)}</p>
                        {lastUpdated && (
                          <p className="text-[10px] text-gray-light mt-1">{t('investment_page.update_label')} {lastUpdated}</p>
                        )}
                      </td>
                      <td className="px-lg py-lg">
                        <div className={`flex items-center gap-1 text-sm font-semibold ${
                          position.day_change_percent >= 0 ? 'text-success' : 'text-danger'
                        }`}>
                          {position.day_change_percent >= 0
                            ? <TrendingUp size={12} />
                            : <TrendingDown size={12} />
                          }
                          {formatSignedPercent(position.day_change_percent)}
                        </div>
                        <div className="text-xs text-gray-light">{formatSignedCurrency(position.day_change_value, currency, locale)}</div>
                      </td>
                      <td className="px-lg py-lg text-sm font-semibold text-white">{formatCurrency(position.current_value, currency, locale)}</td>
                      <td className="px-lg py-lg">
                        <div className={`${position.profit_loss >= 0 ? 'text-success' : 'text-danger'} text-sm font-semibold`}>
                          {formatSignedCurrency(position.profit_loss, currency, locale)}
                        </div>
                        <div className="text-xs text-gray-light">{formatSignedPercent(position.percentage_change)}</div>
                      </td>
                      <td className="px-lg py-lg align-top">
                        <div className="space-y-1">
                          <Badge
                            variant={position.risk_category === 'high' ? 'danger' : position.risk_category === 'moderate' ? 'warning' : 'success'}
                            size="sm"
                          >
                            {position.risk_category.toUpperCase()}
                          </Badge>
                          <p className="text-[11px] text-gray-light">
                            {position.risk_status === 'overweight'
                              ? t('investment_page.overweight')
                              : position.risk_status === 'underweight'
                              ? t('investment_page.underweight')
                              : t('investment_page.balanced')}
                          </p>
                          <p className="text-[10px] text-gray-light">{position.portfolio_weight_pct.toFixed(1)}% of portfolio</p>
                        </div>
                      </td>
                      <td className="px-lg py-lg">
                        <div className="flex items-center justify-end gap-sm">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(position)}>{t('investment_page.edit')}</Button>
                          <button
                            onClick={() => setDeleteConfirmId(position.id)}
                            className="p-sm text-danger hover:bg-danger/10 rounded-md transition-colors"
                          >
                            <Trash2 size={16} />
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

          {form.asset_type === 'gold' && (
            <Input
              label={t('investment_page.manual_price')}
              type="number"
              step="0.01"
              placeholder="Useful if API pricing is unavailable"
              value={form.manual_current_price}
              onChange={(e) => setForm((prev) => ({ ...prev, manual_current_price: e.target.value }))}
              helpText={t('investment_page.manual_price_help')}
            />
          )}

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
