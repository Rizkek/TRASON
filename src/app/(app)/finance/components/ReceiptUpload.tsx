'use client';

import React, { useRef, useState } from 'react';
import { Camera, Spinner } from '@phosphor-icons/react';
import { compressImage } from '@/libs/imageCompression';
import { createTransactionWithInvalidation } from '@/libs/mutations';
import { getLocalISODate } from '@/libs/format';

interface Props {
  onUploadSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
}

export function ReceiptUpload({ onUploadSuccess, onError }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onError('Please upload a valid image file.');
      return;
    }

    try {
      setIsUploading(true);
      
      // 1. Client-side compression & EXIF strip
      const compressedFile = await compressImage(file, 1500, 1500, 0.7);

      // 2. Create placeholder transaction
      const placeholderTx = await createTransactionWithInvalidation({
        title: 'Processing Receipt...',
        amount: 1, // placeholder; real amount filled after AI extraction
        type: 'expense',
        date: getLocalISODate(),
        category_id: null as any,
        time: '00:00:00',
        description: 'AI is analyzing this receipt.',
        payment_method: 'cash',
        tags: [],
        source: 'receipt'
      } as any);

      if (!placeholderTx || !('id' in placeholderTx) && !(placeholderTx[0] && 'id' in placeholderTx[0])) {
        throw new Error('Failed to create placeholder transaction.');
      }
      const txId = 'id' in placeholderTx ? (placeholderTx as any).id : (placeholderTx[0] as any).id;

      // 3. Upload image
      const formData = new FormData();
      formData.append('receipt', compressedFile);

      const uploadRes = await fetch('/api/finance/upload-receipt', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Failed to upload receipt');

      // 4. Trigger AI Extraction (background or await)
      // We will await it so the user knows it's ready, or we can just pass the txId and let the sheet poll it.
      // Awaiting is simpler for now, though it might take 10-20 seconds.
      const extractRes = await fetch('/api/finance/extract-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptUrl: uploadData.url,
          transactionId: txId,
          fileName: uploadData.fileName,
          mimeType: compressedFile.type,
          fileSize: compressedFile.size
        })
      });

      const extractData = await extractRes.json();
      if (!extractRes.ok) throw new Error(extractData.error || 'Failed to extract receipt');

      // 5. Notify success
      onUploadSuccess(txId);
    } catch (err: any) {
      console.error('Upload error:', err);
      onError(err.message || 'Something went wrong during upload.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        accept="image/*"
        capture="environment" // prefers back camera on mobile
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <button
        type="button"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        className="p-3.5 h-full bg-[#141414] border border-white/5 hover:border-primary/50 text-gray-light hover:text-primary rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
        title="Scan Receipt"
        aria-label="Scan Receipt"
      >
        {isUploading ? (
          <Spinner size={20} className="animate-spin text-primary" />
        ) : (
          <Camera size={20} weight="bold" />
        )}
      </button>
    </div>
  );
}
