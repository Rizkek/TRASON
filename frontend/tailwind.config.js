/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // TRASON Design System Colors
        'warm-black': '#0F0F0F',      // Background
        'soft-cream': '#F5F3F0',      // Primary text
        'deep-sage': '#546B5D',       // Accent 1 - calm
        'warm-gold': '#D4A574',       // Accent 2 - warmth
        'pale-blush': '#E8D7D3',      // Accent 3 - soft
        
        // Secondary palette
        'muted-green': '#8BA887',     // Income/Growth
        'warm-brown': '#B8956A',      // Expense/Release
        'insight-taupe': '#9B8B7E',   // Insight/Discovery
        'peachy': '#D9B99F',          // Energy/Activity

        // Neutral grays
        'gray-strong': '#2A2A2A',
        'gray-medium': '#4A4A4A',
        'gray-light': '#8A8A8A',
        'gray-very-light': '#D0D0D0',
      },
      fontFamily: {
        serif: ['var(--font-crimson)', 'serif'],    // Crimson Text
        sans: ['var(--font-inter)', 'sans-serif'],  // Inter
      },
      fontSize: {
        // Typography scale from design system
        'display': '40px',  // Crimson Text, semibold
        'h1': '32px',       // Crimson Text, regular
        'h2': '24px',       // Crimson Text, regular
        'h3': '20px',       // Inter, semibold
        'body': '16px',     // Inter, regular
        'caption': '14px',  // Inter, regular
        'micro': '12px',    // Inter, medium
      },
      spacing: {
        // 8px grid system
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
