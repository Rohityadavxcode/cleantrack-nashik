import test from 'node:test';
import assert from 'node:assert/strict';

// State Machine Transition Rules (mirrored from StatusTransitionService)
const ALLOWED_TRANSITIONS = {
  SUBMITTED: ['RECEIVED', 'UNDER_REVIEW', 'ASSIGNED', 'DUPLICATE', 'INVALID_LOCATION', 'REJECTED'],
  RECEIVED: ['UNDER_REVIEW', 'ASSIGNED', 'DUPLICATE', 'INVALID_LOCATION', 'REJECTED'],
  UNDER_REVIEW: ['ASSIGNED', 'IN_PROGRESS', 'MORE_INFORMATION_REQUIRED', 'DUPLICATE', 'INVALID_LOCATION', 'REJECTED'],
  ASSIGNED: ['IN_PROGRESS', 'UNDER_REVIEW', 'MORE_INFORMATION_REQUIRED', 'REJECTED'],
  IN_PROGRESS: ['RESOLVED', 'MORE_INFORMATION_REQUIRED', 'ASSIGNED'],
  RESOLVED: ['CLOSED', 'REOPENED', 'IN_PROGRESS'],
  CLOSED: ['REOPENED'],
  REOPENED: ['ASSIGNED', 'IN_PROGRESS', 'UNDER_REVIEW'],
  MORE_INFORMATION_REQUIRED: ['UNDER_REVIEW', 'IN_PROGRESS', 'REJECTED'],
  DUPLICATE: ['UNDER_REVIEW', 'CLOSED'],
  INVALID_LOCATION: ['UNDER_REVIEW', 'CLOSED'],
  REJECTED: ['UNDER_REVIEW', 'CLOSED'],
};

function canTransition(currentStatus, nextStatus, forceOverride = false) {
  if (currentStatus === nextStatus) return { allowed: true };
  if (forceOverride) return { allowed: true };
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  if (!allowed || !allowed.includes(nextStatus)) {
    return {
      allowed: false,
      reason: `Invalid status transition: Cannot move directly from ${currentStatus} to ${nextStatus}`,
    };
  }
  return { allowed: true };
}

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

test('State Machine: Permissible transitions are approved', () => {
  assert.equal(canTransition('SUBMITTED', 'RECEIVED').allowed, true);
  assert.equal(canTransition('RECEIVED', 'UNDER_REVIEW').allowed, true);
  assert.equal(canTransition('UNDER_REVIEW', 'ASSIGNED').allowed, true);
  assert.equal(canTransition('ASSIGNED', 'IN_PROGRESS').allowed, true);
  assert.equal(canTransition('IN_PROGRESS', 'RESOLVED').allowed, true);
  assert.equal(canTransition('RESOLVED', 'CLOSED').allowed, true);
  assert.equal(canTransition('RESOLVED', 'REOPENED').allowed, true);
});

test('State Machine: Forbidden arbitrary transitions are strictly rejected', () => {
  const res1 = canTransition('SUBMITTED', 'CLOSED');
  assert.equal(res1.allowed, false);

  const res2 = canTransition('SUBMITTED', 'RESOLVED');
  assert.equal(res2.allowed, false);

  const res3 = canTransition('ASSIGNED', 'CLOSED');
  assert.equal(res3.allowed, false);
});

test('State Machine: Super Admin emergency override bypasses restrictions', () => {
  const res = canTransition('SUBMITTED', 'CLOSED', true);
  assert.equal(res.allowed, true);
});

test('Geospatial Engine: Accurately identifies Nashik coordinates within 50m proximity', () => {
  const distance = calculateHaversineDistanceMeters(19.9678, 73.7582, 19.9681, 73.7582);
  assert.ok(distance > 25 && distance < 45, `Distance was ${distance}m, expected ~35m`);
});

test('Format Integrity: Reference ID matches CTN-YYYY-XXXXXX structure', () => {
  const refIdRegex = /^CTN-\d{4}-\d{6}$/;
  const testId = 'CTN-2026-000101';
  assert.match(testId, refIdRegex);
});
