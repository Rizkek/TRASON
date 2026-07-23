import React, { useState, useEffect } from 'react';
import { Button, Input, Modal, ErrorAlert } from '@/components';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useBudget } from '@/hooks/useBudget';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { sanitizeError } from '@/libs/validation';
import { Wallet } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function BudgetManagerModal({ isOpen, onClose }: Props) {
  const { t } = useTranslation();
  const { currency } = useUserPreferences();
  const { globalBudget, upsertBudget } = useBudget();

  const [amount, setAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (globalBudget) {
      setAmount(globalBudget.amount.toString());
    } else {
      setAmount('');
    }
  }, [globalBudget, isOpen]);

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount))) {
      setError("Masukkan angka yang valid");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await upsertBudget({
        id: globalBudget?.id,
        amount: Number(amount),
        currency: currency || 'USD',
        period_type: 'monthly',
      });
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
      title="Atur Target Pengeluaran (Budget)"
      footer={
        <div className="flex gap-md justify-end w-full">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? 'Menyimpan...' : 'Simpan Target'}
          </Button>
        </div>
      }
    >
      <div className="space-y-lg">
        <ErrorAlert error={error} onDismiss={() => setError(null)} />
        
        <div className="bg-primary/5 p-lg rounded-xl border border-primary/10 flex items-start gap-md">
          <div className="p-sm bg-primary/10 rounded-lg text-primary shrink-0">
            <Wallet size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-soft-cream">Global Monthly Budget</h4>
            <p className="text-xs text-gray-light mt-xs">
              Atur batas maksimal pengeluaran Anda untuk 1 bulan. Ini akan membantu Anda mengontrol agar tidak *over-spending*.
            </p>
          </div>
        </div>

        <Input
          label={`TARGET PENGELUARAN BULANAN (${currency})`}
          type="number"
          placeholder="Misal: 5000000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
    </Modal>
  );
}
