'use client';

import { EmptyState } from '@/components/ui/EmptyState';
import { useTranslation } from '@/libs/i18n/useTranslation';
import React, { } from 'react';
import { CreditCard, Plus, Calendar, CheckCircle } from '@phosphor-icons/react';
import { Button, Badge } from '@/components';
import { useInstallment } from '@/hooks/useInstallment';
import { Installment, InstallmentPayment } from '@/types/database';
import { formatCurrency } from '@/libs/format';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { formatDateOnly } from '@/libs/date';

interface InstallmentListProps {
  onAddClick: () => void;
  onPayClick: (payment: InstallmentPayment, installment: Installment) => void;
}

export function InstallmentList({ onAddClick, onPayClick }: InstallmentListProps) {
  const { t } = useTranslation();
  const { installments, upcomingPayments, isLoading } = useInstallment();
  const { currency, language: locale } = useUserPreferences();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="text-muted-foreground">{t('common.loading')}</span>
      </div>
    );
  }

  const activeInstallments = installments.filter(i => i.status === 'active');
  const completedInstallments = installments.filter(i => i.status === 'completed');

  return (
    <div className="space-y-8">
      {/* Upcoming Payments Section */}
      {upcomingPayments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-foreground font-semibold flex items-center gap-2 text-lg">
            <Calendar size={18} className="text-warning" />
            {t('installments.due_soon')}
          </h3>
          <div className="grid gap-3">
            {upcomingPayments.map(payment => {
              const installment = installments.find(i => i.id === payment.installment_id);
              if (!installment) return null;
              
              const isOverdue = new Date(payment.due_date) < new Date();
              
              return (
                <div key={payment.id} className="bg-warning/5 border border-warning/20 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{installment.title}</p>
                    <p className={`text-xs ${isOverdue ? 'text-danger font-bold' : 'text-muted-foreground'}`}>
                      {isOverdue ? t('installments.overdue_prefix') : t('installments.due_prefix')}: {formatDateOnly(payment.due_date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-bold text-foreground">
                      {formatCurrency(payment.amount, installment.currency || currency, locale)}
                    </p>
                    <Button variant="primary" size="sm" onClick={() => onPayClick(payment, installment)}>{t('installments.pay')}</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Installments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground font-semibold text-lg">{t('installments.active')}</h3>
          <Button variant="outline" size="sm" onClick={onAddClick} leftIcon={<Plus size={14} />}>{t('installments.add')}</Button>
        </div>
        
        {activeInstallments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            className="glass-card"
            title={t('installments.empty')}
            action={<Button variant="outline" size="sm" onClick={onAddClick}>{t('installments.create')}</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeInstallments.map(inst => {
              const percentage = Math.min((inst.paid_months / inst.total_months) * 100, 100);
              
              return (
                <div key={inst.id} className="bg-surface border border-foreground/5 rounded-2xl p-5 relative overflow-hidden group">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{inst.title}</h4>
                      <p className="text-xs text-muted-foreground">{inst.creditor || t('installments.creditor_fallback')}</p>
                    </div>
                    <Badge variant="info" className="border-primary/20 text-primary bg-primary/10">
                      {inst.paid_months} / {inst.total_months} {t('installments.months_short')}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-xs text-muted-foreground">{t('installments.progress')}</p>
                    <p className="text-xs font-mono text-muted-foreground">{Math.round(percentage)}%</p>
                  </div>
                  <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden mb-4">
                    <div 
                      className="h-full bg-primary rounded-full transition-[width]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  <div className="flex items-end justify-between pt-4 border-t border-foreground/5">
                    <div>
                      <p className="text-xs text-muted-foreground">{t('installments.per_month')}</p>
                      <p className="text-sm font-bold text-foreground">
                        {formatCurrency(inst.monthly_amount, inst.currency || currency, locale)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{t('installments.remaining')}</p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(inst.total_amount - (inst.paid_months * inst.monthly_amount), inst.currency || currency, locale)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Installments */}
      {completedInstallments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-muted-foreground font-semibold flex items-center gap-2 text-lg">
            <CheckCircle size={18} className="text-success" />
            {t('installments.completed')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedInstallments.map(inst => (
              <div key={inst.id} className="bg-background/60 border border-foreground/5 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground line-through">{inst.title}</p>
                  <p className="text-xs text-muted-foreground">{t('installments.paid_off_months').replace('{months}', String(inst.total_months))}</p>
                </div>
                <Badge variant="success" className="border-success/20 text-success bg-success/10">{t('installments.paid_off')}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
