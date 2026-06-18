import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ModuleSelectionCardProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const ModuleSelectionCard: React.FC<ModuleSelectionCardProps> = ({
  id,
  title,
  description,
  icon: Icon,
  color,
  isSelected,
  onToggle,
}) => {
  return (
    <div
      onClick={() => onToggle(id)}
      className={`relative p-lg rounded-xl border transition-all cursor-pointer overflow-hidden group ${
        isSelected
          ? 'bg-black/[0.04] dark:bg-white/[0.04] border-primary shadow-lg shadow-primary/10'
          : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05] hover:border-primary/50'
      }`}
    >
      {/* Background glow when selected */}
      {isSelected && (
        <div className="absolute inset-0 bg-primary/5 blur-xl pointer-events-none" />
      )}
      
      <div className="relative z-10 flex items-start gap-md">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
            isSelected ? 'bg-primary/20' : 'bg-black/5 dark:bg-white/5'
          }`}
          style={isSelected ? { color: color, backgroundColor: `${color}20` } : {}}
        >
          <Icon size={24} style={isSelected ? { color: color } : {}} className={!isSelected ? 'text-gray-light' : ''} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className={`text-base font-bold tracking-wide transition-colors ${isSelected ? 'text-soft-cream' : 'text-gray-light'}`}>
              {title}
            </h4>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              isSelected ? 'border-primary bg-primary' : 'border-gray-light/50 bg-transparent'
            }`}>
              {isSelected && <span className="w-2.5 h-2.5 bg-warm-black rounded-full" />}
            </div>
          </div>
          <p className="text-xs text-gray-light leading-relaxed pr-6">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};
