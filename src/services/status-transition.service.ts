/**
 * CleanTrack Nashik - Status Transition State Machine Service
 *
 * Enforces strict, auditable lifecycle transitions for civic complaints.
 * Prevents invalid or arbitrary state jumps (e.g., jumping from SUBMITTED directly to CLOSED).
 */

export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  SUBMITTED: [
    'RECEIVED',
    'UNDER_REVIEW',
    'ASSIGNED',
    'DUPLICATE',
    'INVALID_LOCATION',
    'REJECTED',
  ],
  RECEIVED: [
    'UNDER_REVIEW',
    'ASSIGNED',
    'DUPLICATE',
    'INVALID_LOCATION',
    'REJECTED',
  ],
  UNDER_REVIEW: [
    'ASSIGNED',
    'IN_PROGRESS',
    'MORE_INFORMATION_REQUIRED',
    'DUPLICATE',
    'INVALID_LOCATION',
    'REJECTED',
  ],
  ASSIGNED: [
    'IN_PROGRESS',
    'UNDER_REVIEW',
    'MORE_INFORMATION_REQUIRED',
    'REJECTED',
  ],
  IN_PROGRESS: [
    'RESOLVED',
    'MORE_INFORMATION_REQUIRED',
    'ASSIGNED',
  ],
  RESOLVED: [
    'CLOSED',
    'REOPENED',
    'IN_PROGRESS',
  ],
  CLOSED: [
    'REOPENED',
  ],
  REOPENED: [
    'ASSIGNED',
    'IN_PROGRESS',
    'UNDER_REVIEW',
  ],
  MORE_INFORMATION_REQUIRED: [
    'UNDER_REVIEW',
    'IN_PROGRESS',
    'REJECTED',
  ],
  DUPLICATE: [
    'UNDER_REVIEW',
    'CLOSED',
  ],
  INVALID_LOCATION: [
    'UNDER_REVIEW',
    'CLOSED',
  ],
  REJECTED: [
    'UNDER_REVIEW',
    'CLOSED',
  ],
};

export class StatusTransitionService {
  /**
   * Validates whether transition from currentStatus to nextStatus is permissible.
   * Super Admins can perform emergency overrides if forceOverride is true.
   */
  public static canTransition(
    currentStatus: string,
    nextStatus: string,
    forceOverride: boolean = false
  ): { allowed: boolean; reason?: string } {
    if (currentStatus === nextStatus) {
      return { allowed: true };
    }

    if (forceOverride) {
      return { allowed: true };
    }

    const allowedNextList = ALLOWED_TRANSITIONS[currentStatus];

    if (!allowedNextList || !allowedNextList.includes(nextStatus)) {
      return {
        allowed: false,
        reason: `Invalid status transition: Cannot move complaint directly from "${currentStatus}" to "${nextStatus}". Allowed next statuses are: ${allowedNextList?.join(', ') || 'None'}.`,
      };
    }

    return { allowed: true };
  }
}
