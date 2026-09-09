import { supabase } from '../supabase/supabaseClient';
import { handleQueryError, logError } from '@/libs/apiErrors';
import { withAuthQuery } from "@/services/supabase/queryBuilder";
import { Installment, InstallmentPayment } from '@/types/database';

export const installmentQueries = {
  // Fetch active installments
  async getInstallments() {
    try {
      return await withAuthQuery(async (userId) => {
        const { data, error } = await supabase
          .from('installments')
          .select(`
            *,
            categories:category_id(id, name, color, icon)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Installment[];
      });
    } catch (err) {
      logError(err, 'installmentQueries.getInstallments');
      throw handleQueryError(err);
    }
  },

  // Fetch upcoming payments
  async getUpcomingPayments() {
    try {
      return await withAuthQuery(async (userId) => {
        const { data, error } = await supabase
          .from('installment_payments')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'pending')
          .order('due_date', { ascending: true })
          .limit(10);

        if (error) throw error;
        return data as InstallmentPayment[];
      });
    } catch (err) {
      logError(err, 'installmentQueries.getUpcomingPayments');
      throw handleQueryError(err);
    }
  },

  // Create a new installment and its payment schedule
  async createInstallment(
    installment: Omit<Installment, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'categories'>
  ) {
    try {
      return await withAuthQuery(async (userId) => {
        // 1. Create the installment record
        const { data: newInst, error: instError } = await supabase
          .from('installments')
          .insert([{ ...installment, user_id: userId }])
          .select()
          .single();

        if (instError) throw instError;

        // 2. Generate payment schedule (e.g., 12 months)
        const paymentsToInsert = [];
        const startDate = new Date(installment.start_date);
        
        for (let i = 0; i < installment.total_months; i++) {
          const dueDate = new Date(startDate);
          dueDate.setMonth(dueDate.getMonth() + i);
          
          paymentsToInsert.push({
            installment_id: newInst.id,
            user_id: userId,
            due_date: dueDate.toISOString().split('T')[0],
            amount: installment.monthly_amount,
            status: 'pending'
          });
        }

        const { error: payError } = await supabase
          .from('installment_payments')
          .insert(paymentsToInsert);

        if (payError) throw payError;

        return newInst as Installment;
      });
    } catch (err) {
      logError(err, 'installmentQueries.createInstallment');
      throw handleQueryError(err);
    }
  },

  // Mark payment as paid and link to a transaction
  async markPaymentPaid(paymentId: string, transactionId: string) {
    try {
      return await withAuthQuery(async (userId) => {
        // Update payment
        const { data: updatedPayment, error } = await supabase
          .from('installment_payments')
          .update({
            status: 'paid',
            paid_date: new Date().toISOString().split('T')[0],
            transaction_id: transactionId
          })
          .eq('id', paymentId)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;

        // Increment paid_months on installment
        if (updatedPayment) {
          // get current paid_months
          const { data: inst } = await supabase
            .from('installments')
            .select('paid_months, total_months')
            .eq('id', updatedPayment.installment_id)
            .single();
            
          if (inst) {
            const newPaid = (inst.paid_months || 0) + 1;
            const newStatus = newPaid >= inst.total_months ? 'completed' : 'active';
            
            await supabase
              .from('installments')
              .update({ 
                paid_months: newPaid,
                status: newStatus 
              })
              .eq('id', updatedPayment.installment_id);
          }
        }

        return updatedPayment;
      });
    } catch (err) {
      logError(err, 'installmentQueries.markPaymentPaid');
      throw handleQueryError(err);
    }
  }
};
