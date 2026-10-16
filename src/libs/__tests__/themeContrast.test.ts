import fs from 'fs';
import path from 'path';

// Reads the real tokens from globals.css, so a color change that breaks WCAG AA fails here.
const css = fs.readFileSync(path.join(__dirname, '../../app/globals.css'), 'utf8');

type Rgb = [number, number, number];

function readBlock(selector: string): Record<string, Rgb> {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`${selector} block not found in globals.css`);
  const body = css.slice(start, css.indexOf('}', start));
  const tokens: Record<string, Rgb> = {};
  for (const m of body.matchAll(/--color-([a-z-]+):\s*(\d+)\s+(\d+)\s+(\d+)\s*;/g)) {
    tokens[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])];
  }
  return tokens;
}

const dark = readBlock(':root');
const light = { ...dark, ...readBlock('html.light') };

const channel = (v: number) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
const luminance = ([r, g, b]: Rgb) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const ratio = (a: Rgb, b: Rgb) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const over = (fg: Rgb, bg: Rgb, alpha: number): Rgb =>
  [0, 1, 2].map((i) => Math.round(fg[i] * alpha + bg[i] * (1 - alpha))) as Rgb;

const themes = { dark, light } as const;

describe.each(Object.entries(themes))('%s theme contrast (WCAG AA)', (_name, t) => {
  const AA = 4.5;

  it.each([
    ['foreground', 'background'],
    ['foreground', 'surface'],
    ['muted', 'background'],
    ['muted', 'surface'],
    ['subtle', 'background'],
    ['subtle', 'surface'],
    ['gray-medium-text', 'surface'],
    ['primary-text', 'background'],
    ['primary-text', 'surface'],
    ['secondary-text', 'background'],
    ['secondary-text', 'surface'],
    ['success', 'background'],
    ['success', 'surface'],
    ['danger', 'background'],
    ['danger', 'surface'],
    ['warning', 'background'],
    ['warning', 'surface'],
    ['info', 'background'],
    ['info', 'surface'],
    ['accent-purple', 'background'],
    ['accent-purple', 'surface'],
    ['deep-sage', 'background'],
    ['deep-sage', 'surface'],
    ['insight-taupe', 'background'],
    ['insight-taupe', 'surface'],
  ])('%s text on %s', (fg, bg) => {
    expect(ratio(t[fg], t[bg])).toBeGreaterThanOrEqual(AA);
  });

  it.each([
    ['on-primary', 'primary'],
    ['on-primary', 'secondary'],
    ['background', 'danger'],
  ])('%s text on a %s fill', (fg, bg) => {
    expect(ratio(t[fg], t[bg])).toBeGreaterThanOrEqual(AA);
  });

  it.each(['success', 'danger', 'warning', 'info', 'accent-purple', 'primary-text'])(
    '%s text on its own 15%% tint over the surface',
    (name) => {
      expect(ratio(t[name], over(t[name], t.surface, 0.15))).toBeGreaterThanOrEqual(AA);
    }
  );

  it('muted text stays readable on a card tint', () => {
    expect(ratio(t.muted, over(t.foreground, t.surface, 0.05))).toBeGreaterThanOrEqual(AA);
  });

  it('focus ring and text borders reach 3:1 against the surface', () => {
    expect(ratio(t['primary-text'], t.surface)).toBeGreaterThanOrEqual(3);
  });
});
