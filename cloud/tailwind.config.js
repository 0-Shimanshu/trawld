/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        tr: {
          bg:         '#0d1117',
          surface:    '#161b22',
          border:     '#21262d',
          'border-hi':'#30363d',
          text:       '#e6edf3',
          muted:      '#8b949e',
          dim:        '#7d8590',
          green:      '#3fb950',
          'green-bg': '#0f2817',
          red:        '#f85149',
          'red-bg':   '#2d1115',
          yellow:     '#d29922',
          'yellow-bg':'#2d2008',
          blue:       '#388bfd',
          'blue-bg':  '#0d1f3c',
          'gray-bg':  '#1c2128',
          accent:     '#238636',
          'accent-hi':'#2ea043',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'system-ui', 'sans-serif'],
        mono: ["'JetBrains Mono'", "'Fira Code'", 'monospace'],
      },
    },
  },
  plugins: [],
}

