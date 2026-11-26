import type { APIRequestContext } from '@playwright/test';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  number: string;
  picture_url: string | null;
  video_url: string | null;
  video_name: string | null;
  available_credit: number;
  video_id: number;
  role: UserRole;
}

export type UserRole =
  'ROLE_PREDEFINE' | 'ROLE_USER' | 'ROLE_MECHANIC' | 'ROLE_ADMIN';

function isUserRole(value: unknown): value is UserRole {
  return (
    value === 'ROLE_PREDEFINE' ||
    value === 'ROLE_USER' ||
    value === 'ROLE_MECHANIC' ||
    value === 'ROLE_ADMIN'
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isUserProfile(value: unknown): value is UserProfile {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.id === 'number' &&
    typeof value.name === 'string' &&
    typeof value.email === 'string' &&
    typeof value.number === 'string' &&
    (typeof value.picture_url === 'string' || value.picture_url === null) &&
    (typeof value.video_url === 'string' || value.video_url === null) &&
    (typeof value.video_name === 'string' || value.video_name === null) &&
    typeof value.available_credit === 'number' &&
    typeof value.video_id === 'number' &&
    isUserRole(value.role)
  );
}

export async function getUserProfile(
  request: APIRequestContext,
  token: string,
): Promise<UserProfile> {
  const response = await request.get('/identity/api/v2/user/dashboard', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeout: 10000, // 10 seconds
    maxRedirects: 0, // Prevent automatic redirects
    failOnStatusCode: false, // Do not throw on non-2xx status codes
  });

  try {
    if (response.status() !== 200) {
      throw new Error(
        `Failed to fetch user profile. Status: ${response.status()}`,
      );
    }

    const contentType = response.headers()['content-type'] ?? '';

    if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
      throw new Error('Profile response must have a JSON content type.');
    }

    const body: unknown = await response.json().catch(() => {
      throw new Error('Profile response contains invalid JSON.');
    });

    if (!isUserProfile(body)) {
      throw new Error('Response body is not a valid UserProfile');
    }
    return body;
  } finally {
    await response.dispose();
  }
}
