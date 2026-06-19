export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        coral: { 50: '#fff5f2', 100: '#ffe8e0', 200: '#ffd0c2', 300: '#ffad96', 400: '#ff7d5c', 500: '#ff562e', 600: '#f03a0d', 700: '#c72b06', 800: '#9e250d', 900: '#7f2310' },
        rose: { 50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
