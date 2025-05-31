const axios = require('axios');
require('dotenv').config();

const isEmailValid = async (email) => {
  const API_KEY = process.env.MAILBOXLAYER_API_KEY;
  const url = `https://apilayer.net/api/check?access_key=${API_KEY}&email=${email}`;

  try {
    const res = await axios.get(url);
    const data = res.data;
    return data.format_valid && data.smtp_check && data.mx_found;
  } catch (err) {
    console.error('Email validation failed:', err.message);
    return false;
  }
};

module.exports = isEmailValid;
