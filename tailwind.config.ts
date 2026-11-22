import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      aspectRatio: {
        "16/9": "16 / 9",
      },
      fontFamily: {
        game: ['"Press Start 2P"', 'monospace', 'sans-serif'],
        retro: ['"VT323"', 'monospace', 'sans-serif'],
      },
      colors: {
        lonfri: {
          blue: "#1E88E5",
          darkblue: "#0D47A1",
          yellow: "#FDD835",
          cream: "#FFF9C4",
          wood: "#8D6E63",
          darkwood: "#5D4037",
        },
      },
    },
  },
  plugins: [],
};
export default config;
