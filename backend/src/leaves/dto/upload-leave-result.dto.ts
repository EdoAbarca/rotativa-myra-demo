export interface UploadLeaveError {
  row: number;
  employee_id?: string;
  start_date?: string;
  end_date?: string;
  errors: string[];
}

export interface LeavePreview {
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: string;
  reason?: string;
  days: number;
}

export class UploadLeaveResultDto {
  success: boolean;
  message: string;
  successCount: number;
  errorCount: number;
  errors: UploadLeaveError[];
  created: number;
  updated: number;
  preview?: LeavePreview[];
  balanceUpdates?: {
    employee_id: string;
    leave_type: string;
    days_deducted: number;
    remaining_balance: number;
  }[];
}
