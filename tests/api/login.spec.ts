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

test('login does not reveal whether an email is registered', async ({
  request,
}) => {
  // Request A: Unregistered email
  const unknownUserResponse = await request.post(
    '/identity/api/auth/login',
    {
      data: {
        email: 'nonexistent@example.invalid',
        password: 'deliberately-wrong',
      },
    },
  );

  const unknownUserBody = await unknownUserResponse.json();

  // Request B: Registered email, incorrect password
  const registeredAccount = withIncorrectPassword(fixtureAccount('TEST'));

  const registeredUserResponse = await request.post(
    '/identity/api/auth/login',
    {
      data: registeredAccount,
    },
  );

  const registeredUserBody = await registeredUserResponse.json();

  // Both login attempts must be rejected
  expect(unknownUserResponse.status()).toBe(401);
  expect(registeredUserResponse.status()).toBe(401);

  // Security assertion: Do not disclose whether the account exists
  expect(unknownUserBody.message).toBe(registeredUserBody.message);
});
