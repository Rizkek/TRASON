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
        // WCAG-friendly dark theme tokens
        'primary': '#F4C95D',     // Was Indigo, now Warm Gold
        'secondary': '#E3B84D',   // Was Blue, now Darker Gold
        'warm-black': '#0B0F14',
        'soft-cream': '#F8FAFC',
        'accent-purple': '#F4C95D', // Map to Gold
        'accent-blue': '#D4AF37',   // Map to Dark Gold
        'warm-gold': '#F4C95D',
        'pale-blush': '#F8FAFC',    // Map to soft cream
        'deep-sage': '#F4C95D',     // Was Green, now Gold
        'insight-taupe': '#8B7D6B',

        // Semantic palette
        'success': '#22C55E',
        'danger': '#EF4444',
        'warning': '#F59E0B',
        'info': '#F4C95D',          // Map to Gold

        // Neutral grays
        'gray-strong': '#111827',
        'gray-medium': '#1F2937',
        'gray-light': '#CBD5E1',
        'gray-very-light': '#E2E8F0',
      },
      fontFamily: {
        serif: ['var(--font-crimson)', 'serif'],
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
  plugins: [],
};
