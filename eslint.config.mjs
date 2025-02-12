import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pluginJs from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'
import tsEslint from '@typescript-eslint/eslint-plugin'
import prettier from 'eslint-plugin-prettier'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const eslintCompat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: pluginJs.configs.recommended,
})

export default [
  ...eslintCompat.extends('eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'),
  {
    plugins: {
      '@typescript-eslint': tsEslint,
      prettier,
    },

    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    files: ['**/*.ts'],
    ignores: ['node_modules/**', 'dist/**'],
  },
]
