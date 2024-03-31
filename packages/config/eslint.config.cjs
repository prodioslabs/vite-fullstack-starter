/** @type {import('eslint').Linter.Config} */
const config = {
  env: {
    browser: true,
    node: true,
  },
  globals: {},
  extends: ['standard', 'plugin:import/typescript'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'import'],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  rules: {
    'no-undef': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-use-before-define': 'off',
    camelcase: 'off',
    'comma-dangle': 'off',
    'func-call-spacing': 'off',
    'import/no-absolute-path': 'off',
    'import/order': ['error', { groups: ['builtin', 'external', 'internal'] }],
    'import/un-resolved': 'off',
    indent: 'off',
    'multiline-ternary': 'off',
    'no-console': 'warn',
    'no-unused-expressions': 'off',
    'no-unused-vars': 'off',
    'no-use-before-define': 'off',
    'no-useless-constructor': 'off',
    'no-useless-escape': 'off',
    'prefer-regex-literals': 'off',
    'space-before-function-paren': 'off',
  },
}

module.exports = config
