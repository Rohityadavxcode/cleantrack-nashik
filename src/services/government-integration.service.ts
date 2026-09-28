/**
 * CleanTrack Nashik - Government Integration Service Architecture
 *
 * This service provides an extensible interface and adapter pattern
 * for bi-directional synchronization with official municipal corporation
 * (e.g. Nashik Municipal Corporation / NMC) grievance portals when official
 * API endpoints and credentials become available.
 *
 * NOTE: Currently runs in MOCK/STUB mode. No real government credentials are used.
 */

export interface GovComplaintPayload {
  externalSystem: 'NMC_E_GOV';
  cleantrackRefId: string;
  categoryCode: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  zone: string;
  citizenName: string;
  citizenMobile: string;
  photos: string[];
}

export interface GovSyncResponse {
  success: boolean;
  officialReferenceNo?: string;
  assignedDepartment?: string;
  syncedAt: string;
  mode: 'MOCK' | 'LIVE';
  message: string;
}

export interface IGovernmentGateway {
  transmitComplaint(payload: GovComplaintPayload): Promise<GovSyncResponse>;
  pollStatus(officialReferenceNo: string): Promise<{
    officialStatus: string;
    lastUpdated: string;
    remarks?: string;
  }>;
}

/**
 * Mock Gateway for Local / Development demonstration
 */
class MockNashikGovGateway implements IGovernmentGateway {
  async transmitComplaint(payload: GovComplaintPayload): Promise<GovSyncResponse> {
    const mockGovId = `NMC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    console.log(`[GOV-INTEGRATION] Mock transmission for CleanTrack ID: ${payload.cleantrackRefId} -> Assigned NMC Docket: ${mockGovId}`);

    return {
      success: true,
      officialReferenceNo: mockGovId,
      assignedDepartment: `${payload.zone} Divisional Ward Office`,
      syncedAt: new Date().toISOString(),
      mode: 'MOCK',
      message: 'Complaint successfully queued in mock municipal integration buffer.',
    };
  }

  async pollStatus(officialReferenceNo: string) {
    return {
      officialStatus: 'OFFICIALLY_LOGGED',
      lastUpdated: new Date().toISOString(),
      remarks: 'Municipal field inspector assigned (Mock Sync).',
    };
  }
}

export class GovernmentIntegrationService {
  private static gateway: IGovernmentGateway = new MockNashikGovGateway();

  public static setGateway(customGateway: IGovernmentGateway) {
    this.gateway = customGateway;
  }

  public static async pushToMunicipalPortal(payload: GovComplaintPayload): Promise<GovSyncResponse> {
    return this.gateway.transmitComplaint(payload);
  }

  public static async checkStatus(officialReferenceNo: string) {
    return this.gateway.pollStatus(officialReferenceNo);
  }
}
