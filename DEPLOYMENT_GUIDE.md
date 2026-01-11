# Deployment Guide - Render (Backend) & Vercel (Frontend)

## 🚀 Render Backend Deployment Checklist

### Step 1: Render Service Configuration

**In Render Dashboard, when creating Web Service:**

1. **Basic Settings:**
   - **Name**: `joblytics-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend` ⚠️ **CRITICAL - Must be set to `backend`**
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Node Version**: `18` or `20` (match your local version)

2. **Environment Variables** (Add all of these):

```env
# Server
NODE_ENV=production
PORT=10000

# MongoDB (use your MongoDB Atlas connection string)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/joblytics?retryWrites=true&w=majority

# JWT Secrets (MUST be different values, 32+ characters each)
JWT_ACCESS_SECRET=your-32-character-minimum-secret-here
JWT_REFRESH_SECRET=your-different-32-character-secret-here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cookies (IMPORTANT for production)
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
COOKIE_DOMAIN=your-backend-url.onrender.com

# OpenAI
OPENAI_API_KEY=your-openai-api-key
AI_MODE=live

# Email Service - Resend
EMAIL_SERVICE=resend
RESEND_API_KEY=re_your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Joblytics
FRONTEND_URL=https://your-frontend.vercel.app

# Note: Update FRONTEND_URL and COOKIE_DOMAIN after getting your URLs
```

### Step 2: Common Deployment Errors & Fixes

#### Error: "Cannot find module"
**Fix**: Ensure `Root Directory` is set to `backend` in Render settings

#### Error: "Port already in use" or "EADDRINUSE"
**Fix**: 
- Set `PORT=10000` in environment variables
- Or remove PORT variable and let Render auto-assign (it will be in `process.env.PORT`)

#### Error: "MONGODB_URI is required"
**Fix**: 
- Check you're using `MONGODB_URI` (not `MONGO_URI`)
- Ensure the connection string is correct
- Check MongoDB Atlas allows connections from `0.0.0.0/0`

#### Error: "CORS error" or "Not allowed by CORS"
**Fix**: 
- Set `FRONTEND_URL` to your Vercel URL (e.g., `https://your-app.vercel.app`)
- Ensure no trailing slash in `FRONTEND_URL`
- CORS is now configured to be more flexible in production

#### Error: "RESEND_API_KEY not configured"
**Fix**: 
- Set `EMAIL_SERVICE=resend`
- Add `RESEND_API_KEY=re_...` (your actual Resend API key)
- Verify the email domain in Resend dashboard

#### Error: "Failed to start server"
**Fix**: 
- Check Render logs for specific error
- Verify all required environment variables are set
- Check MongoDB connection string is valid
- Ensure JWT secrets are set and different

### Step 3: After Deployment

1. **Get your backend URL**: `https://your-backend-name.onrender.com`
2. **Test health endpoint**: Visit `https://your-backend-name.onrender.com/health`
3. **Update environment variables**:
   - Set `COOKIE_DOMAIN=your-backend-name.onrender.com`
   - Set `FRONTEND_URL=https://your-frontend.vercel.app` (after frontend is deployed)

---

## 🎨 Vercel Frontend Deployment Checklist

### Step 1: Vercel Configuration

1. **Import Repository** from GitHub
2. **Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` ⚠️ **CRITICAL**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 2: Environment Variables

Add in Vercel Dashboard → Settings → Environment Variables:

```env
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
```

**Important**: 
- Variable name MUST start with `VITE_` to be accessible in frontend
- Replace `your-backend-url.onrender.com` with your actual Render backend URL

### Step 3: After Deployment

1. **Get your frontend URL**: `https://your-project.vercel.app`
2. **Update backend CORS**: 
   - Go back to Render
   - Update `FRONTEND_URL` environment variable to your Vercel URL
   - Redeploy backend (or it will auto-redeploy)

---

## 🔧 Troubleshooting

### Backend won't start
1. Check Render logs (click on your service → Logs tab)
2. Look for error messages
3. Common issues:
   - Missing environment variables
   - Wrong MongoDB connection string
   - Port binding issues

### Frontend can't connect to backend
1. Check `VITE_API_BASE_URL` is set correctly in Vercel
2. Check backend CORS allows your Vercel URL
3. Check backend is running (test `/health` endpoint)
4. Check browser console for CORS errors

### Cookies not working
1. Ensure `COOKIE_SECURE=true` in production
2. Ensure `COOKIE_SAME_SITE=none` for cross-origin
3. Ensure `COOKIE_DOMAIN` is set to your backend domain
4. Ensure frontend uses `withCredentials: true` in Axios (already configured)

---

## ✅ Final Checklist

Before deploying:
- [ ] All environment variables added to Render
- [ ] `Root Directory` set to `backend` in Render
- [ ] `MONGODB_URI` is correct (not `MONGO_URI`)
- [ ] JWT secrets are different and strong (32+ chars)
- [ ] `PORT=10000` set in Render (or let Render auto-assign)
- [ ] Debug logs removed from code

After backend deployment:
- [ ] Backend URL obtained
- [ ] Health check works (`/health` endpoint)
- [ ] Backend logs show no errors

After frontend deployment:
- [ ] Frontend URL obtained
- [ ] `VITE_API_BASE_URL` set in Vercel
- [ ] `FRONTEND_URL` updated in Render
- [ ] Test registration/login
- [ ] Test API calls

---

## 📝 Quick Reference

**Backend URL Format**: `https://your-service-name.onrender.com`
**Frontend URL Format**: `https://your-project.vercel.app`

**Backend Health Check**: `https://your-backend-url.onrender.com/health`
**Backend API Base**: `https://your-backend-url.onrender.com/api`

