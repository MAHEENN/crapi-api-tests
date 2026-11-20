import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

export function loadLocalEnvironment(): void {
  if (existsSync('.env')) {
    try {
      loadEnvFile('.env');
    } catch {
      throw new Error('Cannot load .env. Check its permissions and format.');
    }
  }
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value?.trim()) throw new Error(`Set ${name} before running this test.`);
  return value;
}

export function apiBaseUrl(): string {
  const value = process.env.CRAPI_BASE_URL ?? 'http://localhost:8888';
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('CRAPI_BASE_URL must be an HTTP or HTTPS origin.');
  }
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      'CRAPI_BASE_URL must be an HTTP or HTTPS origin without credentials or a path.',
    );
  }
  if (
    url.protocol === 'http:' &&
    !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
  ) {
    throw new Error('CRAPI_BASE_URL requires HTTPS outside loopback.');
  }
  return url.origin;
}
