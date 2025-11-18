# Backend Fixes Applied ✅

## Summary of Fixes

This document outlines the fixes that have been applied to resolve errors and warnings in the Ceylon Compass backend.

---

## ✅ Fixed Issues

### 1. **Deprecated Mongoose Options (Fixed)**
**Status:** ✅ FIXED

**What was wrong:**
- The mongoose connection was using deprecated options `useNewUrlParser` and `useUnifiedTopology`

**What was fixed:**
- Removed deprecated options from `server.js`
- Changed from:
  ```javascript
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  ```
- To:
  ```javascript
  mongoose.connect(process.env.MONGO_URI)
  ```

**File changed:** `backend/server.js`

---

### 2. **Duplicate Database Index (Fixed)**
**Status:** ✅ FIXED

**What was wrong:**
- The `EventReq` model had a duplicate index on the `createdBy` field
- It was defined both in the field definition (`index: true`) AND as a separate schema index

**What was fixed:**
- Removed `index: true` from the `createdBy` field definition
- Kept the `schema.index({ createdBy: 1 })` at the bottom of the schema

**File changed:** `backend/models/EventReq.js`

---

## ⚠️ MANUAL FIX REQUIRED

### 3. **Email Configuration (Requires Your Action)**
**Status:** ⚠️ YOU NEED TO UPDATE YOUR .env FILE

**The Error:**
```
Error verifying email transporter: Error: Invalid login: 534-5.7.9 Application-specific password required.
```

**What's wrong:**
- Gmail no longer allows regular passwords for third-party apps
- You need to use an App Password instead

**How to Fix:**

#### Step 1: Locate your `.env` file
- File location: `ceylon-compass-main/backend/.env`

#### Step 2: Update the EMAIL_PASS variable
Replace the current `EMAIL_PASS` with your App Password.

**Before:**
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-old-password
```

**After:**
```env
EMAIL_USER=sasindumlhpul2@gmail.com
EMAIL_PASS=dqdc tydc anqn yefh
```

⚠️ **IMPORTANT:** Remove spaces from the app password!

**Correct format:**
```env
EMAIL_PASS=dqdctydcanqnyefh
```

#### Step 3: Restart the backend server
```bash
cd backend
npm start
# or
node server.js
```

#### Step 4: Verify it works
You should see:
```
✓ Email transporter verified and ready
```

Instead of:
```
✗ Error verifying email transporter
```

---

## How to Get a Gmail App Password (If Needed)

1. **Enable 2-Step Verification:**
   - Go to https://myaccount.google.com/security
   - Enable "2-Step Verification" if not already enabled

2. **Generate App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "CeylonCompass"
   - Click "Generate"
   - Copy the 16-character password (it will have spaces)
   - Remove the spaces and paste into your `.env` file

3. **Update .env file** with the new password (without spaces)

4. **Restart your backend server**

---

## Testing After Fixes

### Test Mongoose Connection:
```bash
cd backend
node server.js
```

Expected output:
```
✓ Connected to MongoDB
✓ Email transporter verified and ready
✓ Server is running on port 5000
```

### Test Email Functionality:
1. Try the contact form on your website
2. Try booking an event
3. Check if confirmation emails are sent

---

## Files Modified

1. ✅ `backend/server.js` - Removed deprecated mongoose options
2. ✅ `backend/models/EventReq.js` - Removed duplicate index
3. ⚠️ `backend/.env` - **YOU NEED TO UPDATE THIS MANUALLY**

---

## Final Checklist

- [x] Deprecated mongoose warnings fixed
- [x] Duplicate index warning fixed
- [ ] **Email configuration updated in .env file** ← YOU NEED TO DO THIS
- [ ] Backend server restarted
- [ ] Email system tested and working

---

## Support

If you encounter any issues after applying these fixes:

1. Check that you removed all spaces from the App Password
2. Make sure 2-Step Verification is enabled on your Gmail account
3. Restart the backend server completely
4. Check the console for any error messages

---

**Last Updated:** November 18, 2024
**Status:** 2/3 fixes applied automatically, 1 requires manual update