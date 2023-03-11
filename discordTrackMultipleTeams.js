import sendMessage from "./CopeDiscordBot.js"
import puppeteer from 'puppeteer'

(async () => {
    const rareClanInfoPage = 'https://warthunder.com/en/community/claninfo/COPE--Fight%204%20Whats%20Right%20or%20Die'
    const getCurrentSquadronData = async () => {
        const browser = await puppeteer.launch({
            headless: true,
            executablePath: process.env.WINDOWSCHROMEEXE
        })
        const page = await browser.newPage()
        await page.goto(rareClanInfoPage)


        const squadronPoints = await page.evaluate(() => {
            return parseInt(document.querySelector(".squadrons-counter__value").innerHTML.trim())
        })
        const kills = await page.evaluate(() => {
            const airKills = parseInt(document.querySelector("#bodyRoot > div.content > div:nth-child(2) > div:nth-child(3) > div > section > div.squadrons-profile__header-wrapper > div.squadrons-profile__header-stat.squadrons-stat > ul:nth-child(2) > li:nth-child(2)").innerHTML.trim())
            const tankKills = parseInt(document.querySelector("#bodyRoot > div.content > div:nth-child(2) > div:nth-child(3) > div > section > div.squadrons-profile__header-wrapper > div.squadrons-profile__header-stat.squadrons-stat > ul:nth-child(2) > li:nth-child(3)").innerHTML.trim())
            return airKills + tankKills
        })

        const squadronPlayerCount = await page.evaluate(() => {
            return parseInt(document.querySelector(".squadrons-info__meta-item").innerText.split(":")[1].trim())
        })

        const deaths = await page.evaluate(() => {
            return parseInt(document.querySelector("#bodyRoot > div.content > div:nth-child(2) > div:nth-child(3) > div > section > div.squadrons-profile__header-wrapper > div.squadrons-profile__header-stat.squadrons-stat > ul:nth-child(2) > li:nth-child(4)").innerHTML.trim())
        })

        browser.close()
        return { kills, deaths, squadronPlayerCount, squadronPoints }
    }
    var initialStats = await getCurrentSquadronData()
    console.log('Initial value:', initialStats)

    async function getUpdatedSquadronStats() {
        const browser = await puppeteer.launch({
            headless: false,
            executablePath: process.env.WINDOWSCHROMEEXE
        })

        const page = await browser.newPage()
        await page.goto(rareClanInfoPage)


        var squadronPoints = await page.evaluate(() => {
            return parseInt(document.querySelector(".squadrons-counter__value").innerHTML.trim())
        })

        const kills = await page.evaluate(() => {
            const airKills = parseInt(document.querySelector("#bodyRoot > div.content > div:nth-child(2) > div:nth-child(3) > div > section > div.squadrons-profile__header-wrapper > div.squadrons-profile__header-stat.squadrons-stat > ul:nth-child(2) > li:nth-child(2)").innerHTML.trim())
            const tankKills = parseInt(document.querySelector("#bodyRoot > div.content > div:nth-child(2) > div:nth-child(3) > div > section > div.squadrons-profile__header-wrapper > div.squadrons-profile__header-stat.squadrons-stat > ul:nth-child(2) > li:nth-child(3)").innerHTML.trim())
            return airKills + tankKills
        })

        const squadronPlayerCount = await page.evaluate(() => {
            return parseInt(document.querySelector(".squadrons-info__meta-item").innerText.split(":")[1].trim())
        })

        const deaths = await page.evaluate(() => {
            return parseInt(document.querySelector("#bodyRoot > div.content > div:nth-child(2) > div:nth-child(3) > div > section > div.squadrons-profile__header-wrapper > div.squadrons-profile__header-stat.squadrons-stat > ul:nth-child(2) > li:nth-child(4)").innerHTML.trim())
        })

        console.log('Updated value:', squadronPoints, kills, deaths, squadronPlayerCount)
        browser.close()

        if (squadronPoints > initialStats.squadronPoints) {
            var pointsGained = squadronPoints - initialStats.squadronPoints
            var { killGain, deathGain, kdRatio } = calculateStats()
            sendMessage(`Points: ${squadronPoints} (<:smallgreenuptriangle:1083528485890445342> +${pointsGained}) | Kills: ${kills} (+${killGain}) | Deaths: ${deaths} (+${deathGain}) | K/D: ${kdRatio}`)
        }
        if (squadronPoints < initialStats.squadronPoints) {
            var pointsLost = initialStats.squadronPoints - squadronPoints
            var { killGain, deathGain, kdRatio } = calculateStats()
            sendMessage(`Points: ${squadronPoints} (:small_red_triangle_down: -${pointsLost}) | Kills: ${kills} (+${killGain}) | Deaths: ${deaths} (+ ${deathGain}) | K/D: ${kdRatio}`)
        }
        if (squadronPoints == initialStats.squadronPoints) {
            console.log("No sqb games played yet")
            return
        }
        initialStats.squadronPoints = squadronPoints
        initialStats.kills = kills
        initialStats.deaths = deaths

        function calculateStats() {
            var kdRatio = (kills / deaths).toFixed(2)
            var killGain = kills - initialStats.kills
            var deathGain = deaths - initialStats.deaths
            return { killGain, deathGain, kdRatio }
        }
    }


    setInterval(getUpdatedSquadronStats, 7 * 60 * 1000)
})()

