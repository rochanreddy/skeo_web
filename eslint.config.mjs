import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) })

export default [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  // studio/ is its own npm project (the Sanity Studio), linted by its own tooling.
  { ignores: ['.next/**', 'node_modules/**', 'studio/**'] },
  {
    rules: {
      // A leading underscore marks an argument that is part of a signature we
      // are keeping deliberately — the stubbed OTP and payment calls take the
      // arguments their real counterparts will need.
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
]
