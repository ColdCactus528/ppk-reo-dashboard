/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        eco: {
          bg: "#F4F6F4",
          card: "#FFFFFF",
          text: "#2D2F2E",
          mute: "#6B7280",
          green: "#92C7A3",
          teal:  "#7CC6C4",
          blue:  "#9FC9EE",
          yellow:"#F4E3A1",
          red:   "#D99A9A",
          border:"#E5E7EB",
        },
      },
      boxShadow: { soft: "0 8px 24px rgba(25,60,35,.08)" },
      borderRadius: { xl2: "16px" },
    },
  },
  plugins: [],
};
