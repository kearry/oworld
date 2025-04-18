// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import globals from "globals"; // Import globals
import tseslint from 'typescript-eslint'; // Import typescript-eslint

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
});

// Start building the flat configuration array
const eslintConfig = [
    // 1. Global ignores (optional, often default)
    {
        ignores: ["node_modules/", ".next/", "out/", "build/"]
    },

    // 2. Language options for JavaScript/TypeScript files
    ...tseslint.configs.recommended, // Use recommended TypeScript rules as a base

    // 3. Next.js specific configurations using FlatCompat
    ...compat.extends("next/core-web-vitals"),

    // 4. Custom configuration object for rules overrides
    {
        files: ["**/*.ts", "**/*.tsx"], // Target TS/TSX files specifically
        // languageOptions needed if not covered by tseslint.configs.recommended
        // languageOptions: {
        //     parser: tseslint.parser,
        //     parserOptions: {
        //         project: true, // Assumes tsconfig.json is setup correctly
        //         ecmaFeatures: { jsx: true }
        //     },
        //     globals: {
        //         ...globals.browser,
        //         ...globals.node,
        //         React: "readonly", // Define React global if needed
        //     }
        // },
        // plugins definition might be needed if not inferred
        // plugins: {
        //     '@typescript-eslint': tseslint.plugin,
        // },
        rules: {
             // Inherit/override rules from tseslint.configs.recommended if needed
             // Example: '@typescript-eslint/explicit-function-return-type': 'off',

             // Rules previously in .eslintrc.json
            "max-len": ["error", { "code": 130, "ignoreUrls": true, "ignoreStrings": true, "ignoreTemplateLiterals": true }],
            "react/no-unescaped-entities": "off", // This applies to JSX
            "@next/next/no-img-element": "off",

            // Rule override for the specific issue
            "@typescript-eslint/no-explicit-any": "warn" // Keep as warn
        }
    },

     // 5. Configuration for JSX files (if rules specific to JSX needed beyond TSX)
     {
        files: ["**/*.jsx", "**/*.tsx"],
        rules: {
            "react/no-unescaped-entities": "off",
             // Add other React-specific rules here if necessary
        }
     },

    // 6. Prettier configuration (load last to override styling rules)
    ...compat.extends("prettier"), // Use compat layer for prettier config
];

export default eslintConfig;