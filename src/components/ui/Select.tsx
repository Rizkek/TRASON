'use client';

import React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { CaretDown, CaretUp, Check } from '@phosphor-icons/react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  disabled?: boolean;
}

export interface SelectGroupOption {
  label: string;
  options: SelectOption[];
}

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options?: (SelectOption | SelectGroupOption)[];
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  id?: string;
  name?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

function isGroup(opt: SelectOption | SelectGroupOption): opt is SelectGroupOption {
  return 'options' in opt && Array.isArray((opt as SelectGroupOption).options);
}

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      options,
      placeholder = 'Select an option...',
      label,
      error,
      disabled = false,
      className = '',
      triggerClassName = '',
      id,
      name,
      children,
      size = 'md',
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'h-8 px-2.5 text-xs rounded-md',
      md: 'h-10 px-3 text-sm rounded-lg',
      lg: 'h-12 px-4 text-base rounded-xl',
    };

    return (
      <div className={`w-full space-y-1.5 ${className}`}>
        {label && (
          <label
            htmlFor={id}
            className="block text-[11px] font-bold text-gray-light uppercase tracking-wider select-none"
          >
            {label}
          </label>
        )}

        <SelectPrimitive.Root
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          disabled={disabled}
          name={name}
        >
          <SelectPrimitive.Trigger
            ref={ref}
            id={id}
            className={`w-full bg-gray-strong/80 hover:bg-gray-strong/95 border ${
              error
                ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/30'
                : 'border-white/10 hover:border-white/20 focus:border-primary focus:ring-primary/30'
            } transition-all duration-200 text-soft-cream flex items-center justify-between gap-2 shadow-sm focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
              sizeClasses[size]
            } ${triggerClassName}`}
          >
            <span className="truncate">
              <SelectPrimitive.Value placeholder={<span className="text-gray-light/60">{placeholder}</span>} />
            </span>
            <SelectPrimitive.Icon asChild>
              <CaretDown size={14} weight="bold" className="text-gray-light/70 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>

          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              position="popper"
              sideOffset={5}
              className="z-[200] max-h-80 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-white/10 bg-warm-black/95 backdrop-blur-2xl p-1.5 text-soft-cream shadow-[0_20px_50px_rgba(0,0,0,0.7)] animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
            >
              <SelectPrimitive.ScrollUpButton className="flex items-center justify-center h-6 bg-white/5 text-gray-light cursor-default">
                <CaretUp size={14} />
              </SelectPrimitive.ScrollUpButton>

              <SelectPrimitive.Viewport className="p-1 space-y-0.5">
                {children ? (
                  children
                ) : options ? (
                  options.map((opt, idx) => {
                    if (isGroup(opt)) {
                      return (
                        <SelectPrimitive.Group key={opt.label || idx}>
                          {opt.label && (
                            <SelectPrimitive.Label className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-light/50">
                              {opt.label}
                            </SelectPrimitive.Label>
                          )}
                          {opt.options.map((subOpt) => (
                            <SelectItem key={subOpt.value} value={subOpt.value} disabled={subOpt.disabled}>
                              <div className="flex items-center gap-2">
                                {subOpt.icon}
                                <span>{subOpt.label}</span>
                                {subOpt.badge && (
                                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-light font-mono">
                                    {subOpt.badge}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectPrimitive.Group>
                      );
                    }

                    return (
                      <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                        <div className="flex items-center gap-2">
                          {opt.icon}
                          <span>{opt.label}</span>
                          {opt.badge && (
                            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-light font-mono">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })
                ) : null}
              </SelectPrimitive.Viewport>

              <SelectPrimitive.ScrollDownButton className="flex items-center justify-center h-6 bg-white/5 text-gray-light cursor-default">
                <CaretDown size={14} />
              </SelectPrimitive.ScrollDownButton>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>

        {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className = '', children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={`relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 pl-7 pr-3 text-sm outline-none transition-colors duration-150 data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-warm-gold/15 data-[highlighted]:text-warm-gold data-[state=checked]:font-semibold text-soft-cream ${className}`}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check size={14} weight="bold" className="text-warm-gold" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));

SelectItem.displayName = 'SelectItem';

export const SelectGroup = SelectPrimitive.Group;
export const SelectLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className = '', ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={`px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-light/50 ${className}`}
    {...props}
  />
));
SelectLabel.displayName = 'SelectLabel';

export const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className = '', ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={`-mx-1 my-1 h-px bg-white/10 ${className}`}
    {...props}
  />
));
SelectSeparator.displayName = 'SelectSeparator';
