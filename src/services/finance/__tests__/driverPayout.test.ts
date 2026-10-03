import { estimateDriverPayout } from '../driverPayout';

describe('estimateDriverPayout', () => {
  it('uses the lower estimated service rate at and below IDR 10,000', () => {
    expect(estimateDriverPayout(10000)).toEqual({
      fareAmount: 10000,
      servicePaymentRate: 0.08,
      servicePaymentAmount: 800,
      vatRate: 0.11,
      vatAmount: 88,
      tipAmount: 0,
      netPayoutAmount: 9112,
    });
  });

  it('uses the higher estimated service rate above IDR 10,000', () => {
    expect(estimateDriverPayout(34000)).toEqual({
      fareAmount: 34000,
      servicePaymentRate: 0.081,
      servicePaymentAmount: 2754,
      vatRate: 0.11,
      vatAmount: 302.94,
      tipAmount: 0,
      netPayoutAmount: 30943.06,
    });
  });

  it('adds a known tip to the estimated payout', () => {
    expect(estimateDriverPayout(10000, 2000).netPayoutAmount).toBe(11112);
  });

  it('rejects negative or non-finite amounts', () => {
    expect(() => estimateDriverPayout(-1)).toThrow(RangeError);
    expect(() => estimateDriverPayout(1000, Number.NaN)).toThrow(RangeError);
  });
});