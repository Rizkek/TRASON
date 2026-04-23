'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Button, Badge, Loading, Modal, Input, Alert } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useInvestment } from '@/hooks/useInvestment';
import {
  BriefcaseBusiness,
  Coins,
  Landmark,
  Plus,
  RefreshCcw,
  Shield,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/libs/format';
import { formatSignedCurrency, formatSignedPercent } from '@/services/investmentService';

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
  buy_date: new Date().toISOString().split('T')[0],
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
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    calculatedPositions,
    summary,
    insights,
    isLoading,
    isRefreshing,
    error,
    fetchPositions,
    refreshPortfolio,
    createPosition,
    updatePosition,
    deletePosition,
  } = useInvestment();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<any>(null);
  const [form, setForm] = useState<InvestmentFormState>(defaultForm);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    fetchPositions();
  }, [authLoading, isAuthenticated, fetchPositions]);

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

  const openEditModal = (position: any) => {
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
    if (!form.symbol.trim() || !form.amount || !form.buy_price) return;

    setIsSaving(true);
    try {
      const payload = {
        asset_type: form.asset_type,
        symbol: form.symbol.trim().toUpperCase(),
        display_name: form.display_name.trim() || null,
        amount: Number(form.amount),
        buy_price: Number(form.buy_price),
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
        manual_current_price: form.manual_current_price ? Number(form.manual_current_price) : null,
        notes: form.notes.trim() || null,
        is_active: true,
      };

      if (editingPosition) {
        await updatePosition(editingPosition.id, payload as any);
      } else {
        await createPosition(payload as any);
      }

      setIsModalOpen(false);
      setForm(defaultForm);
    } finally {
      setIsSaving(false);
    }
  };

  const headerInsight = useMemo(() => {
    if (insights?.headline) return insights.headline;
    if (!summary) return 'Track long-term positions with simple signals instead of trading-screen noise.';
    return `Your portfolio is currently worth ${formatCurrency(summary.totalValue)} across ${summary.positionsCount} tracked positions.`;
  }, [insights, summary]);

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loading text="Checking your session..." />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <Layout>
      <div className="space-y-xl animate-fade-in">
        <div className="flex items-start justify-between gap-md flex-wrap">
          <div className="space-y-sm max-w-2xl">
            <h1 className="text-display font-serif text-gradient">Investment Analyst</h1>
            <p className="text-subtext flex items-center gap-sm">
              <BriefcaseBusiness size={14} className="text-primary" />
              Track stocks, crypto, and gold without turning your Personal OS into a trading terminal.
            </p>
          </div>
          <div className="flex gap-md">
            <Button variant="ghost" size="md" onClick={() => refreshPortfolio()} disabled={isRefreshing}>
              <RefreshCcw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Prices
            </Button>
            <Button variant="primary" size="md" onClick={openNewModal}>
              <Plus size={16} className="mr-2" />
              Add Position
            </Button>
          </div>
        </div>

        {error && (
          <Alert type="error" title="Investment Analyst">
            {error}
          </Alert>
        )}

        <Card className="p-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-44 h-44 bg-primary/10 blur-3xl rounded-full" />
          <div className="relative z-10 space-y-sm">
            <p className="text-sm text-soft-cream italic">"{headerInsight}"</p>
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
            <p className="text-micro text-gray-light mb-sm">PORTFOLIO VALUE</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(summary?.totalValue || 0)}</p>
          </Card>
          <Card className="p-xl">
            <p className="text-micro text-gray-light mb-sm">UNREALIZED P/L</p>
            <p className={`text-2xl font-bold ${(summary?.totalProfitLoss || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatSignedCurrency(summary?.totalProfitLoss || 0)}
            </p>
          </Card>
          <Card className="p-xl">
            <p className="text-micro text-gray-light mb-sm">TODAY</p>
            <p className={`text-2xl font-bold ${(summary?.dailyChangeValue || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatSignedCurrency(summary?.dailyChangeValue || 0)}
            </p>
            <p className="text-xs text-gray-light mt-1">{formatSignedPercent(summary?.dailyChangePercent || 0)}</p>
          </Card>
          <Card className="p-xl">
            <p className="text-micro text-gray-light mb-sm">ALLOCATION MIX</p>
            <div className="space-y-2 text-xs text-gray-light">
              <div className="flex justify-between"><span>Stocks</span><span>{formatCurrency(summary?.allocationByType.stock || 0)}</span></div>
              <div className="flex justify-between"><span>Crypto</span><span>{formatCurrency(summary?.allocationByType.crypto || 0)}</span></div>
              <div className="flex justify-between"><span>Gold</span><span>{formatCurrency(summary?.allocationByType.gold || 0)}</span></div>
            </div>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="px-lg py-md border-b border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold tracking-tight">PORTFOLIO TRACKER</h3>
              <p className="text-xs text-gray-light mt-1">Simple cost-basis tracking with daily pricing and narrative insights.</p>
            </div>
            {summary?.topPerformer ? (
              <Badge variant="success" size="sm">
                <TrendingUp size={12} className="mr-1" />
                Top performer: {summary.topPerformer.symbol}
              </Badge>
            ) : null}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-2xl"><Loading /></div>
          ) : calculatedPositions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-gray-light">
                    <th className="px-lg py-md">Asset</th>
                    <th className="px-lg py-md">Amount</th>
                    <th className="px-lg py-md">Avg Cost</th>
                    <th className="px-lg py-md">Current</th>
                    <th className="px-lg py-md">Value</th>
                    <th className="px-lg py-md">P/L</th>
                    <th className="px-lg py-md text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {calculatedPositions.map((position) => (
                    <tr key={position.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-lg py-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-sm">
                            <p className="font-bold text-white">{position.symbol}</p>
                            <Badge variant={getAssetBadgeVariant(position.asset_type)} size="sm">
                              {position.asset_type}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-light">{position.display_name || 'Tracked position'}</p>
                        </div>
                      </td>
                      <td className="px-lg py-lg text-sm text-soft-cream">{formatNumber(position.amount, 4)}</td>
                      <td className="px-lg py-lg text-sm text-soft-cream">{formatCurrency(position.buy_price)}</td>
                      <td className="px-lg py-lg text-sm text-soft-cream">{formatCurrency(position.current_price)}</td>
                      <td className="px-lg py-lg text-sm font-semibold text-white">{formatCurrency(position.current_value)}</td>
                      <td className="px-lg py-lg">
                        <div className={`${position.profit_loss >= 0 ? 'text-success' : 'text-danger'} text-sm font-semibold`}>
                          {formatSignedCurrency(position.profit_loss)}
                        </div>
                        <div className="text-xs text-gray-light">{formatSignedPercent(position.percentage_change)}</div>
                      </td>
                      <td className="px-lg py-lg">
                        <div className="flex items-center justify-end gap-sm">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(position)}>Edit</Button>
                          <button
                            onClick={async () => {
                              if (confirm(`Archive ${position.symbol}?`)) {
                                await deletePosition(position.id);
                              }
                            }}
                            className="p-sm text-danger hover:bg-danger/10 rounded-md transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-2xl text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-lg text-primary">
                <Shield size={28} />
              </div>
              <h3 className="text-lg font-bold text-white">Start with one position</h3>
              <p className="text-sm text-gray-light max-w-lg mx-auto mt-sm">
                Add a stock, a crypto holding, or your gold allocation. The module will surface value, unrealized profit and loss, and lightweight insights without replacing your current system.
              </p>
              <Button variant="primary" size="md" className="mt-lg" onClick={openNewModal}>Add First Position</Button>
            </div>
          )}
        </Card>

        {calculatedPositions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            <Card className="p-xl">
              <div className="flex items-center gap-sm mb-md text-secondary">
                <Landmark size={16} />
                <p className="text-micro">STOCKS</p>
              </div>
              <p className="text-lg font-bold text-white">{formatCurrency(summary?.allocationByType.stock || 0)}</p>
            </Card>
            <Card className="p-xl">
              <div className="flex items-center gap-sm mb-md text-primary">
                <Coins size={16} />
                <p className="text-micro">CRYPTO</p>
              </div>
              <p className="text-lg font-bold text-white">{formatCurrency(summary?.allocationByType.crypto || 0)}</p>
            </Card>
            <Card className="p-xl">
              <div className="flex items-center gap-sm mb-md text-warning">
                <Shield size={16} />
                <p className="text-micro">GOLD</p>
              </div>
              <p className="text-lg font-bold text-white">{formatCurrency(summary?.allocationByType.gold || 0)}</p>
            </Card>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPosition ? 'EDIT POSITION' : 'ADD POSITION'}
        footer={
          <div className="flex justify-end gap-md">
            <Button variant="ghost" size="md" onClick={() => setIsModalOpen(false)}>CANCEL</Button>
            <Button variant="primary" size="md" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'SAVING...' : editingPosition ? 'UPDATE POSITION' : 'SAVE POSITION'}
            </Button>
          </div>
        }
      >
        <div className="space-y-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="space-y-sm">
              <label className="text-[10px] font-bold text-gray-light tracking-widest uppercase">Asset Type</label>
              <select
                value={form.asset_type}
                onChange={(e) => setForm((prev) => ({ ...prev, asset_type: e.target.value as AssetType }))}
                className="w-full h-12 bg-gray-strong border border-white/5 rounded-md px-md text-sm text-white focus:border-primary focus:outline-none"
              >
                <option value="stock">Stock</option>
                <option value="crypto">Crypto</option>
                <option value="gold">Gold</option>
              </select>
            </div>
            <Input
              label="SYMBOL"
              placeholder={form.asset_type === 'gold' ? 'XAU' : 'AAPL / BTC'}
              value={form.symbol}
              onChange={(e) => setForm((prev) => ({ ...prev, symbol: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <Input
              label="DISPLAY NAME"
              placeholder="Apple Inc. / Bitcoin / Gold"
              value={form.display_name}
              onChange={(e) => setForm((prev) => ({ ...prev, display_name: e.target.value }))}
            />
            <Input
              label="BUY DATE"
              type="date"
              value={form.buy_date}
              onChange={(e) => setForm((prev) => ({ ...prev, buy_date: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <Input
              label="AMOUNT"
              type="number"
              step="0.0001"
              placeholder="1.25"
              value={form.amount}
              onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
            />
            <Input
              label="BUY PRICE (USD)"
              type="number"
              step="0.0001"
              placeholder="0.00"
              value={form.buy_price}
              onChange={(e) => setForm((prev) => ({ ...prev, buy_price: e.target.value }))}
            />
          </div>

          {form.asset_type === 'crypto' && (
            <Input
              label="COINGECKO ID"
              placeholder="bitcoin / ethereum / solana"
              value={form.external_id}
              onChange={(e) => setForm((prev) => ({ ...prev, external_id: e.target.value }))}
              helpText="Recommended for crypto because CoinGecko identifies assets by coin id, not ticker."
            />
          )}

          {form.asset_type === 'gold' && (
            <Input
              label="MANUAL CURRENT PRICE (OPTIONAL)"
              type="number"
              step="0.01"
              placeholder="Useful if API pricing is unavailable"
              value={form.manual_current_price}
              onChange={(e) => setForm((prev) => ({ ...prev, manual_current_price: e.target.value }))}
              helpText="Gold can use a manual fallback price to keep the module simple and reliable."
            />
          )}

          <div className="space-y-sm">
            <label className="text-[10px] font-bold text-gray-light tracking-widest uppercase">Notes</label>
            <textarea
              rows={4}
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Why you opened this position, target allocation, or context."
              className="w-full bg-gray-strong border border-white/5 rounded-md p-lg text-sm text-soft-cream focus:border-primary focus:outline-none resize-none"
            />
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
