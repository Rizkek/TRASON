'use client';

import React, { useRef, useState } from 'react';
import { Target, WarningCircle, CheckCircle, Lightbulb, UploadSimple, X, Copy, Check } from '@phosphor-icons/react';
import { Button, Select } from '@/components';
import { Textarea } from '@/components/ui/Textarea';
import { Heading, Paragraph } from '@/components/ui/typography';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { extractTextFromFile } from '@/libs/fileExtractor';
import { analyzeMatch, type AtsResult } from '@/libs/analytics/atsMatcher';
import { cn } from '@/lib/utils';
import { CareerApplication } from '@/types/database';

interface SourceFieldProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  hint: string;
  clearLabel: string;
  isReading: boolean;
  onChange: (value: string) => void;
  onFile: (file: File) => void;
}

/** A text area that also accepts a dropped or uploaded file, the way its hint promises. */
function SourceField({ id, label, value, placeholder, hint, clearLabel, isReading, onChange, onFile }: SourceFieldProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-xs font-semibold text-muted-foreground">
          {label}
        </label>
        <div className="flex items-center gap-1">
          <input
            type="file"
            ref={inputRef}
            accept=".pdf,.txt,.md,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFile(file);
              e.target.value = '';
            }}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => inputRef.current?.click()}
            isLoading={isReading}
            loadingText={t('career_page.ats_matcher.reading_file')}
            leftIcon={<UploadSimple size={14} />}
          >
            {t('career_page.ats_matcher.upload_file')}
          </Button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              aria-label={clearLabel}
              title={clearLabel}
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-danger"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div
        className={cn('rounded-lg', isDragging && 'ring-2 ring-primary')}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) onFile(file);
        }}
      >
        <Textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={10} />
      </div>
      <p className="text-xs text-muted-foreground">{isDragging ? t('ats_ui.drop_active') : hint}</p>
    </div>
  );
}

function Chip({ term, tone }: { term: string; tone: 'success' | 'danger' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold',
        tone === 'success' ? 'border-success/25 bg-success/10 text-success' : 'border-danger/25 bg-danger/10 text-danger'
      )}
    >
      {tone === 'success' ? <Check size={12} weight="bold" aria-hidden="true" /> : <span aria-hidden="true">+</span>}
      {term}
    </span>
  );
}

// Only the role and its notes go in: the company name, place and link would count as skills to match.
const jobDescriptionOf = (app: CareerApplication) => [app.role_title, app.notes].filter(Boolean).join('\n\n');

interface Props {
  applications?: CareerApplication[];
  /** Opens with this application already chosen, as from its card. */
  initialApplicationId?: string;
  /** Stores the score on the chosen application. When absent, no save button is shown. */
  onSaveScore?: (applicationId: string, score: number) => Promise<void>;
}

