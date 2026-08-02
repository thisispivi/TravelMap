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

const documentationSpacing = {
  rules: {
    "blank-line-before-jsdoc": {
      meta: {
        type: "layout",
        docs: {
          description: "Require a blank line before every JSDoc block.",
        },
        fixable: "whitespace",
        messages: {
          missingBlankLine: "Add a blank line before this JSDoc block.",
        },
        schema: [],
      },

      /**
       * Creates visitors that enforce the repository's JSDoc spacing.
       * @param {import("eslint").Rule.RuleContext} context - The ESLint rule context
       * @returns {import("eslint").Rule.RuleListener} The rule listeners
       */
      create(context) {
        const sourceCode = context.sourceCode;

        return {
          /**
           * Checks every JSDoc block once the complete program is available.
           * @returns {void}
           */
          "Program:exit"() {
            for (const comment of sourceCode.getAllComments()) {
              if (comment.type !== "Block" || !comment.value.startsWith("*")) {
                continue;
              }

              const previousToken = sourceCode.getTokenBefore(comment, {
                includeComments: true,
              });
              if (
                !previousToken ||
                ["{", "[", "("].includes(previousToken.value) ||
                comment.loc.start.line - previousToken.loc.end.line > 1
              ) {
                continue;
              }

              context.report({
                loc: comment.loc,
                messageId: "missingBlankLine",
                fix: (fixer) => fixer.insertTextBefore(comment, "\n"),
              });
            }
          },
        };
      },
    },
    "require-named-function-jsdoc": {
      meta: {
        type: "suggestion",
        docs: {
          description: "Require JSDoc on named arrow and function expressions.",
        },
        messages: {
          missingJsdoc: "Add JSDoc for this named function.",
        },
        schema: [],
      },

      /**
       * Creates visitors that require documentation on named function values.
       * @param {import("eslint").Rule.RuleContext} context - The ESLint rule context
       * @returns {import("eslint").Rule.RuleListener} The rule listeners
       */
      create(context) {
        const sourceCode = context.sourceCode;

        return {
          /**
           * Checks function expressions assigned through a variable declaration.
           * @param {object} node - The variable declaration
           * @returns {void}
           */
          VariableDeclaration(node) {
            const hasNamedFunction = node.declarations.some(
              (declaration) =>
                declaration.id.type === "Identifier" &&
                (declaration.init?.type === "ArrowFunctionExpression" ||
                  declaration.init?.type === "FunctionExpression"),
            );
            if (!hasNamedFunction) return;

            const target =
              node.parent.type === "ExportNamedDeclaration"
                ? node.parent
                : node;
            const comments = sourceCode.getCommentsBefore(target);
            const jsdoc = comments.findLast(
              (comment) =>
                comment.type === "Block" && comment.value.startsWith("*"),
            );
            if (
              jsdoc &&
              /^\s*$/.test(
                sourceCode.text.slice(jsdoc.range[1], target.range[0]),
              )
            ) {
              return;
            }

            context.report({ node: target, messageId: "missingJsdoc" });
          },
        };
      },
    },
    "require-declaration-properties": {
      meta: {
        type: "suggestion",
        docs: {
          description:
            "Require an @property tag for every interface, object type, and enum member.",
        },
        messages: {
          missingProperty:
            "Document '{{name}}' with an @property tag in the declaration JSDoc.",
        },
        schema: [],
      },

      /**
       * Creates visitors that verify declaration-member documentation.
       * @param {import("eslint").Rule.RuleContext} context - The ESLint rule context
       * @returns {import("eslint").Rule.RuleListener} The rule listeners
       */
      create(context) {
        const sourceCode = context.sourceCode;

        /**
         * Reports declaration members missing from the attached JSDoc.
         * @param {object} node - The interface, type alias, or enum declaration
         * @param {object[]} members - The declaration members to verify
         * @returns {void}
         */
        function checkDeclarationProperties(node, members) {
          const target =
            node.parent.type === "ExportNamedDeclaration" ? node.parent : node;
          const jsdoc = sourceCode
            .getCommentsBefore(target)
            .findLast(
              (comment) =>
                comment.type === "Block" && comment.value.startsWith("*"),
            );
          if (!jsdoc) return;

          const documentedProperties = new Set(
            jsdoc.value.split(/\r?\n/).flatMap((line) => {
              const match = line.match(
                /@property\b.*\s\[?([A-Za-z_$][\w$]*)\]?\s+-/,
              );
              return match ? [match[1]] : [];
            }),
          );

          for (const member of members) {
            const key = member.key ?? member.id;
            const name =
              key?.type === "Identifier" || key?.type === "Literal"
                ? String(key.name ?? key.value)
                : null;
            if (!name || documentedProperties.has(name)) continue;

            context.report({
              node: member,
              messageId: "missingProperty",
              data: { name },
            });
          }
        }

        return {
          /**
           * Verifies the fields declared by an interface.
           * @param {object} node - The interface declaration
           * @returns {void}
           */
          TSInterfaceDeclaration(node) {
            checkDeclarationProperties(node, node.body.body);
          },

          /**
           * Verifies the members declared by an object-shaped type alias.
           * @param {object} node - The type-alias declaration
           * @returns {void}
           */
          TSTypeAliasDeclaration(node) {
            if (node.typeAnnotation.type === "TSTypeLiteral") {
              checkDeclarationProperties(node, node.typeAnnotation.members);
            }
          },

          /**
           * Verifies the values declared by an enum.
           * @param {object} node - The enum declaration
           * @returns {void}
           */
          TSEnumDeclaration(node) {
            checkDeclarationProperties(node, node.body.members);
          },
        };
      },
    },
  },
};

export default [
  { ignores: ["**/dist/**", "**/node_modules/**"] },
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
      documentation: documentationSpacing,
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
          noSingleLineBlocks: false,
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
            "ClassDeclaration",
            "FunctionDeclaration",
            "MethodDefinition",
            "Property[method=true]",
            "TSInterfaceDeclaration",
            "TSTypeAliasDeclaration",
            "TSEnumDeclaration",
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
      "jsdoc/require-returns": ["error", { forceRequireReturn: true }],
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
      "documentation/blank-line-before-jsdoc": "error",
      "documentation/require-declaration-properties": "error",
      "documentation/require-named-function-jsdoc": "error",

      "nounsanitized/method": "error",
      "nounsanitized/property": "error",

      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/components/*", "@/hooks/*", "@/utils/*"],
              message: "Import from the owning app, feature, or shared module.",
            },
          ],
        },
      ],

      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
    },
  },
  {
    files: [
      "apps/travel-map/src/shared/**/*.ts",
      "apps/travel-map/src/shared/**/*.tsx",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/app/*",
                "@/components/*",
                "@/features/*",
                "@/hooks/*",
                "@/utils/*",
              ],
              message:
                "Shared modules cannot depend on app or feature internals.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "apps/travel-map/src/features/**/*.ts",
      "apps/travel-map/src/features/**/*.tsx",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/app/*",
                "@/components/*",
                "@/features/*",
                "@/hooks/*",
                "@/utils/*",
              ],
              message:
                "Features use relative imports internally and cannot depend on app or other feature internals.",
            },
            {
              regex:
                "^(?:\\.\\./)+(?:gallery|map|navigation|places|stats|timeline|trips)/",
              message:
                "Features cannot import another feature's private modules.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "apps/travel-map/src/data/**/*.ts",
      "apps/travel-map/src/data/**/*.tsx",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/*", "@/features/*", "@/shared/*"],
              message:
                "The data boundary may only depend on static data and core.",
            },
          ],
        },
      ],
    },
  },
];
