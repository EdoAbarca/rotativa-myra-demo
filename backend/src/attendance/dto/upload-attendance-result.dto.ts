export class UploadAttendanceResultDto {
  success: boolean;
  message: string;
  successCount: number;
  errorCount: number;
  errors: Array<{
    row: number;
    employee_id?: string;
    date?: string;
    errors: string[];
  }>;
  created: number;
  updated: number;
  preview?: Array<{
    employee_id: string;
    date: string;
    status: string;
    check_in_time?: string;
    check_out_time?: string;
    hours_worked: number;
    overtime_hours: number;
  }>;
}
