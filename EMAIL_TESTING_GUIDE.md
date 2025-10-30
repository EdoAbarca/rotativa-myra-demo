# Email Notification System - Testing Guide

This guide provides step-by-step instructions for manually testing the email notification system.

## Prerequisites

1. Backend server running
2. MongoDB database accessible
3. Email service credentials configured (or test in development mode)

## Setup

### Option 1: Using Gmail (Recommended for Testing)

1. Create or use an existing Gmail account
2. Enable 2-factor authentication
3. Generate an app-specific password: https://myaccount.google.com/apppasswords
4. Create `.env` file in `backend/` directory:

```env
PORT=3001
MONGODB_URI=mongodb://mongodb:27017/rotativa-myra
NODE_ENV=development

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourcompany.com
EMAIL_FROM_NAME=Rotativa MYRA System
```

### Option 2: Development Mode (No Email Sent)

If you don't configure email credentials, the system will run in development mode:
- Emails are logged to console instead of being sent
- All functionality works except actual email delivery
- Perfect for testing the system without email service

## Test Scenarios

### 1. Verify Email Service Connection

**Test:** Check if email service is properly configured

```bash
curl http://localhost:3001/notifications/email-connection
```

**Expected Response (with credentials configured):**
```json
{
  "success": true,
  "connected": true,
  "message": "Email service is connected and ready"
}
```

**Expected Response (development mode):**
```json
{
  "success": true,
  "connected": false,
  "message": "Email service is not connected. Check configuration."
}
```

---

### 2. Configure Email Preferences

**Test:** Enable email notifications for a user

```bash
curl -X PUT http://localhost:3001/notifications/preferences/hr_admin \
  -H "Content-Type: application/json" \
  -d '{
    "email_enabled": true,
    "email_address": "your-test-email@gmail.com",
    "notification_types": ["absence", "late"]
  }'
```

**Expected Response:**
```json
{
  "user_id": "hr_admin",
  "email_enabled": true,
  "in_app_enabled": true,
  "email_address": "your-test-email@gmail.com",
  "notification_types": ["absence", "late"],
  "createdAt": "2025-...",
  "updatedAt": "2025-..."
}
```

---

### 3. Test Absence Alert Email

**Test:** Trigger an absence detection which should send an email

```bash
curl -X POST "http://localhost:3001/notifications/detect-absences?date=2025-01-15"
```

**Expected Behavior:**
1. Absences are detected for the date
2. In-app notifications created
3. Emails queued and sent to configured address
4. Response shows detected absences

**Check Email:**
- Check your inbox for "Absence Alert" email
- Verify professional formatting
- Check employee information is correct
- Verify "Next Steps" section is present

**Verify in Logs:**
```bash
# Check backend logs for:
# - "Email queued for [email]"
# - "Email sent successfully to [email]"
```

---

### 4. Test Late Arrival Alert Email

**Test:** Detect late arrivals and send email

```bash
curl -X POST "http://localhost:3001/notifications/detect-late-arrivals?date=2025-01-15"
```

**Expected Behavior:**
1. Late arrivals detected
2. Emails queued and sent
3. Response shows late arrival details

**Check Email:**
- Look for "Late Arrival Alert" email
- Verify amber-colored header
- Check timing details (expected, actual, minutes late)
- Verify professional formatting

---

### 5. View Email Delivery Logs

**Test:** Check email delivery history

```bash
# All email logs
curl http://localhost:3001/notifications/email-logs

# Logs for specific user
curl "http://localhost:3001/notifications/email-logs?user_id=hr_admin"

# Limited results
curl "http://localhost:3001/notifications/email-logs?limit=10"
```

**Expected Response:**
```json
{
  "success": true,
  "count": 2,
  "logs": [
    {
      "_id": "...",
      "recipient": "your-test-email@gmail.com",
      "subject": "Absence Alert - John Doe",
      "template": "absence-alert",
      "status": "sent",
      "sent_at": "2025-01-15T10:30:00Z",
      "message_id": "...",
      "retry_count": 0,
      "createdAt": "2025-01-15T10:29:50Z"
    }
  ]
}
```

---

### 6. Check Email Statistics

**Test:** View aggregate email delivery statistics

```bash
curl http://localhost:3001/notifications/email-stats
```

**Expected Response:**
```json
{
  "success": true,
  "stats": {
    "total": 5,
    "sent": 4,
    "failed": 1,
    "pending": 0,
    "queued": 0
  }
}
```

---

### 7. Test Email Retry Logic

**Test:** Verify automatic retry for failed emails

