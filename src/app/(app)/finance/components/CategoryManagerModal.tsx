import React, { useState } from 'react';
import { Modal, Button, Input, ErrorAlert } from '@/components';
import { useCategory } from '@/hooks/useCategory';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import { Category } from '@/types/database';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  typeFilter: 'income' | 'expense';
}

export function CategoryManagerModal({ isOpen, onClose, typeFilter }: CategoryManagerModalProps) {
  const { categories, createCategory, updateCategory, deleteCategory } = useCategory();
  const { t } = useTranslation();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    name: '',
    icon: '📦',
  });
  const [error, setError] = useState<string | null>(null);

  const filteredCategories = categories.filter(c => c.type === typeFilter);

  const resetForm = () => {
    setForm({ name: '', icon: '📦' });
    setIsAdding(false);
    setEditingId(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    
    try {
      if (editingId) {
        await updateCategory(editingId, {
          name: form.name,
          icon: form.icon,
        });
      } else {
        await createCategory({
          name: form.name,
          icon: form.icon,
          type: typeFilter,
          is_default: false,
          sort_order: categories.length,
        });
      }
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, icon: cat.icon || '📦' });
    setIsAdding(true);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title={`Manage ${typeFilter === 'income' ? 'Income' : 'Expense'} Categories`}
    >
      <div className="space-y-md">
        <ErrorAlert error={error} onDismiss={() => setError(null)} />
        
        {!isAdding ? (
          <>
            <div className="grid grid-cols-2 gap-sm max-h-[300px] overflow-y-auto">
              {filteredCategories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-sm bg-gray-strong/40 rounded-md border border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-sm overflow-hidden">
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-sm font-bold truncate">{cat.name}</span>
                  </div>
                  <div className="flex gap-xs">
                    <button onClick={() => startEdit(cat)} className="p-1 text-gray-light hover:text-primary transition-colors">
                      <Edit2 size={14} />
                    </button>
                    {!cat.is_default && (
                      <button onClick={() => handleDelete(cat.id)} className="p-1 text-gray-light hover:text-danger transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full border-dashed"
              onClick={() => setIsAdding(true)}
              leftIcon={<Plus size={16} />}
            >
              Add New Category
            </Button>
          </>
        ) : (
          <div className="space-y-md bg-gray-strong/20 p-md rounded-lg border border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between mb-sm">
              <h3 className="text-sm font-bold">{editingId ? 'Edit Category' : 'New Category'}</h3>
              <button onClick={resetForm} className="text-gray-light hover:text-soft-cream">
                <X size={16} />
              </button>
            </div>
            
            <div className="flex gap-md">
              <div className="w-20">
                <Input
                  label="ICON"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="📦"
                  maxLength={2}
                  className="text-center text-xl"
                />
              </div>
              <div className="flex-1">
                <Input
                  label="NAME"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Groceries"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-sm mt-md">
              <Button variant="ghost" size="sm" onClick={resetForm}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleSave}>Save Category</Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
