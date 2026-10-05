'use client';

import React, { useRef, useState } from 'react';
import { BottomSheet, Button } from '@/components';
import { Receipt, Spinner } from '@phosphor-icons/react';
import { compressImage } from '@/libs/imageCompression';
import { createTransactionWithInvalidation } from '@/libs/mutations';
import { fetchExchangeRates } from '@/libs/exchange';
import { estimateDriverPayout, ServiceCategory } from '@/services/finance/driverPayout';
import { getLocalISODate } from '@/libs/format';
import { useTranslation } from '@/libs/i18n/useTranslation';

type Extraction = {
  date?: string | null;
  fare_amount?: number | null;
  service_payment_amount?: number | null;
  vat_amount?: number | null;
  tip_amount?: number | null;
  net_payout_amount?: number | null;
  distance_km?: number | null;
  currency?: string | null;
};

type VehicleType =
  | 'injection_matic'
  | 'injection_bebek'
  | 'injection_sport'
  | 'carburetor_matic'
  | 'carburetor_bebek'
  | 'none';

const VEHICLE_EFFICIENCY: Record<VehicleType, number> = {
  injection_matic: 50,    // Vario, Beat, Scoopy
  injection_bebek: 55,    // Supra GTR, Revo Fi
  injection_sport: 40,    // CB150, Vixion, GSX-R
  carburetor_matic: 35,   // Mio lama, Spin
  carburetor_bebek: 45,   // Supra lama, Smash
  none: 0,
};

const VEHICLE_LABELS: Record<VehicleType, string> = {
  injection_matic: 'Injeksi Matic ±50km/L (Vario, Beat, Scoopy)',
  injection_bebek: 'Injeksi Bebek ±55km/L (Supra GTR, Revo Fi)',
  injection_sport: 'Injeksi Sport ±40km/L (CB150, Vixion, GSX)',
  carburetor_matic: 'Karbu Matic ±35km/L (Mio lama, Spin)',
  carburetor_bebek: 'Karbu Bebek ±45km/L (Supra lama, Smash)',
  none: 'Abaikan — tidak hitung bensin',
};

