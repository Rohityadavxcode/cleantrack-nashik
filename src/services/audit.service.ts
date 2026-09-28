import prisma from '@/lib/prisma';

export interface AuditActionParams {
  actorId?: string;
  actorName: string;
  action: 'STATUS_CHANGE' | 'ASSIGN_DEPARTMENT' | 'ASSIGN_OFFICER' | 'ADD_NOTE' | 'MARK_DUPLICATE' | 'SLA_UPDATE' | 'REOPEN' | 'CITIZEN_CONFIRMATION' | 'SYSTEM_SCAN';
  entityType?: string;
  entityId: string;
  previousValue?: string | null;
  newValue?: string | null;
  metadata?: Record<string, unknown>;
}

export class AuditService {
  /**
   * Appends an immutable audit log entry
   */
  public static async logAction(params: AuditActionParams): Promise<void> {
    try {
      await prisma.adminActionLog.create({
        data: {
          actorId: params.actorId,
          actorName: params.actorName,
          action: params.action,
          entityType: params.entityType || 'COMPLAINT',
          entityId: params.entityId,
          previousValue: params.previousValue,
          newValue: params.newValue,
          metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        },
      });
    } catch (err) {
      console.error('[AuditService Error] Failed to write audit record:', err);
    }
  }
}
