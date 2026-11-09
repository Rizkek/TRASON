// Bilingual (Indonesian and English) stop words, plus boilerplate that fills most job listings.
const STOP_WORDS = new Set([
  'and', 'the', 'to', 'a', 'of', 'in', 'for', 'is', 'on', 'that', 'by', 'this', 'with', 'i', 'you', 'it', 'not', 'or', 'be', 'are', 'from', 'at', 'as', 'your', 'all', 'have', 'new', 'more', 'an', 'was', 'we', 'will', 'home', 'can', 'us', 'about', 'if', 'page', 'my', 'has', 'search', 'free', 'but', 'our', 'one', 'other', 'do', 'no', 'information', 'time', 'they', 'site', 'he', 'up', 'may', 'what', 'which', 'their', 'news', 'out', 'use', 'any', 'there', 'see', 'only', 'so', 'his', 'when', 'contact', 'here', 'business', 'who', 'web', 'also', 'now', 'help', 'get', 'pm', 'view', 'online', 'first', 'am', 'been', 'would', 'how', 'were', 'me', 'services', 'some', 'these', 'click', 'its', 'like', 'service', 'than', 'find', 'price', 'date', 'back', 'top', 'people', 'had', 'list', 'name', 'just', 'over', 'state', 'year', 'day', 'into', 'email', 'two', 'health', 'world', 'next', 'used', 'work', 'last', 'most', 'products', 'make', 'them', 'should', 'product', 'system', 'post', 'her', 'city', 'add', 'policy', 'number', 'such', 'please', 'available', 'support', 'message', 'after', 'best', 'software', 'good', 'well', 'where', 'info', 'rights', 'public', 'high', 'school', 'through', 'each', 'links', 'she', 'review', 'years', 'order', 'very', 'privacy', 'book', 'items', 'company', 'read', 'group', 'need', 'many', 'user', 'said', 'set', 'under', 'general', 'research', 'mail', 'full', 'reviews', 'program', 'life', 'must', 'able', 'ability', 'looking', 'join', 'team', 'role', 'responsibilities', 'qualifications', 'requirements', 'including', 'skills', 'experience', 'candidate', 'plus', 'minimum', 'preferred', 'strong',
  'yang', 'untuk', 'dengan', 'dan', 'dari', 'pada', 'adalah', 'sebagai', 'dalam', 'akan', 'atau', 'bisa', 'dapat', 'saya', 'kamu', 'kami', 'mereka', 'oleh', 'ke', 'di', 'ini', 'itu', 'juga', 'ada', 'karena', 'tentang', 'secara', 'harus', 'agar', 'bagi', 'sudah', 'telah', 'serta', 'saat', 'seperti', 'lebih', 'antara', 'jika', 'bila', 'ketika', 'hanya', 'saja', 'tersebut', 'setiap', 'satu', 'dua', 'banyak', 'beberapa', 'lain', 'lainnya', 'melakukan', 'menjadi', 'memiliki', 'menggunakan', 'membuat', 'melalui', 'selama', 'posisi', 'tanggung', 'jawab', 'kualifikasi', 'persyaratan', 'pengalaman', 'kemampuan', 'minimal', 'diutamakan', 'bergabung', 'tim', 'perusahaan', 'kerja', 'bekerja', 'baik', 'mampu',
]);

// Multi-word skills that single-word splitting would break apart.
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
  'search engine optimization', 'cyber security', 'information technology',
];

export interface AtsResult {
  /** Weighted share of the listing's terms found in the CV, 0-100. */
  score: number;
  /** Every list is ordered by importance in the listing, most important first. */
  matched: string[];
  missing: string[];
  coreMatched: string[];
  coreMissing: string[];
}

const URL_PATTERN = /https?:\/\/\S+|www\.\S+/g;

/** A technical phrase, or a term carrying a symbol such as node.js, c++, c# or ci/cd. */
export const isCoreTerm = (term: string): boolean => TECHNICAL_PHRASES.includes(term) || /[.+#/]/.test(term);

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Whole-term match, so "java" is not found inside "javascript". */
const containsTerm = (text: string, term: string) =>
  new RegExp(`(^|[^a-z0-9+#])${escapeRegExp(term)}($|[^a-z0-9+#])`).test(text);

/** Terms in a text with how often each appears. Links are dropped: a posting URL says nothing about skills. */
export function extractTerms(text: string): Map<string, number> {
  const lower = text.toLowerCase().replace(URL_PATTERN, ' ');
  const counts = new Map<string, number>();
  const bump = (term: string, by = 1) => counts.set(term, (counts.get(term) ?? 0) + by);

  for (const phrase of TECHNICAL_PHRASES) {
    const occurrences = lower.split(phrase).length - 1;
    if (occurrences > 0) bump(phrase, occurrences);
  }

  // Terms with digits or symbols (and two-letter ones such as ui, qa, ml).
  for (const raw of lower.match(/[a-z0-9+#./-]{2,}/g) ?? []) {
    const term = raw.replace(/^[./-]+|[./-]+$/g, '');
    if (term.length < 2 || /^[a-z]{3,}$/.test(term) || STOP_WORDS.has(term) || /^\d+$/.test(term)) continue;
    bump(term);
  }

  // Plain words, which also splits compounds like react/vue.
  for (const word of lower.match(/\b[a-z]{3,}\b/g) ?? []) {
    if (!STOP_WORDS.has(word)) bump(word);
  }

  return counts;
}

// A term repeated in the listing matters more, up to a cap so one buzzword cannot dominate; core terms count double.
const weightOf = (term: string, count: number) => Math.min(count, 3) * (isCoreTerm(term) ? 2 : 1);

export function analyzeMatch(jobDescription: string, resume: string): AtsResult {
  const resumeLower = resume.toLowerCase().replace(URL_PATTERN, ' ');
  const resumeTerms = extractTerms(resume);

  const matched: { term: string; weight: number }[] = [];
  const missing: { term: string; weight: number }[] = [];
  let totalWeight = 0;
  let matchedWeight = 0;

  for (const [term, count] of extractTerms(jobDescription)) {
    const weight = weightOf(term, count);
    totalWeight += weight;
    if (resumeTerms.has(term) || containsTerm(resumeLower, term)) {
      matchedWeight += weight;
      matched.push({ term, weight });
    } else {
      missing.push({ term, weight });
    }
  }

  const byImportance = (a: { term: string; weight: number }, b: { term: string; weight: number }) =>
    b.weight - a.weight || a.term.localeCompare(b.term);
  const terms = (list: { term: string; weight: number }[]) => list.sort(byImportance).map((item) => item.term);

  const matchedTerms = terms(matched);
  const missingTerms = terms(missing);

  return {
    score: totalWeight === 0 ? 0 : Math.round((matchedWeight / totalWeight) * 100),
    matched: matchedTerms,
    missing: missingTerms,
    coreMatched: matchedTerms.filter(isCoreTerm),
    coreMissing: missingTerms.filter(isCoreTerm),
  };
}
