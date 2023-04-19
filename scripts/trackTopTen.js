import {sendTopTenMessage} from "../discord/CopeDiscordBot.js";
import puppeteer from "puppeteer";
import cron from "node-cron";

const URL_LEADERBOARD = "https://warthunder.com/en/community/clansleaderboard/";

var intervalId, initialTopTenSquadPoints, finalTopTenSquadPoints;

const startScraping = async () => {
  console.log("Start scraping at:", new Date().toLocaleTimeString("en-US"));

  const initialTopTenSquadronPoints = async () => {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: 'chromium-browser',
      slowMo: 1000,
    });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.goto(URL_LEADERBOARD);

    var topTenTeamPoints = await page.evaluate(() => {
      var topTenTeams = [];
      for (let i = 1; i < 11; i++) {
        topTenTeams.push([
          document.querySelectorAll("tr")[i].childNodes[0].innerText.split(" ")[0].concat(" ", document.querySelectorAll("tr")[i].childNodes[1].innerText.split(" ")[0]),
          document.querySelectorAll("tr")[i].childNodes[1].firstChild.href,
        ]);
      }
      return topTenTeams;
    });
    topTenTeamPoints = new Map(topTenTeamPoints);

    for (const [teamName, teamLink] of topTenTeamPoints.entries()) {
      await page.setDefaultNavigationTimeout(0);
      await page.goto(teamLink);

      var squadronPoints = await page.evaluate(() => {
        return parseInt(
          document.querySelector(".squadrons-counter__value").innerHTML.trim()
        );
      });
      topTenTeamPoints.set(teamName, squadronPoints);
    }
    return topTenTeamPoints;
  };

  await updateGlobalVariables();
  console.log("Initial value:", initialTopTenSquadPoints);

  async function getUpdatedSquadronStats() {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: 'chromium-browser',
      slowMo: 1000,
    });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.goto(URL_LEADERBOARD);

    var topTenTeamPoints = await page.evaluate(() => {
      var topTenTeams = [];
      for (let i = 1; i < 11; i++) {
        topTenTeams.push([
          document.querySelectorAll("tr")[i].childNodes[0].innerText.split(" ")[0].concat(" ", document.querySelectorAll("tr")[i].childNodes[1].innerText.split(" ")[0]),
          document.querySelectorAll("tr")[i].childNodes[1].firstChild.href,
        ]);
      }
      return topTenTeams;
    });
    topTenTeamPoints = new Map(topTenTeamPoints);

    for (const [teamName, teamLink] of topTenTeamPoints.entries()) {
      await page.setDefaultNavigationTimeout(0);
      await page.goto(teamLink);

      var squadronPoints = await page.evaluate(() => {
        return parseInt(
          document.querySelector(".squadrons-counter__value").innerHTML.trim()
        );
      });
      topTenTeamPoints.set(teamName, squadronPoints);
    }

    console.log("Updated value:", topTenTeamPoints);
    await browser.close();

    let changesMessage = "";
    let changesDetected = false

    for (const [teamName, initialPoints] of initialTopTenSquadPoints.entries()) {
        const updatedPoints = topTenTeamPoints.get(teamName);
        if (initialPoints !== updatedPoints) {
            changesDetected = true;
            const pointsDifference = updatedPoints - initialPoints;
            const differenceSymbol = pointsDifference > 0 ? "<:smallgreenuptriangle:1083528485890445342>" : ":small_red_triangle_down:";
            changesMessage += `${teamName}: ${updatedPoints} (${differenceSymbol}${pointsDifference})\n`;
        }
    }

    if (changesDetected) {
        sendTopTenMessage(changesMessage);
    }

    normalizeUpdatedData();

    function normalizeUpdatedData() {
        changesDetected = false
        initialTopTenSquadPoints = topTenTeamPoints;
    }
  }
  intervalId = setInterval(getUpdatedSquadronStats, 15 * 60 * 1000);

  async function updateGlobalVariables() {
    initialTopTenSquadPoints = await initialTopTenSquadronPoints();
    finalTopTenSquadPoints = initialTopTenSquadPoints;
  }
};

const stopScraping = async () => {
    clearInterval(intervalId);
    console.log("Stop scraping at:", new Date().toLocaleTimeString("en-US"));
  };

// Schedule the cron job to start and stop scraping
cron.schedule("0 10,21 * * *", () => {
  startScraping();
});

cron.schedule("0 18,2 * * *", () => {
  stopScraping();
});






  
  startScraping();