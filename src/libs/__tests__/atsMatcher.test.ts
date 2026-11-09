import { analyzeMatch, extractTerms, isCoreTerm } from '@/libs/analytics/atsMatcher';

describe('analyzeMatch', () => {
  it('scores a resume that repeats the listing at 100', () => {
    const text = 'React developer with Docker and PostgreSQL experience';
    const result = analyzeMatch(text, text);
    expect(result.score).toBe(100);
    expect(result.missing).toEqual([]);
  });

  it('scores 0 for an empty listing', () => {
    expect(analyzeMatch('', 'react docker').score).toBe(0);
  });

  it('ignores links in the listing', () => {
    const result = analyzeMatch('React https://jobs.example.com/apply/12345', 'I know react well');
    expect(result.score).toBe(100);
  });

  it('matches whole terms only', () => {
    const result = analyzeMatch('java', 'javascript developer');
    expect(result.missing).toContain('java');
    expect(result.score).toBe(0);
  });

  it('puts the term the listing repeats before the rest', () => {
    const result = analyzeMatch('react react react docker', 'python');
    expect(result.missing.slice(0, 2)).toEqual(['react', 'docker']);
  });

  it('counts a repeated term at most three times', () => {
    const many = analyzeMatch('react react react react react react docker', 'docker');
    const three = analyzeMatch('react react react docker', 'docker');
    expect(many.score).toBe(three.score);
  });

  it('weighs symbol terms double and reports them as core', () => {
    const result = analyzeMatch('We use node.js and typescript', 'typescript');
    expect(result.coreMissing).toEqual(['node.js']);
    // node.js counts 2, node and typescript count 1 each: 1 of 4.
    expect(result.score).toBe(25);
  });

  it('keeps core terms inside the matched and missing lists', () => {
    const result = analyzeMatch('machine learning and sql', 'machine learning');
    expect(result.coreMatched).toEqual(['machine learning']);
    expect(result.matched).toContain('machine learning');
  });
});

describe('extractTerms', () => {
  it('counts how often a term appears', () => {
    expect(extractTerms('sql sql sql').get('sql')).toBe(3);
  });

  it('keeps two-letter terms and splits compounds', () => {
    const terms = extractTerms('ui/ux and react/vue');
    expect(terms.has('ui/ux')).toBe(true);
    expect(terms.has('react')).toBe(true);
    expect(terms.has('vue')).toBe(true);
  });

  it('drops stop words and bare numbers', () => {
    const terms = extractTerms('the 2024 and yang');
    expect(terms.size).toBe(0);
  });
});

describe('isCoreTerm', () => {
  it('recognises phrases and symbol terms', () => {
    expect(isCoreTerm('machine learning')).toBe(true);
    expect(isCoreTerm('c++')).toBe(true);
    expect(isCoreTerm('react')).toBe(false);
  });
});
