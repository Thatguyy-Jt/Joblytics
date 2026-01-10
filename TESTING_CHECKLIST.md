# Frontend-Backend Integration Testing Checklist

## Prerequisites
- ✅ Backend server running on `http://localhost:5000`
- ✅ Frontend dev server running on `http://localhost:5173`
- ✅ MongoDB connection active
- ✅ Environment variables configured (`.env` file in backend)

---

## 1. Authentication Testing

### 1.1 Registration
- [ ] Navigate to `/register`
- [ ] Fill in registration form:
  - Full Name (e.g., "John Doe")
  - Email (use a new email)
  - Password (at least 8 characters)
  - Check terms checkbox
- [ ] Click "Create account"
- [ ] **Expected**: Success toast, redirect to dashboard
- [ ] **Check**: User appears in MongoDB Compass

### 1.2 Login
- [ ] Logout if logged in
- [ ] Navigate to `/login`
- [ ] Enter registered email and password
- [ ] Click "Login"
- [ ] **Expected**: Success toast, redirect to dashboard

### 1.3 Logout
- [ ] Click logout button in sidebar
- [ ] **Expected**: Redirect to home page (`/`)

---

## 2. Dashboard Testing

### 2.1 Dashboard Overview
- [ ] Navigate to `/dashboard`
- [ ] **Check**: Stats cards show real data:
  - Total Applications
  - Success Rate
  - Pending Responses
  - Interviews
- [ ] **Check**: Recent Applications section shows applications (if any)
- [ ] **Check**: Upcoming Reminders section shows reminders (if any)
- [ ] **Check**: Application Status section shows status distribution
- [ ] **Check**: AI Insights card is visible

### 2.2 Dashboard Data Loading
- [ ] Refresh the page
- [ ] **Expected**: All data loads without errors
- [ ] **Check**: No console errors

---

## 3. Applications Testing

### 3.1 Applications List
- [ ] Navigate to `/dashboard/applications`
- [ ] **Check**: Applications list displays (or empty state if none)
- [ ] **Test**: Search functionality (search by company/job title)
- [ ] **Test**: Status filter dropdown
- [ ] **Test**: Sort dropdown (Newest First, Oldest First, etc.)
- [ ] **Test**: Pagination (if more than 10 applications)

### 3.2 Create Application
- [ ] Click "Add Application" button
- [ ] Fill in form:
  - Company Name: "Google"
  - Job Title: "Software Engineer"
  - Job Link: "https://careers.google.com/jobs/..."
  - Job Description: (paste a job description)
  - Status: "Applied"
  - Date Applied: (select a date)
  - Source: "LinkedIn"
  - Notes: "Great opportunity"
- [ ] Click "Create Application"
- [ ] **Expected**: Success toast, redirect to application details page
- [ ] **Check**: Application appears in applications list

### 3.3 View Application Details
- [ ] Click on an application from the list
- [ ] **Check**: All application details are displayed correctly
- [ ] **Check**: Edit button is visible
- [ ] **Check**: Delete button is visible

### 3.4 Edit Application
- [ ] On application details page, click "Edit"
- [ ] Modify some fields (e.g., change status to "Interview")
- [ ] Click "Save"
- [ ] **Expected**: Success toast, form switches back to view mode
- [ ] **Check**: Changes are reflected

### 3.5 Delete Application
- [ ] On application details page, click "Delete"
- [ ] Confirm deletion
- [ ] **Expected**: Success toast, redirect to applications list
- [ ] **Check**: Application no longer appears in list

---

## 4. AI Features Testing

### 4.1 AI Tools Page
- [ ] Navigate to `/dashboard/ai-tools`
- [ ] **Check**: All applications are listed
- [ ] **Check**: AI action buttons are visible for each application

### 4.2 Resume Match Analysis
- [ ] On AI Tools page, find an application with job description
- [ ] Click "Resume Match" button
- [ ] **Expected**: Loading state, then success toast
- [ ] **Check**: AI insights appear below the buttons
- [ ] **Note**: If AI_MODE=mock, will use mock data

### 4.3 Interview Preparation
- [ ] Click "Interview Prep" button for an application with job description
- [ ] **Expected**: Loading state, then success toast
- [ ] **Check**: Interview prep tips appear in insights

### 4.4 Resume Improvement
- [ ] Click "Resume Improvement" button
- [ ] Enter resume bullets when prompted (one per line)
- [ ] **Expected**: Loading state, then success toast
- [ ] **Check**: Resume improvement suggestions appear

### 4.5 AI Insights on Application Details
- [ ] Navigate to an application details page
- [ ] **Check**: AI Insights section is visible
- [ ] **Check**: Previously generated AI insights are displayed
- [ ] **Test**: Generate new AI insights from this page

---

## 5. Analytics Testing

### 5.1 Analytics Dashboard
- [ ] Navigate to `/dashboard/analytics`
- [ ] **Check**: Key metrics cards display:
  - Total Applications
  - Success Rate
  - Successful (Interviews + Offers)
  - Pending
- [ ] **Check**: Status Distribution pie chart renders
- [ ] **Check**: Status Breakdown bar chart renders
- [ ] **Check**: Monthly Trends line chart renders
- [ ] **Check**: Status Details grid shows all statuses with counts

### 5.2 Analytics Data Accuracy
- [ ] Compare analytics numbers with actual application counts
- [ ] **Verify**: Total matches count in applications list
- [ ] **Verify**: Status distribution matches actual status counts

---

## 6. Reminders Testing

### 6.1 Reminders List
- [ ] Navigate to `/dashboard/reminders`
- [ ] **Check**: Reminders list displays (or empty state)
- [ ] **Test**: Filter buttons (All, Upcoming, Past, Sent)
- [ ] **Test**: Reminder type filter dropdown

