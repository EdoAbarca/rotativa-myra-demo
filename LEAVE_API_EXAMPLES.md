# Leave Data Import via Excel - API Usage Examples

This document provides practical examples of how to use the Leave Data Import API.

## Setup

Ensure the backend server is running:
```bash
cd backend
npm run start:dev
```

## Example 1: Upload Leave Data (Preview Mode)

Preview the data without importing it to the database:

```bash
curl -X POST http://localhost:3000/leaves/upload?preview=true \
  -F "file=@sample_leave_import.xlsx" \
  -H "Accept: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Preview: 3 leave records ready to import",
  "successCount": 3,
  "errorCount": 0,
  "errors": [],
  "created": 0,
  "updated": 0,
  "preview": [
    {
      "employee_id": "EMP001",
      "leave_type": "Vacation",
      "start_date": "2025-02-01",
      "end_date": "2025-02-05",
      "status": "Approved",
      "reason": "Family vacation",
      "days": 5
    },
    {
      "employee_id": "EMP002",
      "leave_type": "Sick",
      "start_date": "2025-02-10",
      "end_date": "2025-02-11",
      "status": "Approved",
      "reason": "Medical appointment",
      "days": 2
    },
    {
      "employee_id": "EMP003",
      "leave_type": "Personal",
      "start_date": "2025-02-15",
      "end_date": "2025-02-15",
      "status": "Pending",
      "reason": "Personal matter",
      "days": 1
    }
  ]
}
```

## Example 2: Upload Leave Data (Actual Import)

Import the data to the database:

```bash
curl -X POST http://localhost:3000/leaves/upload \
  -F "file=@sample_leave_import.xlsx" \
  -H "Accept: application/json"
```

**Expected Response:**
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
    },
    {
      "employee_id": "EMP002",
      "leave_type": "Sick",
      "days_deducted": 2,
      "remaining_balance": 8
    }
  ]
}
```

## Example 3: Query Leaves

Get all approved leaves for a specific employee:

```bash
curl "http://localhost:3000/leaves?employee_id=EMP001&status=Approved"
```

Get paginated leaves with filtering:

```bash
curl "http://localhost:3000/leaves?leave_type=Vacation&page=1&limit=10&sortBy=start_date&sortOrder=desc"
```

## Example 4: Check Leave Balance

Get leave balance for an employee:

```bash
curl "http://localhost:3000/leaves/balance/EMP001"
```

**Expected Response:**
```json
{
  "employee_id": "EMP001",
  "vacation_balance": 20,
  "sick_balance": 10,
  "personal_balance": 5,
  "vacation_used": 5,
  "sick_used": 0,
  "personal_used": 0
}
```

## Example 5: Export Leaves to Excel

Export all leaves for an employee:

```bash
curl "http://localhost:3000/leaves/export?employee_id=EMP001" \
  --output employee_leaves.xlsx
```

Export all approved vacation leaves:

```bash
curl "http://localhost:3000/leaves/export?leave_type=Vacation&status=Approved" \
  --output vacation_leaves.xlsx
```

## Example 6: Error Handling

### Invalid Employee ID

Excel file with non-existent employee:
```
| employee_id | leave_type | start_date | end_date   | status  |
|-------------|------------|------------|------------|---------|
| EMP999      | Vacation   | 2025-02-01 | 2025-02-05 | Pending |
```

**Response:**
```json
{
  "success": false,
  "message": "Processed with errors: 0 successful, 1 failed",
  "successCount": 0,
  "errorCount": 1,
  "errors": [
    {
      "row": 2,
      "employee_id": "EMP999",
      "start_date": "2025-02-01",
      "end_date": "2025-02-05",
      "errors": ["Employee ID EMP999 does not exist in system"]
    }
  ],
  "created": 0,
  "updated": 0
}
```

### Overlapping Leaves

Excel file with overlapping dates:
```
| employee_id | leave_type | start_date | end_date   | status   |
|-------------|------------|------------|------------|----------|
| EMP001      | Vacation   | 2025-02-01 | 2025-02-05 | Approved |
| EMP001      | Vacation   | 2025-02-03 | 2025-02-07 | Pending  |
```

**Response:**
```json
{
  "success": false,
  "message": "Processed with errors: 1 successful, 1 failed",
  "successCount": 1,
  "errorCount": 1,
  "errors": [
    {
      "row": 3,
      "employee_id": "EMP001",
      "start_date": "2025-02-03",
      "end_date": "2025-02-07",
      "errors": ["Leave request overlaps with existing leave"]
    }
  ],
  "created": 1,
  "updated": 0
}
```

### Invalid Date Range

Excel file with end date before start date:
```
| employee_id | leave_type | start_date | end_date   | status  |
|-------------|------------|------------|------------|---------|
| EMP001      | Vacation   | 2025-02-10 | 2025-02-05 | Pending |
```

**Response:**
```json
{
  "success": false,
  "message": "Processed with errors: 0 successful, 1 failed",
  "successCount": 0,
  "errorCount": 1,
  "errors": [
    {
      "row": 2,
      "employee_id": "EMP001",
      "start_date": "2025-02-10",
      "end_date": "2025-02-05",
      "errors": ["End date must be after or equal to start date"]
    }
  ],
  "created": 0,
  "updated": 0
}
```

### Insufficient Balance

If an employee tries to take more leave than available:
```json
{
  "success": false,
  "message": "Processed with errors: 0 successful, 1 failed",
  "successCount": 0,
  "errorCount": 1,
  "errors": [
    {
      "row": 2,
      "employee_id": "EMP001",
      "start_date": "2025-03-01",
      "end_date": "2025-03-30",
      "errors": ["Insufficient vacation leave balance"]
    }
  ],
  "created": 0,
  "updated": 0
}
```

## Testing with Postman

### Import Collection
```json
{
  "info": {
    "name": "Leave Management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Upload Leaves (Preview)",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/leaves/upload?preview=true",
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "file",
              "type": "file",
              "src": "sample_leave_import.xlsx"
            }
          ]
        }
      }
    },
    {
      "name": "Upload Leaves",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/leaves/upload",
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "file",
              "type": "file",
              "src": "sample_leave_import.xlsx"
            }
          ]
        }
      }
    },
    {
      "name": "Get Leaves",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/leaves?employee_id=EMP001&status=Approved"
      }
    },
    {
      "name": "Get Leave Balance",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/leaves/balance/EMP001"
      }
    },
    {
      "name": "Export Leaves",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/leaves/export?employee_id=EMP001"
      }
    }
  ]
}
```

Save this as `Leave_Management_API.postman_collection.json` and import into Postman.

## Integration Testing Workflow

1. **Setup**: Ensure employees exist in the system
2. **Preview**: Upload the Excel file in preview mode to validate data
3. **Import**: If preview is successful, upload without preview flag
4. **Verify**: Check leave balance to confirm deductions
5. **Query**: Retrieve imported leaves to verify data
6. **Export**: Export data to verify round-trip consistency

## Notes

- The sample template (`sample_leave_import.xlsx`) is included in the repository
- All dates must be in YYYY-MM-DD format
- Leave balances are only updated for "Approved" status
- Overlapping leaves are detected across all non-rejected leaves
- Preview mode is recommended before actual import
