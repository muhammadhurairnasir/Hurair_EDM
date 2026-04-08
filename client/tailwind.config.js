import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Redefine primary 'blue' strictly to a vibrant, mouth-watering 'orange' for elite restaurant feel
        blue: colors.orange,
        purple: colors.rose,
        // Refine emerald to a deeper, professional teal
        emerald: colors.teal,
      },
      borderRadius: {
        // Flatten the "bubbly AI" look into sharp, modern, premium corners
        'xl': '0.5rem',
        '2xl': '0.5rem',
        '3xl': '0.75rem',
      },
      boxShadow: {
        // Apply diffuse, high-end Stripe-like shadows instead of generic drop shadows
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'DEFAULT': '0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
        'md': '0 10px 15px -3px rgba(0, 0, 0, 0.03), 0 4px 6px -4px rgba(0, 0, 0, 0.03)',
        'lg': '0 20px 25px -5px rgba(0, 0, 0, 0.03), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
        'xl': '0 25px 50px -12px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
