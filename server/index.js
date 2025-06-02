
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

async function runBackgroundTask() {
  console.log('Running scheduled price check...');
  const items = await TrackedItem.find();

  const tasks = items.map(async (item) => {
    if (item.notified) return;

    try {
      const currentPrice = await getAmazonPrice(item.url);
      if (!currentPrice) return;

      console.log(`Current: ${currentPrice}, Target: ${item.targetPrice}`);

      if (currentPrice <= item.targetPrice) {
        await sendNotification(item.email, item.url, currentPrice);
        item.notified = true;
        await item.save();
      }
    } catch (err) {
      console.error(`Error processing item ${item.url}:`, err);
    }
  });

  await Promise.allSettled(tasks);
  console.log('Background task finished.');
}

runBackgroundTask();
// Cron job runs every 10 minutes.
cron.schedule('*/10 * * * *', () => {
  runBackgroundTask().catch(err => {
    console.error('Error in scheduled task:', err);
  });
  console.log('Scheduled task completed');
});

app.listen(5001, () => {
  console.log('Server listening on port 5001');
});
