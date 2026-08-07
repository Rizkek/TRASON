import React, { useState } from 'react';
import { Modal, Button, Input, ErrorAlert } from '@/components';
import { useCategory } from '@/hooks/useCategory';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { Plus, Trash as Trash2, PencilSimple as Edit2, X, Smiley } from '@phosphor-icons/react/dist/ssr';
import { Category } from '@/types/database';
import { CategoryIcon, CATEGORY_ICONS, ICON_CATEGORIES } from '@/components';
import { ICON_NAME_SUGGESTIONS } from '@/libs/defaultCategories';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  typeFilter: 'income' | 'expense';
}

export function CategoryManagerModal({ isOpen, onClose, typeFilter }: CategoryManagerModalProps) {
  const { categories, createCategory, updateCategory, deleteCategory } = useCategory();
  const { t } = useTranslation();
  const { language } = useUserPreferences();
  
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
      title={t('finance.categories.manageTitle').replace('{type}', typeFilter === 'income' ? t('finance.modal.type.income') : t('finance.modal.type.expense'))}
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
              {t('finance.categories.addNew')}
            </Button>
          </>
        ) : (
          <div className="space-y-md bg-gray-strong/20 p-md rounded-lg border border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between mb-sm">
              <h3 className="text-sm font-bold">{editingId ? t('finance.categories.edit') : t('finance.categories.new')}</h3>
              <button onClick={resetForm} className="text-gray-light hover:text-soft-cream">
                <X size={16} />
              </button>
            </div>
            
            <div className="flex gap-md relative">
              <div className="w-20 flex flex-col items-center gap-xs">
                <label className="text-[10px] font-bold text-gray-light tracking-widest self-start">{t('finance.categories.iconLabel')}</label>
                <button
                  type="button"
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="w-12 h-12 flex items-center justify-center bg-gray-strong border border-black/5 dark:border-white/5 rounded-md text-2xl hover:border-primary transition-colors focus:outline-none focus:ring-1 focus:ring-primary/30 relative group"
                  title="Klik untuk memilih icon"
                >
                  <CategoryIcon name={form.icon} />
                  <span className="absolute -bottom-1 -right-1 text-[8px] bg-primary/20 text-primary px-1 rounded font-bold border border-primary/30">
                    Ubah
                  </span>
                </button>
              </div>
              <div className="flex-1 space-y-1">
                <Input
                  label={t('finance.categories.nameLabel')}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={t('finance.categories.namePlaceholder')}
                />
                {(() => {
                  const currentSuggestion = ICON_NAME_SUGGESTIONS[form.icon];
                  const suggestedText = currentSuggestion?.[language as keyof typeof currentSuggestion] || currentSuggestion?.id || currentSuggestion?.en;
                  if (!suggestedText || form.name === suggestedText) return null;
                  return (
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] text-gray-light/60">Saran nama:</span>
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, name: suggestedText }))}
                        className="text-[10px] text-primary hover:underline font-medium bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 transition-all"
                      >
                        Gunakan &quot;{suggestedText}&quot; ↵
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>

            {showIconPicker && (
              <div className="bg-gray-strong/40 border border-black/5 dark:border-white/5 rounded-md p-sm max-h-[250px] overflow-y-auto space-y-md relative">
                {ICON_CATEGORIES.map(category => (
                  <div key={category.name}>
                    <div className="text-[10px] font-bold text-gray-light mb-2 uppercase tracking-widest sticky top-0 bg-[#252525]/90 dark:bg-gray-strong/90 backdrop-blur py-1 z-10">
                      {category.name}
                    </div>
                    <div className="grid grid-cols-5 sm:grid-cols-7 gap-xs">
                      {category.icons.map(iconName => {
                        const suggestion = ICON_NAME_SUGGESTIONS[iconName];
                        const iconTitle = suggestion?.[language as keyof typeof suggestion] || suggestion?.id || suggestion?.en || iconName;
                        return (
                          <button
                            key={iconName}
                            type="button"
                            title={iconTitle}
                            onClick={() => {
                              const newSuggestedName = suggestion?.[language as keyof typeof suggestion] || suggestion?.id || suggestion?.en || iconName;
                              
                              setForm(prev => {
                                // Auto replace if: adding new, or name is empty, or name matches any known default icon suggestion
                                const isCurrentAuto = !prev.name.trim() || 
                                  !editingId ||
                                  Object.values(ICON_NAME_SUGGESTIONS).some(s => 
                                    Object.values(s).includes(prev.name.trim())
                                  );

                                return { 
                                  ...prev, 
                                  icon: iconName,
                                  name: isCurrentAuto ? newSuggestedName : prev.name
                                };
                              });
                              setShowIconPicker(false);
                            }}
                            className={`p-2 rounded-md flex items-center justify-center transition-colors group relative ${form.icon === iconName ? 'bg-primary/20 text-primary ring-1 ring-primary' : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-light hover:text-white'}`}
                          >
                            <CategoryIcon name={iconName} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-end gap-sm mt-md">
              <Button variant="ghost" size="sm" onClick={resetForm} disabled={isSaving}>{t('common.cancel')}</Button>
              <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? t('finance.categories.saving') : t('finance.categories.save')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
