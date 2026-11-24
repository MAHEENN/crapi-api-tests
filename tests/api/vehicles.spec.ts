import { expect, test } from '@playwright/test';
import { login } from '../../src/api/auth-client';
import { fixtureAccount } from '../../src/data/accounts';
import { getVehicles } from '../../src/api/vehicle-client';

test('customer can retrieve their associated vehicle', async ({ request }) => {
  const result = await login(request, fixtureAccount('TEST'));

  expect(result.status, 'Login HTTP status').toBe(200);

  if (result.outcome !== 'authenticated') {
    throw new Error('Authentication failed');
  }
  // Extract the JWT
  const token = result.session.token;

  // Retrieve vehicles
  const vehicles = await getVehicles(request, token);

  //expect(vehicles.length, 'Expected at least one vehicle').toBeGreaterThan(0);

  // Find the expected vehicle
  const exppectedVehicle = {
    vin: 'ZX3NGPFA64NMYGB77', // Replace with the actual VIN you expect
    manufacturer: 'Audi', // Replace with the actual manufacturer you expect
    model: 'RS7', // Replace with the actual model you expect
    fuelType: 'PETROL', // Replace with the actual fuel type you expect
    year: 2026, // Replace with the actual year you expect
  };

  const expectedVehicle = vehicles.find(
    (vehicle) => vehicle.vin === exppectedVehicle.vin,
  );

  if (!expectedVehicle) {
    throw new Error(`Expected vehicle '${exppectedVehicle.vin}' not found`);
  }

  // Validate vehicle attributes
  expect(
    expectedVehicle.model.vehiclecompany.name,
    'Expected manufacturer',
  ).toBe(exppectedVehicle.manufacturer);
  expect(expectedVehicle.model.model, 'Expected model').toBe(
    exppectedVehicle.model,
  );
  expect(expectedVehicle.model.fuel_type, 'Expected fuel type').toBe(
    exppectedVehicle.fuelType,
  );
  expect(expectedVehicle.year, 'Expected year').toBe(exppectedVehicle.year);
});
