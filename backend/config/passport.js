const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const crypto = require('crypto');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google OAuth Profile:', profile);

        // Check if user already exists
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Update profile photo if not set
          if (!user.profilePhoto && profile.photos && profile.photos.length > 0) {
            user.profilePhoto = profile.photos[0].value;
            await user.save();
          }
          console.log('Existing Google user logged in:', user.email);
          return done(null, user);
        }

        // Extract first and last names from Google profile
        let firstName = 'User';
        let lastName = 'Name';
        
        if (profile.name) {
          firstName = profile.name.givenName || 'User';
          lastName = profile.name.familyName || 'Name';
        } else if (profile.displayName) {
          // Fallback: split displayName if name object not available
          const nameParts = profile.displayName.split(' ');
          firstName = nameParts[0] || 'User';
          lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Name';
        }

        // Create new user
        const username = profile.displayName
          ? profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000)
          : profile.emails[0].value.split('@')[0];

        user = new User({
          username,
          title: 'Mr.', // Default title, user can change in profile
          firstName,
          lastName,
          email: profile.emails[0].value,
          password: crypto.randomBytes(32).toString('hex'), // Random password for OAuth users
          country: 'Sri Lanka', // Default country
          city: 'Colombo', // Default city
          profilePhoto: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '',
          role: 'user'
        });

        await user.save();
        console.log('New Google user created:', user.email);
        return done(null, user);
      } catch (err) {
        console.error('Error in Google OAuth:', err);
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
