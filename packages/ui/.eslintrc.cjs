module.exports = require('@repo/config/eslint.config.cjs')

const baseConfig = require('@repo/config/eslint.config.cjs')

/** @type {import('eslint').Linter.Config} */
const config = {
  ...baseConfig,
  extends: [...baseConfig.extends, 'plugin:react-hooks/recommended'],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  plugins: [...baseConfig.plugins, 'react'],
  rules: {
    ...baseConfig.rules,
    'react/no-unknown-property': 'error',
    'react/prop-types': 'off',
    'react/self-closing-comp': ['error', { component: true, html: true }],
    'react/react-in-jsx-scope': 'off',
  },
}

module.exports = config
