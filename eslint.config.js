import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

const sharedOptions = {
  extends: [
    js.configs.recommended,
    reactHooks.configs['recommended-latest'],
    reactRefresh.configs.vite,
  ],
  rules: {
    'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
  },
}

const parserOptions = {
  ecmaVersion: 'latest',
  ecmaFeatures: { jsx: true },
  sourceType: 'module',
}

export default defineConfig([
  // mobile/ is the Expo app - it has its own tooling (npx expo lint).
  globalIgnores(['dist', 'mobile']),
  {
    files: ['**/*.{js,jsx}'],
    ignores: ['core/**'],
    ...sharedOptions,
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions,
    },
  },
  // core/ is shared with the mobile app, so no browser globals: using
  // window, document or localStorage there fails lint. Platform-specific
  // things come in through core/config.js.
  {
    files: ['core/**/*.{js,jsx}'],
    ...sharedOptions,
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals['shared-node-browser'],
      parserOptions,
    },
  },
])
