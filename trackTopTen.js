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

var intervalId, initialTopTenSquadPoints, latestTopTenSquadPoints;
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
            topTenTeamPoints.set(teamName, squadronPoints);
        }
        return topTenTeamPoints
    };


    await updateGlobalVariables();
    console.log("Initial value:", initialTopTenSquadPoints);

    async function getUpdatedSquadronStats() {
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
            topTenTeamPoints.set(teamName, squadronPoints);
        }

        console.log("Updated value:", topTenTeamPoints);
        await browser.close();

        let changesMessage = "Squadron points changes detected:\n";
        let rank = 1;
    
        for (const [teamName, initialPoints] of initialTopTenSquadPoints.entries()) {
            const updatedPoints = topTenTeamPoints.get(teamName);
            const pointsDifference = updatedPoints - initialPoints;
            const differenceSymbol = pointsDifference > 0 ? "<:smallgreenuptriangle:1083528485890445342>" : ":small_red_triangle_down:";
            changesMessage += `${rank}. ${teamName}: ${initialPoints} -> ${updatedPoints} (${differenceSymbol} ${pointsDifference})\n`;
            rank++;
        }
    
        sendMessage(changesMessage);

        normalizeUpdatedData();

        function normalizeUpdatedData() {
             initialTopTenSquadPoints = topTenTeamPoints;
        }
    }
     intervalId = setInterval(getUpdatedSquadronStats, 7 * 60 * 1000);

    async function updateGlobalVariables() {
        initialTopTenSquadPoints = await initialTopTenSquadronPoints();
        latestTopTenSquadPoints = initialTopTenSquadPoints;
    }
};


startScraping();

