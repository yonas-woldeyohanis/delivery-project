import express from 'express';
import axios from 'axios';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Initialize Chapa payment
// @route   POST /api/payment/initialize-chapa
// @access  Private
router.post('/initialize-chapa', protect, async (req, res) => {
  try {
    const { amount, currency, email, first_name, last_name, tx_ref } = req.body;

    // Chapa API requires these fields
    const requiredFields = { amount, currency, email, first_name, last_name, tx_ref };
    for (const field in requiredFields) {
      if (!requiredFields[field]) {
        return res.status(400).json({ message: `Missing required field: ${field}` });
      }
    }

    // This is the data Chapa's API expects
    const chapaData = {
      amount,
      currency,
      email,
      first_name,
      last_name,
      tx_ref,
      // IMPORTANT: These URLs are where Chapa will redirect the user after payment
      // We will build the /payment-verify page in a later step
      return_url: `http://localhost:5173/payment-verify`, 
      // You can also set up a webhook for server-to-server confirmation
      // callback_url: 'https://your_backend_url/api/payment/chapa-webhook',
    };

    const config = {
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    // Make the request to Chapa's API
    const response = await axios.post(
      'https://api.chapa.co/v1/transaction/initialize',
      chapaData,
      config
    );

    // If successful, Chapa returns a checkout URL
    if (response.data?.status === 'success') {
      res.status(200).json({ checkout_url: response.data.data.checkout_url });
    } else {
      throw new Error('Could not initialize payment with Chapa.');
    }

  } catch (error) {
    console.error('Chapa Initialization Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Server error during payment initialization.' });
  }
});

// @desc    Verify a Chapa transaction
// @route   GET /api/payment/verify-chapa/:tx_ref
// @access  Private

router.get('/verify-chapa/:tx_ref', protect, async (req, res) => {
  try {
    const { tx_ref } = req.params;

    const config = {
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      },
    };

    // Ask Chapa's API about this specific transaction
    const response = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      config
    );

    // If Chapa confirms the payment was successful, we send success to our frontend
    if (response.data?.status === 'success') {
      res.status(200).json({ status: 'success', data: response.data.data });
    } else {
      res.status(400).json({ status: 'failed', message: 'Payment verification failed.' });
    }

  } catch (error) {
    console.error('Chapa Verification Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Server error during payment verification.' });
  }
});


export default router;