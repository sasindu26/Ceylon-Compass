# Google OAuth Setup Instructions

## Steps to Enable Google Login

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name your project (e.g., "Ceylon Compass")
4. Click "Create"

### 2. Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in:
     - App name: Ceylon Compass
     - User support email: your email
     - Developer contact: your email
   - Click "Save and Continue"
   - Add scopes: email, profile (these are default)
   - Click "Save and Continue"
   - Add test users if needed
   - Click "Save and Continue"

4. Now create OAuth client ID:
   - Application type: "Web application"
   - Name: Ceylon Compass Web Client
   - Authorized JavaScript origins:
     - `http://localhost:5173`
     - `http://localhost:5000`
   - Authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback`
     - `http://localhost:5173`
   - Click "Create"

5. Copy your Client ID and Client Secret

### 4. Update Environment Variables

1. Open `backend/.env`
2. Replace the placeholders:
   ```
   GOOGLE_CLIENT_ID=your-actual-client-id-here
   GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
   ```

3. Open `src/pages/LogIn.jsx`
4. Find line 109 and replace:
   ```jsx
   <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID_HERE">
   ```
   With:
   ```jsx
   <GoogleOAuthProvider clientId="your-actual-client-id-here">
   ```

### 5. Restart Servers

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd ..
npm run dev
```

### 6. Test Google Login

1. Go to http://localhost:5173/login
2. Click the "Sign in with Google" button
3. Select your Google account
4. Grant permissions
5. You should be logged in!

## Troubleshooting

### "Upload preset not found" Error (Fixed!)
- The profile photo upload now uses the existing `restaurants` preset
- This should work without any additional Cloudinary configuration

### Google Login Not Working
- Make sure both Client ID values match (in .env and LogIn.jsx)
- Check that redirect URIs are correctly configured in Google Cloud Console
- Ensure your app is in "Testing" mode if using test users
- Check browser console for specific error messages

### CORS Errors
- Make sure `FRONTEND_URL` in backend `.env` is set to `http://localhost:5173`
- Restart backend server after changing .env

## Security Notes

- **Never commit `.env` files to Git!**
- Add `.env` to your `.gitignore` file
- Use different credentials for production
- Set up proper OAuth consent screen for production use
