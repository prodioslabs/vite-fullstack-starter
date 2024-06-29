const baseConfig = require("@repo/config/eslint.config.cjs");

/** @type {import('eslint').Linter.Config} */
const config = {
  ...baseConfig,
  extends: [...baseConfig.extends, "plugin:react-hooks/recommended"],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  plugins: [...baseConfig.plugins, "react-refresh", "react"],
  rules: {
    ...baseConfig.rules,
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    "react/no-unknown-property": "error",
    "react/prop-types": "off",
    "react/self-closing-comp": ["error", { component: true, html: true }],
    "react/react-in-jsx-scope": "off",
  },
};

module.exports = config;
