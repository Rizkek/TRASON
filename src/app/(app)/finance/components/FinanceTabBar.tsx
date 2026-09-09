'use client';

import React from 'react';
import { ListBullets, CreditCard, CalendarBlank } from '@phosphor-icons/react';
import { useTranslation } from '@/libs/i18n/useTranslation';

export type FinanceTab = 'transactions' | 'installments' | 'subscriptions';

interface FinanceTabBarProps {
  activeTab: FinanceTab;
  onChange: (tab: FinanceTab) => void;
}

export function FinanceTabBar({ activeTab, onChange }: FinanceTabBarProps) {
  const { t } = useTranslation();

  const tabs = [
    { id: 'transactions', label: t('finance.tabs.transactions') || 'Transaksi', icon: ListBullets },
    { id: 'installments', label: t('finance.tabs.installments') || 'Cicilan', icon: CreditCard },
    { id: 'subscriptions', label: t('finance.tabs.subscriptions') || 'Langganan', icon: CalendarBlank },
  ] as const;

  return (
    <div className="w-full border-b border-white/[0.05] sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl z-30 pt-4 px-4 md:px-0 mb-6">
      <div className="flex justify-between md:justify-start md:gap-8 overflow-x-auto hide-scrollbar">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id as FinanceTab)}
              className={`flex-1 md:flex-none flex flex-col md:flex-row items-center gap-1 md:gap-2 pb-3 transition-colors relative whitespace-nowrap min-w-[70px] ${
                isActive ? 'text-primary' : 'text-gray-light hover:text-soft-cream'
              }`}
            >
              <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
              <span className="text-[10px] md:text-sm font-semibold tracking-wider uppercase md:normal-case">{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full shadow-[0_0_8px_rgba(244,201,93,0.5)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
