import { test, expect } from '@playwright/test';
import { login } from '../../src/api/auth-client';
import { addVehicle } from '../../src/api/vehicle-client';
import { fixtureAccount } from '../../src/data/accounts';

interface VehicleTestCase {
  name: string;
  vin: string;
  pincode: string;
  expectedHttpStatus: number;
  expectedBodyStatus?: number;
  expectedMessage: string;
}

const testCases: VehicleTestCase[] = [
  {
    name: 'Reject duplicate vehicle association',
    vin: '45F9HB458093932DT',
    pincode: '1234',
    expectedHttpStatus: 403,
    expectedBodyStatus: 403,
    expectedMessage: 'Sorry, This Vehicle is already added.',
  },
  {
    name: 'Reject non-existent vehicle',
    vin: 'ZZZZZZZZZZZZZZZZZ',
    pincode: '1234',
    expectedHttpStatus: 403,
    expectedBodyStatus: 403,
    expectedMessage: 'Sorry, This Vehicle is already added.',
  },
];

for (const testCase of testCases) {
  test(testCase.name, async ({ request }) => {
    // 1. Authenticate the user
    const loginResult = await login(request, fixtureAccount('TEST'));

    // 2. Verify authentication succeeded
    expect(loginResult.status, 'Login HTTP status').toBe(200);

    if (loginResult.outcome !== 'authenticated') {
      throw new Error('Authentication failed');
    }

    // 3. Construct the vehicle request data
    const vehicleData = {
      vin: testCase.vin,
      pincode: testCase.pincode,
    };

    // 4. Call addVehicle()
    const addVehicleResult = await addVehicle(
      request,
      loginResult.session.token,
      vehicleData,
    );

    // 5. Assert HTTP status
    expect(addVehicleResult.httpStatus, 'Add vehicle HTTP status').toBe(
      testCase.expectedHttpStatus,
    );

    // 6. Assert response body status
    if (testCase.expectedHttpStatus === 400) {
      if (
        !('status' in addVehicleResult.body) ||
        typeof addVehicleResult.body.status !== 'number'
      ) {
        throw new Error('Invalid vehicle response structure');
      }
      expect(addVehicleResult.body.status, 'Add vehicle body status').toBe(
        testCase.expectedBodyStatus,
      );
    } else {
      if (
        !('status' in addVehicleResult.body) ||
        typeof addVehicleResult.body.status !== 'number'
      ) {
        throw new Error('Invalid vehicle response structure');
      }
    }

    expect(addVehicleResult.body.status, 'Add vehicle body status').toBe(
      testCase.expectedBodyStatus,
    );

    // 7. Assert response message
    expect(addVehicleResult.body.message, 'Add vehicle message').toBe(
      testCase.expectedMessage,
    );
  });
}
