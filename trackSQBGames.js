import sendMessage from "./CopeDiscordBot.js"
import puppeteer from 'puppeteer'


(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: process.env.WINDOWSCHROMEEXE,
    devtools: true
  });

  const page = await browser.newPage();
  const rareClanInfoPage = 'https://warthunder.com/en/community/claninfo/COPE--Fight%204%20Whats%20Right%20or%20Die'
  const wtLocalPage = 'http://127.0.0.1:8111/'
  const scoreBoard = { win: 0, loss: 0 }

  const getCurrentSquadronRating = async () => {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.WINDOWSCHROMEEXE
    });
    const page = await browser.newPage();
    await page.goto(rareClanInfoPage)
    return await page.evaluate(() => {
      return parseInt(document.querySelector(".squadrons-counter__value").innerHTML.trim())
    })
  }

  //log current game should be called within the browser and call to get the current points and compare the
  const logCurrentGame = async (initialPoints) => {
    // const browser = await puppeteer.launch({
    //   headless: true,
    //   executablePath: process.env.WINDOWSCHROMEEXE
    // });
    // const page = await browser.newPage();
    // await page.goto(rareClanInfoPage)
    console.log(initialPoints, "initial points from the log current game")
    // return await page.evaluate(() => {
    //   return parseInt(document.querySelector(".squadrons-counter__value").innerHTML.trim())
    // })
  }


  var initialSquadronPoints = await getCurrentSquadronRating()
  await page.exposeFunction("sendMessage", sendMessage)
  await page.exposeFunction("getCurrentSquadronRating", getCurrentSquadronRating)
  await page.exposeFunction("logCurrentSquadron", logCurrentGame)
  await page.goto(wtLocalPage);


  await startGameTracker(page, initialSquadronPoints, scoreBoard)

  async function startGameTracker(page, initialSquadronPoints, scoreBoard) {
    await page.waitForSelector('#textlines')
    const target = await page.$('#textlines')
    const initialPoints = initialSquadronPoints
    await page.evaluate((target, initialPoints, scoreBoard) => {
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

            console.log(recentlyAddedTimeStamp, oldTimeStamp);
            var currentSquadronPoints = await window.getCurrentSquadronRating();
            console.log(initialPoints, await window.getCurrentSquadronRating());
            var pointDifferential = Math.abs(initialPoints - currentSquadronPoints)
            if (currentSquadronPoints > initialPoints) {
              console.log("win");
              scoreBoard.win += 1
              initialPoints += pointDifferential
              sendMessage(`WIN ${scoreBoard.win} - ${scoreBoard.loss} (+${pointDifferential})`)
            }
            if (currentSquadronPoints == initialPoints) {
              //check length of chat array less than 2 means start of game
              //will avoud networks calls
              console.log("misfire")
            }
            if (currentSquadronPoints < initialPoints) {
              console.log("loss");
              scoreBoard.loss += 1
              initialPoints -= pointDifferential
              sendMessage(`LOSS ${scoreBoard.win} - ${scoreBoard.loss} (-${pointDifferential})`)
            }
            console.log("new game initiated new chat session started");
          }
        }
      });
      console.log(initialPoints, "initialPoints")
      var config1 = { characterData: false, attributes: false, childList: true, subtree: false };
      var config = { characterData: true, attributes: false, childList: false, subtree: true };
      observer.observe(target, config1);
    }, target, initialPoints, scoreBoard)
  }
})();