**Steps:**
1. Temporarily break email configuration (wrong password)
2. Trigger an email notification
3. Check email logs - should show "failed" status
4. Fix email configuration
5. Wait 1 minute for retry worker to run
6. Check logs again - should show "sent" status

```bash
# Check failed emails
curl http://localhost:3001/notifications/email-logs | grep "failed"

# Wait 1 minute, then check again
curl http://localhost:3001/notifications/email-logs | grep "sent"
```

---

### 8. Test Disabling Email Notifications

**Test:** Disable email notifications while keeping in-app enabled

```bash
curl -X PUT http://localhost:3001/notifications/preferences/hr_admin \
  -H "Content-Type: application/json" \
  -d '{
    "email_enabled": false,
    "in_app_enabled": true
  }'
```

**Expected Behavior:**
1. Trigger absence detection
2. In-app notifications should work
3. No emails should be sent
4. Verify no new entries in email logs

---

### 9. Test Notification Type Filtering

**Test:** Receive only specific notification types via email

```bash
# Enable only absence notifications
curl -X PUT http://localhost:3001/notifications/preferences/hr_admin \
  -H "Content-Type: application/json" \
  -d '{
    "email_enabled": true,
    "notification_types": ["absence"]
  }'

# Trigger late arrival detection
curl -X POST http://localhost:3001/notifications/detect-late-arrivals

# Should not send email for late arrivals
```

---

### 10. Test Email Template Rendering

**Test:** Verify email templates render correctly with data

**Manual Test:**
1. Send an absence alert email
2. Check email in multiple email clients:
   - Gmail (web and mobile)
   - Outlook (web and desktop)
   - Apple Mail
3. Verify:
   - Header is red for absence, amber for late
   - All employee information displays correctly
   - Next steps section is readable
   - Footer is present with preferences info
   - Email is mobile-responsive

---

## Verification Checklist

After running all tests, verify:

- [ ] Email service connection verified
- [ ] Email preferences can be configured
- [ ] Absence alert emails sent successfully
- [ ] Late arrival alert emails sent successfully
- [ ] Email logs show delivery history
- [ ] Email statistics are accurate
- [ ] Failed emails automatically retry
- [ ] Email notifications can be disabled
- [ ] Notification type filtering works
- [ ] Email templates render correctly in multiple clients
- [ ] Mobile-responsive emails work on phones
- [ ] In-app notifications still work when email disabled

## Common Issues

### Email Not Received

**Possible Causes:**
1. Email in spam folder - Check spam/junk
2. Wrong email address - Verify preference configuration
3. Email service credentials incorrect - Check connection endpoint
4. Email disabled - Check preferences

**Debug Steps:**
```bash
# Check email connection
curl http://localhost:3001/notifications/email-connection

# Check email logs for errors
curl http://localhost:3001/notifications/email-logs | grep "failed"

# Check notification preferences
curl http://localhost:3001/notifications/preferences/hr_admin
```

### Emails Failing to Send

**Check:**
1. Email service credentials in `.env`
2. Email service quotas/limits
3. Backend logs for error messages
4. Email logs for retry status

### Retry Not Working

**Verify:**
1. Retry worker is running (check logs for "Email retry worker started")
2. Failed emails have next_retry_at set
3. Wait at least 1 minute for retry to trigger
4. Check email stats for failed count decreasing

## Performance Testing

### Load Test Email Queue

```bash
# Generate multiple notifications rapidly
for i in {1..10}; do
  curl -X POST http://localhost:3001/notifications/detect-absences &
done
wait

# Check that all emails were queued and sent
curl http://localhost:3001/notifications/email-stats
```

**Expected:** All emails should be queued and eventually sent without errors.

## Security Testing

### Test Input Validation

```bash
# Try invalid email address
curl -X PUT http://localhost:3001/notifications/preferences/hr_admin \
  -H "Content-Type: application/json" \
  -d '{
    "email_address": "not-an-email"
  }'

# Should be handled gracefully by nodemailer
```

### Test SQL Injection Protection

```bash
# Try NoSQL injection in user_id
curl "http://localhost:3001/notifications/email-logs?user_id={\$ne:null}"

# Should return empty or error, not all records
```

## Cleanup

After testing, you may want to:

```bash
# Reset preferences
curl -X PUT http://localhost:3001/notifications/preferences/hr_admin \
  -H "Content-Type: application/json" \
  -d '{
    "email_enabled": false,
    "notification_types": []
  }'
```

## Conclusion

If all tests pass:
- ✅ Email notification system is working correctly
- ✅ Ready for production deployment
- ✅ All features functioning as expected

If any tests fail:
- Review error messages in backend logs
- Check email service configuration
- Verify database connectivity
- Review security summary for any alerts
