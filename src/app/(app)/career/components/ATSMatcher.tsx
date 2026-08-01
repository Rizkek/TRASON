'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { Button, Input } from '@/components';
import { Target, WarningCircle, CheckCircle, Lightbulb } from '@phosphor-icons/react';

// Basic stopwords to ignore during matching
const STOP_WORDS = new Set([
  'and', 'the', 'to', 'a', 'of', 'in', 'for', 'is', 'on', 'that', 'by', 'this', 'with', 'i', 'you', 'it', 'not', 'or', 'be', 'are', 'from', 'at', 'as', 'your', 'all', 'have', 'new', 'more', 'an', 'was', 'we', 'will', 'home', 'can', 'us', 'about', 'if', 'page', 'my', 'has', 'search', 'free', 'but', 'our', 'one', 'other', 'do', 'no', 'information', 'time', 'they', 'site', 'he', 'up', 'may', 'what', 'which', 'their', 'news', 'out', 'use', 'any', 'there', 'see', 'only', 'so', 'his', 'when', 'contact', 'here', 'business', 'who', 'web', 'also', 'now', 'help', 'get', 'pm', 'view', 'online', 'first', 'am', 'been', 'would', 'how', 'were', 'me', 's', 'services', 'some', 'these', 'click', 'its', 'like', 'service', 'x', 'than', 'find', 'price', 'date', 'back', 'top', 'people', 'had', 'list', 'name', 'just', 'over', 'state', 'year', 'day', 'into', 'email', 'two', 'health', 'n', 'world', 're', 'next', 'used', 'go', 'b', 'work', 'last', 'most', 'products', 'music', 'buy', 'data', 'make', 'them', 'should', 'product', 'system', 'post', 'her', 'city', 't', 'add', 'policy', 'number', 'such', 'please', 'available', 'copyright', 'support', 'message', 'after', 'best', 'software', 'then', 'jan', 'good', 'video', 'well', 'd', 'where', 'info', 'rights', 'public', 'books', 'high', 'school', 'through', 'm', 'each', 'links', 'she', 'review', 'years', 'order', 'very', 'privacy', 'book', 'items', 'company', 'read', 'group', 'sex', 'need', 'many', 'user', 'said', 'de', 'does', 'set', 'under', 'general', 'research', 'university', 'january', 'mail', 'full', 'map', 'reviews', 'program', 'life'
]);

export function ATSMatcher() {
  const { t } = useTranslation();
  const [jdText, setJdText] = useState('');
  const [cvText, setCvText] = useState('');
  const [result, setResult] = useState<{
    score: number;
    matched: string[];
    missing: string[];
  } | null>(null);

  const analyze = () => {
    if (!jdText.trim() || !cvText.trim()) return;

    // 1. Extract words
    const extractWords = (text: string) => {
      const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
      return new Set(words.filter(w => !STOP_WORDS.has(w)));
    };

    const jdWords = extractWords(jdText);
    const cvWords = extractWords(cvText);

    // 2. Compare
    const matched: string[] = [];
    const missing: string[] = [];

    jdWords.forEach(word => {
      if (cvWords.has(word)) {
        matched.push(word);
      } else {
        missing.push(word);
      }
    });

    const score = jdWords.size === 0 ? 0 : Math.round((matched.length / jdWords.size) * 100);

    setResult({
      score,
      matched: matched.sort(),
      missing: missing.sort(),
    });
  };

  return (
    <div className="space-y-lg animate-fade-in pb-xl">
      <div className="glass-card p-xl border-t-4 border-t-primary">
        <div className="flex items-start gap-md mb-md">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Target size={24} weight="duotone" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-soft-cream">{t('career_page.ats_matcher.title')}</h2>
            <p className="text-sm text-gray-light mt-1 max-w-2xl">
              {t('career_page.ats_matcher.desc')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg mt-lg">
          <div className="space-y-sm">
            <label className="text-[10px] font-bold text-gray-light uppercase tracking-widest block">
              {t('career_page.ats_matcher.jd_label')}
            </label>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder={t('career_page.ats_matcher.jd_placeholder') as string}
              className="w-full h-64 bg-black/20 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-md text-sm text-soft-cream focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all resize-none"
            />
          </div>
          <div className="space-y-sm">
            <label className="text-[10px] font-bold text-gray-light uppercase tracking-widest block">
              {t('career_page.ats_matcher.cv_label')}
            </label>
            <textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder={t('career_page.ats_matcher.cv_placeholder') as string}
              className="w-full h-64 bg-black/20 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-md text-sm text-soft-cream focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all resize-none"
            />
          </div>
        </div>

        <div className="flex justify-center mt-lg">
          <Button
            variant="primary"
            size="lg"
            onClick={analyze}
            disabled={!jdText.trim() || !cvText.trim()}
            className="w-full md:w-auto px-2xl py-4 rounded-xl shadow-[0_4px_20px_rgba(244,201,93,0.2)] hover:shadow-[0_8px_30px_rgba(244,201,93,0.3)] transition-all flex items-center justify-center gap-2"
          >
            <Target size={20} />
            {t('career_page.ats_matcher.analyze_btn')}
          </Button>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg animate-slide-up">
          <div className="glass-card p-xl flex flex-col items-center justify-center text-center">
            <h3 className="text-[10px] font-bold text-gray-light uppercase tracking-widest mb-md">
              {t('career_page.ats_matcher.score_title')}
            </h3>
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="8" className="text-black/5 dark:text-white/5" />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - result.score / 100)}`}
                  className={result.score > 75 ? 'text-success' : result.score > 40 ? 'text-warning' : 'text-expense'}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black tabular-nums">{result.score}</span>
                <span className="text-xs text-gray-light">%</span>
              </div>
            </div>
            <p className="text-xs text-gray-light mt-md flex items-center gap-1">
              <Lightbulb size={14} className="text-primary" />
              {result.score > 75 ? 'Excellent match!' : result.score > 40 ? 'Needs more keywords.' : 'Poor match.'}
            </p>
          </div>

          <div className="glass-card p-xl md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-xl h-full">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2 mb-md text-success">
                  <CheckCircle size={16} weight="fill" />
                  {t('career_page.ats_matcher.matched_keywords')} ({result.matched.length})
                </h3>
                <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto no-scrollbar">
                  {result.matched.length === 0 ? (
                    <p className="text-xs text-gray-light italic">No matching keywords found.</p>
                  ) : (
                    result.matched.map(kw => (
                      <span key={kw} className="px-3 py-1 bg-success/10 text-success border border-success/20 rounded-full text-[10px] uppercase tracking-wider font-bold">
                        {kw}
                      </span>
                    ))
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2 mb-md text-expense">
                  <WarningCircle size={16} weight="fill" />
                  {t('career_page.ats_matcher.missing_keywords')} ({result.missing.length})
                </h3>
                <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto no-scrollbar">
                  {result.missing.length === 0 ? (
                    <p className="text-xs text-gray-light italic">You matched everything!</p>
                  ) : (
                    result.missing.map(kw => (
                      <span key={kw} className="px-3 py-1 bg-expense/10 text-expense border border-expense/20 rounded-full text-[10px] uppercase tracking-wider font-bold">
                        {kw}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
