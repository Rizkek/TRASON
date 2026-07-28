/** @type {import('tailwindcss').Config} */
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
        // WCAG-friendly dynamic theme tokens (mapped to globals.css variables)
        'primary': 'rgb(var(--color-primary) / <alpha-value>)',
        'secondary': 'rgb(var(--color-secondary) / <alpha-value>)',
        'warm-black': 'rgb(var(--color-warm-black) / <alpha-value>)',
        'soft-cream': 'rgb(var(--color-soft-cream) / <alpha-value>)',
        'warm-gold': 'rgb(var(--color-primary) / <alpha-value>)', // Alias to primary
        'deep-sage': '#8DA399',     // Static
        'insight-taupe': '#A39482', // Static

        // Semantic palette (Static)
        'success': '#4ADE80',
        'danger': '#F87171',
        'warning': '#FB923C',
        'info': '#60A5FA',

        // Neutral grays - Dynamic
        'gray-strong': 'rgb(var(--color-gray-strong) / <alpha-value>)',
        'gray-medium': 'rgb(var(--color-gray-medium) / <alpha-value>)',
        'gray-light': 'rgb(var(--color-gray-light) / <alpha-value>)',
        'gray-very-light': 'rgb(var(--color-gray-very-light) / <alpha-value>)',
        'accent-purple': '#8B5CF6',  // Static — for avatar gradient
      },
      fontFamily: {
        brand: ['var(--font-brand)', 'serif'],
        display: ['var(--font-display)', 'sans-serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      fontSize: {
        // Legacy (to be deprecated)
        'display': '40px',
        'h1': '32px',
        'h2': '24px',
        'h3': '20px',
        'body': '16px',
        'caption': '14px',
        'micro': '12px',
        
        // Semantic Design Tokens
        'display-xl': ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-lg': ['40px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'heading-xl': ['32px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'heading-lg': ['24px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'heading-md': ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'title-lg': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        'title-md': ['16px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '1.5', fontWeight: '400' }],
        'label-md': ['13px', { lineHeight: '1.5', fontWeight: '500' }],
        'label-sm': ['12px', { lineHeight: '1.5', fontWeight: '600', letterSpacing: '0.02em' }],
        'token-micro': ['10px', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '0.05em' }],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
        '4xl': '96px',
        '5xl': '128px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'subtle-pulse': 'subtlePulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 4s infinite linear',
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
        subtlePulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
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
