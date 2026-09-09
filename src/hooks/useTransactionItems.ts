import useSWR from 'swr';
import { useMemo } from 'react';
import { itemQueries, TransactionItem } from '@/services/finance/itemQueries';
import { CACHE_KEYS } from '@/libs/cacheKeys';

export function useTransactionItems(transactionId: string | null) {
  const { data: items, error: itemsError, mutate: mutateItems, isLoading: isItemsLoading } = useSWR(
    transactionId ? CACHE_KEYS.transactionItems.byTransactionId(transactionId) : null,
    () => itemQueries.getByTransactionId(transactionId!)
  );

  const { data: metadata, error: metadataError, mutate: mutateMetadata, isLoading: isMetadataLoading } = useSWR(
    transactionId ? CACHE_KEYS.receiptMetadata.byTransactionId(transactionId) : null,
    () => itemQueries.getReceiptMetadata(transactionId!)
  );

  // Stabilize the array reference so downstream effects don't re-fire on every render
  const stableItems = useMemo(() => items ?? [], [items]);

  const saveItems = async (newItems: TransactionItem[], deletedIds: string[] = []) => {
    if (!transactionId) return;
    if (deletedIds.length > 0) {
      await itemQueries.deleteItems(deletedIds);
    }
    await itemQueries.bulkUpsert(transactionId, newItems);
    await mutateItems();
  };

  return {
    items: stableItems,
    metadata: metadata || null,
    isLoading: isItemsLoading || isMetadataLoading,
    error: itemsError || metadataError,
    saveItems,
    mutateItems,
    mutateMetadata,
  };
}
