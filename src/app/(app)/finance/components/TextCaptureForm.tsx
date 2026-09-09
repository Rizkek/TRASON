'use client';

import React, { useState } from 'react';
import { PaperPlaneRight, Lightning } from '@phosphor-icons/react';
import { parseTransactionText, ParsedTransaction } from '@/services/finance/capture/textParser';
import { ErrorAlert } from '@/components';
import { useTranslation } from '@/libs/i18n/useTranslation';

interface Props {
  onCaptureSuccess: (parsed: ParsedTransaction) => void;
}

export function TextCaptureForm({ onCaptureSuccess }: Props) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const parsed = parseTransactionText(text);
    if (parsed) {
      onCaptureSuccess(parsed);
      setText('');
      setError(null);
    } else {
      setError(t('finance.captureError') || "Couldn't understand that. Try formatting like 'Makan siang 25k' or use the global Smart Input (Ctrl+K) for AI parsing.");
    }
  };

  return (
    <div className="mb-6">
      <ErrorAlert error={error} onDismiss={() => setError(null)} />
      <form onSubmit={handleSubmit} className="relative flex items-center w-full">
        <Lightning className="absolute left-4 text-primary" size={18} />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('finance.capturePlaceholder') || "Quick add (e.g. 'Makan siang 25k', 'Beli bensin 50ribu')"}
          className="w-full bg-[#141414] border border-white/5 rounded-xl pl-12 pr-12 py-3.5 text-sm focus:outline-none focus:border-primary transition-colors text-white placeholder-gray-500 shadow-inner"
        />
        <button 
          type="submit"
          disabled={!text.trim()}
          className="absolute right-2 p-2 bg-primary text-black rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:bg-transparent disabled:text-gray-500 transition-colors"
        >
          <PaperPlaneRight size={16} weight="bold" />
        </button>
      </form>
    </div>
  );
}
