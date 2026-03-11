export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'deloitte-green': '#86BC25',
        'deloitte-black': '#000000',
      },
      fontFamily: {
        'serif': ['"DM Serif Display"', 'serif'],
        'mono': ['"DM Mono"', 'SF Mono', 'monospace'],
      }
    }
  },
  plugins: []
};
