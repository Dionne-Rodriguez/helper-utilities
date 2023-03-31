import sendMessage from "./CopeDiscordBot.js";
import puppeteer from "puppeteer";
import cron from "node-cron";
// Schedule the cron job to start scraping at 10am EST every day
// cron.schedule("0 10 * * *", () => {
//   startScraping();
// });

// // Schedule the cron job to stop scraping at 6pm EST every day
// cron.schedule("0 18 * * *", () => {
//   stopScraping();
// });

var intervalId, initialTopTenSquadPoints, endSessionStats;
const startScraping = async () => {
    console.log("Start scraping at:", new Date().toLocaleTimeString("en-US"));

    const initialTopTenSquadronPoints = async () => {
        const browser = await puppeteer.launch({
            headless: true,
            executablePath: process.env.MACCHROMEPATH,
            slowMo: 1000,
        });
        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(0);
        await page.goto("https://warthunder.com/en/community/clansleaderboard/");

        var topTenTeamPoints = await page.evaluate(() => {
            var topTenTeams = []
            for (let i = 1; i < 11; i++) {
                topTenTeams.push([
                    document.querySelectorAll("tr")[i].childNodes[1].innerText.split(" ")[0],
                    document.querySelectorAll("tr")[i].childNodes[1].firstChild.href
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
            console.log(squadronPoints);
            topTenTeamPoints.set(teamName, squadronPoints);
        }

        return topTenTeamPoints
   
    };


    initialTopTenSquadronPoints()
    await updateGlobalVariables();
    // console.log("Initial value:", initialSessionStats);

    async function getUpdatedSquadronStats() {
        const browser = await puppeteer.launch({
            headless: true,
            executablePath: process.env.MACCHROMEPATH,
            slowMo: 1000,
        });
        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(0);
        await page.goto("https://warthunder.com/en/community/clansleaderboard/");

        var topTenTeamNames = new Map();
        topTenTeamNames.set({ names: 0 });

        var topTenTeamNames = await page.evaluate(() => {
            for (let i = 0; i <= 10; i++) {
                const names = document
                    .querySelectorAll("tr")
                [i].childNodes.map((el) => el.innerText);
            }
            return names;
        });

        console.log("Updated value:", topTenTeamNames);
        await browser.close();

        if (squadronPoints > initialTopTenSquadPoints.squadronPoints) {
            var pointsGained = squadronPoints - initialTopTenSquadPoints.squadronPoints;
            var { killGain, deathGain, kdRatio, calculatedRank } = calculateStats();
            sendMessage(`#${calculatedRank()} F4WRD 🇺🇸🦅
  Points: ${squadronPoints} (<:smallgreenuptriangle:1083528485890445342> +${pointsGained})
  Kills: ${kills} (+${killGain})
  Deaths: ${deaths} (+ ${deathGain})
  K/D: ${kdRatio}
  Players: ${squadronPlayerCount}
  `);
        }
        if (squadronPoints < initialTopTenSquadPoints.squadronPoints) {
            var pointsLost = initialTopTenSquadPoints.squadronPoints - squadronPoints;
            var { killGain, deathGain, kdRatio, calculatedRank } = calculateStats();
            sendMessage(`#${calculatedRank()} F4WRD 🇺🇸🦅
  Points: ${squadronPoints} (:small_red_triangle_down: -${pointsLost})
  Kills: ${kills} (+${killGain})
  Deaths: ${deaths} (+ ${deathGain})
  K/D: ${kdRatio}
  Players: ${squadronPlayerCount}
  `);
        }
        if (squadronPoints == initialTopTenSquadPoints.squadronPoints) {
            return;
        }
        normalizeUpdatedData();

        function calculateStats() {
            var kdRatio = (kills / deaths).toFixed(2);
            var killGain = kills - initialTopTenSquadPoints.kills;
            var deathGain = deaths - initialTopTenSquadPoints.deaths;
            var calculatedRank = () => {
                if (rank > initialTopTenSquadPoints.rank) {
                    return `${rank} :small_red_triangle_down: `;
                }
                if (rank < initialTopTenSquadPoints.rank) {
                    return `${rank} <:smallgreenuptriangle:1083528485890445342>`;
                } else {
                    return rank;
                }
            };
            return { killGain, deathGain, kdRatio, calculatedRank };
        }
        function normalizeUpdatedData() {
            initialTopTenSquadPoints.squadronPoints = squadronPoints;
            initialTopTenSquadPoints.kills = kills;
            initialTopTenSquadPoints.deaths = deaths;
            initialTopTenSquadPoints.rank = rank;
        }
    }
    // intervalId = setInterval(getUpdatedSquadronStats, 7 * 60 * 1000);

    async function updateGlobalVariables() {
        initialTopTenSquadPoints = await initialTopTenSquadronPoints();
        endSessionStats = initialTopTenSquadPoints;
    }
};


startScraping();

