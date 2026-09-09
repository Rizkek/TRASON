import React, { useState, useEffect } from 'react';
import { BottomSheet, Button, ErrorAlert, Loading } from '@/components';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTransactionItems } from '@/hooks/useTransactionItems';
import { TransactionItem } from '@/services/finance/itemQueries';
import { ExtractionStatus } from './ExtractionStatus';
import { ItemList } from './ItemList';
import { Receipt } from '@phosphor-icons/react';

interface Props {
  transactionId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiptReviewSheet({ transactionId, isOpen, onClose }: Props) {
  const { t } = useTranslation();
  const { currency, language: locale } = useUserPreferences();
  const { items, metadata, isLoading, error, saveItems } = useTransactionItems(transactionId);
  
  const [localItems, setLocalItems] = useState<TransactionItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
                
                {metadata.storage_path && (
                  <div className="w-full h-32 md:h-48 bg-black/20 rounded-xl overflow-hidden relative border border-white/5 flex items-center justify-center">
                    {/* Ideally we'd use a signed URL to show the image here. For now, a placeholder icon */}
                    <Receipt size={48} className="text-white/10" />
                    <span className="absolute bottom-2 right-2 text-[10px] text-gray-light bg-black/60 px-2 py-1 rounded">
                      Receipt Image Attached
                    </span>
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
