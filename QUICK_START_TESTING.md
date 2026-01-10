# Quick Start Testing Guide

## Step 1: Start the Servers

### Backend Server
```bash
cd backend
npm run dev
```
**Expected**: Server starts on `http://localhost:5000`
**Check**: You should see "MongoDB connected" and "Server running on port 5000"

### Frontend Server
```bash
cd frontend
npm run dev
```
**Expected**: Server starts on `http://localhost:5173`
**Check**: Browser should open automatically or navigate to `http://localhost:5173`

---

## Step 2: Initial Setup Check

1. **Open Browser DevTools** (F12)
   - Go to Console tab
   - Go to Network tab
   - Keep these open during testing

2. **Check Home Page**
   - Navigate to `http://localhost:5173`
   - Should see the landing page
   - Click "Get Started" or navigate to `/register`

---

## Step 3: Basic Flow Test (5 minutes)

### 3.1 Register a New User
- Go to `/register`
- Fill form:
  - Name: "Test User"
  - Email: `test${Date.now()}@example.com` (unique email)
  - Password: "test1234"
- Click "Create account"
- **Expected**: Redirect to dashboard, see welcome message

### 3.2 Create Your First Application
- Click "Add Application" button
- Fill form:
  - Company: "Google"
  - Job Title: "Software Engineer"
  - Job Link: "https://careers.google.com"
  - Job Description: "We are looking for a software engineer..."
  - Status: "Applied"
  - Date Applied: Today's date
- Click "Create Application"
- **Expected**: Redirect to application details page

### 3.3 Check Dashboard
- Navigate to `/dashboard`
- **Check**: 
  - Stats show "1" total application
  - Recent Applications shows your application
  - Application Status shows counts

### 3.4 Test AI Features
- Navigate to `/dashboard/ai-tools`
- Find your application
- Click "Resume Match" button
- **Expected**: Loading, then AI insights appear
- **Note**: If `AI_MODE=mock` in backend, uses mock data

### 3.5 Create a Reminder
- Navigate to `/dashboard/reminders`
- Click "Create Reminder"
- Fill form:
  - Application: Select your application
  - Reminder Type: "Follow-up"
  - Date: Tomorrow
  - Notes: "Follow up on application"
- Click "Create"
- **Expected**: Reminder appears in list

### 3.6 Check Analytics
- Navigate to `/dashboard/analytics`
- **Check**: 
  - Charts render correctly
  - Numbers match your data
  - No errors in console

---

## Step 4: Common Issues & Fixes

### Issue: "Failed to load resource" errors
**Fix**: 
- Check backend is running on port 5000
- Check CORS is enabled in backend
- Check API base URL in frontend is correct

### Issue: 401 Unauthorized errors
**Fix**:
- Check cookies are being set (DevTools → Application → Cookies)
- Try logging out and logging back in
- Check JWT token is valid

### Issue: 400 Bad Request errors
**Fix**:
- Check request payload matches backend schema
- Check required fields are filled
- Check date formats are correct

### Issue: Charts not rendering
**Fix**:
- Check Recharts is installed: `npm list recharts`
- Check browser console for errors
- Verify analytics data is being returned

### Issue: AI features not working
**Fix**:
- Check `AI_MODE` in backend `.env` (should be `mock` or `live`)
- If `live`, check OpenAI API key is set
- Check job description exists for Resume Match/Interview Prep

---

## Step 5: Verify Data Persistence

1. Create an application
2. Refresh the page (F5)
3. **Check**: Application still exists
4. Edit the application
5. Refresh the page
6. **Check**: Changes persist
7. Delete the application
8. Refresh the page
9. **Check**: Application is deleted

---

## Step 6: Test Error Handling

1. **Network Error**: Stop backend server, try to load dashboard
   - **Expected**: Error toast, graceful handling

2. **Invalid Form**: Try to create application without company name
   - **Expected**: Validation error message

3. **404 Error**: Navigate to `/dashboard/applications/invalid-id`
   - **Expected**: Error message or redirect

---

## Quick Verification Checklist

- [ ] Backend server running (port 5000)
- [ ] Frontend server running (port 5173)
- [ ] Can register new user
- [ ] Can login
- [ ] Dashboard loads with data
- [ ] Can create application
- [ ] Can view application details
- [ ] Can edit application
- [ ] Can delete application
- [ ] AI features work
- [ ] Can create reminder
- [ ] Analytics page loads
- [ ] Charts render
- [ ] Navigation works
- [ ] Logout redirects to home

---

## Next Steps

Once basic flow works:
1. Test with multiple applications
2. Test all filters and search
3. Test pagination
4. Test responsive design
5. Test edge cases
6. Review full testing checklist: `TESTING_CHECKLIST.md`

---

## Need Help?

- Check browser console for errors
- Check Network tab for failed requests
- Check backend terminal for errors
- Verify MongoDB connection
- Check environment variables

