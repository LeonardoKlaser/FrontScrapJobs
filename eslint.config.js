// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook'

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-plugin-prettier'

export default tseslint.config([
  globalIgnores(['dist', 'coverage', 'node_modules', 'eslint.config.js', 'storybook-static', '.storybook', 'vitest.shims.d.ts']),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  defineConfig({
    files: ['**/*.{js,cjs,mjs,ts,tsx}'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      prettier
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.node.json', './tsconfig.test.json'],
        tsconfigRootDir: decodeURIComponent(new URL('.', import.meta.url).pathname),
      },
    },
    rules: {
      semi: ['error', 'never'],
      'comma-dangle': ['error', 'never'],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { args: 'none', ignoreRestSiblings: true }
      ],
      'max-len': [
        'warn',
        {
          code: 100,
          tabWidth: 2,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreComments: false
        }
      ],
      'no-trailing-spaces': 'error',
      'no-multiple-empty-lines': [
        'error',
        { max: 1, maxEOF: 0, maxBOF: 0 }
      ],
      'eol-last': ['error', 'always'],
      'no-console': 'off',
      'prettier/prettier': [
        'error',
        {
          semi: false,
          singleQuote: true,
          trailingComma: 'none',
          tabWidth: 2,
          printWidth: 100,
          endOfLine: 'lf'
        }
      ]
    }
  }),
], storybook.configs['flat/recommended'])
