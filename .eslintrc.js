module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // Warn on console.log (should use proper logger in production)
    'no-console': ['warn', { allow: ['error', 'warn'] }],

    // Error on unused variables
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

    // Prefer const over let when variable is not reassigned
    'prefer-const': 'error',

    // Require === instead of ==
    'eqeqeq': ['error', 'always'],

    // Disallow multiple empty lines
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],

    // Require semicolons
    'semi': ['error', 'always'],

    // Enforce consistent quotes
    'quotes': ['error', 'single', { avoidEscape: true }],

    // Trailing commas for multi-line
    'comma-dangle': ['error', 'only-multiline'],
  },
};
