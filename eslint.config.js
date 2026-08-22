const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const globals = require('globals');

module.exports = defineConfig([
  globalIgnores(['dist/*', 'node_modules/*']),
  expoConfig,
  {
    files: ['babel.config.js'],
    languageOptions: { globals: globals.node },
  },
]);
