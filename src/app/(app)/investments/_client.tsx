'use client';

import { EmptyState } from '@/components/ui/EmptyState';
import { StatCard } from '@/components/ui/StatCard';
import { Tabs } from '@/components/ui/Tabs';
import { Textarea } from '@/components/ui/Textarea';
import { Fab } from '@/components/ui/Fab';
import React, { useMemo, useState } from 'react';
import { Card, Button, Badge, Loading, Modal, Input, Alert, ErrorAlert, ConfirmModal, Select, DatePicker } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useInvestment } from '@/hooks/useInvestment';
import { sanitizeError } from '@/libs/validation';
import { InvestmentPosition } from '@/types/database';
import { Plus, ArrowsClockwise, Shield, Trash as Trash2, WifiHigh as Wifi, WifiX as WifiOff } from '@phosphor-icons/react';
import { formatCurrency, formatNumber, getLocalISODate } from '@/libs/format';
import { formatSignedCurrency, formatSignedPercent } from '@/services/finance/investmentService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { Heading, Paragraph } from '@/components/ui/typography';
import { AppPageHeader } from '@/components/layout/AppPageHeader';

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

export function InvestmentsClient() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const { currency, locale, timezone } = useUserPreferences();
  const { t } = useTranslation();
  const {
    positions,
    calculatedPositions,
    summary,
    unconvertedCount,
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
  
  const [activeTab, setActiveTab] = useState<'financial' | 'physical' | 'liabilities'>('financial');

  // =============================================================
  // 1) FILTER / TAB LOGIC
  // Tab ini memfilter portfolio berdasarkan kategori aset:
  // - financial: stock, crypto, gold
  // - physical: property, vehicle
  // - liabilities: debt
  // =============================================================
  const filteredPositions = useMemo(() => {
    return calculatedPositions.filter(pos => {
      if (activeTab === 'financial') return ['stock', 'crypto', 'gold'].includes(pos.asset_type);
      if (activeTab === 'physical') return ['property', 'vehicle'].includes(pos.asset_type);
      if (activeTab === 'liabilities') return ['debt'].includes(pos.asset_type);
      return true;
    });
  }, [calculatedPositions, activeTab]);

  const openNewModal = () => {
    setEditingPosition(null);
    setForm(defaultForm);
    setIsModalOpen(true);
  };

  // Reads the stored position, not the converted row, so saving cannot write converted prices back.
  const openEditModal = (id: string) => {
    const position = positions.find((p) => p.id === id);
    if (!position) return;
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

  // =============================================================
  // 3) SAVE / UPDATE POSITION LOGIC
  // Fungsi ini menangani pembuatan atau edit posisi investasi.
  // Di sini logika validasi form, payload, dan panggilan createPosition/updatePosition terjadi.
  // =============================================================
  const handleSave = async () => {
    // Basic validation
    setFormError(null);
    setFormErrors({});

    const isPhysicalOrDebt = ['property', 'vehicle', 'debt'].includes(form.asset_type);

    const errors: Record<string, string> = {};
    if (!isPhysicalOrDebt && !form.symbol.trim()) errors.symbol = t('investment_form.symbol_required');
    
    if (!form.amount && !isPhysicalOrDebt) errors.amount = t('investment_form.amount_required');
    else if (form.amount && isNaN(Number(form.amount.replace(/,/g, '')))) errors.amount = t('investment_form.invalid_number');
    
    if (!form.buy_price) errors.buy_price = t('investment_form.price_required');
    else if (isNaN(Number(form.buy_price.replace(/,/g, '')))) errors.buy_price = t('investment_form.invalid_number');

    if (form.manual_current_price && isNaN(Number(form.manual_current_price.replace(/,/g, '')))) {
      errors.manual_current_price = t('investment_form.invalid_number');
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      const isManualPriceSource = isPhysicalOrDebt || form.manual_current_price;
      
      const payload = {
        asset_type: form.asset_type,
        symbol: form.symbol.trim().toUpperCase() || `${form.asset_type.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
        display_name: form.display_name.trim() || null,
        amount: isPhysicalOrDebt && !form.amount ? 1 : Number(form.amount.replace(/,/g, '')),
        buy_price: Number(form.buy_price.replace(/,/g, '')),
        buy_date: form.buy_date,
        quote_currency: isManualPriceSource ? currency : 'USD',
        price_source: isManualPriceSource
          ? 'manual'
          : form.asset_type === 'crypto'
            ? 'coingecko'
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

  const handleRefresh = async () => {
    setFormError(null);
    try {
      await refreshPortfolio();
    } catch (err) {
      setFormError(sanitizeError(err));
    }
  };

  if (authLoading) {
    return (
      <>
        <div className="flex items-center justify-center h-[60vh]">
          <Loading text={t('dashboard.checking_session')} />
        </div>
      </>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <>
      {formError && <ErrorAlert error={formError} onDismiss={() => setFormError(null)} />}
      <>
        {/*
          =============================================================
          4) HALAMAN UTAMA / RENDER UI
          - Header title & subtitle
          - Summary cards
          - Portfolio card + tabs + table
          - Empty state
          =============================================================
        */}
        <div className="space-y-8 animate-fade-in">
          <AppPageHeader
            title={t('investment_page.investment_analyst_title')}
            description={t('investment_page.investment_analyst_desc')}
            actions={
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  iconOnlyOnMobile
                  onClick={handleRefresh}
                  isLoading={isRefreshing}
                  loadingText={t('investment_page.syncing_prices')}
                  leftIcon={<ArrowsClockwise size={16} />}
                >
                  {t('investment_page.refresh_prices')}
                </Button>
                <Button variant="primary" size="sm" onClick={openNewModal} leftIcon={<Plus size={16} />} className="hidden md:inline-flex">
                  {t('investment_page.add_position')}
                </Button>
              </>
            }
          />

        {error && (
          <Alert type="error" title={t('investment_page.investment_analyst_title')}>
            {error?.message || String(error)}
          </Alert>
        )}

        {unconvertedCount > 0 && (
          <Alert type="warning">
            {t('common.rates_unavailable_total').replace('{count}', String(unconvertedCount))}
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <StatCard label={t('dashboard.netWorth.title')} value={formatCurrency(summary?.netWorth || 0, currency, locale)} />
          <StatCard label={t('dashboard.netWorth.totalAssets')} value={formatCurrency(summary?.totalAssets || 0, currency, locale)} hint={t('investment_page.liquid_property_vehicle')} />
          <StatCard label={t('dashboard.netWorth.totalLiabilities')} value={formatCurrency(summary?.totalLiabilities || 0, currency, locale)} hint={t('investment_page.debt_mortgages')} />
        </div>

        <Card className="overflow-hidden">
          <div className="px-4 py-4 md:px-6 border-b border-foreground/5 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <Heading as="h3" size="h3" className="text-sm font-semibold tracking-tight">{t('investment_page.portfolio_tracker')}</Heading>
              <Paragraph className="text-xs text-muted-foreground mt-1">{t('investment_page.portfolio_tracker_desc')}</Paragraph>
            </div>
            
            <Tabs
              variant="segmented"
              label={t('investment_page.portfolio_tracker')}
              value={activeTab}
              onChange={setActiveTab}
              items={[
                { id: 'financial', label: t('investment_page.financial_assets') },
                { id: 'physical', label: t('investment_page.physical_assets') },
                { id: 'liabilities', label: t('investment_page.liabilities') },
              ]}
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loading /></div>
          ) : filteredPositions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-foreground/5 text-xs text-muted-foreground">
                    <th className="px-4 py-3 md:px-6">{t('investment_page.asset')}</th>
                    <th className="hidden px-4 py-3 sm:table-cell">{t('investment_page.amount')}</th>
                    <th className="hidden px-4 py-3 md:table-cell">{t('investment_page.avg_cost')}</th>
                    <th className="px-4 py-3 text-right">{t('investment_page.value')}</th>
                    <th className="hidden px-4 py-3 text-right sm:table-cell">{t('investment_form.profit_loss')}</th>
                    <th className="px-4 py-3 text-right md:px-6">{t('investment_page.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPositions.map((position) => {
                    const isLive = !!position.last_valued_at;
                    const lastUpdated = position.last_valued_at
                      ? new Date(position.last_valued_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZone: timezone })
                      : null;
                    return (
                    <tr key={position.id} className="border-b border-foreground/5 hover:bg-foreground/5 transition-colors">
                      <td className="px-4 py-3 md:px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Paragraph className="font-bold text-foreground text-xs">{position.symbol}</Paragraph>
                            <Badge variant={getAssetBadgeVariant(position.asset_type)} size="sm" className="px-1 py-0">
                              {t(`investment_form.asset_${position.asset_type}`)}
                            </Badge>
                            {isLive ? (
                              <span title={t('investment_page.price_live').replace('{time}', lastUpdated ?? '')}>
                                <Wifi size={12} aria-hidden="true" className="text-success" />
                                <span className="sr-only">{t('investment_page.price_live').replace('{time}', lastUpdated ?? '')}</span>
                              </span>
                            ) : (
                              <span title={t('investment_page.price_stale')}>
                                <WifiOff size={12} aria-hidden="true" className="text-muted-foreground" />
                                <span className="sr-only">{t('investment_page.price_stale')}</span>
                              </span>
                            )}
                          </div>
                          <Paragraph className="text-xs text-muted-foreground truncate max-w-[120px]">{position.display_name || t('investment_page.tracked_position')}</Paragraph>
                          <Paragraph className="font-mono text-xs text-muted-foreground sm:hidden">{formatNumber(position.amount, 4)}</Paragraph>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 font-mono text-xs text-foreground sm:table-cell">{formatNumber(position.amount, 4)}</td>
                      <td className="hidden px-4 py-3 font-mono text-xs text-foreground md:table-cell">{formatCurrency(position.buy_price, position.display_currency ?? currency, locale)}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-foreground">
                        {formatCurrency(position.current_value, position.display_currency ?? currency, locale)}
                      </td>
                      <td className={`hidden px-4 py-3 text-right font-mono text-xs sm:table-cell ${position.profit_loss >= 0 ? 'text-income' : 'text-expense'}`}>
                        {formatSignedCurrency(position.profit_loss, position.display_currency ?? currency, locale)}
                        <span className="block text-muted-foreground">{formatSignedPercent(position.percentage_change)}</span>
                      </td>
                      <td className="px-4 py-3 text-right md:px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(position.id)}>
                            {t('investment_page.edit')}
                          </Button>
                          <button
                            onClick={() => setDeleteConfirmId(position.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
                            aria-label={t('investment_page.delete')}
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
            <EmptyState
              icon={Shield}
              title={t('investment_page.investment_empty_state_desc')}
              action={<Button variant="primary" size="md" onClick={openNewModal}>{t('investment_page.add_first_position')}</Button>}
            />
          )}
        </Card>

      </div>

      {/*
        =============================================================
        5) MOBILE ACTION BUTTON
        Tombol floating untuk add position di device mobile.
        =============================================================
      */}
      <Fab label={t('investment_page.add_position')} onClick={openNewModal} />

      {/*
        =============================================================
        6) MODAL FORM
        Ini tempat form tambah/edit posisi investasi. 
        Semua input di sini disimpan ke form state lalu dikirim via handleSave().
        =============================================================
      */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPosition ? t('investment_page.edit_position') : t('investment_page.add_position_title')}
        footer={
          <div className="flex justify-end gap-4">
            <Button variant="ghost" size="md" onClick={() => setIsModalOpen(false)} disabled={isSaving}>{t('investment_page.cancel_upper')}</Button>
            <Button variant="primary" size="md" onClick={handleSave} isLoading={isSaving} disabled={isSaving}>
              {isSaving ? t('investment_page.saving_upper') : editingPosition ? t('investment_page.update_position_upper') : t('investment_page.save_position_upper')}
            </Button>
          </div>
        }

      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label={t('investment_page.asset_type')}
              value={form.asset_type}
              onValueChange={(val) => setForm((prev) => ({ ...prev, asset_type: val as AssetType }))}
              options={[
                {
                  label: t('investment_page.financial_assets'),
                  options: [
                    { value: 'stock', label: t('investment_form.asset_stock') },
                    { value: 'crypto', label: t('investment_form.asset_crypto') },
                    { value: 'gold', label: t('investment_form.asset_gold') },
                  ],
                },
                {
                  label: t('investment_page.physical_assets'),
                  options: [
                    { value: 'property', label: t('investment_form.asset_property') },
                    { value: 'vehicle', label: t('investment_form.asset_vehicle') },
                  ],
                },
                {
                  label: t('investment_page.liabilities'),
                  options: [
                    { value: 'debt', label: t('investment_form.asset_debt') },
                  ],
                },
              ]}
            />
            {!['property', 'vehicle', 'debt'].includes(form.asset_type) && (
              <Input
                label={t('investment_page.symbol')}
                placeholder={form.asset_type === 'gold' ? 'XAU' : 'AAPL / BTC'}
                value={form.symbol}
                onChange={(e) => setForm((prev) => ({ ...prev, symbol: e.target.value }))}
                error={formErrors.symbol}
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('investment_page.display_name')}
              placeholder="Apple Inc. / Bitcoin / Gold"
              value={form.display_name}
              onChange={(e) => setForm((prev) => ({ ...prev, display_name: e.target.value }))}
            />
            <DatePicker
              label={t('investment_page.buy_date')}
              value={form.buy_date}
              onChange={(val) => setForm((prev) => ({ ...prev, buy_date: val }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!['property', 'vehicle', 'debt'].includes(form.asset_type) && (
              <Input
                label={t('investment_page.amount_upper')}
                type="number"
                step="0.0001"
                placeholder="1.25"
                value={form.amount}
                onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                error={formErrors.amount}
              />
            )}
            <Input
              label={
                form.asset_type === 'debt'
                  ? t('investment_page.original_amount')
                  : ['property', 'vehicle'].includes(form.asset_type) || form.manual_current_price || form.symbol.trim().toUpperCase() === 'XAU.IDR'
                    ? t('investment_page.avg_cost')
                    : t('investment_page.buy_price_usd')
              }
              type="number"
              step="0.0001"
              placeholder="0.00"
              value={form.buy_price}
              onChange={(e) => setForm((prev) => ({ ...prev, buy_price: e.target.value }))}
              error={formErrors.buy_price}
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
            label={form.asset_type === 'debt' ? t('investment_page.remaining_amount') : form.asset_type === 'property' || form.asset_type === 'vehicle' ? t('investment_page.value') : t('investment_page.manual_price')}
            type="number"
            step="0.01"
            placeholder={form.asset_type === 'debt' ? t('investment_form.remaining_placeholder') : t('investment_form.manual_placeholder')}
            value={form.manual_current_price}
            onChange={(e) => setForm((prev) => ({ ...prev, manual_current_price: e.target.value }))}
            helpText={form.asset_type === 'debt' ? t('investment_form.amount_left') : t('investment_page.manual_price_help')}
            error={formErrors.manual_current_price}
          />

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground">{t('investment_page.notes_upper')}</label>
            <Textarea
              rows={4}
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder={t('investment_page.notes_placeholder')}
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
      </>
    </>
  );
}
