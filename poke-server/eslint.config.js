// ESLint con el plugin de seguridad para el analisis estatico (SAST).
import js from "@eslint/js";
import security from "eslint-plugin-security";

export default [
  js.configs.recommended,
  security.configs.recommended,
  {
    files: ["src/**/*.js", "tests/**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { process: "readonly", console: "readonly" },
    },
    rules: {
      "no-unused-vars": "warn",
    },
  },
];
