export type ServiceCategory = 'moto' | 'courier';

export interface DriverPayoutEstimate {
  fareAmount: number;
  serviceCategory: ServiceCategory;
  servicePaymentRate: number;
  servicePaymentAmount: number;
  vatRate: number;
  vatAmount: number;
  totalDeductionAmount: number;
  tipAmount: number;
  netPayoutAmount: number;
}

const VAT_RATE = 0.11; // VAT diambil dari service payment

function roundAmount(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function estimateDriverPayout(fareAmount: number, tipAmount = 0, serviceCategory: ServiceCategory = 'moto'): DriverPayoutEstimate {
  if (!Number.isFinite(fareAmount) || fareAmount < 0) {
    throw new RangeError('Fare amount must be a finite, non-negative number.');
  }
  
  // Rate base pada layanan: Moto ~8.1%, Courier ~11.7%
  let servicePaymentRate = 0.081;
  
  if (serviceCategory === 'moto') {
    servicePaymentRate = fareAmount <= 10000 ? 0.08 : 0.081;
  } else if (serviceCategory === 'courier') {
    servicePaymentRate = 0.117; // Courier potongannya 11.7%
  }

  const servicePaymentAmount = roundAmount(fareAmount * servicePaymentRate);
  const vatAmount = roundAmount(servicePaymentAmount * VAT_RATE);
  const totalDeductionAmount = roundAmount(servicePaymentAmount + vatAmount);

  return {
    fareAmount,
    serviceCategory,
    servicePaymentRate,
    servicePaymentAmount,
    vatRate: VAT_RATE,
    vatAmount,
    totalDeductionAmount,
    tipAmount,
    netPayoutAmount: roundAmount(fareAmount - totalDeductionAmount + tipAmount),
  };
}