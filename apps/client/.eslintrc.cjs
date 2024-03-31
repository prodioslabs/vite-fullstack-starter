const baseConfig = require('@repo/config/eslint.config.cjs')

/** @type {import('eslint').Linter.Config} */
const config = {
  ...baseConfig,
  extends: [...baseConfig.extends, 'plugin:react-hooks/recommended'],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  plugins: [...baseConfig.plugins, 'react-refresh'],
  rules: {
    ...baseConfig.rules,
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
}

module.exports = config
