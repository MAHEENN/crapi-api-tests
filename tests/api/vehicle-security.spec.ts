import { test, expect } from '@playwright/test';
import { login } from '../../src/api/auth-client';
import { addVehicle } from '../../src/api/vehicle-client';
import { fixtureAccount } from '../../src/data/accounts';

test('SEC-002: Validation errors must not expose sensitive information', async ({
  request,
}) => {
  // 1. Authenticate the user
  const loginResult = await login(request, fixtureAccount('TEST'));

  // 2. Verify authentication succeeded
  expect(loginResult.status, 'Login HTTP status').toBe(200);
  if (loginResult.outcome !== 'authenticated') {
    throw new Error('Authentication failed');
  }
  // 3. Prepare synthetic invalid vehicle data
  const invalidVehicleData = {
    vin: '45F9HB458093932DT',
    pincode: '123',
  };

  // 4. Call addVehicle()
  const addVehicleResult = await addVehicle(
    request,
    loginResult.session.token,
    invalidVehicleData,
  );

  // 5. Assert HTTP status is 400
  expect(addVehicleResult.httpStatus, 'Add vehicle HTTP status').toBe(400);

  // 6. Verify the response does not expose internal information

  if (!('details' in addVehicleResult.body)) {
    throw new Error('Expected a validation response');
  }

  const details = addVehicleResult.body.details ?? '';

  // 7. Assert that the details do not contain sensitive information
  const containsRejectedInput = details.includes(
    `rejected value [${invalidVehicleData.pincode}]`,
  );

  const containsFrameworkDiagnostics = details.includes(
    'BeanPropertyBindingResult',
  );

  const containsInternalPackage = details.includes(
    'org.springframework.validation',
  );

  expect
    .soft(containsRejectedInput, 'Details should not contain rejected input')
    .toBe(false);
  expect
    .soft(
      containsFrameworkDiagnostics,
      'Details should not contain framework diagnostics',
    )
    .toBe(false);
  expect
    .soft(
      containsInternalPackage,
      'Details should not contain internal package information',
    )
    .toBe(false);
});
