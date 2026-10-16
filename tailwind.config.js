/** @type {import('tailwindcss').Config} */

// Colors are CSS variables set in src/app/globals.css (dark base, html.light override).
const token = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

// Brand gold has two roles. Fills use --color-primary; text, icons, borders and focus rings use
// --color-primary-text, which is darker in light mode so it passes WCAG AA on white and paper.
const goldText = { primary: token('primary-text'), secondary: token('secondary-text') };

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Role tokens (canonical)
        background: token('background'),
        surface: token('surface'),
        'surface-hover': token('surface-hover'),
        foreground: token('foreground'),
        'muted-foreground': token('muted'),
        subtle: token('subtle'),
        'on-primary': token('on-primary'),

        // Brand
        primary: token('primary'),
        secondary: token('secondary'),

        // Only gray-medium is left of the legacy names: text-gray-medium on the landing nav.
        'gray-medium': token('surface-hover'),

        // Semantic palette. Light mode uses darker values so text passes AA.
        success: token('success'),
        danger: token('danger'),
        warning: token('warning'),
        info: token('info'),
        // Money aliases of the semantic colors, used by finance and career UI
        income: token('success'),
        expense: token('danger'),
        'accent-purple': token('accent-purple'),
        'deep-sage': token('deep-sage'),
        'insight-taupe': token('insight-taupe'),
      },
      // Per-utility overrides: gold used as a foreground uses the -text variant, and gray-medium
      // is a surface as a background but a text color as a foreground.
      textColor: { ...goldText, 'gray-medium': token('gray-medium-text') },
      borderColor: {
        DEFAULT: token('foreground').replace('<alpha-value>', '0.1'),
        primary: token('primary-text'),
        secondary: token('secondary-text'),
      },
      ringColor: goldText,
      outlineColor: goldText,
      divideColor: { primary: token('primary-text') },
      placeholderColor: { primary: token('primary-text') },
      fill: { primary: token('primary-text') },
      stroke: { primary: token('primary-text') },
      decorationColor: goldText,
      fontFamily: {
        brand: ['var(--font-brand)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      // Type scale. Nothing below 12px. Tailwind's text-xs (12), sm (14), base (16), lg (18),
      // xl (20), 2xl (24) stay valid and match these sizes; the names below carry line height
      // and, for headings and titles, weight.
      fontSize: {
        'display-2xl': ['72px', { lineHeight: '1.02', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-md': ['44px', { lineHeight: '1.08', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-xl': ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-lg': ['40px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'heading-xl': ['32px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'heading-lg': ['24px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'heading-md': ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'title-lg': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        'title-md': ['16px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '1.6' }],
        'body-md': ['14px', { lineHeight: '1.6' }],
        'body-sm': ['13px', { lineHeight: '1.5' }],
        'label-md': ['13px', { lineHeight: '1.5', fontWeight: '500' }],
        'label-sm': ['12px', { lineHeight: '1.5', fontWeight: '600', letterSpacing: '0.02em' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      maxWidth: {
        'container': '1024px',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
