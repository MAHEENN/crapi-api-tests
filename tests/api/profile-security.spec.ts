import { expect } from '@playwright/test';
import { test } from '../fixtures/authenticated-api';
import { getUserProfile } from '../../src/api/profile-client';

test('Profile API exposes only permitted fields', async ({
  authenticatedApi,
}) => {
  const profile = await getUserProfile(
    authenticatedApi.request,
    authenticatedApi.token,
  );

  // Define allowed fields
  const allowedFields = [
    'id',
    'name',
    'email',
    'number',
    'picture_url',
    'video_url',
    'video_name',
    'available_credit',
    'video_id',
    'role',
  ];

  // Compare actual fields with allowed fields
  const actualFields = Object.keys(profile);

  expect(actualFields.sort(), 'Profile fields').toEqual(allowedFields.sort());
});
