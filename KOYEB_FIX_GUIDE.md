# 🔧 Koyeb Deployment Fix Guide

## Your Error: "Service degraded - deployment failed"

---

## 🎯 **Quick Fix Steps**

### **Step 1: Configure Environment Variables in Koyeb**

1. Go to your Koyeb service: **ceylon-compass**
2. Click **Settings** tab
3. Scroll to **Environment variables**
4. Add ALL these variables:

```env
NODE_ENV=production
PORT=8000
MONGO_URI=mongodb+srv://sasindunilupath26:S26sasindu@ceyloncompass.t6tto.mongodb.net/ceylonDB?retryWrites=true&w=majority
JWT_SECRET=ceylon-compass-super-secret-jwt-key-2024-production
SESSION_SECRET=ceylon-compass-session-secret-key-2024-production
FRONTEND_URL=https://ceylon-compass-eight.vercel.app
EMAIL_USER=sasindunilupath26@gmail.com
EMAIL_PASS=YOUR_GMAIL_APP_SPECIFIC_PASSWORD_HERE
CLOUDINARY_CLOUD_NAME=dzetdg1sz
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

**⚠️ IMPORTANT**: Replace `EMAIL_PASS` with Gmail App-Specific Password (not your regular password)

---

### **Step 2: Configure Build Settings**

In Koyeb **Settings**:

1. **Root directory**: `backend` (if your backend is in a subfolder)
   - OR leave empty if backend files are in root
   
2. **Build command**: `npm install`

3. **Run command**: `npm start`

4. **Port**: `8000` (Koyeb default)

5. **Instance type**: 
   - Use **nano** or **micro** (Free tier)
   - At least 512MB RAM

---

### **Step 3: Fix Repository Structure**

Your repository structure should be:

```
Ceylon-Compass/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env (don't commit this!)
│   ├── routes/
│   ├── models/
│   └── ...
├── src/
├── public/
└── package.json (frontend)
```

**If backend is in a subfolder**, set **Root directory** to `backend` in Koyeb settings.

---

### **Step 4: Check Deployment Logs**

1. Go to Koyeb dashboard
2. Click on the failed deployment `13a1c320`
3. Click **Logs** tab
4. Look for the actual error message

Common errors you might see:
- ❌ `Cannot find module` → Missing dependencies
- ❌ `EADDRINUSE` → Port already in use
- ❌ `MongoDB connection failed` → Wrong connection string
- ❌ `Authentication failed` → Wrong MongoDB credentials

---

### **Step 5: Get Gmail App-Specific Password**

Your current password won't work. You need an App-Specific Password:

1. Go to: https://myaccount.google.com/security
2. Enable **2-Step Verification** (if not already)
3. Go to: https://myaccount.google.com/apppasswords
4. Select:
   - **App**: Mail
   - **Device**: Other (Custom name) → Type "Ceylon Compass"
5. Click **Generate**
6. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
7. Use this in `EMAIL_PASS` environment variable (remove spaces)

---

### **Step 6: Update MongoDB Atlas**

1. Go to: https://cloud.mongodb.com/
2. Select your cluster: **ceyloncompass**
3. Click **Network Access** (left sidebar)
4. Click **Add IP Address**
5. Click **Allow Access from Anywhere**
6. Add IP: `0.0.0.0/0`
7. Click **Confirm**

This allows Koyeb to connect to your MongoDB.

---

### **Step 7: Redeploy**

After setting all environment variables:

1. Click **Redeploy** button in Koyeb
2. Wait 2-3 minutes for deployment
3. Check logs for success message: `Server is running on port 8000`

---

## 🔍 **Verify Deployment Works**

### Test 1: Check Backend Health
```bash
curl https://vivacious-fanchon-ceylonweb-e40cba11.koyeb.app/api/events
```

Should return JSON data.

### Test 2: Check Login Endpoint
```bash
curl -X POST https://vivacious-fanchon-ceylonweb-e40cba11.koyeb.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

Should return error (user not found) but NO 404 error.

### Test 3: Check Frontend Login
1. Open: https://ceylon-compass-eight.vercel.app/
2. Try to login
3. Should work now!

---

## 🚨 **If Still Getting Errors**

### Error: "Cannot connect to MongoDB"

**Fix**: Check MongoDB connection string
- Make sure password doesn't have special characters (or encode them)
- Make sure `ceylonDB` database name is correct
- Make sure IP whitelist includes `0.0.0.0/0`

### Error: "Port 8000 already in use"

**Fix**: Koyeb automatically handles this. Just redeploy.

### Error: "Module not found"

**Fix**: 
1. Make sure `package.json` is in the same directory as `server.js`
2. Check build logs for npm install errors
3. Try deleting `node_modules` and redeploying

### Error: "Email transporter failed"

**Fix**: 
1. Use Gmail App-Specific Password (not regular password)
2. Make sure EMAIL_USER is correct
3. Check if Gmail account has 2FA enabled

---

## 📋 **Checklist Before Redeploying**

- [ ] All environment variables are set in Koyeb
- [ ] `PORT=8000` is set
- [ ] MongoDB connection string is correct
- [ ] MongoDB IP whitelist includes `0.0.0.0/0`
- [ ] Gmail App-Specific Password is generated and set
- [ ] Build command is `npm install`
- [ ] Run command is `npm start`
- [ ] Root directory is set correctly (if backend is in subfolder)

---

## 🎉 **Success Indicators**

Your deployment is successful when you see:

✅ Status: **Healthy** (green)  
✅ Logs show: `MongoDB connected successfully`  
✅ Logs show: `Server is running on port 8000`  
✅ Test URL works: `https://vivacious-fanchon-ceylonweb-e40cba11.koyeb.app/api/events`  
✅ Frontend can login successfully  

---

## 📸 **Screenshot What You See**

If still having issues, send me screenshots of:
1. Koyeb deployment logs (the red error messages)
2. Koyeb environment variables page
3. Koyeb settings page (build/run commands)

I'll help you debug from there!

---

**Last Updated**: November 18, 2025