type PayoutDraft = {
  date: string;
  fare: string;
  tip: string;
  netPayout: string;
  distance: string;
  returnDistance: string;
  vehicleType: VehicleType;
  serviceCategory: ServiceCategory;
  fuelPrice: string;
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
    tip: '',
    netPayout: '',
    distance: '',
    returnDistance: '',
    vehicleType: 'none',
    serviceCategory: 'moto',
    fuelPrice: '10000',
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
        tip: toFieldValue(data.tip_amount),
        // Net dari screenshot langsung (lebih akurat dari kalkulasi)
        netPayout: toFieldValue(data.net_payout_amount),
        distance: toFieldValue(data.distance_km),
        returnDistance: '',
        vehicleType: 'injection_matic',
        serviceCategory: 'moto',
        fuelPrice: '10000',
      });
      setIsReviewOpen(true);
    } catch (error) {
      onError(error instanceof Error ? error.message : t('finance.driverPayout.readFailed'));
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Derived values
  const fareAmount = parseField(draft.fare);
  const tipAmount = parseField(draft.tip);

  // Estimasi potongan platform dari fare (Moto / Courier)
  const estimate = fareAmount != null && Number.isFinite(fareAmount) && fareAmount >= 0
    ? estimateDriverPayout(fareAmount, tipAmount || 0, draft.serviceCategory)
    : null;

  const extractedNet = extraction?.net_payout_amount;
  const calculatedNet = estimate?.netPayoutAmount;
  const netPayoutAmount = parseField(draft.netPayout) ?? extractedNet ?? calculatedNet;

  const transactionCurrency = /^[A-Za-z]{3}$/.test(extraction?.currency || '')
    ? extraction?.currency?.toUpperCase() || 'IDR'
    : 'IDR';

  // Fuel cost
  const distanceKm = parseField(draft.distance);
  const returnDistanceKm = parseField(draft.returnDistance) || 0;
  const totalDistanceKm = (distanceKm || 0) + returnDistanceKm;

  let fuelCost = 0;
  if (totalDistanceKm > 0 && draft.vehicleType !== 'none') {
    const efficiency = VEHICLE_EFFICIENCY[draft.vehicleType] || 1;
    const pricePerLiter = parseField(draft.fuelPrice) || 10000;
    fuelCost = roundAmount((totalDistanceKm / efficiency) * pricePerLiter);
  }
  const realNetProfit = netPayoutAmount != null ? roundAmount(netPayoutAmount - fuelCost) : undefined;

  const handleSave = async () => {
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

      await createTransactionWithInvalidation({
        title: 'inDrive payout',
        amount: realNetProfit ?? netPayoutAmount,
        type: 'income',
        date: draft.date || getLocalISODate(),
        category_id: null,
        source: 'receipt',
        original_amount: realNetProfit ?? netPayoutAmount,
        original_currency: transactionCurrency,
        exchange_rate_to_base: exchangeRate,
        payment_method: 'inDrive',
        tags: ['indrive', 'driver-payout'],
        metadata: {
          kind: 'driver_payout',
          fare_amount: fareAmount ?? null,
          estimated_service_payment: estimate?.servicePaymentAmount ?? null,
          estimated_vat: estimate?.vatAmount ?? null,
          estimated_total_deduction: estimate?.totalDeductionAmount ?? null,
          service_payment_rate: estimate?.servicePaymentRate ?? null,
          vat_rate: 0.11,
          tip_amount: tipAmount ?? null,
          net_payout_amount: netPayoutAmount,
          net_source: parseField(draft.netPayout) != null
            ? (parseField(draft.netPayout) === extractedNet ? 'screenshot' : 'confirmed')
            : (extractedNet != null ? 'screenshot' : 'estimated'),
          distance_km: distanceKm ?? null,
          return_distance_km: returnDistanceKm > 0 ? returnDistanceKm : null,
          total_distance_km: totalDistanceKm > 0 ? totalDistanceKm : null,
          vehicle_type: draft.vehicleType,
          fuel_price: parseField(draft.fuelPrice) ?? null,
          fuel_cost: fuelCost,
          real_net_profit: realNetProfit ?? netPayoutAmount,
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

  const fmt = (n: number) => n.toLocaleString('id-ID', { maximumFractionDigits: 0 });

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
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isSaving || !draft.netPayout.trim() || netPayoutAmount == null || netPayoutAmount <= 0}
            >
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

          {/* Date */}
          <label className="block space-y-1">
            <span className="text-xs font-medium text-gray-light">{t('finance.driverPayout.date')}</span>
            <input
              type="date"
              value={draft.date}
              onChange={(e) => updateDraft('date', e.target.value)}
              className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-soft-cream"
            />
          </label>

          {/* Fare (pendapatan kotor dari pelanggan) */}
          <label className="block space-y-1">
            <span className="flex items-center justify-between gap-2 text-xs font-medium text-gray-light">
              <span>{t('finance.driverPayout.fare')}</span>
              {extraction?.fare_amount != null && (
                <span className="text-[10px] text-ui-accent">{t('finance.driverPayout.fromImage')}</span>
              )}
            </span>
            <div className="flex gap-2">
              <select
                value={draft.serviceCategory}
                onChange={(e) => updateDraft('serviceCategory', e.target.value as ServiceCategory)}
                className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-soft-cream w-[120px] shrink-0"
              >
                <option value="moto">Moto</option>
                <option value="courier">Courier</option>
              </select>
              <input
                type="number" min="0" step="1" inputMode="numeric"
                value={draft.fare}
                onChange={(e) => updateDraft('fare', e.target.value)}
                placeholder="Contoh: 166500"
                className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-soft-cream placeholder:text-gray-light/60"
              />
            </div>
          </label>

          {/* Info estimasi potongan platform (display only) */}
          {estimate != null && fareAmount != null && (
            <div className="rounded-md bg-white/5 border border-white/10 p-3 space-y-1.5 text-xs text-gray-light">
              <p className="font-semibold text-soft-cream text-[11px] uppercase tracking-wide mb-2">
                {t('finance.driverPayout.estimated')}
              </p>
              <div className="flex justify-between">
                <span>Service Payment ({((estimate.servicePaymentRate) * 100).toFixed(1)}%)</span>
                <span className="font-mono tabular-nums">- {fmt(estimate.servicePaymentAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('finance.driverPayout.vat')}</span>
                <span className="font-mono tabular-nums">- {fmt(estimate.vatAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-1.5 font-semibold text-soft-cream">
                <span>Total</span>
                <span className="font-mono tabular-nums">- {fmt(estimate.totalDeductionAmount)}</span>
              </div>
            </div>
          )}

          {/* Net payout — dari screenshot AI atau manual */}
          <label className="block space-y-1">
            <span className="flex items-center justify-between gap-2 text-xs font-medium text-gray-light">
              <span>{t('finance.driverPayout.netPayout')}</span>
              {extraction?.net_payout_amount != null && (
                <span className="text-[10px] text-ui-accent">{t('finance.driverPayout.fromImage')}</span>
              )}
            </span>
            <input
              type="number" min="0" step="1" inputMode="numeric"
              value={draft.netPayout}
              onChange={(e) => updateDraft('netPayout', e.target.value)}
              placeholder={calculatedNet != null ? `${t('finance.driverPayout.estimated')}: ${fmt(calculatedNet)}` : ''}
              className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-soft-cream placeholder:text-gray-light/60"
            />
            {!draft.netPayout && calculatedNet != null && (
              <button
                type="button"
                onClick={() => updateDraft('netPayout', String(calculatedNet))}
                className="text-[11px] text-ui-accent underline underline-offset-2"
              >
                {t('finance.driverPayout.useEstimate')}: {fmt(calculatedNet)} {transactionCurrency}
              </button>
            )}
          </label>

              {/* Tip */}
          <label className="block space-y-1">
            <span className="text-xs font-medium text-gray-light">
              {t('finance.driverPayout.tip')} {t('common.optional')}
            </span>
            <input
              type="number" min="0" step="1" inputMode="numeric"
              value={draft.tip}
              onChange={(e) => updateDraft('tip', e.target.value)}
              placeholder="0"
              className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-soft-cream placeholder:text-gray-light/60"
            />
          </label>

          {/* Biaya Operasional Bensin */}
          <div className="pt-2 border-t border-white/5 space-y-3">
            <h3 className="text-sm font-semibold text-soft-cream">{t('finance.driverPayout.operationalCost')}</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-xs font-medium text-gray-light">{t('finance.driverPayout.orderDistance')}</span>
                <input
                  type="number" min="0" step="0.1" inputMode="decimal"
                  value={draft.distance}
                  onChange={(e) => updateDraft('distance', e.target.value)}
                  placeholder={extraction?.distance_km != null ? String(extraction.distance_km) : '0'}
                  className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-soft-cream placeholder:text-gray-light/60"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-gray-light">
                  {t('finance.driverPayout.returnDistance')}
                </span>
                <input
                  type="number" min="0" step="0.1" inputMode="decimal"
                  value={draft.returnDistance}
                  onChange={(e) => updateDraft('returnDistance', e.target.value)}
                  placeholder={t('common.optional')}
                  className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-soft-cream placeholder:text-gray-light/60"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-xs font-medium text-gray-light">{t('finance.driverPayout.fuelPrice')}</span>
                <input
                  type="number" min="0" step="500" inputMode="numeric"
                  value={draft.fuelPrice}
                  onChange={(e) => updateDraft('fuelPrice', e.target.value)}
                  placeholder="10000"
                  className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-soft-cream placeholder:text-gray-light/60"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-gray-light">{t('finance.driverPayout.vehicleType')}</span>
                <select
                  value={draft.vehicleType}
                  onChange={(e) => updateDraft('vehicleType', e.target.value as VehicleType)}
                  className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-soft-cream"
                >
                  {(Object.keys(VEHICLE_LABELS) as VehicleType[]).map((key) => (
                    <option key={key} value={key}>{VEHICLE_LABELS[key]}</option>
                  ))}
                </select>
              </label>
            </div>

            {fuelCost > 0 && (
              <div className="rounded-md bg-danger/10 border border-danger/20 p-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-light">
                  <span>
                    {fmt(totalDistanceKm)} km ÷ {VEHICLE_EFFICIENCY[draft.vehicleType]} km/L × {transactionCurrency}{fmt(parseField(draft.fuelPrice) || 10000)}/L
                  </span>
                  <span className="font-mono font-semibold text-danger-light">- {transactionCurrency}{fmt(fuelCost)}</span>
                </div>
                {realNetProfit != null && (
                  <div className="flex justify-between border-t border-danger/20 pt-1.5 text-sm font-bold text-soft-cream">
                    <span>{t('finance.driverPayout.realNetProfit')}</span>
                    <span className="font-mono">{transactionCurrency}{fmt(realNetProfit)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

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
