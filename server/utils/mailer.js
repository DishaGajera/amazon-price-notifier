const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendNotification(to, url, price) {
  const mailOptions = {
    from: process.env.EMAIL,
    to,
    subject: 'Amazon Price Drop Alert!',
    text: `The price dropped to $${price}. Check it out: ${url}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent to', to);
  } catch (err) {
    console.error('Email error:', err.message);
  }
}

module.exports = { sendNotification };