### 6.2 Create Reminder
- [ ] Click "Create Reminder" button
- [ ] Fill in form:
  - Application: (select from dropdown)
  - Reminder Type: "Follow-up"
  - Reminder Date & Time: (select future date/time)
  - Notes: "Follow up on application status"
- [ ] Click "Create"
- [ ] **Expected**: Success toast, modal closes, reminder appears in list

### 6.3 Edit Reminder
- [ ] Click edit icon on a reminder
- [ ] Modify reminder date or notes
- [ ] Click "Update"
- [ ] **Expected**: Success toast, changes reflected

### 6.4 Delete Reminder
- [ ] Click delete icon on a reminder
- [ ] Confirm deletion
- [ ] **Expected**: Success toast, reminder removed from list

### 6.5 Reminder Display
- [ ] **Check**: Reminders show correct date formatting (Today, Tomorrow, or formatted date)
- [ ] **Check**: Reminder type badges are colored correctly
- [ ] **Check**: "Sent" badge appears for sent reminders
- [ ] **Check**: Links to applications work correctly

---

## 7. Navigation Testing

### 7.1 Sidebar Navigation
- [ ] **Test**: All sidebar links:
  - Overview → `/dashboard`
  - Applications → `/dashboard/applications`
  - AI Tools → `/dashboard/ai-tools`
  - Analytics → `/dashboard/analytics`
  - Reminders → `/dashboard/reminders`
- [ ] **Check**: Active route is highlighted in sidebar

### 7.2 Breadcrumbs and Back Buttons
- [ ] **Test**: Back buttons on detail pages
- [ ] **Test**: "View All" links
- [ ] **Check**: Navigation flows correctly

---

## 8. Error Handling Testing

### 8.1 Network Errors
- [ ] Stop backend server
- [ ] Try to load dashboard
- [ ] **Expected**: Error toast, graceful error handling

### 8.2 Invalid Data
- [ ] Try to create application without required fields
- [ ] **Expected**: Error toast with validation message

### 8.3 401 Unauthorized
- [ ] Clear cookies/localStorage
- [ ] Try to access protected route
- [ ] **Expected**: Redirect to login page

### 8.4 404 Not Found
- [ ] Navigate to `/dashboard/applications/invalid-id`
- [ ] **Expected**: Error message, redirect or error state

---

## 9. Response Structure Testing

### 9.1 Verify Response Handling
- [ ] Open browser DevTools → Network tab
- [ ] Perform various API calls
- [ ] **Check**: All responses follow `{ success: true, data: { ... } }` structure
- [ ] **Verify**: Frontend correctly accesses `response.data.data.*`

---

## 10. UI/UX Testing

### 10.1 Loading States
- [ ] **Check**: Loading spinners appear during API calls
- [ ] **Check**: Loading states don't cause layout shifts

### 10.2 Empty States
- [ ] **Check**: Empty states display when no data
- [ ] **Check**: Empty states have helpful messages and CTAs

### 10.3 Responsive Design
- [ ] **Test**: Desktop view (≥1280px)
- [ ] **Test**: Tablet view (768px - 1279px)
- [ ] **Test**: Mobile view (<768px)
- [ ] **Check**: Layout adapts correctly

### 10.4 Animations
- [ ] **Check**: Page transitions are smooth
- [ ] **Check**: Card animations work
- [ ] **Check**: No janky animations

---

## 11. Data Persistence Testing

### 11.1 Create-Read-Update-Delete Flow
- [ ] Create a new application
- [ ] Refresh page
- [ ] **Check**: Application persists
- [ ] Edit the application
- [ ] Refresh page
- [ ] **Check**: Changes persist
- [ ] Delete the application
- [ ] Refresh page
- [ ] **Check**: Application is deleted

### 11.2 AI Insights Persistence
- [ ] Generate AI insights for an application
- [ ] Navigate away and back
- [ ] **Check**: AI insights are still displayed

---

## 12. Integration Points

### 12.1 Dashboard Integration
- [ ] **Verify**: Dashboard stats match actual data
- [ ] **Verify**: Recent applications link to correct details
- [ ] **Verify**: Reminders link to correct applications

### 12.2 Cross-Page Navigation
- [ ] **Test**: Navigation between all pages
- [ ] **Check**: State is maintained where appropriate
- [ ] **Check**: No data loss during navigation

---

## Known Issues to Watch For

1. **Response Structure**: Ensure all API calls use `response.data.data.*`
2. **Date Formatting**: Check date displays are correct
3. **Status Mapping**: Verify status labels match backend values
4. **AI Mock Mode**: If `AI_MODE=mock`, AI features will use mock data
5. **Cookie Handling**: Ensure JWT cookies are sent with requests

---

## Testing Notes

- **Backend URL**: `http://localhost:5000/api`
- **Frontend URL**: `http://localhost:5173`
- **MongoDB**: Check Compass for data verification
- **Console**: Watch for errors in browser console
- **Network Tab**: Monitor API requests/responses

---

## Quick Test Script

1. Register a new user
2. Create 3-5 job applications with different statuses
3. Generate AI insights for at least one application
4. Create 2-3 reminders
5. Check analytics dashboard
6. Test edit/delete operations
7. Verify all navigation links work
8. Test search and filters
9. Check responsive design
10. Verify logout redirects to home

---

## Success Criteria

✅ All CRUD operations work correctly
✅ All pages load without errors
✅ Data persists across page refreshes
✅ AI features generate and display insights
✅ Analytics show accurate data
✅ Reminders can be created, edited, and deleted
✅ Navigation is smooth and intuitive
✅ Error handling is graceful
✅ UI is responsive and polished

