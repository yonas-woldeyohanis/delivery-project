// backend/config/passport.js
import GoogleStrategy from 'passport-google-oauth20';
import User from '../models/userModel.js';
import crypto from 'crypto';

const configurePassport = (passport) => {
  passport.use(new GoogleStrategy.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ email: profile.emails[0].value });

      if (user) {
        return done(null, user);
      } else {
        const newUser = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          profilePicture: profile.photos[0].value,
          password: crypto.randomBytes(20).toString('hex'), 
          role: 'customer',
        });
        
        await newUser.save();
        return done(null, newUser);
      }
    } catch (err) {
      console.error(err);
      return done(err, false);
    }
  }));

  // --- THIS IS THE FIX: ADD THESE TWO FUNCTIONS ---

  // This function is called to save the user's ID to the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // This function is called to retrieve the user from the database using the ID from the session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};

export default configurePassport;