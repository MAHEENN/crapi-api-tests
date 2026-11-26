import { expect } from '@playwright/test';
import { test } from '../fixtures/authenticated-api';
import { getUserProfile } from '../../src/api/profile-client';
import { fixtureAccount } from '../../src/data/accounts';

test('Authenticated user can retrieve their own profile', async ({
  authenticatedApi,
}) => {
  const userProfile = await getUserProfile(
    authenticatedApi.request,
    authenticatedApi.token,
  );

  const expectedAccount = fixtureAccount('TEST');

  expect(userProfile.email, 'User email').toBe(expectedAccount.email);

  expect(userProfile.role, 'User role').toBe('ROLE_USER');
});
