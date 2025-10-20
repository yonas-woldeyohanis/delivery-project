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
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  // Successful authentication, generate our own JWT
  const token = generateToken(req.user._id);

  // Redirect the user back to a specific frontend page with the token
  res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
});

export default router;