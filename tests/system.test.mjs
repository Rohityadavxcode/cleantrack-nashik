import test from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';

// 1. Zod Validation Schema for Complaints
const complaintSubmissionSchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(15).max(1500),
  categoryId: z.string().min(1),
  citizenName: z.string().min(2),
  citizenMobile: z.string().regex(/^[6-9]\d{9}$/),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().min(3),
  zoneName: z.string().min(1),
});

// 2. Haversine Distance Implementation
function calculateHaversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
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

// 3. Privacy Masking Helpers
function maskName(name) {
  if (!name || name.length <= 2) return '**';
  const parts = name.split(' ');
  return parts
    .map((p) => (p.length > 2 ? `${p[0]}${'*'.repeat(p.length - 2)}${p[p.length - 1]}` : `${p[0]}*`))
    .join(' ');
}

function maskMobile(mobile) {
  if (!mobile || mobile.length < 10) return '******';
  return `******${mobile.slice(-4)}`;
}

// 4. SLA Calculator
function calculateSlaHours(urgency, defaultHours = 48) {
  if (urgency === 'CRITICAL') return 12;
  if (urgency === 'HIGH') return 24;
  if (urgency === 'LOW') return 72;
  return defaultHours;
}

// TESTS

test('Validation: Valid complaint data passes Zod validation', () => {
  const validData = {
    title: 'Garbage accumulation on College Road',
    description: 'Waste has not been picked up for 3 days near Big Bazaar junction.',
    categoryId: 'cat-garbage',
    citizenName: 'Ramesh Patil',
    citizenMobile: '9876543210',
    latitude: 20.0042,
    longitude: 73.7638,
    address: 'College Road, Nashik',
    zoneName: 'Nashik West Zone',
  };

  const parsed = complaintSubmissionSchema.safeParse(validData);
  assert.equal(parsed.success, true);
});

test('Validation: Invalid mobile number is rejected', () => {
  const invalidData = {
    title: 'Garbage accumulation on College Road',
    description: 'Waste has not been picked up for 3 days near Big Bazaar junction.',
    categoryId: 'cat-garbage',
    citizenName: 'Ramesh Patil',
    citizenMobile: '12345', // Invalid
    latitude: 20.0042,
    longitude: 73.7638,
    address: 'College Road, Nashik',
    zoneName: 'Nashik West Zone',
  };

  const parsed = complaintSubmissionSchema.safeParse(invalidData);
  assert.equal(parsed.success, false);
});

test('Validation: Too short description (<15 chars) is rejected', () => {
  const invalidData = {
    title: 'Garbage issue',
    description: 'Bad smell', // only 9 chars
    categoryId: 'cat-garbage',
    citizenName: 'Ramesh Patil',
    citizenMobile: '9876543210',
    latitude: 20.0042,
    longitude: 73.7638,
    address: 'College Road, Nashik',
    zoneName: 'Nashik West Zone',
  };

  const parsed = complaintSubmissionSchema.safeParse(invalidData);
  assert.equal(parsed.success, false);
});

test('Geospatial: Haversine distance calculates accurate proximity in Nashik', () => {
  // Ramkund Ghat (20.0068, 73.7925) and Sita Gufa nearby (20.0080, 73.7940)
  const dist = calculateHaversineDistanceMeters(20.0068, 73.7925, 20.0080, 73.7940);
  assert.ok(dist > 100 && dist < 250, `Distance was ${dist}m, expected ~200m`);

  // Identical coordinates return 0
  const sameDist = calculateHaversineDistanceMeters(20.0068, 73.7925, 20.0068, 73.7925);
  assert.equal(sameDist, 0);
});

test('Privacy Guard: Masking hides sensitive citizen contact numbers and names', () => {
  const maskedPhone = maskMobile('9876543210');
  assert.equal(maskedPhone, '******3210');

  const maskedCitizen = maskName('Ramesh Patil');
  assert.equal(maskedCitizen, 'R****h P***l');
});

test('SLA Engine: Properly assigns emergency target hours based on urgency', () => {
  assert.equal(calculateSlaHours('CRITICAL'), 12);
  assert.equal(calculateSlaHours('HIGH'), 24);
  assert.equal(calculateSlaHours('MEDIUM'), 48);
  assert.equal(calculateSlaHours('LOW'), 72);
});

test('Lifecycle: Citizen confirmation transitions work properly', () => {
  function determineNextStatus(currentStatus, quality) {
    if (quality === 'YES_RESOLVED') return 'CLOSED';
    if (quality === 'NO_STILL_EXISTS') return 'REOPENED';
    if (quality === 'NOT_FULLY_RESOLVED') return 'IN_PROGRESS';
    return currentStatus;
  }

  assert.equal(determineNextStatus('RESOLVED', 'YES_RESOLVED'), 'CLOSED');
  assert.equal(determineNextStatus('RESOLVED', 'NO_STILL_EXISTS'), 'REOPENED');
  assert.equal(determineNextStatus('RESOLVED', 'NOT_FULLY_RESOLVED'), 'IN_PROGRESS');
});
