import prisma from '@/lib/prisma';
import { DuplicateCheckResult } from '@/types';

/**
 * Calculates Great-Circle Distance between two coordinates in meters
 * using the Haversine formula.
 */
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Radius of Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Checks if there is an existing active complaint within the threshold radius
 * (default 100 meters) in the same category within the last 30 days.
 */
export async function checkForDuplicateComplaints(
  categoryId: string,
  latitude: number,
  longitude: number,
  radiusMeters: number = 100
): Promise<DuplicateCheckResult> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Active statuses that count as open issues
  const activeStatuses = ['SUBMITTED', 'RECEIVED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'REOPENED'];

  // Query recent complaints in the same category
  const candidates = await prisma.complaint.findMany({
    where: {
      categoryId,
      status: { in: activeStatuses },
      createdAt: { gte: thirtyDaysAgo },
      location: { isNot: null },
    },
    include: {
      location: true,
    },
    take: 100,
  });

  let closestDistance = Infinity;
  let closestCandidate: (typeof candidates)[0] | null = null;
  let nearbyCount = 0;

  for (const item of candidates) {
    if (!item.location) continue;
    const dist = calculateHaversineDistanceMeters(
      latitude,
      longitude,
      item.location.latitude,
      item.location.longitude
    );

    if (dist <= radiusMeters) {
      nearbyCount++;
      if (dist < closestDistance) {
        closestDistance = dist;
        closestCandidate = item;
      }
    }
  }

  if (closestCandidate) {
    return {
      isDuplicateSuspected: true,
      nearbyCount,
      closestComplaint: {
        referenceId: closestCandidate.referenceId,
        title: closestCandidate.title,
        distanceMeters: closestDistance,
        status: closestCandidate.status,
        createdAt: closestCandidate.createdAt.toISOString(),
      },
    };
  }

  return {
    isDuplicateSuspected: false,
    nearbyCount: 0,
  };
}
