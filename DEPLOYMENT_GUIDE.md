# 🚀 Ceylon Compass Deployment Guide

## Current Deployment Status

✅ **Frontend**: Deployed on Vercel  
URL: https://ceylon-compass-eight.vercel.app/

✅ **Backend**: Deployed on Koyeb  
URL: https://vivacious-fanchon-ceylonweb-e40cba11.koyeb.app/

---

## 🔧 Backend Configuration (Koyeb)

### Environment Variables Required:

Add these in your Koyeb dashboard under **Service → Environment Variables**:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ceylonDB
FRONTEND_URL=https://ceylon-compass-eight.vercel.app
JWT_SECRET=your_super_secret_jwt_key_2024_ceylon_compass
SESSION_SECRET=your_session_secret_key_2024
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_specific_password
CLOUDINARY_CLOUD_NAME=dzetdg1sz
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
NODE_ENV=production
PORT=8000
```

### Important Notes:

1. **Gmail App Password**:
   - Go to Google Account → Security → 2-Step Verification → App Passwords
   - Generate a new app password for "Ceylon Compass"
   - Use this password in `EMAIL_PASS`

2. **MongoDB Atlas**:
   - Whitelist Koyeb's IP addresses (or use `0.0.0.0/0` for all IPs)
   - Go to MongoDB Atlas → Network Access → Add IP Address

3. **CORS Configuration**:
   - Backend now accepts requests from your Vercel frontend
   - Configured in `backend/server.js`

---

## 🎨 Frontend Configuration (Vercel)

### Environment Variables Required:

Add these in Vercel dashboard under **Settings → Environment Variables**:

```env
VITE_API_URL=https://vivacious-fanchon-ceylonweb-e40cba11.koyeb.app
VITE_CLOUDINARY_CLOUD_NAME=dzetdg1sz
VITE_CLOUDINARY_UPLOAD_PRESET=ceylon-compass
```

### Build Settings:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

---

## 🐛 Common Issues & Fixes

### Issue 1: 404 NOT_FOUND Error on Login

**Problem**: Backend route not found  
**Solution**:

1. Check backend is running: Visit https://vivacious-fanchon-ceylonweb-e40cba11.koyeb.app/api/auth/test
2. Verify CORS settings allow your frontend domain
3. Check Koyeb logs for errors

### Issue 2: CORS Error

**Problem**: "Access-Control-Allow-Origin" error  
**Solution**:

1. Ensure `FRONTEND_URL` is set correctly in Koyeb
2. Backend CORS now accepts: `https://ceylon-compass-eight.vercel.app`
3. Redeploy backend after adding environment variable

### Issue 3: Email Verification Not Working

**Problem**: Email transporter error  
**Solution**:

1. Use Gmail App-Specific Password (not your regular password)
2. Enable 2-Factor Authentication on Gmail
3. Generate app password: https://myaccount.google.com/apppasswords

### Issue 4: Images Not Loading

**Problem**: Cloudinary images not displaying  
**Solution**:

1. Check Cloudinary credentials are correct
2. Ensure upload preset is set to "unsigned"
3. Verify cloud name matches in both frontend and backend

---

## 📝 Deployment Checklist

### Before Deploying:

- [ ] Update all API URLs to use environment variables
- [ ] Set up MongoDB Atlas with proper IP whitelist
- [ ] Create Gmail app-specific password
- [ ] Configure Cloudinary account
- [ ] Test locally with production URLs

### Backend (Koyeb):

- [ ] Set all environment variables
- [ ] Deploy from GitHub repository
- [ ] Check deployment logs for errors
- [ ] Test API endpoints: `/api/auth/test`, `/api/events`, etc.
- [ ] Verify CORS is working

### Frontend (Vercel):

- [ ] Set environment variables (VITE_API_URL)
- [ ] Deploy from GitHub repository
- [ ] Check build logs
- [ ] Test login/register functionality
- [ ] Test all major features

---

## 🔍 Testing Your Deployment

### 1. Backend Health Check:

```bash
# Test if backend is alive
curl https://vivacious-fanchon-ceylonweb-e40cba11.koyeb.app/api/events

# Should return JSON array of events
```

### 2. Frontend to Backend Connection:

1. Open: https://ceylon-compass-eight.vercel.app/
2. Open Browser Dev Tools (F12)
3. Go to Network tab
4. Try to login
5. Check if requests go to `https://vivacious-fanchon-ceylonweb-e40cba11.koyeb.app`
6. Look for CORS errors in Console

### 3. Test API Endpoints:

```bash
# Events
GET https://vivacious-fanchon-ceylonweb-e40cba11.koyeb.app/api/events

# Restaurants
GET https://vivacious-fanchon-ceylonweb-e40cba11.koyeb.app/api/restaurants

# Accommodations
GET https://vivacious-fanchon-ceylonweb-e40cba11.koyeb.app/api/accommodations

# Countries
GET https://vivacious-fanchon-ceylonweb-e40cba11.koyeb.app/api/locations/countries
```

---

## 🚨 Debugging Steps

### If Login Fails:

1. **Check Network Tab** in Browser Dev Tools:
   - Is the request going to the correct URL?
   - What's the status code? (200, 404, 500?)
   - What's the error message in response?

2. **Check Koyeb Logs**:
   - Go to Koyeb Dashboard → Your Service → Logs
   - Look for POST /api/auth/login requests
   - Check for errors

3. **Verify Environment Variables**:
   - Koyeb: Check all env vars are set correctly
   - Vercel: Check VITE_API_URL is correct

4. **Test Backend Directly**:
```bash
curl -X POST https://vivacious-fanchon-ceylonweb-e40cba11.koyeb.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

---

## 📞 Support Resources

### MongoDB Atlas
- Dashboard: https://cloud.mongodb.com/
- Network Access: Add `0.0.0.0/0` to allow all IPs

### Koyeb
- Dashboard: https://app.koyeb.com/
- Logs: Service → Logs tab
- Environment: Service → Settings → Environment

### Vercel
- Dashboard: https://vercel.com/dashboard
- Deployments: Check build logs
- Environment: Settings → Environment Variables

### Cloudinary
- Dashboard: https://cloudinary.com/console
- Upload Presets: Settings → Upload
- Cloud Name: Found in dashboard URL

---

## ✅ Next Steps After Deployment

1. **Set up Custom Domain** (Optional):
   - Vercel: Add custom domain in settings
   - Update `FRONTEND_URL` in Koyeb

2. **Enable HTTPS** (Already done by Vercel & Koyeb)

3. **Set up Monitoring**:
   - Koyeb provides built-in monitoring
   - Vercel provides analytics

4. **Regular Backups**:
   - MongoDB Atlas automatic backups
   - Export data regularly

5. **Security**:
   - Rotate JWT_SECRET periodically
   - Keep dependencies updated
   - Monitor for vulnerabilities

---

## 🎉 Success Indicators

Your deployment is successful when:

✅ Frontend loads without errors  
✅ You can register a new user  
✅ You can login successfully  
✅ Events/Restaurants/Accommodations display  
✅ Images upload and display correctly  
✅ Admin panel works (if you're admin)  
✅ Booking system works  
✅ Email notifications arrive  

---

**Last Updated**: November 18, 2025  
**Version**: 1.0.0
