import { estimateDriverPayout } from '../driverPayout';

describe('estimateDriverPayout', () => {
  it('uses the lower estimated service rate at and below IDR 10,000', () => {
    expect(estimateDriverPayout(10000)).toEqual({
      fareAmount: 10000,
      serviceCategory: 'moto',
      servicePaymentRate: 0.08,
      servicePaymentAmount: 800,
      vatRate: 0.11,
      vatAmount: 88,
      totalDeductionAmount: 888,
      tipAmount: 0,
      netPayoutAmount: 9112,
    });
  });

  it('uses the higher estimated service rate above IDR 10,000', () => {
    expect(estimateDriverPayout(34000)).toEqual({
      fareAmount: 34000,
      serviceCategory: 'moto',
      servicePaymentRate: 0.081,
      servicePaymentAmount: 2754,
      vatRate: 0.11,
      vatAmount: 302.94,
      totalDeductionAmount: 3056.94,
      tipAmount: 0,
      netPayoutAmount: 30943.06,
    });
  });

  it('applies the courier service rate regardless of fare size', () => {
    expect(estimateDriverPayout(10000, 0, 'courier')).toEqual({
      fareAmount: 10000,
      serviceCategory: 'courier',
      servicePaymentRate: 0.117,
      servicePaymentAmount: 1170,
      vatRate: 0.11,
      vatAmount: 128.7,
      totalDeductionAmount: 1298.7,
      tipAmount: 0,
      netPayoutAmount: 8701.3,
    });
  });

  it('charges VAT on the service payment, not on the fare', () => {
    const estimate = estimateDriverPayout(50000);
    expect(estimate.vatAmount).toBeCloseTo(estimate.servicePaymentAmount * 0.11, 2);
    expect(estimate.totalDeductionAmount).toBeCloseTo(estimate.servicePaymentAmount + estimate.vatAmount, 2);
  });

  it('adds a known tip to the estimated payout without deducting from it', () => {
    const estimate = estimateDriverPayout(10000, 2000);
    expect(estimate.netPayoutAmount).toBe(11112);
    expect(estimate.totalDeductionAmount).toBe(888);
  });

  it('rejects negative or non-finite amounts', () => {
    expect(() => estimateDriverPayout(-1)).toThrow(RangeError);
    expect(() => estimateDriverPayout(Number.NaN)).toThrow(RangeError);
    expect(() => estimateDriverPayout(1000, Number.NaN)).toThrow(RangeError);
    expect(() => estimateDriverPayout(1000, -5)).toThrow(RangeError);
  });
});
