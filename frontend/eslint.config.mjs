import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts", "node_modules/**"],
  },
];
