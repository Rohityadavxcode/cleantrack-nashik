import { NextResponse } from 'next/server';
import { ReminderService } from '@/services/reminder.service';
import { AuditService } from '@/services/audit.service';

export async function POST() {
  try {
    const result = await ReminderService.executeSlaScan();

    await AuditService.logAction({
      actorName: 'System SLA Cron Engine',
      action: 'SYSTEM_SCAN',
      entityId: 'SYSTEM',
      previousValue: null,
      newValue: `Scanned ${result.checkedCount}, Overdue: ${result.overdueCount}, Reminders: ${result.remindersSent}`,
    });

    return NextResponse.json({
      success: true,
      message: 'SLA reminder scan executed successfully',
      result,
    });
  } catch (err: any) {
    console.error('Error running SLA reminders:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
