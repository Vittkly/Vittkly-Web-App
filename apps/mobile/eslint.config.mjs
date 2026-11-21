import expoConfig from 'eslint-config-expo/flat.js';

export default [
  ...expoConfig,
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.expo/**',
      'ios/**',
      'android/**',
      'web-build/**',
      'supabase/**',
    ],
  },
  {
    files: [
      'src/app/**/*.{ts,tsx}',
      'src/components/**/*.{ts,tsx}',
      'src/features/**/components/**/*.{ts,tsx}',
      'src/features/**/screens/**/*.{ts,tsx}',
      'src/features/**/hooks/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/services/supabase',
              message:
                'Direct Supabase client import is forbidden in UI layers. Use domain services and custom hooks instead (Repository Pattern).',
            },
            {
              name: '../services/supabase',
              message:
                'Direct Supabase client import is forbidden in UI layers. Use domain services and custom hooks instead (Repository Pattern).',
            },
            {
              name: '../../services/supabase',
              message:
                'Direct Supabase client import is forbidden in UI layers. Use domain services and custom hooks instead (Repository Pattern).',
            },
          ],
          patterns: [
            {
              group: ['**/services/supabase*'],
              message:
                'Direct Supabase client import is forbidden in UI layers. Use domain services and custom hooks instead (Repository Pattern).',
            },
          ],
        },
      ],
    },
  },
  {
    // Guardrail Thin Routing: las rutas y layouts de src/app deben ser orquestadores ultraligeros
    files: ['src/app/**/*.{ts,tsx}'],
    rules: {
      'max-lines': [
        'error',
        {
          max: 80,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },
  {
    // Guardrail Componentes & Screens: modularización estricta (máximo 250 líneas)
    files: [
      'src/components/**/*.{ts,tsx}',
      'src/features/**/components/**/*.{ts,tsx}',
      'src/features/**/screens/**/*.{ts,tsx}',
      'src/features/**/hooks/**/*.{ts,tsx}',
    ],
    rules: {
      'max-lines': [
        'error',
        {
          max: 250,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },
  {
    // Guardrail Acyclic Features: prohíbe importar desde el alias global @/features/auth
    // dentro de src/features/auth para evitar ciclos de dependencias con index.ts
    files: ['src/features/auth/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/auth', '@/features/auth/*'],
              message:
                'Las importaciones internas en src/features/auth deben ser relativas para evitar ciclos de dependencias con el barrel export.',
            },
          ],
        },
      ],
    },
  },
];
