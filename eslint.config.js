// eslint.config.js - ESLint 9 Flat Config Format
import js from '@eslint/js';
import globals from 'globals';

export default [
  // Apply to all JS files
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
        ...globals.jest,
      },
    },
  },

  // Use ESLint recommended rules
  js.configs.recommended,

  // Custom rules
  {
    rules: {
      // Warn on console.log (allow error/warn)
      'no-console': ['warn', { allow: ['error', 'warn'] }],

      // Error on unused variables
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Prefer const over let when variable is not reassigned
      'prefer-const': 'error',

      // Require === instead of ==
      eqeqeq: ['error', 'always'],

      // Disallow multiple empty lines
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],

      // Require semicolons
      semi: ['error', 'always'],

      // Enforce consistent quotes
      quotes: ['error', 'single', { avoidEscape: true }],

      // Trailing commas for multi-line
      'comma-dangle': ['error', 'only-multiline'],
    },
  },

  // Ignore patterns
  {
    ignores: ['node_modules/**', 'coverage/**', '.github/**'],
  },
];
