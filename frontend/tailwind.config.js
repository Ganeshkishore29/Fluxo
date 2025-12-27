module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        slideIn: {
'0%': { transform: 'translateX(0%)' },
'100%': { transform: 'translateX(0)' },
},
slideOut: {
'0%': { transform: 'translateX(0)' },
'100%': { transform: 'translateX(0)' },
},
},
animation: {
slideIn: 'slideIn 0.5s ease-in-out',
slideOut: 'slideOut 0.5s ease-in-out',
},
       fontFamily: {
        hnm: ["Inter", "Helvetica Neue", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
}

