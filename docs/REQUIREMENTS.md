# Rotativa Myra - HR Assistant System Requirements

## Project Overview

Rotativa Myra is an HR assistant system designed to automate and streamline HR processes, specifically focusing on:
1. **Automated Salary Calculation**: Calculate monthly employee salaries considering base salary, overtime, absences, licenses, holidays, and legal days off
2. **Event Monitoring & Notifications**: Alert HR personnel about unexpected events such as employee absences or tardiness

## Technology Stack

- **Frontend**: Next.js (TypeScript/JavaScript)
- **Backend**: NestJS (TypeScript)
- **Database**: MongoDB
- **Containerization**: Docker & Docker Compose
- **Build Automation**: Makefile
- **CI/CD**: GitHub Actions

## User Roles

### 1. HR Employee (Primary User)
- Main user of the system
- Uploads Excel files with employee data
- Views salary calculations and reports
- Receives notifications about events
- Manages employee records

### 2. Admin (System Administrator)
- System configuration and maintenance
- User management
- Advanced reporting and analytics
- System monitoring

## Data Sources

### Excel File Structures

#### 1. Employee Master Data (`employees.xlsx`)
| Column | Description | Example |
|--------|-------------|---------|
| employee_id | Unique identifier | EMP001 |
| first_name | Employee first name | Juan |
| last_name | Employee last name | Pérez |
| email | Employee email | juan.perez@company.com |
| department | Department name | IT |
| position | Job position | Developer |
| base_salary | Monthly base salary | 1500000 |
| hire_date | Date of hire | 2023-01-15 |
| status | Employment status | Active |

#### 2. Attendance Data (`attendance_YYYY_MM.xlsx`)
| Column | Description | Example |
|--------|-------------|---------|
| employee_id | Employee identifier | EMP001 |
| date | Work date | 2024-10-15 |
| check_in | Time of arrival | 09:00 |
| check_out | Time of departure | 18:30 |
| hours_worked | Total hours worked | 8.5 |
| overtime_hours | Extra hours worked | 0.5 |
| status | Attendance status | Present/Absent/Late |

#### 3. Leave Requests (`leaves_YYYY_MM.xlsx`)
| Column | Description | Example |
|--------|-------------|---------|
| employee_id | Employee identifier | EMP001 |
| leave_type | Type of leave | Vacation/Sick/Personal |
| start_date | Leave start date | 2024-10-20 |
| end_date | Leave end date | 2024-10-22 |
| days_count | Number of days | 3 |
| status | Leave status | Approved/Pending/Rejected |

---

## Epic 1: Employee Management System

### User Story 1.1: Employee Registration
**As an** HR Employee  
**I want to** register new employees in the system  
**So that** I can track their attendance and calculate their salaries

**Acceptance Criteria:**
- I can upload an Excel file with employee master data
- The system validates the data format and shows errors if any
- Employee records are created or updated in the database
- I receive confirmation of successful import
- Duplicate employees are handled appropriately

### User Story 1.2: Employee Profile Management
**As an** HR Employee  
**I want to** view and edit employee profiles  
**So that** I can keep employee information up to date

**Acceptance Criteria:**
- I can search for employees by name, ID, or department
- I can view detailed employee profiles
- I can edit employee information (except historical data)
- Changes are logged for audit purposes
- I can deactivate employees when they leave

### User Story 1.3: Employee List and Filtering
**As an** HR Employee  
**I want to** view a list of all employees with filtering options  
**So that** I can quickly find specific employees or groups

**Acceptance Criteria:**
- I can view a paginated list of all active employees
- I can filter by department, position, or employment status
- I can sort by name, hire date, or department
- I can export filtered lists to Excel
- The list shows key information (name, position, department, status)

---

## Epic 2: Attendance Tracking System

### User Story 2.1: Attendance Data Import
**As an** HR Employee  
**I want to** upload monthly attendance data via Excel files  
**So that** the system can track employee attendance automatically

**Acceptance Criteria:**
- I can upload Excel files with attendance data for any month
- The system validates data format and employee IDs
- Invalid entries are highlighted with error messages
- Successfully imported data is stored in the database
- I can preview data before confirming the import

### User Story 2.2: Attendance Monitoring Dashboard
**As an** HR Employee  
**I want to** view real-time attendance information  
**So that** I can monitor employee attendance patterns

**Acceptance Criteria:**
- I can view daily attendance summary (present, absent, late)
- I can see attendance details for individual employees
- I can filter attendance data by date range and employee
- Attendance statistics are displayed with charts
- I can export attendance reports to Excel

