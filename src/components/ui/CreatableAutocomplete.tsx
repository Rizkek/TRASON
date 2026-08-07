'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Buildings, Briefcase, Plus, X, Globe, Check, ClockCounterClockwise } from '@phosphor-icons/react';

export interface CreatableAutocompleteProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'company' | 'role';
  customHistory?: string[];
  error?: string;
  required?: boolean;
  className?: string;
  autoFocus?: boolean;
  disabled?: boolean;
}

interface SuggestionItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeType?: 'saved' | 'local' | 'api';
  domain?: string;
  logo?: string;
}

export function CreatableAutocomplete({
  label,
  value,
  onChange,
  placeholder,
  type = 'company',
  customHistory = [],
  error,
  required = false,
  className = '',
  autoFocus = false,
  disabled = false,
}: CreatableAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [remoteSuggestions, setRemoteSuggestions] = useState<SuggestionItem[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const storageKey = type === 'company' ? 'trason_custom_companies' : 'trason_custom_roles';

  // Load custom persisted items from localStorage
  const [storedCustomItems, setStoredCustomItems] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setStoredCustomItems(parsed);
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  // Sync external value with local input value
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Save new item to localStorage
  const saveCustomItem = useCallback((newItem: string) => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    setStoredCustomItems((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 50);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, [storageKey]);

  // Fetch suggestions from internal TRASON API Route (/api/career/autocomplete)
  const fetchFromApi = useCallback(async (query: string, itemType: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoadingApi(true);
    try {
      const params = new URLSearchParams({
        q: query,
        type: itemType,
      });

      const res = await fetch(`/api/career/autocomplete?${params.toString()}`, {
        signal: controller.signal,
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.results)) {
          setRemoteSuggestions(data.results);
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setRemoteSuggestions([]);
      }
    } finally {
      setIsLoadingApi(false);
    }
  }, []);

  // Debounced API fetch on input change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFromApi(inputValue.trim(), type);
    }, 200);

    return () => clearTimeout(timer);
  }, [inputValue, type, fetchFromApi]);

  // Merge client-side saved/history items with remote API results
  const suggestions = useMemo(() => {
    const query = inputValue.trim().toLowerCase();
    const result: SuggestionItem[] = [];
    const seenTitles = new Set<string>();

    // 1. User History & Saved Items
    const allUserHistory = Array.from(new Set([...storedCustomItems, ...customHistory])).filter(Boolean);
    for (const item of allUserHistory) {
      if (!query || item.toLowerCase().includes(query)) {
        if (!seenTitles.has(item.toLowerCase())) {
          seenTitles.add(item.toLowerCase());
          result.push({
            id: `saved-${item}`,
            title: item,
            badge: 'Tersimpan',
            badgeType: 'saved',
          });
        }
      }
    }

    // 2. Remote API Results (Indonesia Dataset + Live Global API)
    for (const remote of remoteSuggestions) {
      if (!seenTitles.has(remote.title.toLowerCase())) {
        seenTitles.add(remote.title.toLowerCase());
        result.push(remote);
      }
    }

    return result.slice(0, 15);
  }, [inputValue, storedCustomItems, customHistory, remoteSuggestions]);

  // Check if current input exactly matches an existing item
  const hasExactMatch = useMemo(() => {
    const q = inputValue.trim().toLowerCase();
    if (!q) return true;
    return suggestions.some((s) => s.title.toLowerCase() === q);
  }, [inputValue, suggestions]);

  // Total selectable rows (suggestions + 1 creatable option if not exact match)
  const showCreatable = inputValue.trim().length > 0 && !hasExactMatch;
  const totalOptionsCount = suggestions.length + (showCreatable ? 1 : 0);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (selectedTitle: string) => {
    setInputValue(selectedTitle);
    onChange(selectedTitle);
    saveCustomItem(selectedTitle);
    setIsOpen(false);
  };

  const handleCreateNew = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    saveCustomItem(trimmed);
    onChange(trimmed);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % totalOptionsCount);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + totalOptionsCount) % totalOptionsCount);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (showCreatable && (highlightedIndex === 0 || highlightedIndex === -1)) {
        handleCreateNew();
      } else {
        const targetIndex = showCreatable ? highlightedIndex - 1 : highlightedIndex;
        if (targetIndex >= 0 && targetIndex < suggestions.length) {
          handleSelect(suggestions[targetIndex].title);
        } else if (showCreatable) {
          handleCreateNew();
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full space-y-sm ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-gray-very-light tracking-wide flex items-center justify-between">
          <span>
            {label}
            {required && <span className="text-danger ml-1">*</span>}
          </span>
          <span className="text-[10px] text-gray-light/60 font-normal">
            {type === 'company' ? 'Ketik nama / pilih dari daftar' : 'Pilih posisi standar'}
          </span>
        </label>
      )}

      <div className="relative group">
        <div className="absolute left-md top-1/2 -translate-y-1/2 text-gray-light group-focus-within:text-primary transition-colors z-10 pointer-events-none">
          {type === 'company' ? <Buildings size={18} /> : <Briefcase size={18} />}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => {
            setIsOpen(true);
            if (remoteSuggestions.length === 0) {
              fetchFromApi(inputValue.trim(), type);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            placeholder ||
            (type === 'company'
              ? 'Contoh: Gojek, BCA, Telkom, PT ABC...'
              : 'Contoh: Frontend Developer, Product Manager...')
          }
          disabled={disabled}
          autoFocus={autoFocus}
          className={`w-full h-12 pl-2xl pr-16 bg-gray-strong/70 border transition-all duration-300 rounded-md focus:ring-2 focus:ring-secondary/40 text-soft-cream placeholder:text-gray-light/60 disabled:opacity-50 disabled:cursor-not-allowed text-sm ${
            error
              ? 'border-danger focus:border-danger'
              : 'border-gray-light/25 focus:border-secondary hover:border-white/20'
          }`}
        />

        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoadingApi && (
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          )}

          {inputValue && (
            <button
              type="button"
              onClick={() => {
                setInputValue('');
                onChange('');
                setIsOpen(true);
                inputRef.current?.focus();
              }}
              className="p-1.5 text-gray-light hover:text-white rounded-md hover:bg-white/5 transition-colors"
              title="Hapus input"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-xs font-medium text-danger">{error}</p>}

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-[300] max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-warm-black/95 backdrop-blur-2xl p-1.5 text-soft-cream shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-in fade-in-0 zoom-in-95">
          {/* Header indicator */}
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-light/50 flex items-center justify-between border-b border-white/5 mb-1 pb-1">
            <span>
              {type === 'company' ? 'Rekomendasi Perusahaan Indonesia & Global' : 'Rekomendasi Posisi & Peran'}
            </span>
            {suggestions.length > 0 && <span>{suggestions.length} opsi</span>}
          </div>

          {/* Option: Creatable Add New */}
          {showCreatable && (
            <button
              type="button"
              onClick={handleCreateNew}
              onMouseEnter={() => setHighlightedIndex(0)}
              className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 mb-1 border border-primary/20 ${
                highlightedIndex === 0
                  ? 'bg-primary/20 text-primary font-semibold'
                  : 'bg-primary/10 text-primary hover:bg-primary/15'
              }`}
            >
              <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center shrink-0">
                <Plus size={14} weight="bold" className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold truncate">
                    + Tambah &ldquo;{inputValue.trim()}&rdquo;
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/25 text-primary uppercase font-bold tracking-wider">
                    Baru
                  </span>
                </div>
                <p className="text-[10px] text-gray-light/80 font-light truncate">
                  Simpan ke daftar pilihan pribadi Anda
                </p>
              </div>
            </button>
          )}

          {/* List of suggestions */}
          <div className="space-y-0.5">
            {suggestions.map((item, idx) => {
              const actualHighlightIndex = showCreatable ? idx + 1 : idx;
              const isHighlighted = highlightedIndex === actualHighlightIndex;
              const isSelected = item.title.toLowerCase() === value?.toLowerCase();

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.title)}
                  onMouseEnter={() => setHighlightedIndex(actualHighlightIndex)}
                  className={`w-full text-left flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs md:text-sm transition-colors duration-150 ${
                    isHighlighted
                      ? 'bg-warm-gold/15 text-warm-gold font-medium'
                      : isSelected
                      ? 'bg-white/10 text-white font-medium'
                      : 'text-soft-cream hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Icon or Logo */}
                    {item.logo ? (
                      <img
                        src={item.logo}
                        alt=""
                        className="w-5 h-5 rounded object-contain bg-white p-0.5 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : item.badgeType === 'saved' ? (
                      <ClockCounterClockwise size={14} className="text-amber-400 shrink-0" />
                    ) : item.badgeType === 'api' ? (
                      <Globe size={14} className="text-blue-400 shrink-0" />
                    ) : type === 'company' ? (
                      <Buildings size={14} className="text-gray-light/60 shrink-0" />
                    ) : (
                      <Briefcase size={14} className="text-gray-light/60 shrink-0" />
                    )}

                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.title}</p>
                      {item.subtitle && (
                        <p className="text-[10px] text-gray-light/60 truncate font-mono">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                          item.badgeType === 'saved'
                            ? 'bg-amber-400/15 text-amber-300 border border-amber-400/20'
                            : item.badgeType === 'api'
                            ? 'bg-blue-400/15 text-blue-300 border border-blue-400/20'
                            : 'bg-white/5 text-gray-light border border-white/10'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isSelected && <Check size={14} weight="bold" className="text-warm-gold" />}
                  </div>
                </button>
              );
            })}

            {suggestions.length === 0 && !showCreatable && (
              <div className="p-4 text-center text-xs text-gray-light/70 italic">
                {isLoadingApi ? 'Mencari...' : 'Tidak ada rekomendasi ditemukan.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
