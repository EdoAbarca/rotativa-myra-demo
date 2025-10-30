# Email Templates

This directory contains Handlebars email templates for the notification system.

## Available Templates

### 1. absence-alert.hbs
Template for employee absence notifications.

**Variables:**
- `employee_name` - Name of the absent employee
- `employee_id` - Employee ID
- `absence_date` - Date of the absence
- `absence_type` - Type of absence (e.g., "Absent", "unexcused")

### 2. late-arrival-alert.hbs
Template for late arrival notifications.

**Variables:**
- `employee_name` - Name of the employee
- `employee_id` - Employee ID
- `date` - Date of late arrival
- `expected_time` - Expected check-in time
- `actual_time` - Actual check-in time
- `minutes_late` - Number of minutes the employee was late

## Template Structure

All templates follow a consistent structure:
1. **Header** - Color-coded header with alert type
2. **Alert Box** - Brief summary of the alert
3. **Employee Info** - Detailed employee information
4. **Next Steps** - Recommended actions for HR
5. **Footer** - Company branding and preferences information

## Customization

To customize templates:
1. Edit the `.hbs` files in this directory
2. Rebuild the application: `npm run build`
3. Restart the server

Templates use standard HTML/CSS and Handlebars syntax.

## Testing Templates

Templates are automatically compiled and cached when the EmailService initializes. To test:

1. Trigger a notification event (absence or late arrival)
2. Check the email logs: `GET /notifications/email-logs`
3. Verify the email was sent with the correct template

## Best Practices

- Keep templates mobile-responsive
- Use inline CSS for email client compatibility
- Test across major email clients (Gmail, Outlook, etc.)
- Keep file sizes small for fast loading
- Use web-safe fonts for consistent rendering
