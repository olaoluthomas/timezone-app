module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation changes
        'style', // Formatting, missing semicolons, etc.
        'refactor', // Code refactoring
        'test', // Adding or updating tests
        'chore', // Build process, dependencies
        'perf', // Performance improvements
        'ci', // CI configuration
        'revert', // Revert previous commit
      ],
    ],
    'subject-case': [0], // Allow any case for subject
  },
};
