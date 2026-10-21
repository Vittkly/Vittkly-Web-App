import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'node_modules/**',
  ]),
  {
    files: ['src/components/**/*.{ts,tsx}', 'src/app/**/*.{ts,tsx}'],
    ignores: ['src/app/auth/callback/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/lib/supabase/*', '../lib/supabase/*', '../../lib/supabase/*'],
              message:
                'Prohibido importar clientes de Supabase directamente en componentes de presentación o rutas de src/app. Usa los servicios o repositorios en src/features/[feature]/services/.',
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
