# Employee Excel Upload API

## Overview

This API allows HR employees to register new employees in the system by uploading an Excel file with employee master data.

## Endpoint

**POST** `/employees/upload`

### Request

- **Content-Type**: `multipart/form-data`
- **Field Name**: `file`
- **Accepted File Types**: `.xlsx`, `.xls`
- **Max File Size**: 5MB

### Required Excel Columns

The Excel file must contain the following columns in the first row (header row):

| Column Name   | Type    | Description                                      | Validation                           |
|---------------|---------|--------------------------------------------------|--------------------------------------|
| employee_id   | String  | Unique identifier for the employee               | Required, must be unique             |
| first_name    | String  | Employee's first name                            | Required                             |
| last_name     | String  | Employee's last name                             | Required                             |
| email         | String  | Employee's email address                         | Required, must be valid email format |
| department    | String  | Department name                                  | Required                             |
| position      | String  | Job position/title                               | Required                             |
| base_salary   | Number  | Base salary amount                               | Required, must be >= 0               |
| hire_date     | Date    | Date when employee was hired                     | Required, must be valid date         |
| status        | String  | Employment status                                | Required, must be one of: active, inactive, on_leave |

### Example Excel Structure

```
| employee_id | first_name | last_name | email                 | department  | position           | base_salary | hire_date  | status |
|-------------|------------|-----------|------------------------|-------------|--------------------|-------------|------------|--------|
| EMP001      | John       | Doe       | john.doe@example.com   | Engineering | Software Engineer  | 75000       | 2024-01-15 | active |
| EMP002      | Jane       | Smith     | jane.smith@example.com | HR          | HR Manager         | 65000       | 2024-02-01 | active |
```

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Successfully processed 2 employees (2 created, 0 updated)",
  "successCount": 2,
  "errorCount": 0,
  "errors": [],
  "created": 2,
  "updated": 0
}
```

### Partial Success Response (200 OK)

```json
{
  "success": false,
  "message": "Processed with errors: 1 successful, 1 failed",
  "successCount": 1,
  "errorCount": 1,
  "errors": [
    {
      "row": 3,
      "employee_id": "EMP003",
      "errors": ["email must be an email"]
    }
  ],
  "created": 1,
  "updated": 0
}
```

### Error Response (400 Bad Request)

```json
{
  "statusCode": 400,
  "message": "Missing required columns: employee_id, email",
  "error": "Bad Request"
}
```

## Duplicate Handling

If an employee with the same `employee_id` already exists in the database:
- The existing employee record will be **updated** with the new data from the Excel file
- The response will show the number of records created vs updated

## Usage Examples

### Using cURL

```bash
curl -X POST http://localhost:3001/employees/upload \
  -F "file=@employees.xlsx"
```

### Using Postman

1. Set request type to `POST`
2. Enter URL: `http://localhost:3001/employees/upload`
3. Go to "Body" tab
4. Select "form-data"
5. Add a new field with:
   - Key: `file` (change type to "File")
   - Value: Select your Excel file

### Using JavaScript (Fetch API)

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:3001/employees/upload', {
  method: 'POST',
  body: formData
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

## Validation Rules

### Email Validation
- Must be a valid email format (e.g., user@example.com)

### Base Salary Validation
- Must be a non-negative number
- Can include commas (e.g., 75,000 will be parsed as 75000)

### Status Validation
- Must be one of: `active`, `inactive`, or `on_leave`

### Date Validation
- hire_date must be a valid date in Excel date format or ISO format (YYYY-MM-DD)

## Error Handling

### Common Errors

1. **Missing Required Columns**
   - Error: "Missing required columns: [column names]"
   - Solution: Ensure all required columns are present in the Excel header row

2. **Invalid File Type**
   - Error: "Only Excel files (.xlsx, .xls) are allowed"
   - Solution: Upload only .xlsx or .xls files

3. **File Too Large**
   - Error: File size exceeds limit
   - Solution: Ensure file is under 5MB

4. **Validation Errors**
   - The response will include detailed error messages for each row that failed validation
   - Fix the data in those rows and re-upload

## Best Practices

1. **Always include all required columns** in your Excel file
2. **Test with a small file first** (2-3 rows) before uploading large datasets
3. **Review error messages** carefully to identify and fix data issues
4. **Keep employee_id unique** across all records
5. **Use consistent date formats** (preferably ISO format: YYYY-MM-DD)
6. **Validate email addresses** before uploading to avoid validation errors

## Additional Features

### Get All Employees

**GET** `/employees`

Returns a list of all employees in the system.

```bash
curl http://localhost:3001/employees
```

Response:
```json
[
  {
    "_id": "...",
    "employee_id": "EMP001",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "department": "Engineering",
    "position": "Software Engineer",
    "base_salary": 75000,
    "hire_date": "2024-01-15T00:00:00.000Z",
    "status": "active",
    "createdAt": "2024-01-20T10:30:00.000Z",
    "updatedAt": "2024-01-20T10:30:00.000Z"
  }
]
```
