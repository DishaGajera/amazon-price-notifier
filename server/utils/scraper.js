const puppeteer = require('puppeteer');

async function getAmazonPrice(url) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
    );

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });

    await page.waitForSelector('.a-price .a-offscreen', { timeout: 10000 });

    const price = await page.evaluate(() => {
        const priceSpan = document.querySelector('.a-price .a-offscreen');
        return priceSpan ? parseFloat(priceSpan.innerText.replace(/[^0-9.]/g, '')) : null;
      });
    await browser.close();
    return price;

  } catch (error) {
    console.error('Puppeteer Scraper Error:', error.message);
    return null;
  }
}

module.exports = { getAmazonPrice };
