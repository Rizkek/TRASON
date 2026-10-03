'use client';

import React, { useRef, useState } from 'react';
import { BottomSheet, Button } from '@/components';
import { Receipt, Spinner } from '@phosphor-icons/react';
import { compressImage } from '@/libs/imageCompression';
import { createTransactionWithInvalidation } from '@/libs/mutations';
import { fetchExchangeRates } from '@/libs/exchange';
import { estimateDriverPayout } from '@/services/finance/driverPayout';
import { getLocalISODate } from '@/libs/format';
import { useTranslation } from '@/libs/i18n/useTranslation';

type Extraction = {
  date?: string | null;
  fare_amount?: number | null;
  service_payment_amount?: number | null;
  vat_amount?: number | null;
  tip_amount?: number | null;
  net_payout_amount?: number | null;
  currency?: string | null;
};

type PayoutDraft = {
  date: string;
  fare: string;
  servicePayment: string;
  vat: string;
  tip: string;
  netPayout: string;
};

const toFieldValue = (value?: number | null) => value == null ? '' : String(value);
const parseField = (value: string) => value.trim() === '' ? undefined : Number(value);
const roundAmount = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

interface Props {
  onSaved: () => void;
  onError: (message: string) => void;
}

export function DriverPayoutImport({ onSaved, onError }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [extraction, setExtraction] = useState<Extraction | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [draft, setDraft] = useState<PayoutDraft>({
    date: getLocalISODate(),
    fare: '',
    servicePayment: '',
    vat: '',
    tip: '',
    netPayout: '',
  });

  const updateDraft = (key: keyof PayoutDraft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onError(t('finance.driverPayout.invalidImage'));
      return;
    }

    setIsProcessing(true);
    try {
      const compressedFile = await compressImage(file, 1500, 1500, 0.7);
      const formData = new FormData();
      formData.append('receipt', compressedFile);

      const uploadResponse = await fetch('/api/finance/upload-receipt', {
        method: 'POST',
        body: formData,
      });
      const uploadResult = await uploadResponse.json();
      if (!uploadResponse.ok) throw new Error(uploadResult.error || t('finance.driverPayout.uploadFailed'));

      const extractionResponse = await fetch('/api/finance/extract-driver-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiptUrl: uploadResult.url }),
      });
      const extractionResult = await extractionResponse.json();
      if (!extractionResponse.ok) throw new Error(extractionResult.error || t('finance.driverPayout.readFailed'));

      const data = extractionResult.data as Extraction;
      setExtraction(data);
      setReceiptUrl(uploadResult.url);
      setConfidence(typeof extractionResult.confidence === 'number' ? extractionResult.confidence : null);
      setDraft({
        date: data.date && /^\d{4}-\d{2}-\d{2}$/.test(data.date) ? data.date : getLocalISODate(),
        fare: toFieldValue(data.fare_amount),
        servicePayment: toFieldValue(data.service_payment_amount),
        vat: toFieldValue(data.vat_amount),
        tip: toFieldValue(data.tip_amount),
        netPayout: toFieldValue(data.net_payout_amount),
      });
      setIsReviewOpen(true);
    } catch (error) {
      onError(error instanceof Error ? error.message : t('finance.driverPayout.readFailed'));
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const fareAmount = parseField(draft.fare);
  const tipAmount = parseField(draft.tip);
  const estimate = fareAmount != null && Number.isFinite(fareAmount) && fareAmount >= 0
    ? estimateDriverPayout(fareAmount, tipAmount || 0)
    : null;
  const servicePaymentAmount = parseField(draft.servicePayment) ?? estimate?.servicePaymentAmount;
  const vatAmount = parseField(draft.vat) ?? (servicePaymentAmount == null ? undefined : roundAmount(servicePaymentAmount * 0.11));
  const calculatedNet = fareAmount != null && servicePaymentAmount != null && vatAmount != null
    ? roundAmount(fareAmount - servicePaymentAmount - vatAmount + (tipAmount || 0))
    : undefined;
  const netPayoutAmount = parseField(draft.netPayout) ?? calculatedNet;
  const transactionCurrency = /^[A-Za-z]{3}$/.test(extraction?.currency || '')
    ? extraction?.currency?.toUpperCase() || 'IDR'
    : 'IDR';

  const handleSave = async () => {
    const enteredAmounts = [
      fareAmount,
      parseField(draft.servicePayment),
      parseField(draft.vat),
      tipAmount,
      parseField(draft.netPayout),
    ];
    if (enteredAmounts.some((amount) => amount != null && (!Number.isFinite(amount) || amount < 0))) {
      onError(t('finance.driverPayout.invalidAmounts'));
      return;
    }

    if (!draft.netPayout.trim() || netPayoutAmount == null || !Number.isFinite(netPayoutAmount) || netPayoutAmount <= 0) {
      onError(t('finance.driverPayout.missingPayout'));
      return;
    }

    setIsSaving(true);
    try {
      const rates = await fetchExchangeRates();
      const exchangeRate = rates?.rates[transactionCurrency]
        ? 1 / rates.rates[transactionCurrency]
        : 1;
      const fieldSource = (value: string, extractedValue?: number | null, estimateValue?: number) => {
        const amount = parseField(value);
        if (amount == null) return 'estimate';
        if (amount === extractedValue) return 'screenshot';
        if (extractedValue == null && amount === estimateValue) return 'estimate_confirmed';
        return 'confirmed';
      };
      const servicePaymentSource = fieldSource(draft.servicePayment, extraction?.service_payment_amount, estimate?.servicePaymentAmount);
      const vatSource = fieldSource(draft.vat, extraction?.vat_amount, estimate?.vatAmount);
      const payoutSource = fieldSource(draft.netPayout, extraction?.net_payout_amount, calculatedNet);

      await createTransactionWithInvalidation({
        title: 'inDrive payout',
        amount: netPayoutAmount,
        type: 'income',
        date: draft.date || getLocalISODate(),
        category_id: null,
        source: 'receipt',
        original_amount: netPayoutAmount,
        original_currency: transactionCurrency,
        exchange_rate_to_base: exchangeRate,
        payment_method: 'inDrive',
        tags: ['indrive', 'driver-payout'],
        metadata: {
          kind: 'driver_payout',
          fare_amount: fareAmount ?? null,
          fare_source: fieldSource(draft.fare, extraction?.fare_amount),
          service_payment_amount: servicePaymentAmount ?? null,
          service_payment_source: servicePaymentSource,
          estimated_service_payment_rate: estimate?.servicePaymentRate ?? null,
          vat_amount: vatAmount ?? null,
          vat_rate: 0.11,
          vat_source: vatSource,
          tip_amount: tipAmount ?? null,
          tip_status: tipAmount == null ? 'unknown' : 'recorded',
          tip_source: fieldSource(draft.tip, extraction?.tip_amount),
          net_payout_amount: netPayoutAmount,
          net_payout_source: payoutSource,
          extraction_confidence: confidence,
          receipt_url: receiptUrl,
        },
      });

      setIsReviewOpen(false);
      onSaved();
    } catch (error) {
      onError(error instanceof Error ? error.message : t('finance.driverPayout.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const amountFields: Array<{ key: keyof Pick<PayoutDraft, 'fare' | 'servicePayment' | 'vat' | 'tip' | 'netPayout'>; label: string; extracted?: number | null; estimate?: number }> = [
    { key: 'fare', label: t('finance.driverPayout.fare'), extracted: extraction?.fare_amount },
    { key: 'servicePayment', label: t('finance.driverPayout.servicePayment'), extracted: extraction?.service_payment_amount, estimate: estimate?.servicePaymentAmount },
    { key: 'vat', label: t('finance.driverPayout.vat'), extracted: extraction?.vat_amount, estimate: servicePaymentAmount == null ? undefined : roundAmount(servicePaymentAmount * 0.11) },
    { key: 'tip', label: t('finance.driverPayout.tip'), extracted: extraction?.tip_amount },
    { key: 'netPayout', label: t('finance.driverPayout.netPayout'), extracted: extraction?.net_payout_amount, estimate: calculatedNet },
  ];

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        size="md"
        disabled={isProcessing}
        onClick={() => fileInputRef.current?.click()}
        leftIcon={isProcessing ? <Spinner size={18} className="animate-spin" /> : <Receipt size={18} />}
      >
        {isProcessing ? t('finance.driverPayout.reading') : t('finance.driverPayout.importButton')}
      </Button>

      <BottomSheet
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        title={t('finance.driverPayout.reviewTitle')}
        description={t('finance.driverPayout.reviewDescription')}
        footer={(
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setIsReviewOpen(false)} disabled={isSaving}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={isSaving || !draft.netPayout.trim() || netPayoutAmount == null || netPayoutAmount <= 0}>
              {isSaving ? t('finance.driverPayout.saving') : t('finance.driverPayout.saveIncome')}
            </Button>
          </div>
        )}
      >
        <div className="space-y-4">
          {confidence != null && (
            <p className="text-xs text-gray-light">
              {t('finance.driverPayout.ocrConfidence')}: {Math.round(confidence * 100)}%
            </p>
          )}
          <label className="block space-y-1">
            <span className="text-xs font-medium text-gray-light">{t('finance.driverPayout.date')}</span>
            <input
              type="date"
              value={draft.date}
              onChange={(event) => updateDraft('date', event.target.value)}
              className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-soft-cream"
            />
          </label>
          {amountFields.map(({ key, label, extracted, estimate: estimateValue }) => (
            <label key={key} className="block space-y-1">
              <span className="flex items-center justify-between gap-2 text-xs font-medium text-gray-light">
                <span>{label}</span>
                <span className="text-[10px]">
                  {draft[key]
                    ? (extracted != null
                      ? t('finance.driverPayout.fromImage')
                      : key === 'netPayout' && Number(draft[key]) === calculatedNet
                        ? t('finance.driverPayout.estimateConfirmed')
                        : t('finance.driverPayout.confirmed'))
                    : estimateValue != null ? t('finance.driverPayout.estimated') : t('finance.driverPayout.notShown')}
                </span>
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={draft[key]}
                onChange={(event) => updateDraft(key, event.target.value)}
                placeholder={estimateValue == null ? t('finance.driverPayout.notShown') : String(estimateValue)}
                className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-soft-cream placeholder:text-gray-light/60"
              />
              {key === 'tip' && !draft.tip && (
                <span className="block text-[10px] text-gray-light">{t('finance.driverPayout.tipUnknownHint')}</span>
              )}
            </label>
          ))}
          {!draft.netPayout.trim() && calculatedNet != null && calculatedNet > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateDraft('netPayout', String(calculatedNet))}
            >
              {t('finance.driverPayout.useEstimate')}: {calculatedNet.toLocaleString('id-ID', { maximumFractionDigits: 2 })} {transactionCurrency}
            </Button>
          )}
          <p className="rounded-md border border-warning/20 bg-warning/5 p-3 text-xs text-gray-light">
            {t('finance.driverPayout.estimateDisclaimer')}
          </p>
          <p className="flex items-center gap-2 text-sm font-semibold text-soft-cream">
            <Receipt size={16} />
            {t('finance.driverPayout.transactionCurrency')}: {transactionCurrency}
          </p>
        </div>
      </BottomSheet>
    </>
  );
}
