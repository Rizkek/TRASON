import React, { useState, useEffect } from 'react';
import { Button, Input, Modal, ErrorAlert, CategoryIcon } from '@/components';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useBudget } from '@/hooks/useBudget';
import { useCategory } from '@/hooks/useCategory';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { sanitizeError } from '@/libs/validation';
import { Wallet, Target } from '@phosphor-icons/react/dist/ssr';
import { Heading, Paragraph } from '@/components/ui/typography';

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
      title={t('finance.budget.title')}
      footer={
        <div className="flex gap-4 justify-end w-full">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? t('common.loading') : t('common.save')}
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        <ErrorAlert error={error} onDismiss={() => setError(null)} />
        
        {/* Global Budget */}
        <div className="space-y-4">
          <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex items-start gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
              <Wallet size={20} />
            </div>
            <div>
              <Heading as="h4" size="h4" className="text-sm font-bold text-soft-cream">{t('finance.budget.globalMonthly')}</Heading>
              <Paragraph className="text-xs text-gray-light mt-1">
                {t('finance.budget.global_desc')}
              </Paragraph>
            </div>
          </div>
          <Input
            label={t('finance.budget.target_label').replace('{currency}', currency || 'USD')}
            type="number"
            placeholder={t('finance.budget.globalPlaceholder')}
            value={globalAmount}
            onChange={(e) => setGlobalAmount(e.target.value)}
          />
        </div>

        <div className="w-full h-px bg-white/10"></div>

        {/* Category Budgets */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Target size={18} className="text-secondary" />
            <Heading as="h4" size="h4" className="text-sm font-bold text-soft-cream">{t('finance.budget.predictiveBlueprint')}</Heading>
          </div>
          <Paragraph className="text-xs text-gray-light">
            {t('finance.budget.category_desc')}
          </Paragraph>
          
          <div className="space-y-2 mt-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {categories.length === 0 ? (
              <Paragraph className="text-xs text-center text-gray-light py-4">{t('finance.budget.noCategories')}</Paragraph>
            ) : (
              categories.map(cat => (
                <div key={cat.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-black/[0.02] dark:bg-white/[0.02] p-2 rounded-lg border border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-gray-strong/40 flex items-center justify-center text-xs text-soft-cream">
                      <CategoryIcon name={cat.icon || 'Box'} />
                    </div>
                    <span className="text-sm font-medium text-soft-cream">{cat.name}</span>
                  </div>
                  <div className="w-full sm:w-[150px]">
                    <Input
                      type="number"
                      placeholder={t('finance.budget.targetPlaceholder')}
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
