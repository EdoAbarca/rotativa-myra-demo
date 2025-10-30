# Leave Data Import via Excel - Implementation

## Overview
This feature allows HR employees to import leave requests and approvals via Excel files. The system validates the data, checks for overlaps, and automatically updates leave balances.

## API Endpoints

### 1. Upload Leave Data
**Endpoint:** `POST /leaves/upload`

**Description:** Import leave data from Excel file

**Parameters:**
- `file` (multipart/form-data): Excel file (.xlsx or .xls)
- `preview` (query, optional): Set to "true" to preview data without importing

**Request Example:**
```bash
curl -X POST http://localhost:3000/leaves/upload \
  -F "file=@leave_data.xlsx" \
  -F "preview=true"
```

**Response Example (Success):**
```json
{
  "success": true,
  "message": "Successfully processed 3 leave records (3 created, 0 updated)",
  "successCount": 3,
  "errorCount": 0,
  "errors": [],
  "created": 3,
  "updated": 0,
  "balanceUpdates": [
    {
      "employee_id": "EMP001",
      "leave_type": "Vacation",
      "days_deducted": 5,
      "remaining_balance": 15
    }
  ]
}
```

**Response Example (With Errors):**
```json
{
  "success": false,
  "message": "Processed with errors: 2 successful, 1 failed",
  "successCount": 2,
  "errorCount": 1,
  "errors": [
    {
      "row": 3,
      "employee_id": "EMP999",
      "start_date": "2025-02-01",
      "end_date": "2025-02-05",
      "errors": ["Employee ID EMP999 does not exist in system"]
    }
  ],
  "created": 2,
  "updated": 0
}
```

### 2. Get Leaves
**Endpoint:** `GET /leaves`

**Description:** Retrieve leave records with optional filtering and pagination

**Query Parameters:**
- `employee_id` (optional): Filter by employee ID
- `leave_type` (optional): Filter by leave type (Vacation/Sick/Personal)
- `status` (optional): Filter by status (Pending/Approved/Rejected)
- `start_date` (optional): Filter by start date (YYYY-MM-DD)
- `end_date` (optional): Filter by end date (YYYY-MM-DD)
- `page` (optional): Page number for pagination
- `limit` (optional): Results per page
- `sortBy` (optional): Sort field (start_date/end_date/leave_type/status)
- `sortOrder` (optional): Sort order (asc/desc)

**Request Example:**
```bash
curl "http://localhost:3000/leaves?employee_id=EMP001&status=Approved&page=1&limit=10"
```

### 3. Get Leave Balance
**Endpoint:** `GET /leaves/balance/:employee_id`

**Description:** Get leave balance for a specific employee

**Request Example:**
```bash
curl "http://localhost:3000/leaves/balance/EMP001"
```

**Response Example:**
```json
{
  "employee_id": "EMP001",
  "vacation_balance": 20,
  "sick_balance": 10,
  "personal_balance": 5,
  "vacation_used": 5,
  "sick_used": 2,
  "personal_used": 1
}
```

### 4. Export Leaves to Excel
**Endpoint:** `GET /leaves/export`

**Description:** Export leave data to Excel file

**Query Parameters:** Same as GET /leaves endpoint

**Request Example:**
```bash
curl "http://localhost:3000/leaves/export?employee_id=EMP001" --output leaves.xlsx
```

## Excel File Format

### Required Columns
1. **employee_id** - Employee identifier (must exist in system)
2. **leave_type** - Type of leave: Vacation, Sick, or Personal
3. **start_date** - Leave start date in YYYY-MM-DD format
4. **end_date** - Leave end date in YYYY-MM-DD format
5. **status** - Leave status: Pending, Approved, or Rejected

### Optional Columns
1. **reason** - Text description of the leave reason

