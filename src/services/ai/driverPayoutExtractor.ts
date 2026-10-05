import { z } from 'zod';

const optionalAmount = z.number().nonnegative().nullable().optional();

export const driverPayoutExtractionSchema = z.object({
  date: z.string().nullable().optional(),
  fare_amount: optionalAmount,
  service_payment_amount: optionalAmount,
  vat_amount: optionalAmount,
  tip_amount: optionalAmount,
  net_payout_amount: optionalAmount,
  distance_km: optionalAmount,
  currency: z.string().nullable().optional(),
});

export type DriverPayoutExtraction = z.infer<typeof driverPayoutExtractionSchema>;