
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://www.example.com/');

  await page.exposeFunction('puppeteerLogMutation', () => {
    console.log('Mutation Detected: A child node has been added or removed.');
  });

  await page.evaluate(() => {
    const target = document.querySelector('body');
    const observer = new MutationObserver( mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          puppeteerLogMutation();
        }
      }
    });
    observer.observe(target, { childList: true });
  });

  await page.evaluate(() => {
    document.querySelector('body').appendChild(document.createElement('br'));
  });

})();