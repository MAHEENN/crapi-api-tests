import { expect, test } from '@playwright/test';
import { login } from '../../src/api/auth-client';
import { fixtureAccount, withIncorrectPassword } from '../../src/data/accounts';

test('successful login returns a bearer JWT without an MFA challenge', async ({
  request,
}) => {
  const result = await login(request, fixtureAccount('TEST'));

  expect(result.status, 'Login HTTP status').toBe(200);
  expect(
    result.outcome,
    'Expected a compact JWT, Bearer type, success message and MFA=false',
  ).toBe('authenticated');
});

test('login rejects an incorrect password without issuing a token', async ({
  request,
}) => {
  const result = await login(
    request,
    withIncorrectPassword(fixtureAccount('TEST')),
  );

  expect(result.status, 'Incorrect-password HTTP status').toBe(401);
  expect(
    result.outcome,
    'Expected an invalid-credentials response with no token',
  ).toBe('rejected');
});
