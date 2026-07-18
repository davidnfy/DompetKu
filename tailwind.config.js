/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './resources/**/*.blade.php',
    './resources/js/**/*.jsx',
  ],
  theme: {
    screens: {
      'xs': '320px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1440px',
      '2xl': '1920px',
    },
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#1e3a8a', // Deep Blue
          600: '#1e40af',
          700: '#1d4ed8',
          800: '#1e3a5f', // Dark Slate Blue for main branding
          900: '#0f172a', // Navy Dark
        },
        accent: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          400: '#2dd4bf',
          500: '#14b8a6', // Teal
          600: '#0d9488',
        },
        income: '#14b8a6', // Teal/Toska
        expense: '#f43f5e', // Rose/Red soft
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

