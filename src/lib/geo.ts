import { NASHIK_COORDINATES, NASHIK_ZONES } from './constants';

export interface GeoValidationResult {
  isWithin: boolean;
  distanceFromCenterKm?: number;
  nearestZone?: string;
  reason?: string;
}

/**
 * Calculates Haversine distance between two coordinates in kilometers.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Validates whether the given coordinates fall inside the configured
 * CleanTrack Nashik municipal corporation reporting boundary.
 */
export function isWithinNashikServiceArea(
  lat: number,
  lng: number,
  maxRadiusKm = 28
): GeoValidationResult {
  const bounds = NASHIK_COORDINATES.bounds;
  const center = NASHIK_COORDINATES.center;

  // 1. Direct bounding box check
  const inBoundingBox =
    lat >= bounds.minLat &&
    lat <= bounds.maxLat &&
    lng >= bounds.minLng &&
    lng <= bounds.maxLng;

  // 2. Radial check from Nashik City center
  const distFromCenter = calculateHaversineDistanceKm(
    lat,
    lng,
    center.lat,
    center.lng
  );

  const nearestZone = detectNashikZone(lat, lng);

  if (!inBoundingBox || distFromCenter > maxRadiusKm) {
    return {
      isWithin: false,
      distanceFromCenterKm: Math.round(distFromCenter * 10) / 10,
      nearestZone,
      reason: `Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)}) appear to be ~${Math.round(distFromCenter)}km outside the Nashik Municipal Corporation service boundary.`,
    };
  }

  return {
    isWithin: true,
    distanceFromCenterKm: Math.round(distFromCenter * 10) / 10,
    nearestZone,
  };
}

/**
 * Automatically determines the nearest Nashik administrative zone for coordinates.
 */
export function detectNashikZone(lat: number, lng: number): string {
  let closestZone = NASHIK_ZONES[0].name;
  let minDistance = Infinity;

  for (const zone of NASHIK_ZONES) {
    const dist = calculateHaversineDistanceKm(
      lat,
      lng,
      zone.centerLatitude,
      zone.centerLongitude
    );
    if (dist < minDistance) {
      minDistance = dist;
      closestZone = zone.name;
    }
  }

  return closestZone;
}

/**
 * Reverse geocodes coordinates via OpenStreetMap / Nominatim with polite headers and fallback.
 */
export async function reverseGeocodeAddress(
  lat: number,
  lng: number
): Promise<{ address: string; zoneName: string }> {
  const zoneName = detectNashikZone(lat, lng);
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'CleanTrackNashik/1.0 (civic-portal@cleantrack.local)',
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        return {
          address: data.display_name,
          zoneName,
        };
      }
    }
  } catch (err) {
    console.warn('Reverse geocoding network notice:', err);
  }

  return {
    address: `Near coordinates ${lat.toFixed(5)}, ${lng.toFixed(5)}, ${zoneName}, Nashik`,
    zoneName,
  };
}
