# Employee List and Filtering API Documentation

This document describes the employee list and filtering functionality added to the API.

## Endpoints

### GET /employees

Retrieves a paginated list of employees with filtering and sorting capabilities.

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number (minimum: 1) |
| `limit` | number | No | 10 | Number of items per page (minimum: 1) |
| `name` | string | No | - | Filter by employee first name or last name (case-insensitive partial match) |
| `employee_id` | string | No | - | Filter by employee ID (case-insensitive partial match) |
| `department` | string | No | - | Filter by department (case-insensitive partial match) |
| `position` | string | No | - | Filter by position (case-insensitive partial match) |
| `status` | string | No | - | Filter by status (exact match: `active`, `inactive`, or `on_leave`) |
| `sortBy` | string | No | `employee_id` | Sort field: `name`, `hire_date`, `department`, or `employee_id` |
| `sortOrder` | string | No | `asc` | Sort order: `asc` or `desc` |

#### Response Format

```json
{
  "data": [
    {
      "employee_id": "EMP001",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "department": "Engineering",
      "position": "Software Engineer",
      "base_salary": 75000,
      "hire_date": "2024-01-15T00:00:00.000Z",
      "status": "active",
      "createdAt": "2024-10-30T00:00:00.000Z",
      "updatedAt": "2024-10-30T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

#### Example Requests

**Get all active employees (first page, 10 items):**
```bash
curl "http://localhost:3001/employees?status=active"
```

**Get employees from Engineering department, sorted by name:**
```bash
curl "http://localhost:3001/employees?department=Engineering&sortBy=name&sortOrder=asc"
```

**Get second page of employees with 20 items per page:**
```bash
curl "http://localhost:3001/employees?page=2&limit=20"
```

**Search for employees by name:**
```bash
curl "http://localhost:3001/employees?name=John"
```

**Filter by multiple criteria:**
```bash
curl "http://localhost:3001/employees?department=Engineering&status=active&position=Engineer&sortBy=hire_date&sortOrder=desc"
```

### GET /employees/export

Exports the filtered employee list to an Excel file.

#### Query Parameters

Accepts the same filtering and sorting parameters as `GET /employees`, except `page` and `limit` (exports all matching records).

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | No | - | Filter by employee first name or last name |
| `employee_id` | string | No | - | Filter by employee ID |
| `department` | string | No | - | Filter by department |
| `position` | string | No | - | Filter by position |
| `status` | string | No | - | Filter by status |
| `sortBy` | string | No | `employee_id` | Sort field |
| `sortOrder` | string | No | `asc` | Sort order |

#### Response

Returns an Excel file (.xlsx) with the following columns:
- Employee ID
- First Name
- Last Name
- Email
- Department
- Position
- Base Salary
- Hire Date
- Status

The file is automatically downloaded with the filename format: `employees-export-{timestamp}.xlsx`

#### Example Requests

**Export all active employees:**
```bash
curl "http://localhost:3001/employees/export?status=active" -o active-employees.xlsx
```

**Export Engineering department employees:**
```bash
curl "http://localhost:3001/employees/export?department=Engineering" -o engineering-employees.xlsx
```

**Export all employees sorted by hire date:**
```bash
curl "http://localhost:3001/employees/export?sortBy=hire_date&sortOrder=desc" -o employees-by-hire-date.xlsx
```

## Performance Optimizations

The following database indexes are created automatically to optimize query performance:

- `employee_id` (unique index)
- `first_name` (index)
- `last_name` (index)
- `department` (index)
- `position` (index)
- `hire_date` (index)
- `status` (index)
- `email` (unique index)

These indexes ensure efficient filtering and sorting for large employee datasets (tested for 1000+ employees).

## Validation Rules

### Pagination
- `page` must be >= 1
- `limit` must be >= 1

### Sorting
- `sortBy` must be one of: `name`, `hire_date`, `department`, `employee_id`
- `sortOrder` must be one of: `asc`, `desc`

### Filtering
- `status` must be one of: `active`, `inactive`, `on_leave`
- Text filters (`name`, `employee_id`, `department`, `position`) are case-insensitive and use partial matching
- `status` filter uses exact matching

## Error Responses

### 400 Bad Request

Invalid query parameters:
```json
{
  "statusCode": 400,
  "message": [
    "sortBy must be one of the following values: name, hire_date, department, employee_id"
  ],
  "error": "Bad Request"
}
```

## Notes

- The default pagination limit is 10 items per page
- All text searches are case-insensitive
- Date values are returned in ISO 8601 format
- The `name` filter searches both first_name and last_name fields
- When sorting by `name`, the system sorts by first_name first, then last_name
