'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Button, Badge, Loading, Modal, Input } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useTransaction } from '@/hooks/useTransaction';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Search, 
  Filter, 
  MoreVertical,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/libs/format';
import { getDateRange } from '@/libs/date';

export default function FinancePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { transactions, fetchTransactions, createTransaction, updateTransaction, deleteTransaction } = useTransaction();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  
  const [form, setForm] = useState({
    title: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category_id: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadData = async () => {
      setIsLoading(true);
      const now = new Date();
      const { start, end } = getDateRange(now.getMonth(), now.getFullYear());
      await fetchTransactions(start, end);
      setIsLoading(false);
    };
    
    loadData();
  }, [isAuthenticated]);

  const handleSave = async () => {
    if (!form.title || !form.amount) return;
    
    const payload = {
      title: form.title,
      amount: parseFloat(form.amount),
      type: form.type,
      date: new Date(form.date).toISOString(),
      notes: form.notes
    };

    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, payload);
      } else {
        await createTransaction(payload);
      }
      setIsModalOpen(false);
      // Refresh
      const now = new Date();
      const { start, end } = getDateRange(now.getMonth(), now.getFullYear());
      fetchTransactions(start, end);
    } catch (err) {
      console.error('Failed to save transaction:', err);
    }
  };

  const openAddModal = () => {
    setEditingTransaction(null);
    setForm({
      title: '',
      amount: '',
      type: 'expense',
      category_id: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (t: any) => {
    setEditingTransaction(t);
    setForm({
      title: t.title,
      amount: t.amount.toString(),
      type: t.type,
      category_id: t.category_id || '',
      date: new Date(t.date).toISOString().split('T')[0],
      notes: t.notes || ''
    });
    setIsModalOpen(true);
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  if (!isAuthenticated) return null;

  return (
    <Layout>
      <div className="space-y-xl animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-md">
          <div className="space-y-sm">
            <h1 className="text-display font-serif text-gradient">Financial Flow</h1>
            <p className="text-subtext flex items-center gap-sm">
              <Wallet size={14} className="text-primary" />
              Manage your resources and track architecture
            </p>
          </div>
          <Button variant="primary" size="md" onClick={openAddModal} leftIcon={<Plus size={18} />}>
            New Entry
          </Button>
        </div>

        {/* Global Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          <Card className="p-xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-success/5 rounded-full blur-2xl group-hover:bg-success/10 transition-all" />
            <p className="text-micro text-gray-light mb-md tracking-widest">TOTAL INCOME</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-success">{formatCurrency(totalIncome)}</p>
              <div className="p-sm bg-success/10 rounded-md text-success"><ArrowUpRight size={20} /></div>
            </div>
          </Card>
          
          <Card className="p-xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-danger/5 rounded-full blur-2xl group-hover:bg-danger/10 transition-all" />
            <p className="text-micro text-gray-light mb-md tracking-widest">TOTAL EXPENSES</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-danger">{formatCurrency(totalExpense)}</p>
              <div className="p-sm bg-danger/10 rounded-md text-danger"><ArrowDownLeft size={20} /></div>
            </div>
          </Card>

          <Card className="p-xl relative overflow-hidden group border-b-2 border-primary/20">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
            <p className="text-micro text-gray-light mb-md tracking-widest">NET BALANCE</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-white">{formatCurrency(totalIncome - totalExpense)}</p>
              <div className="p-sm bg-primary/10 rounded-md text-primary"><TrendingUp size={20} /></div>
            </div>
          </Card>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-md items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search size={18} className="absolute left-md top-1/2 -translate-y-1/2 text-gray-light group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search transactions..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-xl pr-md py-md bg-gray-strong bg-opacity-40 border border-white border-opacity-[0.05] rounded-md text-sm focus:border-primary focus:outline-none transition-all"
            />
          </div>
          
          <div className="flex bg-gray-strong bg-opacity-40 p-1 rounded-md border border-white border-opacity-[0.05]">
            {(['all', 'income', 'expense'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-xl py-sm text-[10px] font-bold rounded-sm transition-all uppercase tracking-widest ${
                  filterType === type 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-gray-light hover:text-soft-cream'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <Card className="overflow-hidden border-none shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white bg-opacity-[0.02] border-b border-white border-opacity-[0.05]">
                  <th className="px-xl py-lg text-[10px] font-bold text-gray-light tracking-widest uppercase">Transaction</th>
                  <th className="px-xl py-lg text-[10px] font-bold text-gray-light tracking-widest uppercase">Date</th>
                  <th className="px-xl py-lg text-[10px] font-bold text-gray-light tracking-widest uppercase">Category</th>
                  <th className="px-xl py-lg text-right text-[10px] font-bold text-gray-light tracking-widest uppercase">Amount</th>
                  <th className="px-xl py-lg text-right text-[10px] font-bold text-gray-light tracking-widest uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white divide-opacity-[0.03]">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-2xl text-center"><Loading /></td>
                  </tr>
                ) : filteredTransactions.length > 0 ? (
                  filteredTransactions.map((t) => (
                    <tr 
                      key={t.id} 
                      className="group hover:bg-white hover:bg-opacity-[0.02] transition-colors cursor-pointer"
                      onClick={() => openEditModal(t)}
                    >
                      <td className="px-xl py-xl">
                        <div className="flex items-center gap-md">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            t.type === 'income' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                          }`}>
                            {t.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-soft-cream group-hover:text-primary transition-colors underline-offset-4 decoration-primary">{t.title}</p>
                            {t.notes && <p className="text-[10px] text-gray-light truncate max-w-[200px] mt-1">{t.notes}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-xl py-xl">
                        <div className="flex items-center gap-sm text-gray-light">
                          <Calendar size={12} />
                          <span className="text-xs font-medium">{formatDate(t.date)}</span>
                        </div>
                      </td>
                      <td className="px-xl py-xl">
                        <Badge variant={t.type === 'income' ? 'success' : 'danger'} size="sm">
                          {t.category?.name || 'Uncategorized'}
                        </Badge>
                      </td>
                      <td className="px-xl py-xl text-right">
                        <p className={`text-sm font-bold ${t.type === 'income' ? 'text-success' : 'text-soft-cream'}`}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                        </p>
                      </td>
                      <td className="px-xl py-xl text-right">
                        <button className="p-sm text-gray-light hover:text-soft-cream rounded-md hover:bg-white/5 transition-all">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-2xl text-center text-gray-light text-xs italic opacity-60">
                      No transactions match your current view.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Entry Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTransaction ? 'EDIT TRANSACTION' : 'RECORD NEW FLOW'}
        footer={
          <div className="flex gap-md justify-end">
            <Button variant="ghost" size="md" onClick={() => setIsModalOpen(false)}>CANCEL</Button>
            <Button variant="primary" size="md" onClick={handleSave}>
              {editingTransaction ? 'UPDATE LOG' : 'PERSIST TRANSACTION'}
            </Button>
          </div>
        }
      >
        <div className="space-y-xl">
          <div className="flex bg-gray-strong p-1 rounded-md border border-white border-opacity-[0.05]">
            {(['income', 'expense'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setForm(f => ({ ...f, type }))}
                className={`flex-1 py-md text-[10px] font-bold rounded-sm transition-all uppercase tracking-widest ${
                  form.type === type 
                    ? type === 'income' ? 'bg-success text-white' : 'bg-danger text-white'
                    : 'text-gray-light hover:text-soft-cream'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <Input
            label="TITLE"
            placeholder="Coffee, Subscription, Freelance..."
            value={form.title}
            onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-md">
            <Input
              label="AMOUNT"
              type="number"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
            />
            <div className="space-y-sm">
              <label className="text-[10px] font-bold text-gray-light tracking-widest block">DATE</label>
              <input 
                type="date" 
                value={form.date}
                onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full h-10 bg-gray-strong border border-white/5 rounded-sm px-md text-sm text-soft-cream focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-sm">
            <label className="text-[10px] font-bold text-gray-light tracking-widest block">DESCRIPTION / NOTES</label>
            <textarea
              placeholder="Context or tags..."
              rows={4}
              value={form.notes}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full bg-gray-strong bg-opacity-40 border border-white border-opacity-[0.05] rounded-md p-lg text-sm text-soft-cream focus:border-primary focus:outline-none resize-none"
            />
          </div>

          {editingTransaction && (
            <button 
              onClick={async () => {
                if(confirm('Delete this entry forever?')) {
                  await deleteTransaction(editingTransaction.id);
                  setIsModalOpen(false);
                  const now = new Date();
                  const { start, end } = getDateRange(now.getMonth(), now.getFullYear());
                  fetchTransactions(start, end);
                }
              }}
              className="w-full py-md text-danger text-[10px] font-bold uppercase tracking-widest border border-danger border-opacity-20 hover:bg-danger hover:bg-opacity-5 rounded-md transition-all"
            >
              DELETE THIS TRANSACTION
            </button>
          )}
        </div>
      </Modal>
    </Layout>
  );
}
