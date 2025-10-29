export class UploadResultDto {
  success: boolean;
  message: string;
  successCount: number;
  errorCount: number;
  errors: {
    row: number;
    employee_id?: string;
    errors: string[];
  }[];
  created: number;
  updated: number;
}
