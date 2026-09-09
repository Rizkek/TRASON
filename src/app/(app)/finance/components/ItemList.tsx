import React, { useState, useEffect } from 'react';
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
        <h4 className="text-xs font-bold text-gray-light uppercase tracking-widest">Itemized Receipt</h4>
        <button 
          onClick={handleAdd}
          className="text-primary hover:text-white text-[10px] font-bold tracking-wider flex items-center gap-1 transition-colors"
        >
          <Plus size={12} weight="bold" /> ADD ITEM
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-black/20 rounded-xl p-8 border border-white/5 border-dashed text-center">
          <p className="text-xs text-gray-light">No items extracted. You can add them manually.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={item.id || idx} className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden">
              {editingIndex === idx ? (
                <div className="p-4 space-y-3">
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Item name"
                    className="w-full bg-black/20 border border-white/10 rounded p-2 text-sm text-white focus:border-primary focus:outline-none"
                    autoFocus
                  />
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-light block mb-1">Qty</label>
                      <input
                        type="number"
                        value={editForm.quantity || ''}
                        onChange={e => setEditForm({ ...editForm, quantity: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-black/20 border border-white/10 rounded p-2 text-sm text-white focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-light block mb-1">Total</label>
                      <input
                        type="number"
                        value={editForm.total || ''}
                        onChange={e => setEditForm({ ...editForm, total: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-black/20 border border-white/10 rounded p-2 text-sm text-white focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button onClick={() => handleDelete(idx)} className="p-2 text-danger hover:bg-danger/10 rounded transition-colors">
                      <Trash size={16} />
                    </button>
                    <button onClick={() => setEditingIndex(null)} className="px-3 py-1.5 text-xs text-gray-light hover:text-white transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleSave} className="px-3 py-1.5 text-xs bg-primary text-black font-semibold rounded hover:bg-primary/90 transition-colors">
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 flex items-center justify-between group">
                  <div className="flex-1 pr-4">
                    <p className="text-sm font-medium text-soft-cream">{item.name}</p>
                    {item.quantity > 1 && (
                      <p className="text-[10px] text-gray-light mt-0.5">Qty: {item.quantity}</p>
                    )}
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <p className="text-sm font-semibold text-white">
                      {formatCurrency(item.total, currency, locale)}
                    </p>
                    <button 
                      onClick={() => handleEdit(idx)}
                      className="text-gray-light hover:text-primary opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <PencilSimple size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          <div className="flex justify-between items-center p-3 mt-4 border-t border-white/10">
            <span className="text-xs text-gray-light uppercase tracking-widest font-bold">Calculated Sum</span>
            <span className="text-sm font-bold text-primary">{formatCurrency(totalSum, currency, locale)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
