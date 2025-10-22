// backend/routes/authRoutes.js
import express from 'express';
import passport from 'passport';
import generateToken from '../utils/generateToken.js';

const router = express.Router();

// @desc    Auth with Google
// @route   GET /api/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
router.get('/google/callback', (req, res, next) => {

  console.log("CALLBACK ROUTE HIT!");
  console.log("Session object:", req.session);
  console.log("User on session:", req.user);
  passport.authenticate('google', (err, user, info) => {
    // This is our custom callback to get more details

    if (err) {
      // This will catch any internal errors from the Passport strategy
      console.error("PASSPORT AUTHENTICATION ERROR:", err);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=Authentication-Error`);
    }

    if (!user) {
      // This is the most likely path. 'info' will tell us why it failed.
      console.error("PASSPORT AUTHENTICATION FAILED (NO USER):", info);
      const message = info ? info.message : 'Unknown authentication error';
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(message)}`);
    }

    // If we get here, authentication was successful.
    // We must manually log the user in when using a custom callback.
   req.logIn(user, (loginErr) => {
  if (loginErr) {
    console.error("ERROR DURING req.logIn:", loginErr);
    return next(loginErr);
  }

  // Successful login, now generate token and redirect
  const token = generateToken(req.user._id);
  
  // --- THIS IS THE FIX ---
  // Convert the user object to a URL-safe string and add it to the redirect URL
  const userString = encodeURIComponent(JSON.stringify(req.user));
  return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&user=${userString}`);
});

  })(req, res, next);
});

export default router;