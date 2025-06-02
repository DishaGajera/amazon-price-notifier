
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const cron = require('node-cron');
const trackerRoutes = require('./routes/trackerRoutes');
const TrackedItem = require('./models/TrackedItem');
const { getAmazonPrice } = require('./utils/scraper');
const { sendNotification } = require('./utils/mailer');

require('dotenv').config();

app.use(express.json());

const allowedOrigins = [
  "http://localhost:3000",
  "https://amazon-price-notifier.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// Connect to MongoDB using MONGO_URI
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));


//Routes
app.use('/api/track', trackerRoutes);

// Cron job runs every minutes
cron.schedule('* * * * *', async () => {
  console.log('Running scheduled price check...');
  const items = await TrackedItem.find();

  for (let item of items) {
    const currentPrice = await getAmazonPrice(item.url);
    console.log(`current price: ${currentPrice}`);
    if (!currentPrice) continue;

    console.log(`${item.targetPrice}`)

    if (currentPrice <= item.targetPrice && !item.notified) {
      await sendNotification(item.email, item.url, currentPrice);
      item.notified = true;
      await item.save();
    }
  }
});

app.listen(5001, () => {
  console.log('Server listening on port 5001');
});
