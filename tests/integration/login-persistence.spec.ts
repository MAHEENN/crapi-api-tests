import { expect, test } from '@playwright/test';
import { login } from '../../src/api/auth-client';
import { requireEnv } from '../../src/config/env';
import { fixtureAccount } from '../../src/data/accounts';
import { readStoredLogin } from '../../src/db/login-persistence';

test('successful login persists the returned JWT for the fixture account', async ({
  request,
}) => {
  const account = fixtureAccount('INTEGRATION');
  const databaseUrl = requireEnv('CRAPI_DATABASE_URL');
  const result = await login(request, account);

  expect(result.status, 'Login HTTP status').toBe(200);
  if (result.outcome !== 'authenticated')
    throw new Error('Expected an authenticated login response.');

  const stored = await readStoredLogin(
    account.email,
    databaseUrl,
    result.session.token,
  );
  expect(
    stored.rowCount,
    'Expected exactly one fixture row (read capped at two)',
  ).toBe(1);
  expect(
    stored.tokenMatches,
    'Persisted JWT must match the HTTP response',
  ).toBe(true);
});
