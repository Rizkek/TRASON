'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Card, Badge, Loading } from '@/components';
import { MagnifyingGlass as Search, ArrowUpRight, ArrowDownLeft, Calendar, X, PencilSimple as Edit2, Trash as Trash2} from '@phosphor-icons/react';
import { formatCurrency, formatDate } from '@/libs/format';
import type { Transaction, CategoryJoin } from '@/types/database';
import { useTranslation } from '@/libs/i18n/useTranslation';

function resolveCategory(
  categories: CategoryJoin | CategoryJoin[] | null | undefined
): CategoryJoin | null {
  if (!categories) return null;
  if (Array.isArray(categories)) return categories[0] ?? null;
  return categories;
}

// Date label is computed once per render based on locale strings passed from parent,
// but for simplicity we keep a module-level helper and pass t() at call site.
function getDateLabel(dateStr: string, todayLabel: string, yesterdayLabel: string): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const txDate = new Date(dateStr + 'T00:00:00');
  if (txDate.toDateString() === today.toDateString()) return todayLabel;
  if (txDate.toDateString() === yesterday.toDateString()) return yesterdayLabel;
  return formatDate(dateStr);
}

function groupByDate(transactions: Transaction[], todayLabel: string, yesterdayLabel: string): { label: string; date: string; items: Transaction[] }[] {
  const map = new Map<string, Transaction[]>();
  for (const t of transactions) {
    const d = t.date.split('T')[0];
    if (!map.has(d)) map.set(d, []);
    map.get(d)!.push(t);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({ label: getDateLabel(date, todayLabel, yesterdayLabel), date, items }));
}

const PAGE_SIZE = 8;

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
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const todayLabel = t('finance.feed.today');
  const yesterdayLabel = t('finance.feed.yesterday');

  const filtered = useMemo(
    () =>
      transactions.filter((t) => {
        const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchType = filterType === 'all' || t.type === filterType;
        return matchSearch && matchType;
      }),
    [transactions, searchQuery, filterType]
  );

  // Reset visible count whenever filters/search changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, filterType]);

  const allGroups = useMemo(() => groupByDate(filtered, todayLabel, yesterdayLabel), [filtered, todayLabel, yesterdayLabel]);

  // Flatten to item-level for counting, then re-group only visible slice
  const visibleItems = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const visibleGroups = useMemo(() => groupByDate(visibleItems, todayLabel, yesterdayLabel), [visibleItems, todayLabel, yesterdayLabel]);

  const hasMore = visibleCount < filtered.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filtered.length));
  }, [filtered.length]);

  // Intersection Observer — watches the sentinel div at the bottom
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '120px' } // trigger 120px before reaching bottom
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

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
            placeholder={t('finance.feed.searchPlaceholder')}
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
              {type === 'all' ? t('finance.feed.filterAll') : type === 'income' ? t('finance.feed.filterIncome') : t('finance.feed.filterExpense')}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction list */}
      <Card className="overflow-hidden">
        <div className="px-md pt-md pb-xs flex items-center justify-between">
          <h3 className="text-[10px] md:text-xs font-bold text-gray-light tracking-widest uppercase">
            {t('finance.feed.transactionHistory')}
          </h3>
          {filtered.length > 0 && (
            <span className="text-[9px] text-gray-light">{filtered.length} {t('finance.table.transaction').toLowerCase()}</span>
          )}
        </div>

        {isLoading ? (
          <div className="py-2xl flex justify-center">
            <Loading />
          </div>
        ) : visibleGroups.length === 0 ? (
          <div className="py-2xl flex flex-col items-center justify-center gap-md opacity-50">
            <div className="text-center">
              <p className="text-sm font-semibold text-soft-cream">{t('finance.feed.empty')}</p>
              <p className="text-xs text-gray-light mt-xs">
                {searchQuery || filterType !== 'all'
                  ? t('finance.feed.filterAll')
                  : t('moduleCommon.emptyDesc')}
              </p>
            </div>
          </div>
        ) : (
          <div className="pb-xs">
            {visibleGroups.map((group) => (
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
                        className={`text-sm font-bold tabular-nums shrink-0 ${
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

            {/* Infinite scroll sentinel */}
            {hasMore && (
              <div ref={sentinelRef} className="flex justify-center py-lg">
                <Loading />
              </div>
            )}

            {/* End of list indicator */}
            {!hasMore && allGroups.length > 0 && visibleCount >= filtered.length && filtered.length > PAGE_SIZE && (
              <p className="text-center text-[10px] text-gray-light py-lg tracking-widest uppercase">
                {t('finance.feed.allShown')}
              </p>
            )}
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
                      <span className="text-gray-light">{t('finance.feed.category')}</span>
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
                      <span className="text-gray-light shrink-0">{t('finance.feed.notes')}</span>
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
