import tailwindcss from "@tailwindcss/vite";

const config = {
  darkMode: 'class',
  plugins: [
    "@tailwindcss/postcss",
    require('@tailwindcss/typography')
  ],
};

export default config;
