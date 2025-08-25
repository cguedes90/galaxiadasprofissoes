/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'twinkle': 'twinkle 2s ease-in-out infinite alternate',
      },
      keyframes: {
        twinkle: {
          '0%': { opacity: '0.3' },
          '100%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}