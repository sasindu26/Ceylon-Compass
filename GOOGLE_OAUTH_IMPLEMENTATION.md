# Google OAuth Implementation - Ceylon Compass

## Overview
Successfully implemented Google OAuth 2.0 authentication using the **redirect flow** with Passport.js.

## Architecture
- **Frontend**: Custom Google login button redirects to backend OAuth route
- **Backend**: Passport.js with Google OAuth 2.0 strategy handles authentication
- **Flow**: User clicks button → Redirects to Google → Google authenticates → Callback to backend → JWT token generated → Redirects to frontend with token

## Files Modified

### Backend

1. **`backend/config/passport.js`** (New)
   - Passport.js Google OAuth strategy configuration
   - User serialization/deserialization
   - Find or create user logic
   - Auto-generates username and random password for OAuth users
   - Uses profile photo from Google account

2. **`backend/server.js`**
   - Added express-session middleware
   - Initialized Passport with `passport.initialize()` and `passport.session()`
   - Session configuration with secure cookies

3. **`backend/routes/auth.js`**
   - Added `GET /api/auth/google` - Initiates OAuth flow
   - Added `GET /api/auth/google/callback` - Handles OAuth callback
   - Added `GET /api/auth/me` - Returns current user data (for OAuth login)
   - Both OAuth routes use `session: false` (stateless JWT authentication)

### Frontend

1. **`src/pages/LogIn.jsx`**
   - Removed `@react-oauth/google` dependency
   - Removed `GoogleOAuthProvider` wrapper and `GoogleLogin` component
   - Added custom Google button with `handleGoogleLogin()` function
   - Added `useEffect` to handle OAuth callback with token parameter
   - Automatically fetches user data and stores in localStorage after OAuth

2. **`src/styles/Auth.css`**
   - Added `.google-login-button` styling
   - Google brand colors (white background, #4285f4 hover)
   - Google icon integration with SVG

## Environment Variables

Required in `backend/.env`:
```env
GOOGLE_CLIENT_ID=802617914821-uaitgq3cap2m6kareth3abj272Bb4Gdg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key
SESSION_SECRET=ceylon-compass-secret-key-2024
```

## Google Cloud Console Configuration

### Authorized JavaScript Origins
- `http://localhost:5173` (Frontend)
- `http://localhost:5000` (Backend)

### Authorized Redirect URIs
- `http://localhost:5000/api/auth/google/callback`

### OAuth Consent Screen
- Test users must be added for development
- Scopes: profile, email

## Authentication Flow

1. User clicks "Sign in with Google" button on `/login`
2. Browser redirects to `http://localhost:5000/api/auth/google`
3. Passport redirects to Google OAuth consent screen
4. User authorizes the application
5. Google redirects back to `http://localhost:5000/api/auth/google/callback`
6. Backend finds or creates user in database
7. Backend generates JWT token
8. Backend redirects to `http://localhost:5173/login?token=<jwt_token>`
9. Frontend detects token in URL parameters
10. Frontend calls `GET /api/auth/me` with token to fetch user data
11. Frontend stores token and user data in localStorage
12. Frontend redirects to home page

## User Model Updates

Added optional fields to support profile enhancements:
- `phone` (String) - User's phone number
- `location` (Object)
  - `address` (String) - User's address
  - `coordinates` (Object)
    - `latitude` (Number)
    - `longitude` (Number)

## Testing

1. **Start Backend**: `cd backend && npm run dev` (Port 5000)
2. **Start Frontend**: `npm run dev` (Port 5173)
3. Navigate to `http://localhost:5173/login`
4. Click "Sign in with Google"
5. Authorize with Google account (must be in test users list)
6. Should redirect back to home page logged in

## Dependencies

### Backend
- `passport@0.7.0` - Authentication middleware
- `passport-google-oauth20@2.0.0` - Google OAuth strategy
- `express-session@1.18.2` - Session management

### Frontend
- No additional dependencies (removed `@react-oauth/google`)

## Notes

- OAuth flow is **stateless** using JWT tokens (no server-side sessions stored)
- Session middleware is used only for Passport's OAuth flow
- Users created via Google OAuth have randomly generated passwords
- Profile photos are automatically imported from Google accounts
- Phone and location fields remain optional and can be filled in Profile page

## Troubleshooting

### Google Login Not Working
- Make sure both Client ID and Secret match in `backend/.env`
- Check that redirect URIs are correctly configured in Google Cloud Console
- Ensure your app is in "Testing" mode if using test users
- Make sure test users are added to OAuth consent screen
- Check browser console for specific error messages

### CORS Errors
- Make sure `FRONTEND_URL` in backend `.env` is set to `http://localhost:5173`
- Restart backend server after changing .env

## Security Notes

- **Never commit `.env` files to Git!**
- Add `.env` to your `.gitignore` file
- Use different credentials for production
- Set up proper OAuth consent screen for production use
