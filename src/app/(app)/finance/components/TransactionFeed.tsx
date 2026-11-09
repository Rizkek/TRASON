'use client';

import { EmptyState } from '@/components/ui/EmptyState';
import { Tabs } from '@/components/ui/Tabs';
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Card, Badge, Button, BottomSheet, Loading } from '@/components';
import { Receipt, Calendar, ArrowUpRight, ArrowDownLeft, MagnifyingGlass as Search, PencilSimple as Edit2, Trash as Trash2 } from '@phosphor-icons/react';
import { formatCurrency, formatDate } from '@/libs/format';
import type { Transaction} from '@/types/database';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { Heading, Paragraph } from '@/components/ui/typography';
import { resolveCategory } from '@/libs/finance/categoryHelpers';


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
  onViewReceipt?: (id: string) => void;
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
  onViewReceipt,
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
      <div className="sticky top-0 z-20 space-y-2 bg-background pb-2 pt-1">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="text"
            placeholder={t('finance.feed.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-2 bg-surface/60 border border-foreground/[0.06] rounded-lg text-sm focus:border-primary focus:outline-none transition-all"
          />
        </div>
        <Tabs
          variant="segmented"
          label={t('finance.feed.transactionHistory')}
          value={filterType}
          onChange={onFilterChange}
          items={[
            { id: 'all', label: t('finance.feed.filterAll') },
            { id: 'income', label: t('finance.feed.filterIncome') },
            { id: 'expense', label: t('finance.feed.filterExpense') },
          ]}
        />
      </div>

      {/* Transaction list */}
      <Card className="overflow-hidden">
        <div className="px-4 pt-4 pb-1 flex items-center justify-between">
          <Heading as="h3" size="h3" className="text-xs font-bold text-muted-foreground">
            {t('finance.feed.transactionHistory')}
          </Heading>
          {filtered.length > 0 && (
            <span className="text-xs text-muted-foreground">{filtered.length} {t('finance.table.transaction').toLowerCase()}</span>
          )}
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Loading />
          </div>
        ) : visibleGroups.length === 0 ? (
          <EmptyState
            title={t('finance.feed.empty')}
            description={searchQuery || filterType !== 'all' ? t('finance.feed.emptyFiltered') : t('moduleCommon.emptyDesc')}
          />
        ) : (
          <div className="pb-1">
            {visibleGroups.map((group) => (
              <div key={group.date}>
                {/* Date group header */}
                <div className="px-4 py-1 mt-2 flex items-center gap-2">
                  <Calendar size={12} className="text-muted-foreground shrink-0" />
                  <span className="text-xs font-bold text-muted-foreground">
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
                      className="w-full flex items-center gap-4 px-4 py-2 hover:bg-foreground/[0.03] active:bg-foreground/[0.05] transition-colors border-b border-foreground/[0.03] last:border-0 text-left"
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
                        <div className="flex items-center gap-2">
                          <Paragraph className="text-sm font-semibold text-foreground truncate">{tx.title}</Paragraph>
                          {(tx.source === 'receipt' || tx.source === 'text') && onViewReceipt && (
                            <Receipt size={14} className="text-primary shrink-0" weight="fill" />
                          )}
                        </div>
                        <Paragraph className="text-xs text-muted-foreground truncate">
                          {cat?.name || t('finance_ui.other')}
                        </Paragraph>
                      </div>
                      {/* Amount */}
                      <Paragraph
                        className={`text-sm font-bold tabular-nums shrink-0 ${
                          tx.type === 'income' ? 'text-success' : 'text-foreground'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount, tx.original_currency || currency, locale)}
                      </Paragraph>
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Infinite scroll sentinel */}
            {hasMore && (
              <div ref={sentinelRef} className="flex justify-center py-6">
                <Loading />
              </div>
            )}

            {/* End of list indicator */}
            {!hasMore && allGroups.length > 0 && visibleCount >= filtered.length && filtered.length > PAGE_SIZE && (
              <Paragraph className="text-center text-xs text-muted-foreground py-6">
                {t('finance.feed.allShown')}
              </Paragraph>
            )}
          </div>
        )}
      </Card>

      {selected && (
        <BottomSheet
          isOpen
          onClose={() => setSelected(null)}
          title={selected.title}
          description={formatDate(selected.date)}
          footer={
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                leftIcon={<Edit2 size={16} />}
                onClick={() => {
                  const tx = selected;
                  setSelected(null);
                  onEdit(tx);
                }}
              >
                {t('common.edit')}
              </Button>
              <Button
                variant="danger"
                leftIcon={<Trash2 size={16} />}
                onClick={() => {
                  const id = selected.id;
                  setSelected(null);
                  onDeleteRequest(id);
                }}
              >
                {t('common.delete')}
              </Button>
            </div>
          }
        >
          <p className={`py-2 text-center font-mono text-heading-lg font-semibold ${selected.type === 'income' ? 'text-income' : 'text-expense'}`}>
            {selected.type === 'income' ? '+' : '-'}
            {formatCurrency(selected.amount, selected.original_currency || currency, locale)}
          </p>
          <div className="mt-4 space-y-3">
            {selectedCat && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t('finance.feed.category')}</span>
                <Badge variant={selected.type === 'income' ? 'success' : 'danger'} size="sm">
                  {selectedCat.name}
                </Badge>
              </div>
            )}
          </div>
        </BottomSheet>
      )}
    </>
  );
}
