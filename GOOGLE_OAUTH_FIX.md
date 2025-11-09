# 🔧 Fix Google OAuth Login Error

## Error: "Can't continue with google.com - Something went wrong"

This error occurs because your Google Cloud Console needs to be configured with authorized domains.

---

## ✅ Step-by-Step Fix Guide

### **Step 1: Open Google Cloud Console**
1. Go to: **https://console.cloud.google.com/apis/credentials**
2. Sign in with the Google account you used to create the OAuth credentials

### **Step 2: Select Your Project**
- Make sure you're in the correct project (check the project name at the top)

### **Step 3: Find Your OAuth 2.0 Client ID**
1. Look for **"OAuth 2.0 Client IDs"** section
2. Find the client ID that starts with: `802697914821-...`
3. Click on the **pencil icon (✏️)** or the client ID name to edit it

### **Step 4: Configure Authorized JavaScript Origins**
Scroll down to **"Authorized JavaScript origins"**

**Add these two URLs:**
```
http://localhost:5173
http://localhost:5000
```

Click **"+ ADD URI"** for each one.

### **Step 5: Configure Authorized Redirect URIs**
Scroll down to **"Authorized redirect URIs"**

**Add these two URLs:**
```
http://localhost:5173
http://localhost:5000/api/auth/google/callback
```

Click **"+ ADD URI"** for each one.

### **Step 6: Save Changes**
1. Scroll to the bottom
2. Click **"SAVE"** button
3. You should see a success message

### **Step 7: Wait for Propagation**
⏰ **IMPORTANT:** Google takes 2-5 minutes to propagate these changes globally.
- Wait at least 3 minutes before testing again

### **Step 8: Clear Browser Cache**
1. In Chrome, press: `Ctrl + Shift + Delete`
2. Select **"Cookies and other site data"**
3. Select **"Cached images and files"**
4. Click **"Clear data"**
5. Close and reopen your browser

### **Step 9: Test Google Login**
1. Go to: **http://localhost:5173/login**
2. Click **"Sign in with Google"**
3. Select your Google account
4. You should be logged in successfully! ✅

---

## 🎯 What Your Settings Should Look Like

### Authorized JavaScript origins:
- ✅ `http://localhost:5173`
- ✅ `http://localhost:5000`

### Authorized redirect URIs:
- ✅ `http://localhost:5173`
- ✅ `http://localhost:5000/api/auth/google/callback`

---

## 🐛 Troubleshooting

### Still seeing "Something went wrong"?
- **Wait longer:** Changes can take up to 5 minutes
- **Clear cache again:** Make sure all Google cookies are cleared
- **Try incognito mode:** Open http://localhost:5173/login in incognito window
- **Check project:** Make sure you edited the correct OAuth client in Google Console

### "Redirect URI mismatch" error?
- Double-check that you added EXACTLY: `http://localhost:5173` (no trailing slash)
- Make sure both origins AND redirect URIs are added

### Still not working?
1. Take a screenshot of your Google Cloud Console OAuth settings
2. Check the browser console for errors (F12 → Console tab)
3. Check backend logs for any error messages

---

## 📋 Current Configuration

Your application is currently configured with:

- **Frontend URL:** http://localhost:5173
- **Backend URL:** http://localhost:5000
- **Google Client ID:** (configured in backend/.env)
- **Google Client Secret:** (configured in backend/.env)

---

## 🎉 Once It Works

After successful login, you will:
1. Be redirected to the home page
2. See your name in the navigation bar
3. Have access to your profile with Google photo
4. Be able to add restaurants, events, and accommodations

---

**Note:** The servers are already running correctly. The only thing needed is updating Google Cloud Console settings!
