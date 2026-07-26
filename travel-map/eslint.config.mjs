import path from "node:path";
import { fileURLToPath } from "node:url";

import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import jsdoc from "eslint-plugin-jsdoc";
import noUnsanitized from "eslint-plugin-no-unsanitized";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";

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
      jsdoc,
      react,
      "react-hooks": fixupPluginRules(reactHooks),
      nounsanitized: noUnsanitized,
      "simple-import-sort": simpleImportSort,
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
      jsdoc: {
        mode: "typescript",
        structuredTags: {
          component: {
            required: [],
          },
        },
      },
      react: {
        version: "19.2",
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

      "jsdoc/check-alignment": "error",
      "jsdoc/check-param-names": "error",
      "jsdoc/check-property-names": "error",
      "jsdoc/check-tag-names": [
        "error",
        {
          definedTags: ["component"],
          typed: false,
        },
      ],
      "jsdoc/check-types": "error",
      "jsdoc/empty-tags": "error",
      "jsdoc/multiline-blocks": [
        "error",
        {
          noFinalLineText: true,
          noSingleLineBlocks: true,
          noZeroLineText: true,
        },
      ],
      "jsdoc/match-description": [
        "error",
        {
          contexts: ["FunctionDeclaration[id.name=/^[A-Z]/]"],
          mainDescription: {
            match:
              "^(?![\\s\\S]*\\n\\s*\\n)[A-Z][A-Za-z0-9]* component(?:\\n|$)",
            message:
              "Component JSDoc must start with '<ComponentName> component' and contain no blank lines.",
          },
        },
      ],
      "jsdoc/no-blank-block-descriptions": "error",
      "jsdoc/no-blank-blocks": "error",
      "jsdoc/no-multi-asterisks": "error",
      "jsdoc/no-undefined-types": "error",
      "jsdoc/reject-any-type": "error",
      "jsdoc/require-description": ["error", { contexts: ["any"] }],
      "jsdoc/require-hyphen-before-param-description": [
        "error",
        "always",
        { tags: { property: "always", returns: "never" } },
      ],
      "jsdoc/require-jsdoc": [
        "error",
        {
          contexts: [
            "ExportDefaultDeclaration > ClassDeclaration",
            "ExportDefaultDeclaration > FunctionDeclaration",
            "ExportNamedDeclaration > ClassDeclaration",
            "ExportNamedDeclaration > FunctionDeclaration",
            "ExportNamedDeclaration > TSInterfaceDeclaration",
            "ExportNamedDeclaration > TSTypeAliasDeclaration",
            "ExportNamedDeclaration > TSEnumDeclaration",
            "FunctionDeclaration[id.name=/^[A-Z]/]",
          ],
          require: {
            ArrowFunctionExpression: false,
            ClassDeclaration: false,
            ClassExpression: false,
            FunctionDeclaration: false,
            FunctionExpression: false,
            MethodDefinition: false,
          },
        },
      ],
      "jsdoc/require-param": ["error", { checkTypesPattern: ".*" }],
      "jsdoc/require-param-name": "error",
      "jsdoc/require-param-type": "error",
      "jsdoc/require-property": "error",
      "jsdoc/require-property-description": "error",
      "jsdoc/require-property-name": "error",
      "jsdoc/require-property-type": "error",
      "jsdoc/require-returns": "error",
      "jsdoc/require-returns-check": "error",
      "jsdoc/require-returns-description": "error",
      "jsdoc/require-returns-type": "error",
      "jsdoc/tag-lines": [
        "error",
        "never",
        {
          endLines: 0,
          startLines: 0,
        },
      ],
      "jsdoc/valid-types": "error",

      "nounsanitized/method": "error",
      "nounsanitized/property": "error",

      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
    },
  },
];
