import { supabase } from '@/services/supabase/supabaseClient';

export interface TransactionItem {
  id?: string;
  transaction_id: string;
  name: string;
  quantity: number;
  unit_price?: number;
  total: number;
  category_id?: string;
  sort_order?: number;
}

export const itemQueries = {
  async getByTransactionId(transactionId: string) {
    const { data, error } = await supabase
      .from('transaction_items')
      .select('*')
      .eq('transaction_id', transactionId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data as TransactionItem[];
  },

  async getReceiptMetadata(transactionId: string) {
    const { data, error } = await supabase
      .from('receipt_metadata')
      .select('*')
      .eq('transaction_id', transactionId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is not found
    return data;
  },

  async bulkUpsert(transactionId: string, items: TransactionItem[]) {
    // Basic validation
    if (!items.every(i => i.name && i.total != null)) {
      throw new Error('Items must have a name and total.');
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw new Error('Not authenticated');

    const payload = items.map((item, index) => ({
      ...(item.id ? { id: item.id } : {}),
      transaction_id: transactionId,
      user_id: userData.user.id,
      name: item.name,
      quantity: item.quantity || 1,
      unit_price: item.unit_price || null,
      total: item.total,
      category_id: item.category_id || null,
      sort_order: item.sort_order ?? index,
    }));

    const { data, error } = await supabase
      .from('transaction_items')
      .upsert(payload, { onConflict: 'id' })
      .select();

    if (error) throw error;
    return data;
  },

  async deleteItems(itemIds: string[]) {
    if (!itemIds.length) return;
    const { error } = await supabase
      .from('transaction_items')
      .delete()
      .in('id', itemIds);

    if (error) throw error;
  }
};
