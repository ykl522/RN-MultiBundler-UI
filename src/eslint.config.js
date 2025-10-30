import { defineConfig } from "eslint/config";
import react from "@eslint/react";

export default defineConfig([
  {
    files: ["&zwnj;**/*.jsx", "**&zwnj;/*.tsx"],
    plugins: [react],
    extends: [react.recommended],
    rules: {
      "react/no-unused-vars": "warn",
      "react/no-undef": "warn",
      // 其他React相关规则...
    },
  },
]);
