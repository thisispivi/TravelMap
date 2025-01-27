import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  { ignores: ["/*", "!/src", "server.js", "dist"] },
  ...fixupConfigRules(
    compat.extends(
      "eslint:recommended",
      "plugin:react-hooks/recommended",
      "plugin:@typescript-eslint/recommended",
      "prettier",
    ),
  ),
  {
    plugins: {
      "@typescript-eslint": fixupPluginRules(typescriptEslint),
      react,
      "react-hooks": fixupPluginRules(reactHooks),
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/jsx-pascal-case": "error",
      "react/button-has-type": "error",
      "react/jsx-no-script-url": "error",
      "react/no-children-prop": "error",
      "react/no-danger": "error",
      "react/no-danger-with-children": "error",

      "react/no-unstable-nested-components": [
        "error",
        {
          allowAsProps: true,
        },
      ],

      "react/jsx-fragments": "error",

      "react/destructuring-assignment": [
        "error",
        "always",
        {
          destructureInSignature: "always",
        },
      ],

      "react/jsx-no-leaked-render": [
        "error",
        {
          validStrategies: ["ternary"],
        },
      ],

      "react/jsx-key": [
        "error",
        {
          checkFragmentShorthand: true,
          checkKeyMustBeforeSpread: true,
          warnOnDuplicates: true,
        },
      ],

      "react/jsx-no-useless-fragment": "warn",
      "react/jsx-curly-brace-presence": "warn",
      "react/no-typos": "warn",
      "react/display-name": "warn",
      "react/self-closing-comp": "warn",
      "react/jsx-sort-props": "warn",
      "react/react-in-jsx-scope": "off",

      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
];
