'use client';

import React, { useState, useMemo } from 'react';
import { Card, Badge, Loading } from '@/components';
import { MagnifyingGlass as Search, ArrowUpRight, ArrowDownLeft, Calendar, X, PencilSimple as Edit2, Trash as Trash2, Sparkle } from '@phosphor-icons/react';
import { formatCurrency, formatDate } from '@/libs/format';
import type { Transaction, CategoryJoin } from '@/types/database';

function resolveCategory(
  categories: CategoryJoin | CategoryJoin[] | null | undefined
): CategoryJoin | null {
  if (!categories) return null;
  if (Array.isArray(categories)) return categories[0] ?? null;
  return categories;
}

function getDateLabel(dateStr: string): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const txDate = new Date(dateStr + 'T00:00:00');
  if (txDate.toDateString() === today.toDateString()) return 'Hari Ini';
  if (txDate.toDateString() === yesterday.toDateString()) return 'Kemarin';
  return formatDate(dateStr);
}

function groupByDate(transactions: Transaction[]): { label: string; date: string; items: Transaction[] }[] {
  const map = new Map<string, Transaction[]>();
  for (const t of transactions) {
    const d = t.date.split('T')[0];
    if (!map.has(d)) map.set(d, []);
    map.get(d)!.push(t);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({ label: getDateLabel(date), date, items }));
}

interface Props {
  transactions: Transaction[];
  isLoading: boolean;
  searchQuery: string;
  filterType: 'all' | 'income' | 'expense';
  onSearchChange: (v: string) => void;
  onFilterChange: (type: 'all' | 'income' | 'expense') => void;
  onEdit: (t: Transaction) => void;
  onDeleteRequest: (id: string) => void;
  currency: string;
  locale: string;
}

