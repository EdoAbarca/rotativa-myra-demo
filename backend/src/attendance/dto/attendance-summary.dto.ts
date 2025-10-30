export class AttendanceSummaryDto {
  date: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  presentPercentage: number;
  absentPercentage: number;
  latePercentage: number;
}

export class AttendanceStatisticsDto {
  totalEmployees: number;
  dateRange: {
    start: string;
    end: string;
  };
  summary: AttendanceSummaryDto;
  dailyBreakdown: Array<{
    date: string;
    present: number;
    absent: number;
    late: number;
  }>;
  employeeBreakdown: Array<{
    employee_id: string;
    total_days: number;
    present_days: number;
    absent_days: number;
    late_days: number;
    total_hours: number;
    overtime_hours: number;
  }>;
}
