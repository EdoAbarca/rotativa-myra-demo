import { Injectable, Logger } from '@nestjs/common';
import { AttendanceService } from '../attendance/attendance.service';
import { EmployeesService } from '../employees/employees.service';

export interface LateArrival {
  employee_id: string;
  employee_name: string;
  date: string;
  expected_time: string;
  actual_time: string;
  minutes_late: number;
}

@Injectable()
export class LateArrivalDetectionService {
  private readonly logger = new Logger(LateArrivalDetectionService.name);

  constructor(
    private attendanceService: AttendanceService,
    private employeesService: EmployeesService,
  ) {}

  async detectLateArrivals(date?: string): Promise<LateArrival[]> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    this.logger.log(`Detecting late arrivals for date: ${targetDate}`);

    // Get all attendance records for the date
    const attendanceRecords = await this.attendanceService.findAllPaginated({
      start_date: targetDate,
      end_date: targetDate,
      limit: 1000,
    });

    const lateArrivals: LateArrival[] = [];

    for (const record of attendanceRecords.data) {
      // Only check Present and Late status
      if (record.status === 'Present' || record.status === 'Late') {
        // Parse check-in time first
        const checkInTime = record.check_in_time;
        if (!checkInTime) {
          continue;
        }

        // Get employee details
        const employee = await this.employeesService.findByEmployeeId(
          record.employee_id,
        );

        if (!employee) {
          continue;
        }

        // Expected time is 9:00 AM by default
        const expectedHour = 9;
        const expectedMinute = 0;

        // Parse actual check-in time (format: "HH:MM:SS" or "HH:MM")
        const timeParts = checkInTime.split(':');
        const actualHour = parseInt(timeParts[0], 10);
        const actualMinute = parseInt(timeParts[1], 10);

        // Calculate minutes late
        const expectedTotalMinutes = expectedHour * 60 + expectedMinute;
        const actualTotalMinutes = actualHour * 60 + actualMinute;
        const minutesLate = actualTotalMinutes - expectedTotalMinutes;

        // Consider late if more than 5 minutes past expected time
        if (minutesLate > 5) {
          lateArrivals.push({
            employee_id: record.employee_id,
            employee_name: `${employee.first_name} ${employee.last_name}`,
            date: targetDate,
            expected_time: `${expectedHour.toString().padStart(2, '0')}:${expectedMinute.toString().padStart(2, '0')}`,
            actual_time: checkInTime,
            minutes_late: minutesLate,
          });
        }
      }
    }

    this.logger.log(
      `Found ${lateArrivals.length} late arrivals on ${targetDate}`,
    );
    return lateArrivals;
  }
}
