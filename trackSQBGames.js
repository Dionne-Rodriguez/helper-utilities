// import sendMessage from "./CopeDiscordBot.js"
import puppeteer from 'puppeteer'


(async () => {

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: process.env.WINDOWSCHROMEEXE

  });
  const page = await browser.newPage();
  const rareClanInfoPage = 'https://warthunder.com/en/community/claninfo/COPE'
  const wtLocalPage = 'http://127.0.0.1:8111/'
  const initialSquadronPoints = await getCurrentSquadronRating()
  await page.goto(wtLocalPage);
  await startGameTracker(page, initialSquadronPoints)

  const getCurrentSquadronRating = async () => {
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: process.env.WINDOWSCHROMEEXE

    });
    const page = await browser.newPage();
    await page.goto(rareClanInfoPage)
    return await page.evaluate(() => {
      return parseInt(document.querySelector(".squadrons-counter__value").innerHTML.trim())
    })
  }



  async function startGameTracker(page, initialSquadronPoints, getCurrentSquadronRating) {
    await page.waitForSelector('#textlines')
    const target = await page.$('#textlines')
    const initialPoints = initialSquadronPoints
    await page.evaluate((target, initialPoints, getCurrentSquadronRating) => {
      function stringToNumber(str) {
        // Split the string into two parts using the ":" separator
        const parts = str.split(":");

        // Convert each part to a number and pad it with a leading zero if necessary
        const hours = Number(parts[0]).toString().padStart(2, "0");
        const minutes = Number(parts[1]).toString().padStart(2, "0");

        // Join the parts together and return the result as a number
        return Number(`${hours}${minutes}`);
      }

      const observer = new MutationObserver(async mutations => {
        for await (const mutation of mutations) {
          const oldTimeStamp = stringToNumber(document.querySelector("#textlines > div:nth-last-child(2) > span").innerHTML)
          const recentlyAddedTimeStamp = stringToNumber(document.querySelector("#textlines > div:last-child > span").innerHTML)
          if (recentlyAddedTimeStamp < oldTimeStamp) {
            const getCurrentSquadronRating = getCurrentSquadronRating
            const getSquadronPoints = await getCurrentSquadronRating();
            console.log(initialPoints, getSquadronPoints);

            console.log("new game initiated new chat session started");
          }
        }
      });
      console.log(initialPoints, "initialPoints")
      var config1 = { characterData: false, attributes: false, childList: true, subtree: false };
      var config = { characterData: true, attributes: false, childList: false, subtree: true };
      observer.observe(target, config1);

    }, target, initialPoints, getCurrentSquadronRating)
  }



  async function getSquadronRating(page) {
    const target = await page.$('.squadrons-counter__value');
    await page.evaluate((target) => {
      const oldValue = parseInt(target.textContent.replace(/\D+/g, ''));
      console.log(oldValue, "old val");
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
      console.log(target, "target")
      var config = { characterData: true, attributes: false, childList: false, subtree: true };
      observer.observe(target, config);



    }, target)
  }






})();



//PRESS A BUTTON REFRESHES THE WT SITE
//WE GET THE CURRENT VAL.. OLD VAL SHOULD BE STORED ALREADY
//STORE THE WIN OR LOSS IN ITS STATE VAR AND SEND TO DISCORD


//when battle chat or mission chat start at 0 time call the wt site to get the current val and compare to old value