import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        gt: {
          background: 'hsl(220 14% 96%)',
          foreground: 'hsl(25 25% 15%)',
          primary: 'hsl(204 96% 37%)',
          primaryHover: 'hsl(204 96% 43%)',
          secondary: 'hsl(204 45% 88%)',
          secondaryForeground: 'hsl(204 80% 25%)',
          accent: 'hsl(142 40% 85%)',
          accentForeground: 'hsl(142 60% 25%)',
          muted: 'hsl(220 14% 92%)',
          mutedForeground: 'hsl(25 15% 45%)',
          card: 'hsl(0 0% 100%)',
          border: 'hsl(220 13% 90%)',
          destructive: 'hsl(0 84% 60%)',
        },
      },
      boxShadow: {
        soft: '0 4px 32px -8px hsl(204 96% 37% / 0.15)',
        card: '0 2px 20px -4px hsl(25 25% 15% / 0.06)',
        elevated: '0 8px 40px -12px hsl(204 96% 37% / 0.2)',
      },
      borderRadius: {
        xl: '1.5rem',
        '2xl': '2rem',
      },
      backgroundImage: {
        hero: 'linear-gradient(135deg, hsl(204 96% 37%) 0%, hsl(204 96% 50%) 100%)',
        subtle: 'linear-gradient(180deg, hsl(220 14% 94%) 0%, hsl(220 14% 96%) 100%)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.6s ease forwards',
        pulseSoft: 'pulseSoft 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
