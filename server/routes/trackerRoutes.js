const express = require('express');
const router = express.Router();
const TrackedItem = require('../models/TrackedItem');
const isEmailValid = require('../utils/emailValidator');

router.post('/', async (req, res) => {

  const { email, url, targetPrice } = req.body;
  try {

    // Validate email format
    const valid = await isEmailValid(email);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid or unreachable email address' });
    }

    const newItem = new TrackedItem({ email, url, targetPrice });
    await newItem.save();
    res.status(201).json({ message: 'Item tracked successfully.' });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
