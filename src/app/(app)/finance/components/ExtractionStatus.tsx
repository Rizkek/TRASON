import React from 'react';
import { CheckCircle, WarningCircle, XCircle, Clock, Receipt } from '@phosphor-icons/react';
import { useTranslation } from '@/libs/i18n/useTranslation';

interface Props {
  status: 'pending' | 'processing' | 'verified' | 'needs_review' | 'failed';
  confidence?: number;
}

export function ExtractionStatus({ status, confidence = 0 }: Props) {
  const { t } = useTranslation();

  const getStatusConfig = () => {
    switch (status) {
      case 'processing':
        return {
          icon: <Clock size={16} className="text-primary" />,
          text: 'AI is extracting details...',
          bg: 'bg-primary/10',
          textColor: 'text-primary'
        };
      case 'verified':
        return {
          icon: <CheckCircle size={16} className="text-success" weight="fill" />,
          text: 'Verified by AI',
          bg: 'bg-success/10',
          textColor: 'text-success'
        };
      case 'needs_review':
        return {
          icon: <WarningCircle size={16} className="text-warning" weight="fill" />,
          text: 'Needs your review',
          bg: 'bg-warning/10',
          textColor: 'text-warning'
        };
      case 'failed':
        return {
          icon: <XCircle size={16} className="text-danger" weight="fill" />,
          text: 'Extraction failed',
          bg: 'bg-danger/10',
          textColor: 'text-danger'
        };
      default:
        return {
          icon: <Receipt size={16} className="text-muted-foreground" />,
          text: 'Waiting for receipt',
          bg: 'bg-surface/50',
          textColor: 'text-muted-foreground'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} border border-foreground/5 w-fit`}>
      {config.icon}
      <span className={`text-xs font-semibold tracking-wide ${config.textColor}`}>
        {config.text}
      </span>
      {status === 'verified' && confidence > 0 && (
        <span className="text-xs text-success/50 ml-1">
          {Math.round(confidence * 100)}%
        </span>
      )}
    </div>
  );
}
