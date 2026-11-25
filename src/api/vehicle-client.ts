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

interface AddVehicleRequest {
  vin: string;
  pincode: string;
}

interface AddVehicleResponse {
  message: string;
  status: number;
}

type VehicleResponseBody = AddVehicleResponse | VehicleValidationError;

interface AddVehicleResult {
  httpStatus: number;
  body: VehicleResponseBody;
}

interface VehicleValidationError {
  message: string;
  details?: string;
}

export async function addVehicle(
  request: APIRequestContext,
  token: string,
  vehicleData: AddVehicleRequest,
): Promise<AddVehicleResult> {
  const response = await request.post('/identity/api/v2/vehicle/add_vehicle', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: vehicleData,
    timeout: 10000, // 10 seconds
    maxRedirects: 0, // Prevent automatic redirects
    failOnStatusCode: false, // Allow handling of non-2xx responses
  });

  try {
    const status = response.status();

    const contentType = response.headers()['content-type'] ?? '';

    if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
      throw new Error('Add vehicle response must have a JSON content type.');
    }

    const body: unknown = await response.json().catch(() => {
      throw new Error('Add vehicle response contains invalid JSON');
    });

    if (
      typeof body !== 'object' ||
      body === null ||
      !('message' in body) ||
      typeof body.message !== 'string'
    ) {
      throw new Error('Invalid vehicle response structure');
    }

    if (status === 400) {
      if ('details' in body) {
        if (typeof body.details !== 'string') {
          throw new Error('Invalid vehicle validation response');
        }

        return {
          httpStatus: status,
          body: {
            message: body.message,
            details: body.details,
          },
        };
      }

      return {
        httpStatus: status,
        body: {
          message: body.message,
        },
      };
    }

    if (status !== 200 && status !== 403) {
      throw new Error(`Unexpected HTTP status: ${status}`);
    }

    if (!('status' in body) || typeof body.status !== 'number') {
      throw new Error('Invalid vehicle response structure');
    }

    return {
      httpStatus: status,
      body: {
        message: body.message,
        status: body.status,
      },
    };
  } finally {
    await response.dispose();
  }
}
