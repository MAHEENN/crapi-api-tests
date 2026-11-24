import type { APIRequestContext } from '@playwright/test';

interface VehicleCompany {
  id: number;
  name: string;
}

interface VehicleModel {
  id: number;
  model: string;
  fuel_type: string;
  vehicle_img: string;
  vehiclecompany: VehicleCompany;
}

interface Vehicle {
  id: number;
  uuid: string;
  pincode: string;
  vin: string;
  year: number;
  status: string;
  previousOwners: unknown[];
  model: VehicleModel;
  vehicleLocation: VehicleLocation;
  owner: unknown;
}

interface VehicleLocation {
  id: number;
  latitude: string;
  longitude: string;
}

export async function getVehicles(
  request: APIRequestContext,
  token: string,
): Promise<Vehicle[]> {
  const response = await request.get('/identity/api/v2/vehicle/vehicles', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeout: 10000, // 10 seconds
    maxRedirects: 0, // Prevent automatic redirects
  });

  try {
    const status = response.status();

    if (status !== 200) {
      throw new Error(`Failed to fetch vehicles: ${status}`);
    }

    const contentType = response.headers()['content-type'] ?? '';

    if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
      throw new Error('Vehicle response must have a JSON content type.');
    }

    const vehicles: unknown = await response.json();

    if (!Array.isArray(vehicles)) {
      throw new Error('Expected an array of vehicles.');
    }

    return vehicles as Vehicle[];
  } finally {
    await response.dispose();
  }
}
