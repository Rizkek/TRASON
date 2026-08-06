'use client';

import React, { useState, useRef } from 'react';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { Button, Select } from '@/components';
import { Target, WarningCircle, CheckCircle, Lightbulb, UploadSimple, FileText, X, Copy, Check, Sparkle } from '@phosphor-icons/react';
import { extractTextFromFile } from '@/libs/fileExtractor';
import { CareerApplication } from '@/types/database';

// Comprehensive Bilingual (Indonesian & English) Stopwords
const STOP_WORDS = new Set([
  // English common words
  'and', 'the', 'to', 'a', 'of', 'in', 'for', 'is', 'on', 'that', 'by', 'this', 'with', 'i', 'you', 'it', 'not', 'or', 'be', 'are', 'from', 'at', 'as', 'your', 'all', 'have', 'new', 'more', 'an', 'was', 'we', 'will', 'home', 'can', 'us', 'about', 'if', 'page', 'my', 'has', 'search', 'free', 'but', 'our', 'one', 'other', 'do', 'no', 'information', 'time', 'they', 'site', 'he', 'up', 'may', 'what', 'which', 'their', 'news', 'out', 'use', 'any', 'there', 'see', 'only', 'so', 'his', 'when', 'contact', 'here', 'business', 'who', 'web', 'also', 'now', 'help', 'get', 'pm', 'view', 'online', 'first', 'am', 'been', 'would', 'how', 'were', 'me', 'services', 'some', 'these', 'click', 'its', 'like', 'service', 'than', 'find', 'price', 'date', 'back', 'top', 'people', 'had', 'list', 'name', 'just', 'over', 'state', 'year', 'day', 'into', 'email', 'two', 'health', 'world', 'next', 'used', 'work', 'last', 'most', 'products', 'make', 'them', 'should', 'product', 'system', 'post', 'her', 'city', 'add', 'policy', 'number', 'such', 'please', 'available', 'support', 'message', 'after', 'best', 'software', 'good', 'well', 'where', 'info', 'rights', 'public', 'high', 'school', 'through', 'each', 'links', 'she', 'review', 'years', 'order', 'very', 'privacy', 'book', 'items', 'company', 'read', 'group', 'need', 'many', 'user', 'said', 'set', 'under', 'general', 'research', 'mail', 'full', 'reviews', 'program', 'life', 'must', 'able', 'ability', 'looking', 'join', 'team', 'role', 'responsibilities', 'qualifications', 'requirements', 'including', 'skills', 'experience', 'candidate', 'plus', 'minimum', 'preferred', 'strong',
  // Indonesian common words
  'yang', 'untuk', 'dengan', 'dan', 'dari', 'pada', 'adalah', 'sebagai', 'dalam', 'akan', 'atau', 'bisa', 'dapat', 'saya', 'kamu', 'kami', 'mereka', 'oleh', 'ke', 'di', 'ini', 'itu', 'juga', 'ada', 'karena', 'tentang', 'secara', 'harus', 'agar', 'bagi', 'sudah', 'telah', 'serta', 'saat', 'seperti', 'lebih', 'antara', 'jika', 'bila', 'ketika', 'hanya', 'saja', 'tersebut', 'setiap', 'satu', 'dua', 'banyak', 'beberapa', 'lain', 'lainnya', 'melakukan', 'menjadi', 'memiliki', 'menggunakan', 'membuat', 'melalui', 'selama', 'posisi', 'tanggung', 'jawab', 'kualifikasi', 'persyaratan', 'pengalaman', 'kemampuan', 'minimal', 'diutamakan', 'bergabung', 'tim', 'perusahaan', 'kerja', 'bekerja', 'baik', 'mampu'
]);

// Well-known multi-word technical skills and industry phrases
const TECHNICAL_PHRASES = [
  'machine learning', 'deep learning', 'artificial intelligence', 'data science', 'data engineer', 'data analyst',
  'frontend developer', 'backend developer', 'full stack developer', 'fullstack developer', 'mobile developer',
  'react js', 'react native', 'next js', 'vue js', 'node js', 'express js', 'nest js', 'angular js',
  'tailwind css', 'bootstrap css', 'styled components', 'rest api', 'restful api', 'graphql api',
  'cloud computing', 'amazon web services', 'google cloud', 'microsoft azure',
  'ci cd', 'continuous integration', 'continuous deployment', 'unit testing', 'integration testing',
  'test driven development', 'object oriented', 'system design', 'clean architecture',
  'product management', 'project management', 'agile scrum', 'scrum master', 'user experience', 'user interface',
  'ui ux design', 'version control', 'code review', 'relational database', 'database management',
  'search engine optimization', 'cyber security', 'information technology'
];