export function ATSMatcher({ applications = [], initialApplicationId, onSaveScore }: Props) {
  const { t } = useTranslation();
  const initialApp = applications.find((app) => app.id === initialApplicationId);
  const [jdText, setJdText] = useState(initialApp ? jobDescriptionOf(initialApp) : '');
  const [cvText, setCvText] = useState('');
  const [selectedAppId, setSelectedAppId] = useState<string>(initialApp?.id ?? '');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isExtractingJd, setIsExtractingJd] = useState(false);
  const [isExtractingCv, setIsExtractingCv] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<AtsResult | null>(null);

  const handleSelectApplication = (appId: string) => {
    setSelectedAppId(appId);
    setSaveState('idle');
    const app = applications.find((a) => a.id === appId);
    if (app) setJdText(jobDescriptionOf(app));
  };

  const handleAnalyze = () => {
    setResult(analyzeMatch(jdText, cvText));
    setSaveState('idle');
  };

  const handleSaveScore = async () => {
    if (!result || !selectedAppId || !onSaveScore) return;
    setSaveState('saving');
    try {
      await onSaveScore(selectedAppId, result.score);
      setSaveState('saved');
    } catch (err) {
      console.error('Failed to save the resume match score:', err);
      setSaveState('error');
    }
  };

  const handleFile = async (file: File, target: 'jd' | 'cv') => {
    setExtractError(null);
    const setReading = target === 'jd' ? setIsExtractingJd : setIsExtractingCv;
    const setText = target === 'jd' ? setJdText : setCvText;
    setReading(true);
    try {
      setText(await extractTextFromFile(file));
    } catch {
      setExtractError(t('career_form.read_failed'));
    } finally {
      setReading(false);
    }
  };

  const handleCopyMissing = () => {
    if (!result || result.missing.length === 0) return;
    navigator.clipboard.writeText(result.missing.join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const otherMatched = result ? result.matched.filter((term) => !result.coreMatched.includes(term)) : [];
  const otherMissing = result ? result.missing.filter((term) => !result.coreMissing.includes(term)) : [];
  const scoreTone = result ? (result.score >= 75 ? 'text-success' : result.score >= 45 ? 'text-warning' : 'text-danger') : '';

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="glass-card p-5 md:p-8">
        <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div className="flex items-start gap-4">
            <div className="shrink-0 rounded-xl bg-primary/10 p-3 text-primary">
              <Target size={24} />
            </div>
            <div>
              <Heading as="h2" size="h3">
                {t('career_page.ats_matcher.title')}
              </Heading>
              <Paragraph className="mt-1 max-w-2xl text-sm text-muted-foreground">{t('career_page.ats_matcher.desc')}</Paragraph>
            </div>
          </div>

          {applications.length > 0 && (
            <div className="w-full shrink-0 sm:w-64">
              <Select
                id="select-saved-app"
                label={t('career_page.ats_matcher.from_saved_app')}
                value={selectedAppId}
                onValueChange={handleSelectApplication}
                placeholder={t('career_page.ats_matcher.select_app_placeholder')}
                options={[
                  { value: '', label: t('career_page.ats_matcher.manual_entry') },
                  ...applications.map((app) => ({ value: app.id, label: `${app.company_name} (${app.role_title})` })),
                ]}
              />
            </div>
          )}
        </div>

        {extractError && (
          <div role="alert" className="mb-4 flex items-center gap-2 rounded-lg border border-danger/20 bg-danger/10 p-4 text-xs text-danger">
            <WarningCircle size={16} aria-hidden="true" />
            <span>{extractError}</span>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <SourceField
            id="ats-jd"
            label={t('career_page.ats_matcher.jd_label')}
            value={jdText}
            placeholder={t('career_page.ats_matcher.jd_placeholder')}
            hint={t('career_page.ats_matcher.drag_jd_hint')}
            clearLabel={t('career_page.ats_matcher.clear_jd')}
            isReading={isExtractingJd}
            onChange={setJdText}
            onFile={(file) => handleFile(file, 'jd')}
          />
          <SourceField
            id="ats-cv"
            label={t('career_page.ats_matcher.cv_label')}
            value={cvText}
            placeholder={t('career_page.ats_matcher.cv_placeholder')}
            hint={t('career_page.ats_matcher.drag_cv_hint')}
            clearLabel={t('career_page.ats_matcher.clear_cv')}
            isReading={isExtractingCv}
            onChange={setCvText}
            onFile={(file) => handleFile(file, 'cv')}
          />
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={handleAnalyze}
            disabled={!jdText.trim() || !cvText.trim() || isExtractingJd || isExtractingCv}
            leftIcon={<Target size={20} />}
            className="w-full md:w-auto"
          >
            {t('career_page.ats_matcher.analyze_btn')}
          </Button>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 gap-6 animate-slide-up xl:grid-cols-3">
          <div className="glass-card flex flex-col items-center justify-center p-5 text-center md:p-8">
            <Heading as="h3" size="h6" className="mb-4 text-muted-foreground">
              {t('career_page.ats_matcher.score_title')}
            </Heading>
            <div className="relative flex h-36 w-36 items-center justify-center">
              <svg className="absolute h-full w-full -rotate-90" aria-hidden="true">
                <circle cx="72" cy="72" r="62" fill="none" stroke="currentColor" strokeWidth="10" className="text-foreground/5" />
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 62}`}
                  strokeDashoffset={`${2 * Math.PI * 62 * (1 - result.score / 100)}`}
                  className={scoreTone}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-mono text-4xl font-bold tabular-nums text-foreground">{result.score}</span>
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lightbulb size={16} className="shrink-0 text-primary" aria-hidden="true" />
              <span>
                {result.score >= 75
                  ? t('career_page.ats_matcher.score_high_tip')
                  : result.score >= 45
                    ? t('career_page.ats_matcher.score_mid_tip')
                    : t('career_page.ats_matcher.score_low_tip')}
              </span>
            </div>

            {onSaveScore && selectedAppId && (
              <div className="mt-4 w-full space-y-1">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={handleSaveScore}
                  isLoading={saveState === 'saving'}
                  loadingText={t('common.saving')}
                  disabled={saveState === 'saved'}
                >
                  {saveState === 'saved' ? t('ats_ui.saved') : t('ats_ui.save_score')}
                </Button>
                {saveState === 'error' && (
                  <p role="alert" className="text-xs text-danger">
                    {t('ats_ui.save_failed')}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="glass-card space-y-6 p-5 md:p-8 xl:col-span-2">
            {(result.coreMatched.length > 0 || result.coreMissing.length > 0) && (
              <section className="space-y-2">
                <Heading as="h3" size="h6">
                  {t('ats_ui.key_skills')}
                </Heading>
                <Paragraph className="text-xs text-muted-foreground">{t('ats_ui.key_skills_desc')}</Paragraph>
                <div className="flex flex-wrap gap-1.5">
                  {result.coreMatched.map((term) => (
                    <Chip key={term} term={term} tone="success" />
                  ))}
                  {result.coreMissing.map((term) => (
                    <Chip key={term} term={term} tone="danger" />
                  ))}
                </div>
              </section>
            )}

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <section className="space-y-2">
                <Heading as="h3" size="h6" className="flex items-center gap-2 text-success">
                  <CheckCircle size={18} weight="fill" aria-hidden="true" />
                  {t('career_page.ats_matcher.matched_keywords')} ({otherMatched.length})
                </Heading>
                <div className="flex max-h-56 flex-wrap gap-1.5 overflow-y-auto p-1">
                  {otherMatched.length === 0 ? (
                    <Paragraph className="text-xs text-muted-foreground">{t('career_page.ats_matcher.no_matched_found')}</Paragraph>
                  ) : (
                    otherMatched.map((term) => <Chip key={term} term={term} tone="success" />)
                  )}
                </div>
              </section>

              <section className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Heading as="h3" size="h6" className="flex items-center gap-2 text-danger">
                    <WarningCircle size={18} weight="fill" aria-hidden="true" />
                    {t('career_page.ats_matcher.missing_keywords')} ({otherMissing.length})
                  </Heading>
                  {result.missing.length > 0 && (
                    <button
                      type="button"
                      onClick={handleCopyMissing}
                      className="flex min-h-9 items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
                      title={t('career_page.ats_matcher.copy_missing')}
                    >
                      {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                      {copied ? t('career_page.ats_matcher.copied') : t('career_page.ats_matcher.copy_missing')}
                    </button>
                  )}
                </div>
                {otherMissing.length > 0 && <p className="text-xs text-muted-foreground">{t('ats_ui.sorted_hint')}</p>}
                <div className="flex max-h-56 flex-wrap gap-1.5 overflow-y-auto p-1">
                  {otherMissing.length === 0 ? (
                    <Paragraph className="flex items-center gap-1 text-xs text-success">
                      <CheckCircle size={14} weight="fill" aria-hidden="true" /> {t('career_page.ats_matcher.all_matched')}
                    </Paragraph>
                  ) : (
                    otherMissing.map((term) => <Chip key={term} term={term} tone="danger" />)
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
