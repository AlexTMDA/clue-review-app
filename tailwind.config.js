/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    // Add commonly used classes that might be missed
    'bg-orange-600', 'bg-orange-700', 'bg-teal-600', 'bg-teal-700',
    'text-white', 'text-gray-700', 'text-gray-800', 'text-gray-600',
    'px-6', 'py-8', 'mb-4', 'w-8', 'h-8', 'max-w-6xl',
    'rounded-xl', 'shadow-lg', 'border-gray-200'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}