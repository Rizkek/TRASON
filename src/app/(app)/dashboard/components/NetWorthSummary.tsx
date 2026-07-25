import React from 'react';
import Link from 'next/link';
import { Card, Button, Badge } from '@/components';
import { ArrowRight, Wallet, House, Car, Scales } from '@phosphor-icons/react/dist/ssr';
import { InvestmentPortfolioSummary, formatSignedCurrency } from '@/services/finance/investmentService';
import { formatCurrency } from '@/libs/format';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTranslation } from '@/libs/i18n/useTranslation';

interface Props {
  summary: InvestmentPortfolioSummary | null;
}

export const NetWorthSummary = ({ summary }: Props) => {
  const { currency, locale } = useUserPreferences();
  const { t } = useTranslation();

  if (!summary || summary.positionsCount === 0) {
    return (
      <Card className="p-xl border border-dashed border-black/10 dark:border-white/10 bg-transparent">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-lg">
          <div className="space-y-sm w-full sm:w-auto flex-1 min-w-0">
            <p className="text-micro text-gray-light">Total Wealth</p>
            <h3 className="text-xl font-bold text-soft-cream">Mulai catat aset Anda</h3>
            <p className="text-xs text-gray-light opacity-80 mt-2">
              Pantau seluruh kekayaan Anda: Kas, Investasi, Properti, dan Utang dalam satu tempat.
            </p>
          </div>
          <div className="shrink-0 mt-4 sm:mt-0">
            <Link href="/investments">
              <Button variant="primary" size="md">Hubungkan Aset</Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  const hasDebt = summary.totalLiabilities > 0;

  return (
    <Card className="p-xl relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/10 blur-[50px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-secondary/10 blur-[50px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 space-y-lg">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-md">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wallet size={16} className="text-primary" />
              <p className="text-xs font-bold text-gray-light uppercase tracking-widest">Net Worth</p>
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-light">
              {formatCurrency(summary.netWorth, currency, locale)}
            </h3>
            <p className="text-xs text-gray-light mt-1">
              {summary.positionsCount} aset & liabilitas tercatat
            </p>
          </div>
          <Link href="/investments">
            <Button variant="ghost" size="sm" className="border-black/10 dark:border-white/10 backdrop-blur-sm">
              Kelola Portofolio
              <ArrowRight size={14} className="ml-2" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md pt-md border-t border-white/5">
          {/* Total Assets */}
          <div className="p-lg rounded-xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5">
            <p className="text-[10px] text-success uppercase tracking-widest mb-1 font-bold">Total Assets</p>
            <p className="text-xl font-bold text-white">
              {formatCurrency(summary.totalAssets, currency, locale)}
            </p>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {(summary.allocationByType['property'] || 0) > 0 && (
                <Badge variant="info" size="sm"><House size={12} className="mr-1" /> Properti</Badge>
              )}
              {(summary.allocationByType['vehicle'] || 0) > 0 && (
                <Badge variant="warning" size="sm"><Car size={12} className="mr-1" /> Kendaraan</Badge>
              )}
              {((summary.allocationByType['stock'] || 0) + (summary.allocationByType['crypto'] || 0) + (summary.allocationByType['gold'] || 0)) > 0 && (
                <Badge variant="activity" size="sm"><Wallet size={12} className="mr-1" /> Investasi</Badge>
              )}
            </div>
          </div>

          {/* Total Liabilities */}
          <div className="p-lg rounded-xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5">
            <p className="text-[10px] text-danger uppercase tracking-widest mb-1 font-bold">Total Liabilities</p>
            <p className={`text-xl font-bold ${hasDebt ? 'text-white' : 'text-gray-light'}`}>
              {formatCurrency(summary.totalLiabilities, currency, locale)}
            </p>
            
            {hasDebt ? (
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="danger" size="sm"><Scales size={12} className="mr-1" /> Utang/Kredit</Badge>
              </div>
            ) : (
              <p className="text-xs text-success mt-3 font-medium">✨ Bebas Utang</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
