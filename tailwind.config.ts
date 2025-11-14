import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0a0e27',
        'light-text': '#ffffff',
        'gray-text': '#b0b8c4',
        'primary': '#3b82f6',
        'success': '#10b981',
        'error': '#ef4444',
      },
      backgroundImage: {
        'gradient-1': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-2': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      },
    },
  },
  plugins: [],
}
export default config

