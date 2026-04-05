import type { Config } from "tailwindcss";

/** Content paths kept for tooling; Tailwind v4 + @tailwindcss/postcss scans sources from CSS imports. */
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};
export default config;
