import React, { useState} from 'react';
import { Plus, Trash, PencilSimple } from '@phosphor-icons/react';
import { TransactionItem } from '@/services/finance/itemQueries';
import { formatCurrency } from '@/libs/format';
import { useTranslation } from '@/libs/i18n/useTranslation';

interface Props {
  items: TransactionItem[];
  onChange: (items: TransactionItem[]) => void;
  currency?: string;
  locale?: string;
}

export function ItemList({ items, onChange, currency = 'USD', locale = 'en-US' }: Props) {
  const { t } = useTranslation();
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<TransactionItem>>({});

  const handleAdd = () => {
    const newItem: TransactionItem = {
      transaction_id: '',
      name: '',
      quantity: 1,
      total: 0,
      sort_order: items.length
    };
    onChange([...items, newItem]);
    setEditingIndex(items.length);
    setEditForm(newItem);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditForm(items[index]);
  };

  const handleSave = () => {
    if (editingIndex === null) return;
    const newItems = [...items];
    newItems[editingIndex] = { ...newItems[editingIndex], ...editForm } as TransactionItem;
    
    // Auto calculate total if qty and unit_price are provided
    if (editForm.quantity && editForm.unit_price) {
       newItems[editingIndex].total = editForm.quantity * editForm.unit_price;
    }

    onChange(newItems);
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const totalSum = items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-muted-foreground">{t('receipt.items_title')}</h4>
        <button 
          onClick={handleAdd}
          className="text-primary hover:text-foreground text-xs font-bold flex items-center gap-1 transition-colors"
        >
          <Plus size={12} weight="bold" /> {t('receipt.add_item')}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-background/60 rounded-xl p-5 md:p-8 border border-foreground/5 border-dashed text-center">
          <p className="text-xs text-muted-foreground">{t('receipt.no_items')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={item.id || idx} className="bg-surface border border-foreground/5 rounded-xl overflow-hidden">
              {editingIndex === idx ? (
                <div className="p-4 space-y-3">
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder={t('receipt.item_name')}
                    className="w-full bg-background/60 border border-foreground/10 rounded p-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    autoFocus
                  />
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground block mb-1">{t('receipt.qty')}</label>
                      <input
                        type="number"
                        value={editForm.quantity || ''}
                        onChange={e => setEditForm({ ...editForm, quantity: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-background/60 border border-foreground/10 rounded p-2 text-sm text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground block mb-1">{t('receipt.total')}</label>
                      <input
                        type="number"
                        value={editForm.total || ''}
                        onChange={e => setEditForm({ ...editForm, total: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-background/60 border border-foreground/10 rounded p-2 text-sm text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button onClick={() => handleDelete(idx)} className="p-2 text-danger hover:bg-danger/10 rounded transition-colors">
                      <Trash size={16} />
                    </button>
                    <button onClick={() => setEditingIndex(null)} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">{t('common.cancel')}</button>
                    <button onClick={handleSave} className="px-3 py-1.5 text-xs bg-primary text-on-primary font-semibold rounded hover:bg-primary/90 transition-colors">{t('common.save')}</button>
                  </div>
                </div>
              ) : (
                <div className="p-3 flex items-center justify-between group">
                  <div className="flex-1 pr-4">
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-muted-foreground mt-0.5">{t('receipt.qty')}: {item.quantity}</p>
                    )}
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(item.total, currency, locale)}
                    </p>
                    <button 
                      onClick={() => handleEdit(idx)}
                      aria-label={t('common.edit')}
                      className="text-muted-foreground transition-colors hover:text-primary can-hover:opacity-0 can-hover:group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      <PencilSimple size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          <div className="flex justify-between items-center p-3 mt-4 border-t border-foreground/10">
            <span className="text-xs text-muted-foreground font-bold">{t('receipt.sum')}</span>
            <span className="text-sm font-bold text-primary">{formatCurrency(totalSum, currency, locale)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
