import puppeteer from 'puppeteer'
import sendMessage from './CopeDiscordBot'

const rareClanInfoPage = 'https://warthunder.com/en/community/claninfo/COPE'
const wtLocalPage = 'http://127.0.0.1:8111/'

async function getCurrentSquadronRating(page) {
    await page.goto(rareClanInfoPage)
    return await page.evaluate(() => {
        return parseInt(document.querySelector(".squadrons-counter__value").innerHTML.trim())
    })
}



async function startGameTracker(page, initialSquadronPoints) {
    await page.waitForSelector('#textlines')
    const target = await page.$('#textlines')
    const initialPoints = initialSquadronPoints
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: process.env.WINDOWSCHROMEEXE
    });
    const getCurrentSquadronRating = async () => {
        const page = await browser.newPage();
        return getCurrentSquadronRating(page)
    }
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

(async () => {

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: process.env.WINDOWSCHROMEEXE
    });
    const page = await browser.newPage();
    const initialSquadronPoints = await getCurrentSquadronRating(page)
    await page.goto(wtLocalPage);
    console.log("hi");
    await startGameTracker(page, initialSquadronPoints)
})