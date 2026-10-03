export interface DriverPayoutEstimate {
  fareAmount: number;
  servicePaymentRate: number;
  servicePaymentAmount: number;
  vatRate: number;
  vatAmount: number;
  tipAmount: number;
  netPayoutAmount: number;
}

const VAT_RATE = 0.11;
const LOW_FARE_THRESHOLD = 10000;

function roundAmount(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function estimateDriverPayout(fareAmount: number, tipAmount = 0): DriverPayoutEstimate {
  if (!Number.isFinite(fareAmount) || fareAmount < 0) {
    throw new RangeError('Fare amount must be a finite, non-negative number.');
  }
  if (!Number.isFinite(tipAmount) || tipAmount < 0) {
    throw new RangeError('Tip amount must be a finite, non-negative number.');
  }

  const servicePaymentRate = fareAmount <= LOW_FARE_THRESHOLD ? 0.08 : 0.081;
  const servicePaymentAmount = roundAmount(fareAmount * servicePaymentRate);
  const vatAmount = roundAmount(servicePaymentAmount * VAT_RATE);

  return {
    fareAmount,
    servicePaymentRate,
    servicePaymentAmount,
    vatRate: VAT_RATE,
    vatAmount,
    tipAmount,
    netPayoutAmount: roundAmount(fareAmount - servicePaymentAmount - vatAmount + tipAmount),
  };
}