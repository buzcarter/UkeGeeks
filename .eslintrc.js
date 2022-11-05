/* TODO: can't use AirBnB's "rules/imports" :(
 * would like to fix this so we can enforce cool stuff (like "eslint-disable-line import/no-unresolved")
 * and other stuff we'd immediately ignore (like "import/no-dynamic-require")
 */

// Note: When disabling or modifying linter rules, please include a brief explanation.
module.exports = {
  extends: [
    './node_modules/eslint-config-airbnb-base/rules/best-practices',
    './node_modules/eslint-config-airbnb-base/rules/errors',
    './node_modules/eslint-config-airbnb-base/rules/node',
    './node_modules/eslint-config-airbnb-base/rules/style',
    './node_modules/eslint-config-airbnb-base/rules/variables',
    './node_modules/eslint-config-airbnb-base/rules/es6',
    './node_modules/eslint-config-airbnb-base/rules/strict',
  ].map(require.resolve),

  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  env: {
    es6: true,
    node: true,
  },
  globals: {
  },
  ignorePatterns: [
    '/js/**/*.js',
    'src/js/ace/**/*.js',
    'src/js/libs/**/*.js',
  ],
  rules: {
    'default-case': 0, // Standard pattern.
    'function-paren-newline': 0,
    'no-plusplus': 0,
    // Remove unless we introduce prettier.
    'max-len': 0,

    // #region disabled during conversion
    'new-cap': 0,
    'no-alert': 0,
    'no-continue': 0,
    'no-param-reassign': 0,
    'no-underscore-dangle': 0,
    'no-use-before-define': 0,
    'prefer-destructuring': 0,
    eqeqeq: 0,
    // #endregion
  },
  overrides: [{
    files: ['jest.setup.js'],
    env: {
      jest: true,
    },
  }, {
    files: [
      '**/__mocks__/**/*.js',
      '**/*.mock.js',
      '**/*.test.js',
    ],
    globals: {
      $: true,
      debug: true,
      fdRequire: true,
      fdRequireJest: true,
      jest: true,
      mockComponents: true,
    },
  }],
};
