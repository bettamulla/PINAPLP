import ttypescript from '@typescript-eslint/parser'
import * as reactPlugin from 'eslint-plugin-react'
import * as reactHooksPlugin from 'eslint-plugin-react-hooks'
import * as tsPlugin from '@typescript-eslint/eslint-plugin'
import * as nextPlugin from 'eslint-config-next'

export default [
  {
    ignores: ['.next/', 'node_modules/'],
  },
  {
    files: ['**/*.{js,ts,jsx,tsx}'],
    languageOptions: {
      parser: ttypescript,
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    files: ['**/actions/*.ts', '**/actions/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      'react/no-unescaped-entities': 'off',
    },
  },
  {
    files: ['**/components/*.{ts,tsx}'],
    rules: {
      'react/no-unescaped-entities': 'warn',
    },
  },
  {
    extends: ['eslint-config-next'],
  },
]