### Sample Excel File
```
| employee_id | leave_type | start_date | end_date   | status   | reason            |
|-------------|------------|------------|------------|----------|-------------------|
| EMP001      | Vacation   | 2025-02-01 | 2025-02-05 | Approved | Family vacation   |
| EMP002      | Sick       | 2025-02-10 | 2025-02-11 | Approved | Medical appt      |
| EMP003      | Personal   | 2025-02-15 | 2025-02-15 | Pending  | Personal matter   |
```

## Validation Rules

### 1. Employee Validation
- Employee ID must exist in the system
- If employee not found, the row is rejected

### 2. Date Validation
- Dates must be in YYYY-MM-DD format
- End date must be after or equal to start date
- Invalid date formats or ranges are rejected

### 3. Overlap Detection
- System checks for overlapping leave periods for the same employee
- Only non-rejected leaves are checked for overlaps
- Overlapping leaves are rejected

### 4. Leave Balance Validation
- When status is "Approved", system checks if employee has sufficient balance
- Leave days are calculated as: (end_date - start_date) + 1
- If insufficient balance, the leave is rejected
- Balance is automatically updated when leave is approved

## Leave Balance Management

### Default Balances
When a new employee's leave balance is created:
- Vacation: 20 days
- Sick: 10 days
- Personal: 5 days

### Balance Updates
- Balances are only deducted for "Approved" leaves
- "Pending" and "Rejected" leaves do not affect balance
- The system tracks both total balance and used days

### Balance Calculation
```
Remaining Balance = Total Balance - Used Days
```

## Database Schema

### Leave Schema
```typescript
{
  employee_id: string (required, indexed)
  leave_type: 'Vacation' | 'Sick' | 'Personal' (required, indexed)
  start_date: Date (required, indexed)
  end_date: Date (required, indexed)
  status: 'Pending' | 'Approved' | 'Rejected' (required, indexed)
  reason: string (optional)
  createdAt: Date (auto-generated)
  updatedAt: Date (auto-generated)
}
```

### Leave Balance Schema
```typescript
{
  employee_id: string (required, unique, indexed)
  vacation_balance: number (default: 20)
  sick_balance: number (default: 10)
  personal_balance: number (default: 5)
  vacation_used: number (default: 0)
  sick_used: number (default: 0)
  personal_used: number (default: 0)
  createdAt: Date (auto-generated)
  updatedAt: Date (auto-generated)
}
```

## Error Handling

### Common Errors
1. **Invalid File Format**
   - Error: "Only Excel files (.xlsx, .xls) are allowed"
   - Solution: Upload a valid Excel file

2. **Missing Required Columns**
   - Error: "Missing required columns: employee_id, leave_type"
   - Solution: Ensure all required columns are present

3. **Employee Not Found**
   - Error: "Employee ID EMP999 does not exist in system"
   - Solution: Verify employee exists or create employee first

4. **Invalid Date Range**
   - Error: "End date must be after or equal to start date"
   - Solution: Correct the date range

5. **Overlapping Leaves**
   - Error: "Leave request overlaps with existing leave"
   - Solution: Adjust dates to avoid overlap

6. **Insufficient Balance**
   - Error: "Insufficient vacation leave balance"
   - Solution: Reduce leave duration or adjust leave type

## Testing

### Unit Tests
All service and controller methods are covered by unit tests:
- Leave creation with validation
- Overlap detection
- Balance management
- Excel upload processing
- Export functionality

### Manual Testing
1. Create sample Excel file using provided template
2. Test upload with valid data
3. Test upload with invalid data (overlaps, missing employees, etc.)
4. Verify balance updates
5. Test export functionality

## Sample Template Generation
A sample Excel template can be generated using:
```bash
cd backend
node create-leave-template.js
```

This creates `sample_leave_import.xlsx` with example data.

## Integration
The Leave module is integrated with:
- **Employees Module**: Validates employee existence
- **MongoDB**: Stores leave and balance data
- **ExcelJS**: Handles Excel file parsing and generation

## Future Enhancements
- Email notifications for leave approvals/rejections
- Integration with calendar systems
- Leave approval workflow
- Historical leave tracking and reporting
- Integration with payroll for leave without pay
