'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Send } from 'lucide-react';
import { transactionQueries } from '@/services/queries';
import { getLocalISODate } from '@/libs/format';

export function SmartInput() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setResult(data);
    } catch (error) {
      console.error(error);
      setResult({ error: 'Failed to process input. Try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!result || result.type !== 'transaction' || result.action !== 'create' || !result.data) return;

    try {
      setIsLoading(true);
      // Dummy user ID for now, should come from auth
      await transactionQueries.createTransaction({
        title: result.data.title || 'Untitled',
        amount: result.data.amount || 0,
        type: result.data.transactionType || 'expense',
        date: result.data.date || getLocalISODate(),
        category_id: null as any, // Nullable category allowed
        time: '00:00:00',
        description: '',
        payment_method: 'cash',
        tags: []
      });
      
      setIsOpen(false);
      setInput('');
      setResult(null);
      // Optional: trigger mutate if using SWR
    } catch (error) {
      console.error('Failed to save:', error);
      setResult({ ...result, error: 'Failed to save to database.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[20vh]">
      <div className="bg-gray-strong border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        <form onSubmit={handleSubmit} className="relative flex items-center p-md border-b border-white/10">
          <Search className="absolute left-lg text-gray-light" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type 'Spent $15 on lunch' or 'Remind me to run tomorrow'..."
            className="w-full bg-transparent text-white text-lg pl-3xl pr-xl py-md focus:outline-none placeholder-gray-light/50"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="absolute right-lg text-primary hover:text-white disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </form>

        {result && !result.error && (
          <div className="p-xl bg-black/20">
            <p className="text-sm text-gray-light mb-md">{result.message}</p>
            
            {result.data && (
              <div className="bg-white/5 rounded-lg p-md mb-md font-mono text-xs text-white/80">
                {JSON.stringify(result.data, null, 2)}
              </div>
            )}

            {result.confidence > 0.7 && result.action === 'create' && (
              <div className="flex justify-end gap-md mt-lg">
                <button 
                  onClick={() => setResult(null)} 
                  className="px-md py-sm text-sm text-gray-light hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="px-md py-sm text-sm bg-primary text-black font-bold rounded hover:opacity-90 disabled:opacity-50"
                >
                  Confirm & Save
                </button>
              </div>
            )}
          </div>
        )}
        
        {result?.error && (
          <div className="p-xl bg-red-500/10 text-red-500 text-sm">
            {result.error}
          </div>
        )}
        
        <div className="p-md text-xs text-gray-light/40 flex justify-between bg-black/40">
          <span>Smart Input Engine (Powered by AI)</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
