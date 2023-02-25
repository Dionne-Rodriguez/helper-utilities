import sendMessage from "./CopeDiscordBot.js"
import puppeteer from 'puppeteer'


(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome'
  });
  const page = await browser.newPage();
  await page.goto('https://warthunder.com/en/community/claninfo/COPE');

  const target = await page.$('.squadrons-counter__value');
await page.evaluate((target) => {
  const oldValue = parseInt(target.textContent.replace(/\D+/g, ''));
  console.log(oldValue,"old val");
  const observer = new MutationObserver(async mutations => {
    for await (const mutation of mutations) {
      const newValue = parseInt(mutation.target.textContent.replace(/\D+/g, ''));
      // const newValue = parseInt(target.textContent.replace(/\D+/g, ''));
      // console.log(newValue, "new val");
      console.log(newValue, "new val");
      if (newValue > oldValue) {
        console.log("win");
      } else {
        console.log("loss");
      }
    }
  });
  console.log(target,"target")
  var config = { characterData: true, attributes: false, childList: false, subtree: true };
  observer.observe(target, config);
}, target)
 

})();