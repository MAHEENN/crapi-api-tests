import type { APIRequestContext } from '@playwright/test';

export interface LoginRequest {
  email: string;
  password: string;
}

interface LoginSuccess {
  token: string;
  type: 'Bearer';
  message: 'Login successful';
  mfaRequired: false;
}

export type LoginResponse =
  | { status: number; outcome: 'authenticated'; session: LoginSuccess }
  | { status: number; outcome: 'rejected' | 'unexpected' };

function classifyLogin(status: number, body: unknown): LoginResponse {
  if (typeof body !== 'object' || body === null)
    return { status, outcome: 'unexpected' };

  const fields = body as Record<string, unknown>;
  const { token, type, message, mfaRequired } = fields;
  if (
    status === 200 &&
    typeof token === 'string' &&
    /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token) &&
    type === 'Bearer' &&
    message === 'Login successful' &&
    mfaRequired === false
  ) {
    return {
      status,
      outcome: 'authenticated',
      session: { token, type, message, mfaRequired },
    };
  }
  if (
    status === 401 &&
    (token === null || token === '' || token === undefined) &&
    message === 'Invalid Credentials'
  ) {
    return { status, outcome: 'rejected' };
  }
  return { status, outcome: 'unexpected' };
}

export async function login(
  request: APIRequestContext,
  credentials: LoginRequest,
): Promise<LoginResponse> {
  if (process.env.DEBUG || process.env.NODE_DEBUG || process.env.PWDEBUG) {
    throw new Error(
      'Unset DEBUG, NODE_DEBUG and PWDEBUG before running credentialed tests.',
    );
  }

  const response = await request
    .post('/identity/api/auth/login', {
      data: credentials,
      maxRedirects: 0,
      timeout: 10_000,
    })
    .catch(() => {
      throw new Error(
        'Login request failed. Check crAPI reachability and TLS.',
      );
    });

  const status = response.status();
  try {
    const contentType = response.headers()['content-type'] ?? '';
    if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
      throw new Error('Login response must have a JSON content type.');
    }
    const body: unknown = await response.json().catch(() => {
      throw new Error('Login response contains invalid JSON.');
    });
    return classifyLogin(status, body);
  } finally {
    await response.dispose();
  }
}
