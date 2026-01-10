# Reminder Email Troubleshooting Guide

## Issues Fixed

### 1. **Schedule Frequency**
- **Before**: Reminder processor ran every hour at minute 0 (e.g., 1:00, 2:00, 3:00)
- **After**: Now runs every 5 minutes for better responsiveness
- **Impact**: If you set a reminder for 5:48 PM, it will be processed within 5 minutes instead of waiting until 6:00 PM

### 2. **Email Service Configuration**
- **Default Mode**: `EMAIL_SERVICE=stub` (emails are logged to console, not actually sent)
- **To Send Real Emails**: Configure SMTP or another email service in `.env`

### 3. **Better Logging**
- Added detailed logging to show:
  - When reminders are found
  - Which reminders are being processed
  - Success/failure status for each reminder
  - Email sending details

### 4. **Manual Trigger Endpoint**
- Added `/api/admin/reminders/process` endpoint to manually trigger reminder processing
- Useful for testing without waiting for the scheduled run

## How to Test Your Reminder

### Option 1: Wait for Automatic Processing
1. The reminder processor now runs every 5 minutes
2. Check your backend console logs for processing messages
3. If `EMAIL_SERVICE=stub`, you'll see email logs in the console (not actual emails)

### Option 2: Manually Trigger Processing (Recommended for Testing)
1. Make sure you're logged in to the frontend
2. Open browser DevTools (F12) → Console tab
3. Run this command:
```javascript
fetch('http://localhost:5000/api/admin/reminders/process', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

Or use curl:
```bash
curl -X POST http://localhost:5000/api/admin/reminders/process \
  -H "Content-Type: application/json" \
  --cookie "refreshToken=YOUR_TOKEN"
```

### Option 3: Check Backend Console
1. Look at your backend terminal/console
2. You should see messages like:
   - `🔔 Processing due reminders at...`
   - `📧 Found X due reminder(s)`
   - `📤 Sending reminder...`
   - `✅ Successfully sent reminder...` or `❌ Failed to process reminder...`

## Email Service Configuration

### Current Status (Stub Mode)
- Emails are **logged to console only**
- You'll see messages like:
  ```
  📧 [STUB EMAIL] Would send email:
     To: user@example.com
     Subject: Reminder: Follow-up for Google
  ```

### To Send Real Emails

#### Option A: SMTP (Gmail, Outlook, etc.)
Add to `backend/.env`:
```env
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### Option B: Resend (Recommended for Production)
Add to `backend/.env`:
```env
EMAIL_SERVICE=resend
RESEND_API_KEY=your-resend-api-key
```

#### Option C: SendGrid
Add to `backend/.env`:
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
```

## Checking if Your Reminder Was Processed

1. **Check the Reminders Page**: 
   - Go to `/dashboard/reminders`
   - Look for a "Sent" badge on your reminder
   - If it shows "Sent", the reminder was processed

2. **Check Backend Logs**:
   - Look for processing messages in your backend console
   - Check for any error messages

3. **Check Database** (if you have MongoDB Compass):
   - Look at the `reminders` collection
   - Check if `sent: true` and `sentAt` is set

## Common Issues

### Issue: Reminder not processed
**Possible Causes**:
- Reminder date is in the future (check the time)
- Server was restarted and reminder processor didn't start
- Email service failed (check console logs)

**Solution**: 
- Manually trigger processing using the admin endpoint
- Check backend console for error messages

### Issue: No email received
**Possible Causes**:
- `EMAIL_SERVICE=stub` (default) - emails are only logged
- SMTP credentials incorrect
- Email went to spam folder

**Solution**:
- Check backend console for email logs
- Configure real email service if needed
- Check spam folder

### Issue: Reminder processed but email failed
**Check**:
- Backend console for error messages
- Email service configuration
- Network connectivity

## Next Steps

1. **Test the manual trigger** to verify your reminder works
2. **Check backend console** to see if the reminder was found and processed
3. **Configure email service** if you want to receive actual emails (not just console logs)
4. **Restart backend server** to apply the new 5-minute schedule

