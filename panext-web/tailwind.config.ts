import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          dark:  "#2D6A4F",
          mid:   "#40916C",
          light: "#52B788",
          soft:  "#D8F3DC",
        },
        purple: { dark: "#3D1F6D" },
        bg:     "#F4F1EC",
        card:   "#FFFFFF",
        gray: {
          100: "#F0EDEA",
          200: "#E2DDD8",
          400: "#9E9891",
          600: "#6B6560",
          800: "#2E2B28",
        },
        red:    "#C94040",
        orange: "#D4854A",
        yellow: "#E8B84B",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        body:    ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "16px",
        xl3: "20px",
      },
      boxShadow: {
        card: "0 2px 12px rgba(0,0,0,0.07)",
        md:   "0 4px 24px rgba(0,0,0,0.10)",
        lg:   "0 8px 40px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
