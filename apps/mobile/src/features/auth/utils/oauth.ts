import type { OAuthProvider } from '../types/auth.types';

export interface SupabaseOAuthConfig {
  supabaseProvider: 'google' | 'azure';
  label: string;
  scopes?: string;
  queryParams: {
    prompt: 'select_account';
  };
}

const MOBILE_OAUTH_CONFIG: Record<OAuthProvider, SupabaseOAuthConfig> = {
  google: {
    supabaseProvider: 'google',
    label: 'Google',
    queryParams: {
      prompt: 'select_account',
    },
  },
  microsoft: {
    supabaseProvider: 'azure',
    label: 'Microsoft',
    scopes: 'email',
    queryParams: {
      prompt: 'select_account',
    },
  },
};

export function getSupabaseOAuthConfig(provider: OAuthProvider): SupabaseOAuthConfig {
  return MOBILE_OAUTH_CONFIG[provider];
}

function parseParamSegment(segment: string, out: Record<string, string>): void {
  for (const pair of segment.split('&')) {
    if (!pair) continue;
    const eqIdx = pair.indexOf('=');
    const rawKey = eqIdx >= 0 ? pair.slice(0, eqIdx) : pair;
    const rawVal = eqIdx >= 0 ? pair.slice(eqIdx + 1) : '';
    try {
      const key = decodeURIComponent(rawKey.replace(/\+/g, ' '));
      const val = decodeURIComponent(rawVal.replace(/\+/g, ' '));
      if (key) {
        out[key] = val;
      }
    } catch {
      if (rawKey) {
        out[rawKey] = rawVal;
      }
    }
  }
}

/**
 * Extrae parámetros de query (`?code=...`) y fragment (`#access_token=...`)
 * de una URL de retorno OAuth en React Native sin depender de URLSearchParams nativo.
 */
export function parseOAuthCallbackUrl(callbackUrl: string): Record<string, string> {
  const out: Record<string, string> = {};
  const hashIdx = callbackUrl.indexOf('#');
  const beforeHash = hashIdx >= 0 ? callbackUrl.slice(0, hashIdx) : callbackUrl;
  const fragment = hashIdx >= 0 ? callbackUrl.slice(hashIdx + 1) : '';
  const queryIdx = beforeHash.indexOf('?');
  const query = queryIdx >= 0 ? beforeHash.slice(queryIdx + 1) : '';

  if (query) {
    parseParamSegment(query, out);
  }
  if (fragment) {
    parseParamSegment(fragment, out);
  }
  return out;
}
