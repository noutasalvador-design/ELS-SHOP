import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: {
    colors: { ink: "#17221D", forest: "#174B37", leaf: "#2C7655", lime: "#C9F27A", sand: "#F6F5EF", muted: "#66736C" },
    boxShadow: { soft: "0 18px 50px rgba(23, 34, 29, 0.08)" }
  }},
  plugins: []
};
export default config;