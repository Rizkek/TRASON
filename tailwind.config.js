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
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      fontSize: {
        'display': '40px',
        'h1': '32px',
        'h2': '24px',
        'h3': '20px',
        'body': '16px',
        'caption': '14px',
        'micro': '12px',
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
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        subtlePulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
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
