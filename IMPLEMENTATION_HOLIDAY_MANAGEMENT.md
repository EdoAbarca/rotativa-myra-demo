# Holiday and Legal Days Off Management Implementation

## Overview
This document describes the implementation of the Holiday and Legal Days Off Management feature for the Rotativa Myra Demo HR system. This feature allows administrators to configure company holidays and legal days off, which are automatically considered in salary calculations and absence tracking.

## Features Implemented

### 1. Holiday CRUD Operations
Complete Create, Read, Update, Delete functionality for holidays:
- **Create**: Add new holidays with date, name, description, and type (paid/unpaid)
- **Read**: View all holidays in list or calendar format with filtering options
- **Update**: Edit existing holiday details
- **Delete**: Remove holidays by ID or date

### 2. Recurring Holiday Support
Holidays can be marked as recurring and automatically generated for future years:
- **Recurring Configuration**: Set month (1-12) and day (1-31) for annual holidays
- **Automatic Generation**: Generate recurring holidays for any specified year
- **Template System**: Recurring holidays serve as templates; generated instances are non-recurring

### 3. Holiday Filtering and Querying
Advanced filtering options for holiday management:
- **Date Range**: Filter holidays between start and end dates
- **Recurring Status**: Filter by recurring or non-recurring holidays only
- **Paid Status**: Filter by paid or unpaid holidays

### 4. Calendar Visualization
Interactive calendar view showing all holidays:
- **Year Navigation**: Switch between years to view different periods
- **Visual Highlights**: Holidays are highlighted in red on calendar days
- **Hover Details**: Holiday names shown on hover
- **12-Month Grid**: Complete yearly view with all 12 months

### 5. Integration with Salary Calculations
Holidays are automatically integrated with the salary calculation engine:
- **Exclusion from Absences**: Absences on holidays are not deducted from salary
- **Paid Holiday Support**: Only paid holidays are considered in calculations
- **Working Days Calculation**: Holidays are excluded from working day counts

## Database Schema

### Holiday Collection
```typescript
{
  _id: ObjectId,                 // MongoDB unique identifier
  date: Date,                    // Holiday date (indexed)
  name: string,                  // Holiday name
  description?: string,          // Optional description
  is_paid: boolean,              // Whether it's a paid holiday (default: true)
  is_recurring: boolean,         // Whether it recurs annually (default: false)
  recurring_month?: number,      // Month for recurring (1-12)
  recurring_day?: number,        // Day for recurring (1-31)
  createdAt: Date,               // Auto-generated timestamp
  updatedAt: Date                // Auto-generated timestamp
}
```

**Note**: The `date` field is no longer unique to allow multiple holiday instances (e.g., Christmas 2025 and Christmas 2026).

## API Endpoints

### Holiday Management

#### Create Holiday
```
POST /salary/holidays
Body: {
  date: string (ISO date),
  name: string,
  description?: string,
  is_paid?: boolean,
  is_recurring?: boolean,
  recurring_month?: number (1-12),
  recurring_day?: number (1-31)
}
```
Creates a new holiday or updates an existing one if the date matches.

#### Get Holidays
```
GET /salary/holidays?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&is_recurring=true&is_paid=true
```
Returns all holidays with optional filtering by date range, recurring status, and paid status.

#### Get Single Holiday
```
GET /salary/holidays/:id
```
Returns details of a specific holiday by its ID.

#### Update Holiday
```
PUT /salary/holidays/:id
Body: {
  name?: string,
  description?: string,
  is_paid?: boolean,
  is_recurring?: boolean,
  recurring_month?: number,
  recurring_day?: number
}
```
Updates an existing holiday. All fields are optional.

#### Delete Holiday (by date)
```
DELETE /salary/holidays/:date
```
Deletes a holiday by its date.

#### Delete Holiday (by ID)
```
DELETE /salary/holidays/by-id/:id
```
Deletes a holiday by its unique ID.

#### Generate Recurring Holidays
```
POST /salary/holidays/generate/:year
```
Generates instances of all recurring holidays for the specified year. Skips holidays that already exist.

**Example Response**:
```json
{
  "message": "Generated 2 recurring holidays for 2026",
  "holidays": [
    {
      "_id": "...",
      "date": "2026-12-25T00:00:00.000Z",
      "name": "Christmas Day",
      "is_paid": true,
      "is_recurring": false
    }
  ]
}
```

## Frontend Implementation

### Holiday Management Page
Location: `/app/holidays/page.tsx`

#### Key Features:
1. **Dual View Modes**:
   - List View: Tabular display of all holidays with actions
   - Calendar View: 12-month calendar with visual holiday indicators

2. **Holiday Form**:
   - Inline form for creating/editing holidays
   - Support for recurring holiday configuration
   - Validation for required fields

3. **Action Buttons**:
   - Add Holiday: Opens form for new holiday
   - Generate Recurring: Creates holiday instances for selected year
   - View Toggle: Switches between list and calendar views

4. **Filters** (List View):
   - Start/End Date range
   - Recurring status (All, Recurring Only, Non-Recurring Only)
   - Clear Filters button

5. **Calendar View**:
   - Year navigation (previous/next/today)
   - 12-month grid layout
   - Holidays highlighted in red with tooltip

#### User Interface Components:
- **Holiday Table**: Displays date, name, description, type, recurring info, and actions
- **Holiday Form**: Clean, accessible form with proper labels and placeholders
- **Calendar Grid**: Responsive grid layout showing all 12 months
- **Status Badges**: Visual indicators for paid/unpaid and recurring holidays

### Navigation Integration
Added to main homepage (`/app/page.tsx`):
```tsx
<Link href="/holidays">
  🎉 Holiday Management
</Link>
```

