import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    ignores: [".next/*", "node_modules/*", "backend/node_modules/*"],
  },
  {
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "no-undef": "off", // Next.js and Node.js have global variables
    },
  },
];