### User Story 2.3: Absence Detection and Alerts
**As an** HR Employee  
**I want to** receive automatic notifications about employee absences  
**So that** I can take immediate action when needed

**Acceptance Criteria:**
- The system automatically detects unexcused absences
- I receive real-time notifications for unexpected absences
- Notifications include employee details and absence type
- I can configure notification preferences (email, in-app)
- I can mark absences as excused or follow up on them

---

## Epic 3: Leave Management System

### User Story 3.1: Leave Data Import
**As an** HR Employee  
**I want to** import leave requests and approvals via Excel  
**So that** the system can track employee time off accurately

**Acceptance Criteria:**
- I can upload Excel files with leave request data
- The system validates leave dates and employee IDs
- Overlapping leaves are detected and flagged
- Leave balances are automatically updated
- I receive confirmation of successful import

### User Story 3.2: Leave Balance Tracking
**As an** HR Employee  
**I want to** track employee leave balances  
**So that** I can ensure compliance with company policies

**Acceptance Criteria:**
- I can view current leave balances for all employees
- The system shows vacation days, sick days, and personal days separately
- Leave balances are updated automatically when leaves are taken
- I can view leave history for any employee
- I can export leave balance reports

### User Story 3.3: Holiday and Legal Days Off Management
**As an** Admin  
**I want to** configure company holidays and legal days off  
**So that** they are automatically considered in salary calculations

**Acceptance Criteria:**
- I can add, edit, and remove company holidays
- I can set recurring holidays (annual holidays)
- Legal days off are automatically applied to all employees
- Holidays are excluded from absence calculations
- I can view a calendar of all configured holidays

---

## Epic 4: Automated Salary Calculation System

### User Story 4.1: Salary Calculation Engine
**As an** HR Employee  
**I want the system to** automatically calculate monthly salaries  
**So that** I can save time and reduce calculation errors

**Acceptance Criteria:**
- The system calculates base salary for each employee
- Overtime hours are calculated at the appropriate rate (1.5x base hourly rate)
- Absences are deducted from the total salary
- Holidays and legal days off are not deducted
- Approved leaves are handled according to company policy

### User Story 4.2: Salary Calculation Rules Configuration
**As an** Admin  
**I want to** configure salary calculation rules  
**So that** the system follows company policies accurately

**Acceptance Criteria:**
- I can set overtime multiplier rates
- I can configure deduction rules for different absence types
- I can set minimum and maximum working hours per month
- I can define different rules for different employee categories
- Changes to rules are logged and versioned

### User Story 4.3: Monthly Payroll Generation
**As an** HR Employee  
**I want to** generate monthly payroll reports  
**So that** I can process employee payments accurately

**Acceptance Criteria:**
- I can generate payroll for any month with complete data
- The report shows detailed salary breakdown for each employee
- I can export payroll data to Excel for accounting systems
- The system shows warnings for employees with incomplete data
- Generated payrolls are saved and can be regenerated

### User Story 4.4: Salary Breakdown and Transparency
**As an** HR Employee  
**I want to** view detailed salary breakdowns for each employee  
**So that** I can explain salary calculations to employees

**Acceptance Criteria:**
- I can view itemized salary calculations (base + overtime - deductions)
- The breakdown shows days worked, overtime hours, and absences
- I can export individual salary slips
- Historical salary data is preserved and accessible
- Calculations include clear explanations for each component

---

## Epic 5: Notification and Alert System

### User Story 5.1: Real-time Event Notifications
**As an** HR Employee  
**I want to** receive real-time notifications about important events  
**So that** I can respond quickly to HR issues

**Acceptance Criteria:**
- I receive notifications for unexpected absences
- I get alerts for employees arriving late
- Notifications appear in the web interface immediately
- I can configure which events trigger notifications
- Notification history is maintained for reference

### User Story 5.2: Email Notification System
**As an** HR Employee  
**I want to** receive email notifications for critical events  
**So that** I'm informed even when not using the system

**Acceptance Criteria:**
- Critical events trigger automatic email notifications
- I can configure email notification preferences
- Emails include relevant employee information and next steps
- I can disable email notifications if preferred
- Email templates are professional and informative

### User Story 5.3: Notification Dashboard
**As an** HR Employee  
**I want to** view all notifications in a centralized dashboard  
**So that** I can track and manage all HR events efficiently

**Acceptance Criteria:**
- I can view all notifications in chronological order
- I can filter notifications by type, date, or employee
- I can mark notifications as read/unread
- I can take actions directly from notifications (e.g., mark absence as excused)
- Notification statistics help me identify patterns

---

## Epic 6: Reporting and Analytics System

