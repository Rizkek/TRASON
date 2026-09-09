'use client';

import React, { useState } from 'react';
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
  const { installments, upcomingPayments, isLoading } = useInstallment();
  const { currency, language: locale } = useUserPreferences();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="animate-pulse text-gray-light">Loading installments...</span>
      </div>
    );
  }

  const activeInstallments = installments.filter(i => i.status === 'active');
  const completedInstallments = installments.filter(i => i.status === 'completed');

  return (
    <div className="space-y-8 pb-32">
      {/* Upcoming Payments Section */}
      {upcomingPayments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-soft-cream font-semibold flex items-center gap-2 text-lg">
            <Calendar size={18} className="text-warning" />
            Jatuh Tempo Mendekat
          </h3>
          <div className="grid gap-3">
            {upcomingPayments.map(payment => {
              const installment = installments.find(i => i.id === payment.installment_id);
              if (!installment) return null;
              
              const isOverdue = new Date(payment.due_date) < new Date();
              
              return (
                <div key={payment.id} className="bg-warning/5 border border-warning/20 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-soft-cream">{installment.title}</p>
                    <p className={`text-[10px] ${isOverdue ? 'text-danger font-bold' : 'text-gray-light'}`}>
                      {isOverdue ? 'Terlambat: ' : 'Jatuh tempo: '}{formatDateOnly(payment.due_date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-bold text-white">
                      {formatCurrency(payment.amount, installment.currency || currency, locale)}
                    </p>
                    <Button variant="primary" size="sm" onClick={() => onPayClick(payment, installment)}>
                      Bayar
                    </Button>
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
          <h3 className="text-soft-cream font-semibold text-lg">Cicilan Aktif</h3>
          <Button variant="outline" size="sm" onClick={onAddClick} leftIcon={<Plus size={14} />}>
            Tambah
          </Button>
        </div>
        
        {activeInstallments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl border-dashed">
            <CreditCard size={32} className="text-gray-light mb-4 opacity-50" />
            <p className="text-gray-light text-center text-sm">Belum ada cicilan aktif.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={onAddClick}>Buat Cicilan</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeInstallments.map(inst => {
              const percentage = Math.min((inst.paid_months / inst.total_months) * 100, 100);
              
              return (
                <div key={inst.id} className="bg-[#141414] border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-semibold text-soft-cream">{inst.title}</h4>
                      <p className="text-xs text-gray-light">{inst.creditor || 'Cicilan'}</p>
                    </div>
                    <Badge variant="info" className="border-primary/20 text-primary bg-primary/10">
                      {inst.paid_months} / {inst.total_months} bln
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-[10px] text-gray-light">Progress</p>
                    <p className="text-[10px] font-mono text-gray-light">{Math.round(percentage)}%</p>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-1000"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  <div className="flex items-end justify-between pt-4 border-t border-white/5">
                    <div>
                      <p className="text-[10px] text-gray-light">Cicilan per bulan</p>
                      <p className="text-sm font-bold text-white">
                        {formatCurrency(inst.monthly_amount, inst.currency || currency, locale)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-light">Sisa Tagihan</p>
                      <p className="text-sm font-semibold text-soft-cream">
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
        <div className="space-y-4 opacity-70">
          <h3 className="text-gray-light font-semibold flex items-center gap-2 text-lg">
            <CheckCircle size={18} className="text-success" />
            Selesai Lunas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedInstallments.map(inst => (
              <div key={inst.id} className="bg-black/20 border border-white/5 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-light line-through">{inst.title}</p>
                  <p className="text-[10px] text-gray-light">Lunas ({inst.total_months} bulan)</p>
                </div>
                <Badge variant="success" className="border-success/20 text-success bg-success/10">Lunas</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
