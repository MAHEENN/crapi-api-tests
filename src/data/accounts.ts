import { randomUUID } from 'node:crypto';
import type { LoginRequest } from '../api/auth-client';
import { requireEnv } from '../config/env';

export function fixtureAccount(scope: 'TEST' | 'INTEGRATION'): LoginRequest {
  return {
    email: requireEnv(`CRAPI_${scope}_EMAIL`),
    password: requireEnv(`CRAPI_${scope}_PASSWORD`),
  };
}

export function withIncorrectPassword(account: LoginRequest): LoginRequest {
  return { ...account, password: `Incorrect-${randomUUID()}!1` };
}