export function TransactionFeed({
  transactions,
  isLoading,
  searchQuery,
  filterType,
  onSearchChange,
  onFilterChange,
  onEdit,
  onDeleteRequest,
  currency,
  locale,
}: Props) {
  const [selected, setSelected] = useState<Transaction | null>(null);

  const filtered = useMemo(
    () =>
      transactions.filter((t) => {
        const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchType = filterType === 'all' || t.type === filterType;
        return matchSearch && matchType;
      }),
    [transactions, searchQuery, filterType]
  );

  const groups = useMemo(() => groupByDate(filtered), [filtered]);
  const selectedCat = selected ? resolveCategory(selected.categories) : null;

  return (
    <>
      {/* Sticky search + filter bar */}
      <div className="sticky top-0 z-20 pt-xs pb-sm space-y-sm">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-md top-1/2 -translate-y-1/2 text-gray-light pointer-events-none"
          />
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-2xl pr-md py-sm bg-gray-strong/60 border border-white/[0.06] rounded-lg text-sm focus:border-primary focus:outline-none transition-all"
          />
        </div>
        <div className="flex gap-xs overflow-x-auto no-scrollbar">
          {(['all', 'income', 'expense'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onFilterChange(type)}
              className={`px-md py-xs text-[10px] font-bold rounded-full transition-all uppercase tracking-widest whitespace-nowrap shrink-0 ${
                filterType === type
                  ? 'bg-primary text-white'
                  : 'bg-white/[0.05] text-gray-light hover:bg-white/[0.1] hover:text-soft-cream'
              }`}
            >
              {type === 'all' ? 'Semua' : type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction list */}
      <Card className="overflow-hidden">
        <div className="px-md pt-md pb-xs flex items-center justify-between">
          <h3 className="text-[10px] md:text-xs font-bold text-gray-light tracking-widest uppercase">
            Riwayat Transaksi
          </h3>
          {filtered.length > 0 && (
            <span className="text-[9px] text-gray-light">{filtered.length} transaksi</span>
          )}
        </div>

        {isLoading ? (
          <div className="py-2xl flex justify-center">
            <Loading />
          </div>
        ) : groups.length === 0 ? (
          <div className="py-2xl flex flex-col items-center justify-center gap-md opacity-50">
            <Sparkle size={32} className="text-gray-light" />
            <div className="text-center">
              <p className="text-sm font-semibold text-soft-cream">Belum ada transaksi</p>
              <p className="text-xs text-gray-light mt-xs">
                {searchQuery || filterType !== 'all'
                  ? 'Coba ubah kata kunci atau filter'
                  : 'Mulai catat pemasukan atau pengeluaranmu'}
              </p>
            </div>
          </div>
        ) : (
          <div className="pb-xs">
            {groups.map((group) => (
              <div key={group.date}>
                {/* Date group header */}
                <div className="px-md py-xs mt-sm flex items-center gap-sm">
                  <Calendar size={10} className="text-gray-light shrink-0" />
                  <span className="text-[10px] font-bold text-gray-light uppercase tracking-widest">
                    {group.label}
                  </span>
                </div>
                {/* Items */}
                {group.items.map((tx) => {
                  const cat = resolveCategory(tx.categories);
                  return (
                    <button
                      key={tx.id}
                      type="button"
                      onClick={() => setSelected(tx)}
                      className="w-full flex items-center gap-md px-md py-sm hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors border-b border-white/[0.03] last:border-0 text-left"
                    >
                      {/* Icon */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          tx.type === 'income'
                            ? 'bg-success/10 text-success'
                            : 'bg-danger/10 text-danger'
                        }`}
                      >
                        {tx.type === 'income' ? (
                          <ArrowUpRight size={16} />
                        ) : (
                          <ArrowDownLeft size={16} />
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-soft-cream truncate">{tx.title}</p>
                        <p className="text-[10px] text-gray-light truncate">
                          {cat?.name || 'Lainnya'}
                          {tx.description ? ` · ${tx.description}` : ''}
                        </p>
                      </div>
                      {/* Amount */}
                      <p
                        className={`text-sm font-bold shrink-0 ${
                          tx.type === 'income' ? 'text-success' : 'text-soft-cream'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount, tx.original_currency || currency, locale)}
                      </p>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Bottom Sheet */}
      {selected && (
        <>
          {/* Scrim */}
          <div
            className="fixed inset-0 bg-black/60 z-40"
            style={{ backdropFilter: 'blur(2px)' }}
            onClick={() => setSelected(null)}
          />
          {/* Panel */}
          <div
            className="fixed bottom-0 inset-x-0 z-50 max-w-lg mx-auto"
            style={{ animation: 'slideUp 0.22s ease-out' }}
          >
            <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
            <div className="bg-[#141414] rounded-t-2xl border-t border-white/10 shadow-2xl">
              {/* Drag handle */}
              <div className="flex justify-center pt-md pb-sm">
                <div className="w-10 h-1 bg-white/20 rounded-full" />
              </div>

              <div className="px-lg">
                {/* Header row */}
                <div className="flex items-start justify-between mb-lg">
                  <div className="flex items-center gap-md min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        selected.type === 'income'
                          ? 'bg-success/10 text-success'
                          : 'bg-danger/10 text-danger'
                      }`}
                    >
                      {selected.type === 'income' ? (
                        <ArrowUpRight size={18} />
                      ) : (
                        <ArrowDownLeft size={18} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-bold text-soft-cream truncate">{selected.title}</p>
                      <p className="text-xs text-gray-light">{formatDate(selected.date)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="p-sm text-gray-light hover:text-soft-cream rounded-lg hover:bg-white/[0.05] transition-all shrink-0 ml-sm"
                    aria-label="Tutup"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Amount */}
                <div className="text-center py-lg border-y border-white/[0.05] mb-lg">
                  <p
                    className={`text-3xl font-bold ${
                      selected.type === 'income' ? 'text-success' : 'text-danger'
                    }`}
                  >
                    {selected.type === 'income' ? '+' : '-'}
                    {formatCurrency(selected.amount, selected.original_currency || currency, locale)}
                  </p>
                  {selected.original_currency && (
                    <p className="text-xs text-gray-light mt-xs">{selected.original_currency}</p>
                  )}
                </div>

                {/* Detail rows */}
                <div className="space-y-sm mb-lg">
                  {selectedCat && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-light">Kategori</span>
                      <Badge
                        variant={selected.type === 'income' ? 'success' : 'danger'}
                        size="sm"
                      >
                        {selectedCat.name}
                      </Badge>
                    </div>
                  )}
                  {selected.description && (
                    <div className="flex items-start justify-between text-xs gap-md">
                      <span className="text-gray-light shrink-0">Catatan</span>
                      <span className="text-soft-cream text-right">{selected.description}</span>
                    </div>
                  )}
                  {(selected.metadata?.decision_notes as string) && (
                    <div className="bg-primary/5 border border-primary/10 rounded-lg p-md mt-sm">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-xs">
                        Reasoning
                      </p>
                      <p className="text-xs text-soft-cream">
                        {selected.metadata?.decision_notes as string}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-sm pb-24 md:pb-lg">
                  <button
                    type="button"
                    onClick={() => {
                      const tx = selected;
                      setSelected(null);
                      onEdit(tx);
                    }}
                    className="flex items-center justify-center gap-sm py-md px-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-soft-cream rounded-xl text-sm font-semibold transition-all"
                  >
                    <Edit2 size={15} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const id = selected.id;
                      setSelected(null);
                      onDeleteRequest(id);
                    }}
                    className="flex items-center justify-center gap-sm py-md px-lg bg-danger/10 hover:bg-danger/20 border border-danger/20 text-danger rounded-xl text-sm font-semibold transition-all"
                  >
                    <Trash2 size={15} />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
