'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Button, Input, Modal, Badge, Alert } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useTransaction } from '@/hooks/useTransaction';
import { useAsyncOperation } from '@/hooks/useFetch';
import { formatCurrency, formatDate } from '@/libs/format';
import { getDateRange } from '@/libs/date';

export default function FinancePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    createTransaction,
    deleteTransaction,
  } = useTransaction();
  const { execute } = useAsyncOperation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH',
    notes: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const { start, end } = getDateRange(selectedMonth.getMonth(), selectedMonth.getFullYear());
    fetchTransactions(start, end);
  }, [isAuthenticated, selectedMonth]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();

    await execute(async () => {
      await createTransaction({
        title: formData.title,
        description: formData.notes,
        categoryId: 'default',
        amount: parseFloat(formData.amount),
        type: formData.type,
        date: new Date(formData.date),
      });

      setFormData({
        title: '',
        amount: '',
        type: 'expense',
        category: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'CASH',
        notes: '',
      });
      setIsModalOpen(false);

      // Refresh transactions
      const { start, end } = getDateRange(
        selectedMonth.getMonth(),
        selectedMonth.getFullYear()
      );
      await fetchTransactions(start, end);
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      await execute(async () => {
        await deleteTransaction(id);

        // Refresh transactions
        const { start, end } = getDateRange(
          selectedMonth.getMonth(),
          selectedMonth.getFullYear()
        );
        await fetchTransactions(start, end);
      });
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-900">💰 Finance</h1>
          <Button onClick={() => setIsModalOpen(true)}>Add Transaction</Button>
        </div>

        {error && <Alert type="error" title="Error">{error}</Alert>}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hover>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Total Income</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(income)}</p>
            </div>
          </Card>

          <Card hover>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Total Expenses</p>
              <p className="text-3xl font-bold text-red-600">{formatCurrency(expenses)}</p>
            </div>
          </Card>

          <Card hover>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Balance</p>
              <p className={`text-3xl font-bold ${income - expenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(income - expenses)}
              </p>
            </div>
          </Card>
        </div>

        {/* Month Selector */}
        <Card>
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                const newDate = new Date(selectedMonth);
                newDate.setMonth(newDate.getMonth() - 1);
                setSelectedMonth(newDate);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              ← Previous
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => {
                const newDate = new Date(selectedMonth);
                newDate.setMonth(newDate.getMonth() + 1);
                setSelectedMonth(newDate);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Next →
            </button>
          </div>
        </Card>

        {/* Transactions Table */}
        <Card title="Transactions" description={`${transactions.length} transactions this month`}>
          {isLoading ? (
            <p className="text-center text-gray-500 py-8">Loading transactions...</p>
          ) : transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-2 font-semibold text-gray-700">Title</th>
                    <th className="text-left py-2 font-semibold text-gray-700">Category</th>
                    <th className="text-left py-2 font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-2 font-semibold text-gray-700">Type</th>
                    <th className="text-left py-2 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3">{formatDate(transaction.date)}</td>
                      <td className="py-3">{transaction.title}</td>
                      <td className="py-3">{transaction.category?.name || 'Other'}</td>
                      <td className={`py-3 font-medium ${
                        transaction.type === 'income'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={transaction.type === 'income' ? 'income' : 'expense'}
                          size="sm"
                        >
                          {transaction.type}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No transactions this month</p>
          )}
        </Card>
      </div>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Transaction"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTransaction}>Add</Button>
          </>
        }
      >
        <form onSubmit={handleAddTransaction} className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Grocery Shopping"
            required
          />

          <select
            value={formData.type}
            onChange={(e) =>
              setFormData({
                ...formData,
                type: e.target.value as 'income' | 'expense',
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            aria-label="Transaction type"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>

          <Input
            label="Amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
            required
          />

          <Input
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., Food, Transport"
            required
          />

          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />

          <select
            value={formData.paymentMethod}
            onChange={(e) =>
              setFormData({ ...formData, paymentMethod: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            aria-label="Payment method"
          >
            <option value="CASH">Cash</option>
            <option value="CARD">Card</option>
            <option value="TRANSFER">Transfer</option>
            <option value="OTHER">Other</option>
          </select>

          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add notes..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            rows={3}
          />
        </form>
      </Modal>
    </Layout>
  );
}
