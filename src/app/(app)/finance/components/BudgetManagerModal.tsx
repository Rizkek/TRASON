import React, { useState, useEffect } from 'react';
import { Button, Input, Modal, ErrorAlert, CategoryIcon } from '@/components';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useBudget } from '@/hooks/useBudget';
import { useCategory } from '@/hooks/useCategory';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { sanitizeError } from '@/libs/validation';
import { Wallet, Target } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function BudgetManagerModal({ isOpen, onClose }: Props) {
  const { t } = useTranslation();
  const { currency } = useUserPreferences();
  const { globalBudget, budgets, upsertBudget, deleteBudget } = useBudget();
  const { categories } = useCategory('expense');

  const [globalAmount, setGlobalAmount] = useState('');
  const [categoryAmounts, setCategoryAmounts] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setGlobalAmount(globalBudget ? globalBudget.amount.toString() : '');
      
      const newCatAmounts: Record<string, string> = {};
      categories.forEach(cat => {
        const b = budgets.find(b => b.category_id === cat.id);
        if (b) {
          newCatAmounts[cat.id] = b.amount.toString();
        } else {
          newCatAmounts[cat.id] = '';
        }
      });
      setCategoryAmounts(newCatAmounts);
      setError(null);
    }
  }, [isOpen, globalBudget, budgets, categories]);

  const handleCategoryChange = (catId: string, val: string) => {
    setCategoryAmounts(prev => ({ ...prev, [catId]: val }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      // Save global budget
      if (globalAmount && !isNaN(Number(globalAmount))) {
        await upsertBudget({
          id: globalBudget?.id,
          amount: Number(globalAmount),
          currency: currency || 'USD',
          period_type: 'monthly',
          category_id: null
        });
      } else if (globalBudget?.id && !globalAmount) {
        await deleteBudget(globalBudget.id);
      }

      // Save category budgets
      const promises = categories.map(async (cat) => {
        const val = categoryAmounts[cat.id];
        const existing = budgets.find(b => b.category_id === cat.id);
        
        if (val && !isNaN(Number(val))) {
          if (!existing || existing.amount !== Number(val)) {
            return upsertBudget({
              id: existing?.id,
              amount: Number(val),
              currency: currency || 'USD',
              period_type: 'monthly',
              category_id: cat.id
            });
          }
        } else if (existing?.id && !val) {
          return deleteBudget(existing.id);
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      onClose();
    } catch (err) {
      setError(sanitizeError(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Budget Planner"
      footer={
        <div className="flex gap-md justify-end w-full">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? 'Menyimpan...' : 'Simpan Plan'}
          </Button>
        </div>
      }
    >
      <div className="space-y-xl">
        <ErrorAlert error={error} onDismiss={() => setError(null)} />
        
        {/* Global Budget */}
        <div className="space-y-md">
          <div className="bg-primary/5 p-md rounded-xl border border-primary/10 flex items-start gap-sm">
            <div className="p-sm bg-primary/10 rounded-lg text-primary shrink-0">
              <Wallet size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-soft-cream">Global Monthly Budget</h4>
              <p className="text-xs text-gray-light mt-1">
                Batas maksimal seluruh pengeluaran Anda dalam 1 bulan.
              </p>
            </div>
          </div>
          <Input
            label={`TARGET TOTAL BULANAN (${currency})`}
            type="number"
            placeholder="Misal: 5000000"
            value={globalAmount}
            onChange={(e) => setGlobalAmount(e.target.value)}
          />
        </div>

        <div className="w-full h-px bg-white/10"></div>

        {/* Category Budgets */}
        <div className="space-y-md">
          <div className="flex items-center gap-sm mb-sm">
            <Target size={18} className="text-secondary" />
            <h4 className="text-sm font-bold text-soft-cream">Predictive Category Blueprint</h4>
          </div>
          <p className="text-xs text-gray-light">
            Biarkan sistem memantau otomatis. Tetapkan batas pengeluaran spesifik untuk setiap kategori (Opsional).
          </p>
          
          <div className="space-y-sm mt-md max-h-[40vh] overflow-y-auto pr-sm custom-scrollbar">
            {categories.length === 0 ? (
              <p className="text-xs text-center text-gray-light py-md">Belum ada kategori pengeluaran.</p>
            ) : (
              categories.map(cat => (
                <div key={cat.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm bg-black/[0.02] dark:bg-white/[0.02] p-sm rounded-lg border border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-sm">
                    <div className="w-8 h-8 rounded-md bg-gray-strong/40 flex items-center justify-center text-xs text-soft-cream">
                      <CategoryIcon name={cat.icon || 'Box'} />
                    </div>
                    <span className="text-sm font-medium text-soft-cream">{cat.name}</span>
                  </div>
                  <div className="w-full sm:w-[150px]">
                    <Input
                      type="number"
                      placeholder="Target (Opsional)"
                      value={categoryAmounts[cat.id] || ''}
                      onChange={(e) => handleCategoryChange(cat.id, e.target.value)}
                      className="text-right"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