interface Props {
  applications?: CareerApplication[];
}

export function ATSMatcher({ applications = [] }: Props) {
  const { t } = useTranslation();
  const [jdText, setJdText] = useState('');
  const [cvText, setCvText] = useState('');
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [isExtractingJd, setIsExtractingJd] = useState(false);
  const [isExtractingCv, setIsExtractingCv] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const jdFileInputRef = useRef<HTMLInputElement>(null);
  const cvFileInputRef = useRef<HTMLInputElement>(null);

  const [result, setResult] = useState<{
    score: number;
    matched: string[];
    missing: string[];
    coreMatched: string[];
    coreMissing: string[];
  } | null>(null);

  // Handle loading data from a saved application
  const handleSelectApplication = (appId: string) => {
    setSelectedAppId(appId);
    if (!appId) return;
    const app = applications.find(a => a.id === appId);
    if (app) {
      let content = `Role: ${app.role_title} at ${app.company_name}\n`;
      if (app.location) content += `Location: ${app.location} (${app.work_scheme || 'WFO'})\n`;
      if (app.notes) content += `\nJob Details / Requirements:\n${app.notes}\n`;
      if (app.url) content += `\nPosting URL: ${app.url}`;
      setJdText(content);
    }
  };

  // Handle file uploads (PDF, TXT, DOCX, etc.)
  const handleFileUpload = async (file: File, type: 'jd' | 'cv') => {
    setExtractError(null);
    if (type === 'jd') setIsExtractingJd(true);
    else setIsExtractingCv(true);

    try {
      const extractedText = await extractTextFromFile(file);
      if (type === 'jd') {
        setJdText(extractedText);
      } else {
        setCvText(extractedText);
      }
    } catch (err: any) {
      setExtractError(err.message || 'Gagal membaca isi dokumen.');
    } finally {
      if (type === 'jd') setIsExtractingJd(false);
      else setIsExtractingCv(false);
    }
  };

  // Advanced Tokenization with multi-word phrases and technical symbols
  const extractTokens = (text: string) => {
    const cleanLower = text.toLowerCase();
    const tokens = new Set<string>();

    // 1. Check known technical multi-word phrases
    for (const phrase of TECHNICAL_PHRASES) {
      if (cleanLower.includes(phrase)) {
        tokens.add(phrase);
      }
    }

    // 2. Extract technical terms with symbols (e.g. c++, c#, .net, ci/cd, node.js, ui/ux, next.js)
    const techMatches = cleanLower.match(/\b([a-z0-9+#./-]{2,})\b/g) || [];
    for (const token of techMatches) {
      const cleaned = token.replace(/^[./-]+|[./-]+$/g, '');
      if (cleaned.length >= 2 && !STOP_WORDS.has(cleaned) && !/^\d+$/.test(cleaned)) {
        tokens.add(cleaned);
      }
    }

    // 3. Extract standard words (length >= 3)
    const standardWords = cleanLower.match(/\b[a-z]{3,}\b/g) || [];
    for (const word of standardWords) {
      if (!STOP_WORDS.has(word)) {
        tokens.add(word);
      }
    }

    return tokens;
  };

  const analyze = () => {
    if (!jdText.trim() || !cvText.trim()) return;

    const jdTokens = extractTokens(jdText);
    const cvTokens = extractTokens(cvText);
    const cvRawLower = cvText.toLowerCase();

    const matched: string[] = [];
    const missing: string[] = [];

    jdTokens.forEach(token => {
      // Direct token match or substring occurrence in CV text
      if (cvTokens.has(token) || cvRawLower.includes(token)) {
        matched.push(token);
      } else {
        missing.push(token);
      }
    });

    // Score calculation
    const totalJd = jdTokens.size;
    const score = totalJd === 0 ? 0 : Math.round((matched.length / totalJd) * 100);

    // Identify core technical skills (high priority)
    const coreMatched = matched.filter(t => TECHNICAL_PHRASES.includes(t) || t.includes('.') || t.includes('+') || t.includes('#'));
    const coreMissing = missing.filter(t => TECHNICAL_PHRASES.includes(t) || t.includes('.') || t.includes('+') || t.includes('#'));

    setResult({
      score,
      matched: matched.sort(),
      missing: missing.sort(),
      coreMatched,
      coreMissing,
    });
  };

  const handleCopyMissing = () => {
    if (!result || result.missing.length === 0) return;
    navigator.clipboard.writeText(result.missing.join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-lg animate-fade-in pb-xl">
      <div className="glass-card p-xl border-t-4 border-t-primary">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-md mb-md">
          <div className="flex items-start gap-md">
            <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
              <Target size={24} weight="duotone" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-soft-cream flex items-center gap-2">
                {t('career_page.ats_matcher.title')}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold tracking-wider uppercase">
                  Smart Parser
                </span>
              </h2>
              <p className="text-xs md:text-sm text-gray-light mt-1 max-w-2xl font-light">
                {t('career_page.ats_matcher.desc')} Dukungan file PDF/TXT, frasa teknis multi-kata, dan Bahasa Indonesia.
              </p>
            </div>
          </div>

          {/* Quick-fill from saved applications */}
          {applications.length > 0 && (
            <div className="w-full sm:w-64 shrink-0">
              <Select
                id="select-saved-app"
                label="Isi dari Lamaran Tersimpan"
                value={selectedAppId}
                onValueChange={handleSelectApplication}
                placeholder="Pilih lamaran..."
                options={[
                  { value: '', label: '— Masukkan manual / file —' },
                  ...applications.map(app => ({
                    value: app.id,
                    label: `${app.company_name} (${app.role_title})`,
                  }))
                ]}
              />
            </div>
          )}
        </div>

        {extractError && (
          <div className="p-md rounded-lg bg-expense/10 border border-expense/20 text-expense text-xs flex items-center gap-2 mb-md">
            <WarningCircle size={16} />
            <span>{extractError}</span>
          </div>
        )}

        {/* Input Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg mt-md">
          {/* JD Input */}
          <div className="space-y-sm">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-gray-light uppercase tracking-wider block">
                {t('career_page.ats_matcher.jd_label')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={jdFileInputRef}
                  accept=".pdf,.txt,.md,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'jd');
                  }}
                />
                <button
                  type="button"
                  onClick={() => jdFileInputRef.current?.click()}
                  disabled={isExtractingJd}
                  className="px-2.5 py-1 rounded bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-[10px] font-bold text-soft-cream flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <UploadSimple size={12} />
                  {isExtractingJd ? 'Membaca PDF...' : 'Unggah File (PDF/TXT)'}
                </button>
                {jdText && (
                  <button
                    type="button"
                    onClick={() => setJdText('')}
                    className="p-1 rounded text-gray-light hover:text-expense transition-colors"
                    title="Hapus teks JD"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder={t('career_page.ats_matcher.jd_placeholder') as string}
                rows={10}
                className="w-full bg-black/20 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-md text-sm text-soft-cream focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all resize-none font-sans"
              />
              {!jdText && (
                <div 
                  onClick={() => jdFileInputRef.current?.click()}
                  className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-lg text-center opacity-40 hover:opacity-70 transition-opacity"
                >
                  <FileText size={28} className="text-gray-light mb-1" />
                  <p className="text-xs text-gray-light">Tarik & lepas file PDF lowongan atau ketik langsung</p>
                </div>
              )}
            </div>
          </div>

          {/* CV Input */}
          <div className="space-y-sm">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-gray-light uppercase tracking-wider block">
                {t('career_page.ats_matcher.cv_label')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={cvFileInputRef}
                  accept=".pdf,.txt,.md,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'cv');
                  }}
                />
                <button
                  type="button"
                  onClick={() => cvFileInputRef.current?.click()}
                  disabled={isExtractingCv}
                  className="px-2.5 py-1 rounded bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-[10px] font-bold text-soft-cream flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <UploadSimple size={12} />
                  {isExtractingCv ? 'Membaca PDF...' : 'Unggah Resume (PDF/TXT)'}
                </button>
                {cvText && (
                  <button
                    type="button"
                    onClick={() => setCvText('')}
                    className="p-1 rounded text-gray-light hover:text-expense transition-colors"
                    title="Hapus teks CV"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder={t('career_page.ats_matcher.cv_placeholder') as string}
                rows={10}
                className="w-full bg-black/20 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-md text-sm text-soft-cream focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all resize-none font-sans"
              />
              {!cvText && (
                <div 
                  onClick={() => cvFileInputRef.current?.click()}
                  className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-lg text-center opacity-40 hover:opacity-70 transition-opacity"
                >
                  <FileText size={28} className="text-gray-light mb-1" />
                  <p className="text-xs text-gray-light">Tarik & lepas file CV / Resume PDF Anda</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center mt-lg">
          <Button
            variant="primary"
            size="lg"
            onClick={analyze}
            disabled={!jdText.trim() || !cvText.trim() || isExtractingJd || isExtractingCv}
            className="w-full md:w-auto px-2xl py-4 rounded-xl shadow-[0_4px_20px_rgba(244,201,93,0.2)] hover:shadow-[0_8px_30px_rgba(244,201,93,0.3)] transition-all flex items-center justify-center gap-2 font-bold"
          >
            <Target size={20} />
            {t('career_page.ats_matcher.analyze_btn')}
          </Button>
        </div>
      </div>

      {/* Results Presentation */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg animate-slide-up">
          {/* Score Card */}
          <div className="glass-card p-xl flex flex-col items-center justify-center text-center">
            <h3 className="text-[11px] font-bold text-gray-light uppercase tracking-wider mb-md">
              {t('career_page.ats_matcher.score_title')}
            </h3>
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle cx="72" cy="72" r="62" fill="none" stroke="currentColor" strokeWidth="10" className="text-black/5 dark:text-white/5" />
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 62}`}
                  strokeDashoffset={`${2 * Math.PI * 62 * (1 - result.score / 100)}`}
                  className={result.score >= 75 ? 'text-success' : result.score >= 45 ? 'text-warning' : 'text-expense'}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black tabular-nums text-soft-cream">{result.score}</span>
                <span className="text-xs text-gray-light font-bold">%</span>
              </div>
            </div>

            <div className="mt-md text-xs text-gray-light flex items-center gap-1.5 font-medium">
              <Lightbulb size={16} className="text-primary shrink-0" />
              <span>
                {result.score >= 75
                  ? 'Kecocokan sangat tinggi! CV Anda siap dikirim.'
                  : result.score >= 45
                  ? 'Cukup baik, tambahkan kata kunci teknis di bawah.'
                  : 'Kecocokan rendah. Sesuaikan CV dengan kata kunci lowongan.'}
              </span>
            </div>
          </div>

          {/* Keywords Breakdown */}
          <div className="glass-card p-xl md:col-span-2 space-y-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-xl h-full">
              {/* Matched Keywords */}
              <div className="space-y-sm">
                <h3 className="text-sm font-bold flex items-center gap-2 text-success">
                  <CheckCircle size={18} weight="fill" />
                  {t('career_page.ats_matcher.matched_keywords')} ({result.matched.length})
                </h3>
                <div className="flex flex-wrap gap-1.5 max-h-[220px] overflow-y-auto no-scrollbar p-1">
                  {result.matched.length === 0 ? (
                    <p className="text-xs text-gray-light italic">Belum ada kata kunci yang cocok ditemukan.</p>
                  ) : (
                    result.matched.map(kw => (
                      <span
                        key={kw}
                        className="px-2.5 py-1 bg-success/10 text-success border border-success/25 rounded-md text-[11px] font-semibold tracking-wide"
                      >
                        ✓ {kw}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Missing Keywords */}
              <div className="space-y-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold flex items-center gap-2 text-expense">
                    <WarningCircle size={18} weight="fill" />
                    {t('career_page.ats_matcher.missing_keywords')} ({result.missing.length})
                  </h3>
                  {result.missing.length > 0 && (
                    <button
                      onClick={handleCopyMissing}
                      className="text-[10px] uppercase font-bold text-gray-light hover:text-primary flex items-center gap-1 transition-colors"
                      title="Salin semua kata kunci yang kurang"
                    >
                      {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                      {copied ? 'Tersalin' : 'Salin'}
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-[220px] overflow-y-auto no-scrollbar p-1">
                  {result.missing.length === 0 ? (
                    <p className="text-xs text-success italic flex items-center gap-1">
                      <Sparkle size={14} weight="fill" /> Semua kualifikasi lowongan sudah ada di CV Anda!
                    </p>
                  ) : (
                    result.missing.map(kw => (
                      <span
                        key={kw}
                        className="px-2.5 py-1 bg-expense/10 text-expense border border-expense/25 rounded-md text-[11px] font-semibold tracking-wide"
                      >
                        + {kw}
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
