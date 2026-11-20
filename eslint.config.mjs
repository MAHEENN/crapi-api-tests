import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores([
    'test-results/**',
    'playwright-report/**',
    'blob-report/**',
    'coverage/**',
  ]),
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.recommended],
    rules: { 'no-console': 'error' },
  },
);