### User Story 6.1: Standard HR Reports
**As an** HR Employee  
**I want to** generate standard HR reports  
**So that** I can analyze workforce data and trends

**Acceptance Criteria:**
- I can generate monthly attendance reports
- I can create payroll summary reports
- I can export reports in Excel and PDF formats
- Reports include charts and visualizations
- I can schedule reports to be generated automatically

### User Story 6.2: Custom Report Builder
**As an** HR Employee  
**I want to** create custom reports with selected data fields  
**So that** I can analyze specific metrics important to my organization

**Acceptance Criteria:**
- I can select which data fields to include in reports
- I can apply filters and date ranges to reports
- I can save custom report templates for reuse
- I can share reports with other authorized users
- Reports can be exported in multiple formats

### User Story 6.3: Analytics Dashboard
**As an** Admin  
**I want to** view comprehensive analytics about workforce patterns  
**So that** I can make data-driven HR decisions

**Acceptance Criteria:**
- I can view attendance trends over time
- I can see overtime patterns by department
- I can analyze absence rates and patterns
- Interactive charts help me drill down into data
- Dashboard can be customized with relevant widgets

---

## Epic 7: System Administration

### User Story 7.1: User Management
**As an** Admin  
**I want to** manage system users and their permissions  
**So that** I can control access to sensitive HR data

**Acceptance Criteria:**
- I can create and manage HR Employee accounts
- I can assign different permission levels to users
- I can deactivate user accounts when needed
- User activity is logged for security purposes
- Password policies are enforced

### User Story 7.2: Data Import History and Validation
**As an** Admin  
**I want to** view history of all data imports and their validation results  
**So that** I can ensure data integrity and troubleshoot issues

**Acceptance Criteria:**
- I can view complete history of Excel file imports
- I can see validation errors and how they were resolved
- I can re-process failed imports
- Import logs include timestamp, user, and file details
- I can export import history for auditing

### User Story 7.3: System Configuration
**As an** Admin  
**I want to** configure system-wide settings  
**So that** the system operates according to company policies

**Acceptance Criteria:**
- I can configure company working hours and days
- I can set up notification settings and email templates
- I can configure salary calculation parameters
- I can set data retention policies
- Configuration changes are logged and can be reverted

---

## Epic 8: Data Integration and File Management

### User Story 8.1: Excel File Upload Interface
**As an** HR Employee  
**I want an** intuitive interface for uploading Excel files  
**So that** I can easily import HR data into the system

**Acceptance Criteria:**
- I can drag and drop Excel files for upload
- The system shows upload progress and validation status
- I can preview data before confirming import
- Error messages are clear and actionable
- I can download template files for correct formatting

### User Story 8.2: Data Validation and Error Handling
**As an** HR Employee  
**I want the system to** validate uploaded data and highlight errors  
**So that** I can ensure data accuracy before processing

**Acceptance Criteria:**
- The system validates all data formats and constraints
- Errors are highlighted with specific row and column references
- I can fix errors and re-upload corrected files
- Warnings are shown for suspicious but valid data
- Validation rules are clearly documented

### User Story 8.3: Data Export Capabilities
**As an** HR Employee  
**I want to** export system data to Excel format  
**So that** I can use the data in other systems or for reporting

**Acceptance Criteria:**
- I can export employee lists with selected fields
- I can export payroll data for accounting systems
- I can export attendance reports for analysis
- Exported files maintain proper formatting
- Large exports are processed in the background

---

## Technical Considerations

### Security Requirements
- Secure authentication and authorization
- Data encryption at rest and in transit
- Audit logging for all data modifications
- GDPR compliance for employee data protection

### Performance Requirements
- Support for up to 1000 employees
- Excel file processing within 30 seconds
- Real-time notifications with < 1 second delay
- Web interface responsive on desktop and mobile

### Integration Requirements
- MongoDB for flexible document storage
- Docker containers for easy deployment
- RESTful API design for potential future integrations
- Comprehensive logging and monitoring

### Development Workflow
- GitHub Actions for CI/CD pipeline
- Automated testing for all critical functions
- Code quality checks and security scanning
- Documentation generation and maintenance

---

## Success Metrics

1. **Time Savings**: Reduce monthly payroll processing time by 80%
2. **Accuracy**: Achieve 99.9% accuracy in salary calculations
3. **Response Time**: HR receives absence notifications within 1 minute
4. **User Adoption**: 100% HR team adoption within 30 days
5. **Error Reduction**: 95% reduction in manual calculation errors

---

## Future Enhancements (Out of Scope for Demo)

- Mobile application for employee self-service
- Integration with time tracking devices
- Advanced analytics and machine learning insights
- Multi-company support
- Cloud deployment with scalability features