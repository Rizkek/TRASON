import useSWR from 'swr';
import { installmentQueries } from '@/services/finance/installmentQueries';
import { Installment, InstallmentPayment } from '@/types/database';

export function useInstallment() {
  const { data: installments, error: instError, mutate: mutateInstallments, isLoading: isInstLoading } = useSWR(
    'finance:installments',
    installmentQueries.getInstallments
  );

  const { data: upcomingPayments, error: payError, mutate: mutatePayments, isLoading: isPayLoading } = useSWR(
    'finance:installment_payments',
    installmentQueries.getUpcomingPayments
  );

  const createInstallment = async (
    data: Omit<Installment, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'categories'>
  ) => {
    const result = await installmentQueries.createInstallment(data);
    await Promise.all([mutateInstallments(), mutatePayments()]);
    return result;
  };

  const payInstallment = async (paymentId: string, transactionId: string) => {
    const result = await installmentQueries.markPaymentPaid(paymentId, transactionId);
    await Promise.all([mutateInstallments(), mutatePayments()]);
    return result;
  };

  return {
    installments: installments || [],
    upcomingPayments: upcomingPayments || [],
    isLoading: isInstLoading || isPayLoading,
    error: instError || payError,
    createInstallment,
    payInstallment,
    mutateInstallments,
    mutatePayments,
  };
}
