import { test as base, type APIRequestContext } from '@playwright/test';

import { login } from '../../src/api/auth-client';
import { fixtureAccount } from '../../src/data/accounts';

interface AuthenticatedApiFixtures {
  authenticatedApi: AuthenticatedApi;
}

interface AuthenticatedApi {
  request: APIRequestContext;
  token: string;
}

export const test = base.extend<AuthenticatedApiFixtures>({
  authenticatedApi: async ({ request }, use) => {
    // 1. Call the login helper
    const loginResult = await login(request, fixtureAccount('TEST'));

    // 2. Check the authentication outcome
    if (loginResult.outcome !== 'authenticated') {
      throw new Error(
        `Authentication failed with status ${loginResult.status} and outcome ${loginResult.outcome}`,
      );
    }
    // 3. Extract the token
    const token = loginResult.session.token;

    // 4. Provide the resource using await use()
    await use({
      request,
      token,
    });
  },
});