## Backend Services

### SalaryService Updates

#### New Methods:
- `updateHoliday(id, updates)`: Update a holiday by ID
- `getAllHolidays(filters)`: Get holidays with optional filtering
- `getHolidayById(id)`: Get a single holiday
- `deleteHolidayById(id)`: Delete by ID
- `generateRecurringHolidays(year)`: Generate recurring holidays for a year

#### Enhanced Methods:
- `createHoliday()`: Now supports recurring holiday parameters
- `getHolidaysInPeriod()`: Used internally for salary calculations

### Holiday Integration Logic

#### Salary Calculation:
1. Fetch holidays in the calculation period
2. Exclude absences that fall on holiday dates
3. Count holiday days separately
4. Only paid holidays affect salary calculations

#### Example:
```typescript
const holidays = await this.getHolidaysInPeriod(startDate, endDate);
const deductibleAbsences = this.calculateDeductibleAbsences(
  absentDays,
  holidays,
  absentRecords
);
```

## Testing

### Backend Tests
All tests pass (186 total):
- Holiday CRUD operations
- Recurring holiday creation and generation
- Holiday filtering by date range and status
- Update and delete operations
- Integration with salary calculations

### Key Test Scenarios:
1. Create recurring holiday (Christmas, New Year)
2. Generate recurring holidays for future years
3. Filter holidays by date range
4. Update holiday information
5. Delete holidays by ID
6. Verify holiday exclusion from absence deductions
7. Verify no duplicate generation

## Usage Examples

### Creating a Recurring Holiday
```bash
curl -X POST http://localhost:3001/salary/holidays \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-12-25",
    "name": "Christmas Day",
    "description": "Annual Christmas celebration",
    "is_paid": true,
    "is_recurring": true,
    "recurring_month": 12,
    "recurring_day": 25
  }'
```

### Generating Holidays for a Year
```bash
curl -X POST http://localhost:3001/salary/holidays/generate/2026
```

### Filtering Holidays
```bash
# Get all recurring holidays
curl "http://localhost:3001/salary/holidays?is_recurring=true"

# Get holidays in a date range
curl "http://localhost:3001/salary/holidays?start_date=2025-01-01&end_date=2025-12-31"
```

## User Workflows

### Admin: Add a One-Time Holiday
1. Navigate to Holiday Management page
2. Click "+ Add Holiday"
3. Fill in date, name, and description
4. Select "Paid Holiday" if applicable
5. Click "Add Holiday"

### Admin: Configure Recurring Holiday
1. Navigate to Holiday Management page
2. Click "+ Add Holiday"
3. Fill in date, name, and description
4. Check "Recurring Holiday"
5. Enter recurring month (1-12) and day (1-31)
6. Click "Add Holiday"

### Admin: Generate Annual Holidays
1. Navigate to Holiday Management page
2. Use calendar view or select year
3. Click "Generate Recurring for [Year]"
4. Confirm generation
5. All recurring holidays are created for that year

### Admin: View Holiday Calendar
1. Navigate to Holiday Management page
2. Click "📅 Calendar View"
3. Use year navigation buttons to switch years
4. Holidays are highlighted in red
5. Hover over dates to see holiday names

## Benefits

### For Administrators:
- Easy holiday configuration and management
- Automatic generation of annual holidays
- Visual calendar for planning
- Flexible filtering and search

### For Payroll:
- Automatic exclusion of holidays from absence deductions
- Accurate working day calculations
- Transparent holiday tracking
- Integration with salary calculation engine

### For Employees:
- Clear visibility of company holidays
- No salary deductions for absences on holidays
- Predictable holiday schedule

## Technical Implementation Details

### Schema Changes:
- Removed `unique: true` constraint on `date` field
- Added `is_recurring`, `recurring_month`, `recurring_day` fields
- Maintained backward compatibility

### API Enhancements:
- New PUT endpoint for updates
- New DELETE by ID endpoint
- New POST endpoint for recurring generation
- Enhanced GET with query parameters

### Frontend Architecture:
- Client-side rendering with React hooks
- State management with useState
- API integration with fetch
- Responsive design with Tailwind CSS

### Performance Considerations:
- Indexed date field for fast queries
- Efficient filtering at database level
- Pagination support (currently showing all)
- Optimized calendar rendering

## Future Enhancements

Potential improvements for future iterations:
1. **Bulk Import**: Import holidays from CSV or calendar files
2. **Holiday Templates**: Pre-defined holiday sets by country/region
3. **Notifications**: Alerts for upcoming holidays
4. **Employee View**: Public calendar view for employees
5. **Approval Workflow**: Require approval for holiday additions
6. **Holiday Reports**: Analytics on holiday usage and impact
7. **Integration**: Sync with external calendar systems (Google Calendar, Outlook)
8. **Multi-Year Generation**: Generate recurring holidays for multiple years at once

## Screenshots

### List View
![Holiday List View](https://github.com/user-attachments/assets/36d0a874-327f-476c-9194-1c9168a0e5f0)

### Calendar View
![Holiday Calendar View](https://github.com/user-attachments/assets/0893e04a-9141-4f99-a401-0ed2caa8c804)

### Add/Edit Form
![Holiday Form](https://github.com/user-attachments/assets/ab18644d-d3fd-4704-b43a-afae48406df2)

## Conclusion

The Holiday and Legal Days Off Management feature provides a comprehensive solution for managing company holidays. It includes full CRUD operations, recurring holiday support, visual calendar views, and seamless integration with the salary calculation engine. The feature is production-ready with complete test coverage and a user-friendly interface.
