export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: { soft: "0 8px 24px rgba(25,60,35,.08)" },
      borderRadius: { xl2: "16px" }, // оставляем, чтобы не поломать классы rounded-xl2
    },
  },
  plugins: [],
};
