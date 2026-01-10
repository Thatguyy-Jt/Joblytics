# Email Setup Guide - Real Email Sending

## ✅ Implementation Complete

The email service has been updated to send **real emails** when reminders are due. The system now supports:

1. **SMTP** (Gmail, Outlook, custom SMTP) - ✅ Fully implemented
2. **Resend** - ✅ Fully implemented (using SMTP endpoint)
3. **SendGrid** - ✅ Fully implemented (using SMTP endpoint)
4. **Stub Mode** - For development/testing (logs to console)

## Configuration

### Your `.env` file should have:

```env
# Email Service Selection
EMAIL_SERVICE=smtp
# Options: 'smtp', 'resend', 'sendgrid', or 'stub'

# Email "From" Configuration
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Joblytics

# SMTP Configuration (for Gmail/Outlook/custom SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Resend Configuration (alternative to SMTP)
RESEND_API_KEY=re_your_api_key_here

# SendGrid Configuration (alternative to SMTP)
SENDGRID_API_KEY=SG.your_api_key_here
```

## How It Works

1. **When a reminder's time is reached:**
   - The reminder processor runs every 5 minutes
   - It finds all due reminders (reminderDate <= now AND sent === false)
   - For each reminder, it sends an email to the user
   - After successful email, the reminder is marked as sent

2. **Email Service Selection:**
   - The system checks `EMAIL_SERVICE` in your `.env`
   - Uses the corresponding configuration
   - Verifies connection on startup
   - Logs all email attempts

## Verification

### Check Backend Console on Startup

When you start your backend server, you should see:

**For SMTP:**
```
✅ Email Service: SMTP configured (smtp.gmail.com:587)
✅ Email service connection verified successfully
```

**For Resend:**
```
✅ Email Service: Resend configured (using SMTP)
✅ Email service connection verified successfully
```

**For SendGrid:**
```
✅ Email Service: SendGrid configured (using SMTP)
✅ Email service connection verified successfully
```

### Check When Reminder is Processed

When a reminder is due, you'll see in the console:
```
🔔 Processing due reminders at 2024-01-10T17:48:00.000Z...
📧 Found 1 due reminder(s):
   - Reminder 123abc: follow-up for Google (due: 2024-01-10T17:48:00.000Z)
📤 Sending email to user@example.com via smtp...
✅ Email sent successfully to user@example.com
   Message ID: <abc123@mail.gmail.com>
✅ Successfully sent reminder 123abc to user@example.com
📊 Reminder processing complete: 1 sent, 0 failed
```

## Testing

### Test Email Sending

1. **Create a test reminder:**
   - Set reminder time to 1-2 minutes in the future
   - Wait for automatic processing (runs every 5 minutes)
   - OR manually trigger: `POST /api/admin/reminders/process`

2. **Check your email inbox:**
   - Check the inbox of the user who created the reminder
   - Check spam folder if not in inbox
   - Verify the "From" address matches your `EMAIL_FROM` setting

3. **Check backend console:**
   - Look for email sending logs
   - Check for any error messages

## Troubleshooting

### Issue: "Email service not initialized"
**Solution**: Check your `.env` file has all required variables for your selected `EMAIL_SERVICE`

### Issue: "SMTP configuration incomplete"
**Solution**: Make sure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS` are all set

### Issue: "RESEND_API_KEY not configured"
**Solution**: Set `RESEND_API_KEY` in your `.env` file

### Issue: "Email service connection verification failed"
**Possible Causes**:
- Wrong SMTP credentials
- Network/firewall blocking SMTP port
- Gmail requires App Password (not regular password)
- Resend/SendGrid API key is invalid

**Solution**:
- Verify credentials are correct
- For Gmail: Use App Password, not regular password
- Check API keys are valid
- Verify network allows SMTP connections

### Issue: Emails not received
**Check**:
1. Backend console for error messages
2. Spam/junk folder
3. Email address is correct
4. Email service is not in "stub" mode

## Email Types Sent

The system sends different email templates based on reminder type:

1. **Interview Reminders** → `sendInterviewReminder()`
2. **Follow-up Reminders** → `sendFollowUpReminder()`
3. **Deadline Reminders** → `sendFollowUpReminder()`
4. **Response Reminders** → `sendFollowUpReminder()`

All emails include:
- User's name
- Company name
- Job title
- Reminder type
- Action items

## Default "From" Address

Updated defaults:
- **Email**: `noreply@joblytics.com`
- **Name**: `Joblytics`

You can override these in your `.env`:
```env
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Joblytics
```

## Next Steps

1. ✅ Configure your `.env` file with email credentials
2. ✅ Restart your backend server
3. ✅ Check console for "Email service connection verified"
4. ✅ Create a test reminder
5. ✅ Wait for processing or manually trigger
6. ✅ Check email inbox

Your reminders will now send **real emails** to users! 🎉

