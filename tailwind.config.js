/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundColor: {
        walletconnectblack: "#000000",
        metamaskorange: "#f4a142",
        guestblue: "#2d9cdb",
      },
    },
  },
  plugins: [],
};
