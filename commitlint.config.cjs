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
        'build', // Build system changes
        'revert', // Revert previous commit
        'deps', // Dependency updates
      ],
    ],
    'subject-case': [0], // Allow any case for subject
  },
};
