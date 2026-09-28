// CleanTrack Nashik - Core Types & Interfaces

export type UserRole = 'CITIZEN' | 'OFFICER' | 'DEPARTMENT_MANAGER' | 'ADMIN' | 'SUPER_ADMIN';

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'RECEIVED'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REJECTED'
  | 'DUPLICATE'
  | 'INVALID_LOCATION'
  | 'MORE_INFORMATION_REQUIRED'
  | 'REOPENED';

export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type FeedbackQuality = 'YES_RESOLVED' | 'NOT_FULLY_RESOLVED' | 'NO_STILL_EXISTS';

export interface CategoryInfo {
  id: string;
  code: string;
  name: string;
  nameMarathi: string;
  description?: string;
  icon: string;
  defaultDepartmentId?: string;
  defaultSlaHours: number;
  subcategories?: SubcategoryInfo[];
}

export interface SubcategoryInfo {
  id: string;
  categoryId: string;
  name: string;
  nameMarathi: string;
}

export interface NashikZone {
  code: string;
  name: string;
  nameMarathi: string;
  wardCount: number;
  centerLatitude: number;
  centerLongitude: number;
  officeAddress?: string;
  emergencyContact?: string;
}

export interface ComplaintLocationData {
  latitude: number;
  longitude: number;
  address: string;
  landmark?: string;
  zoneName: string;
  wardNumber?: string;
  locality?: string;
  postalCode?: string;
}

export interface ComplaintDetail {
  id: string;
  referenceId: string;
  title: string;
  description: string;
  categoryId: string;
  category?: CategoryInfo;
  subcategoryId?: string;
  subcategory?: SubcategoryInfo;
  status: ComplaintStatus;
  urgency: UrgencyLevel;
  duration?: string;
  isBlockingTraffic: boolean;
  isHealthHazard: boolean;
  citizenName: string;
  citizenMobile: string;
  citizenEmail?: string;
  citizenLanguage: string;
  departmentId?: string;
  department?: {
    id: string;
    name: string;
    nameMarathi: string;
    code: string;
  };
  assignedOfficerName?: string;
  slaDueAt?: string | Date;
  isOverdue: boolean;
  resolutionSummary?: string;
  resolutionPhoto?: string;
  resolvedAt?: string | Date;
  closedAt?: string | Date;
  isDuplicateFlagged: boolean;
  duplicateOfId?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  location?: ComplaintLocationData;
  photos: {
    id: string;
    url: string;
    caption?: string;
    isResolutionProof: boolean;
  }[];
  history: {
    id: string;
    fromStatus?: string;
    toStatus: string;
    changedByName: string;
    notes?: string;
    publicNote?: string;
    createdAt: string | Date;
  }[];
  feedback?: {
    resolutionQuality: FeedbackQuality;
    feedbackText?: string;
    feedbackPhoto?: string;
    rating?: number;
    createdAt: string | Date;
  };
}

export interface PublicComplaintView {
  referenceId: string;
  title: string;
  description: string;
  categoryName: string;
  categoryNameMarathi: string;
  categoryIcon: string;
  status: ComplaintStatus;
  urgency: UrgencyLevel;
  zoneName: string;
  address: string;
  latitude: number;
  longitude: number;
  photos: string[];
  resolutionPhoto?: string;
  resolutionSummary?: string;
  departmentName?: string;
  departmentNameMarathi?: string;
  createdAt: string;
  slaDueAt?: string;
  isOverdue: boolean;
  maskedCitizenName: string;
  maskedCitizenMobile: string;
  timeline: {
    status: string;
    changedByName: string;
    note?: string;
    timestamp: string;
  }[];
  feedback?: {
    resolutionQuality: FeedbackQuality;
    feedbackText?: string;
  };
}

export interface DuplicateCheckResult {
  isDuplicateSuspected: boolean;
  nearbyCount: number;
  closestComplaint?: {
    referenceId: string;
    title: string;
    distanceMeters: number;
    status: string;
    createdAt: string;
  };
}
