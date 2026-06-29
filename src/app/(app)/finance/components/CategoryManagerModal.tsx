import React, { useState } from 'react';
import { Modal, Button, Input, ErrorAlert } from '@/components';
import { useCategory } from '@/hooks/useCategory';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { Plus, Trash2, Edit2, X, Smile } from 'lucide-react';
import { Category } from '@/types/database';
import { CategoryIcon, CATEGORY_ICONS } from '@/components';

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
    icon: 'ShoppingCart',
  });
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const filteredCategories = categories.filter(c => c.type === typeFilter);

  const resetForm = () => {
    setForm({ name: '', icon: 'ShoppingCart' });
    setIsAdding(false);
    setEditingId(null);
    setError(null);
    setShowIconPicker(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    
    setIsSaving(true);
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
    } finally {
      setIsSaving(false);
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
    setForm({ name: cat.name, icon: cat.icon || 'ShoppingCart' });
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
                    <CategoryIcon name={cat.icon || 'ShoppingCart'} className="text-gray-light" />
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
            
            <div className="flex gap-md relative">
              <div className="w-20 flex flex-col items-center gap-xs">
                <label className="text-[10px] font-bold text-gray-light tracking-widest self-start">ICON</label>
                <button
                  type="button"
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="w-12 h-12 flex items-center justify-center bg-gray-strong border border-black/5 dark:border-white/5 rounded-md text-2xl hover:border-primary transition-colors focus:outline-none focus:ring-1 focus:ring-primary/30"
                >
                  <CategoryIcon name={form.icon} />
                </button>
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

            {showIconPicker && (
              <div className="bg-gray-strong/40 border border-black/5 dark:border-white/5 rounded-md p-sm max-h-[150px] overflow-y-auto grid grid-cols-5 sm:grid-cols-7 gap-xs">
                {CATEGORY_ICONS.map(iconName => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => {
                      setForm({ ...form, icon: iconName });
                      setShowIconPicker(false);
                    }}
                    className={`p-2 rounded-md flex items-center justify-center transition-colors ${form.icon === iconName ? 'bg-primary/20 text-primary' : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-light hover:text-white'}`}
                  >
                    <CategoryIcon name={iconName} />
                  </button>
                ))}
              </div>
            )}
            
            <div className="flex justify-end gap-sm mt-md">
              <Button variant="ghost" size="sm" onClick={resetForm} disabled={isSaving}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Category'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
