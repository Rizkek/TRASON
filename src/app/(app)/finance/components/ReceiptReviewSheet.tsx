import React, { useState, useEffect } from 'react';
import { BottomSheet, Button, ErrorAlert, Loading } from '@/components';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTransactionItems } from '@/hooks/useTransactionItems';
import { TransactionItem } from '@/services/finance/itemQueries';
import { ExtractionStatus } from './ExtractionStatus';
import { ItemList } from './ItemList';
import { Receipt } from '@phosphor-icons/react';

import { updateTransactionWithInvalidation } from '@/libs/mutations';
import { storageQueries } from '@/services/core/storageQueries';

interface Props {
  transactionId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSuccess?: () => void;
}

export function ReceiptReviewSheet({ transactionId, isOpen, onClose, onConfirmSuccess }: Props) {
  const { t } = useTranslation();
  const { currency, language: locale } = useUserPreferences();
  const { items, metadata, isLoading, error, saveItems } = useTransactionItems(transactionId);
  
  const [localItems, setLocalItems] = useState<TransactionItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [receiptImageUrl, setReceiptImageUrl] = useState<string | null>(null);
  const storagePath: string | undefined = metadata?.storage_path;

  // The receipts bucket is private, so the image needs a short-lived signed URL.
  useEffect(() => {
    setReceiptImageUrl(null);
    if (!storagePath) return;
    let cancelled = false;
    storageQueries
      .getReceiptSignedUrl(storagePath)
      .then((url) => !cancelled && setReceiptImageUrl(url))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [storagePath]);

  const initializedForId = React.useRef<string | null>(null);

  // Seed local items only once per transactionId (avoids infinite loop from array ref churn)
  useEffect(() => {
    if (!transactionId || initializedForId.current === transactionId) return;
    if (isLoading) return; // wait until data is ready

    initializedForId.current = transactionId;

    if (items && items.length > 0) {
      setLocalItems(items);
    } else if (metadata?.raw_extraction?.items) {
      const aiItems = metadata.raw_extraction.items.map((aiItem: any, idx: number) => ({
        transaction_id: transactionId,
        name: aiItem.name,
        quantity: aiItem.quantity || 1,
        unit_price: aiItem.unit_price,
        total: aiItem.total,
        sort_order: idx
      }));
      setLocalItems(aiItems);
    } else {
      setLocalItems([]);
    }
  }, [transactionId, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);
      // Find deleted ids (items that were in the original 'items' array but not in 'localItems')
      const deletedIds = items
        .filter(origItem => origItem.id && !localItems.find(li => li.id === origItem.id))
        .map(i => i.id as string);
        
      await saveItems(localItems, deletedIds);

      // Update the main transaction with the extracted total and merchant name
      if (metadata && transactionId) {
        const extractedTitle = metadata.extracted_merchant || 'Receipt Expense';
        const extractedAmount = metadata.extracted_total || localItems.reduce((acc, curr) => acc + (curr.total || 0), 0) || 1;
        
        await updateTransactionWithInvalidation(transactionId, {
          title: extractedTitle,
          amount: extractedAmount,
          metadata: { ...metadata, status: 'completed', note: 'Analyzed via AI' }
        });
      }

      if (onConfirmSuccess) onConfirmSuccess();
      onClose();
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save items');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Receipt Details"
      footer={
        <div className="flex gap-4 justify-end">
          <Button variant="ghost" size="md" onClick={onClose} disabled={isSaving}>{t('common.cancel')}</Button>
          <Button variant="primary" onClick={handleSave} disabled={isSaving || isLoading} className="w-full">
            {isSaving ? 'Saving...' : 'Confirm Items'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6 pb-24 md:pb-6">
        <ErrorAlert error={error?.message || saveError} onDismiss={() => setSaveError(null)} />
        
        {isLoading ? (
          <div className="py-12 flex justify-center"><Loading text="Loading receipt data..." /></div>
        ) : (
          <>
            {/* Metadata Section */}
            {metadata && (
              <div className="flex flex-col gap-4">
                <ExtractionStatus 
                  status={metadata.extraction_status} 
                  confidence={metadata.confidence_score} 
                />
                
                {storagePath && (
                  <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-xl border border-foreground/5 bg-background/60 md:h-64">
                    {receiptImageUrl ? (
                      // Plain img: signed URLs expire, so next/image caching would serve dead links.
                      <img src={receiptImageUrl} alt={t('finance.receipt_image_alt')} className="h-full w-full object-contain" />
                    ) : (
                      <>
                        <Receipt size={48} aria-hidden="true" className="text-foreground/10" />
                        <span className="sr-only">{t('finance.receipt_image_alt')}</span>
                      </>
                    )}
                  </div>
                )}
                
                {metadata.mismatch_amount > 0 && metadata.extraction_status === 'needs_review' && (
                  <div className="bg-warning/10 border border-warning/30 p-3 rounded-lg">
                    <p className="text-xs text-warning font-medium">
                      Warning: The sum of items does not match the stated total. Please review and adjust.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Item List */}
            <ItemList 
              items={localItems} 
              onChange={setLocalItems} 
              currency={currency} 
              locale={locale} 
            />
          </>
        )}
      </div>
    </BottomSheet>
  );
}
