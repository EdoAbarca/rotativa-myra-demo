# Attendance Data Import API Documentation

## Overview
This API allows HR employees to upload attendance data via Excel files. The system validates employee IDs, calculates work hours and overtime automatically, and provides preview functionality before final import.

## Endpoints

### 1. Upload Attendance Data

**Endpoint:** `POST /attendance/upload`

**Description:** Upload an Excel file containing attendance data. Supports both preview mode and actual import.

**Request:**
- **Method:** POST
- **Content-Type:** multipart/form-data
- **Parameters:**
  - `file` (required): Excel file (.xlsx or .xls)
  - `preview` (optional, query param): Set to "true" to preview data without importing

**Excel File Format:**

Required columns:
- `employee_id` (string): Must exist in the employees database
- `date` (date string): Format: YYYY-MM-DD
- `status` (string): One of: "Present", "Absent", "Late"

Optional columns:
- `check_in_time` (string): Format: HH:MM (e.g., "09:00")
- `check_out_time` (string): Format: HH:MM (e.g., "17:00")
- `hours_worked` (number): Auto-calculated if not provided
- `overtime_hours` (number): Auto-calculated if not provided

**Response:**
```json
{
  "success": true,
  "message": "Successfully processed 4 attendance records (3 created, 1 updated)",
  "successCount": 4,
  "errorCount": 0,
  "errors": [],
  "created": 3,
  "updated": 1,
  "preview": [] // Only included when preview=true
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Processed with errors: 2 successful, 2 failed",
  "successCount": 2,
  "errorCount": 2,
  "errors": [
    {
      "row": 3,
      "employee_id": "EMP999",
      "date": "2025-01-15",
      "errors": ["Employee ID EMP999 does not exist in system"]
    },
    {
      "row": 4,
      "employee_id": "EMP002",
      "date": "invalid-date",
      "errors": ["date must be a valid ISO 8601 date string"]
    }
  ],
  "created": 1,
  "updated": 1
}
```

### 2. Get All Attendance Records

**Endpoint:** `GET /attendance`

**Description:** Retrieve all attendance records from the database.

**Request:**
- **Method:** GET

**Response:**
```json
[
  {
    "employee_id": "EMP001",
    "date": "2025-01-15T00:00:00.000Z",
    "status": "Present",
    "check_in_time": "09:00",
    "check_out_time": "17:00",
    "hours_worked": 8,
    "overtime_hours": 0
  },
  {
    "employee_id": "EMP002",
    "date": "2025-01-15T00:00:00.000Z",
    "status": "Late",
    "check_in_time": "09:30",
    "check_out_time": "18:00",
    "hours_worked": 8,
    "overtime_hours": 0.5
  }
]
```

## Usage Examples

### Example 1: Preview Attendance Data

Preview the data before importing:

```bash
curl -X POST http://localhost:3001/attendance/upload?preview=true \
  -F "file=@attendance_template.xlsx"
```

**Response:**
```json
{
  "success": true,
  "message": "Preview: 4 records ready to import",
  "successCount": 4,
  "errorCount": 0,
  "errors": [],
  "created": 0,
  "updated": 0,
  "preview": [
    {
      "employee_id": "EMP001",
      "date": "2025-01-15",
      "status": "Present",
      "check_in_time": "09:00",
      "check_out_time": "17:00",
      "hours_worked": 8,
      "overtime_hours": 0
    }
  ]
}
```

### Example 2: Import Attendance Data

Import the data into the database:

```bash
curl -X POST http://localhost:3001/attendance/upload \
  -F "file=@attendance_template.xlsx"
```

### Example 3: Get All Attendance Records

```bash
curl http://localhost:3001/attendance
```

## Validation Rules

### Employee ID Validation
- Must exist in the employees database
- If not found, the record will be rejected with an error

### Date Validation
- Must be a valid date in ISO 8601 format (YYYY-MM-DD)
- Invalid dates will be rejected

### Status Validation
- Must be one of: "Present", "Absent", "Late"
- Any other value will be rejected

### Time Validation
- Check-in and check-out times should be in HH:MM format
- Times are optional for "Absent" status
- If provided, times will be used to calculate hours_worked and overtime_hours

### Hours Calculation
- **Standard Work Day:** 8 hours
- **Hours Worked:** Calculated from check_in_time to check_out_time (max 8 hours)
- **Overtime Hours:** Any hours beyond 8 hours
- **Absent Status:** Both hours_worked and overtime_hours are set to 0

**Example Calculations:**
- Check-in: 09:00, Check-out: 17:00 → hours_worked: 8, overtime_hours: 0
- Check-in: 09:00, Check-out: 19:00 → hours_worked: 8, overtime_hours: 2
- Check-in: 09:00, Check-out: 14:00 → hours_worked: 5, overtime_hours: 0
- Status: Absent → hours_worked: 0, overtime_hours: 0

## Error Handling

### File Validation Errors
- **Invalid file format:** "Only Excel files (.xlsx, .xls) are allowed"
- **No file uploaded:** "No file uploaded"
- **Empty file:** "Excel file is empty or invalid"

### Column Validation Errors
- **Missing required columns:** "Missing required columns: employee_id, date, status"

### Data Validation Errors
Each row with validation errors will be included in the `errors` array with:
- `row`: Row number in the Excel file
- `employee_id`: The employee ID from the row
- `date`: The date from the row
- `errors`: Array of error messages for that row

## Duplicate Handling

If an attendance record already exists for the same `employee_id` and `date`:
- The existing record will be **updated** with the new data
- The response will indicate the number of records updated vs created

## Sample Excel Template

A sample Excel template is provided at: `backend/docs/examples/attendance_template.xlsx`

The template includes:
- Properly formatted headers
- Sample data for 4 attendance records
- Examples of different attendance statuses
- Styled header row for clarity

## Performance Notes

- **Batch Size:** Records are processed in batches of 10 to optimize database performance
- **File Size Limit:** 5MB maximum
- **Recommended:** Process no more than 1,000 records per upload for optimal performance

## Security Considerations

- Only Excel files (.xlsx, .xls) are accepted
- File size is limited to 5MB to prevent abuse
- All input data is validated before processing
- Employee IDs are validated against the database to prevent invalid data

## Integration Notes

When integrating this API into your frontend:

1. **Always use preview first:** Call with `preview=true` to show users what will be imported
2. **Display errors clearly:** Show row-specific errors to help users fix issues
3. **Show success/failure counts:** Display how many records were created vs updated
4. **Handle partial success:** The API processes all valid rows even if some rows have errors
