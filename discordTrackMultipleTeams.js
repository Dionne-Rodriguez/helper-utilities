import sendMessage from "./CopeDiscordBot.js";
import puppeteer from "puppeteer";
import cron from "node-cron";

var intervalId, initialSessionStats, endSessionStats;

const startScraping = async () => {
  console.log("Start scraping at:", new Date().toLocaleTimeString("en-US"));

  const getInitialSquadronData = async () => {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.MACCHROMEPATH,
      slowMo: 1000,
    });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.goto(
      "https://warthunder.com/en/community/claninfo/COPE--Fight%204%20Whats%20Right%20or%20Die"
    );
    const squadronPoints = await page.evaluate(() => {
      return parseInt(
        document.querySelector(".squadrons-counter__value").innerHTML.trim()
      );
    });
    const kills = await page.evaluate(() => {
      const airKills = parseInt(
        document
          .querySelector(
            "#bodyRoot > div.content > div:nth-child(2) > div:nth-child(3) > div > section > div.squadrons-profile__header-wrapper > div.squadrons-profile__header-stat.squadrons-stat > ul:nth-child(2) > li:nth-child(2)"
          )
          .innerHTML.trim()
      );
      const tankKills = parseInt(
        document
          .querySelector(
            "#bodyRoot > div.content > div:nth-child(2) > div:nth-child(3) > div > section > div.squadrons-profile__header-wrapper > div.squadrons-profile__header-stat.squadrons-stat > ul:nth-child(2) > li:nth-child(3)"
          )
          .innerHTML.trim()
      );
      return airKills + tankKills;
    });
    const squadronPlayerCount = await page.evaluate(() => {
      return parseInt(
        document
          .querySelector(".squadrons-info__meta-item")
          .innerText.split(":")[1]
          .trim()
      );
    });

    const deaths = await page.evaluate(() => {
      return parseInt(
        document
          .querySelector(
            "#bodyRoot > div.content > div:nth-child(2) > div:nth-child(3) > div > section > div.squadrons-profile__header-wrapper > div.squadrons-profile__header-stat.squadrons-stat > ul:nth-child(2) > li:nth-child(4)"
          )
          .innerHTML.trim()
      );
    });

    await page.setDefaultNavigationTimeout(0);
    await page.goto("https://warthunder.com/en/community/clansleaderboard/");

    const rank = await page.evaluate(() => {
      return parseInt(
        document.querySelectorAll(
          "[href='/en/community/claninfo/COPE--Fight%204%20Whats%20Right%20or%20Die']"
        )[0].parentNode.previousElementSibling.innerText
      );
    });
    await browser.close();
    return { kills, rank, deaths, squadronPlayerCount, squadronPoints };
  };


  await updateGlobalVariables();
  console.log("Initial value:", initialSessionStats);

  async function getUpdatedSquadronStats() {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.MACCHROMEPATH,
      slowMo: 1000,
    });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.goto(
      "https://warthunder.com/en/community/claninfo/COPE--Fight%204%20Whats%20Right%20or%20Die"
    );

    var squadronPoints = await page.evaluate(() => {
      return parseInt(
        document.querySelector(".squadrons-counter__value").innerHTML.trim()
      );
    });

    var kills = await page.evaluate(() => {
      const airKills = parseInt(
        document
          .querySelector(
            "#bodyRoot > div.content > div:nth-child(2) > div:nth-child(3) > div > section > div.squadrons-profile__header-wrapper > div.squadrons-profile__header-stat.squadrons-stat > ul:nth-child(2) > li:nth-child(2)"
          )
          .innerHTML.trim()
      );
      const tankKills = parseInt(
        document
          .querySelector(
            "#bodyRoot > div.content > div:nth-child(2) > div:nth-child(3) > div > section > div.squadrons-profile__header-wrapper > div.squadrons-profile__header-stat.squadrons-stat > ul:nth-child(2) > li:nth-child(3)"
          )
          .innerHTML.trim()
      );
      return airKills + tankKills;
    });

    var squadronPlayerCount = await page.evaluate(() => {
      return parseInt(
        document
          .querySelector(".squadrons-info__meta-item")
          .innerText.split(":")[1]
          .trim()
      );
    });

    var deaths = await page.evaluate(() => {
      return parseInt(
        document
          .querySelector(
            "#bodyRoot > div.content > div:nth-child(2) > div:nth-child(3) > div > section > div.squadrons-profile__header-wrapper > div.squadrons-profile__header-stat.squadrons-stat > ul:nth-child(2) > li:nth-child(4)"
          )
          .innerHTML.trim()
      );
    });

    await page.setDefaultNavigationTimeout(0);
    await page.goto("https://warthunder.com/en/community/clansleaderboard/");
    var rank = await page.evaluate(() => {
      return parseInt(
        document.querySelectorAll(
          "[href='/en/community/claninfo/COPE--Fight%204%20Whats%20Right%20or%20Die']"
        )[0].parentNode.previousElementSibling.innerText
      );
    });

    console.log(
      "Updated value:",
      squadronPoints,
      kills,
      deaths,
      squadronPlayerCount,
      rank,
      new Date().toLocaleTimeString("en-US")
    );
    await browser.close();

    if (squadronPoints > initialSessionStats.squadronPoints) {
      var pointsGained = squadronPoints - initialSessionStats.squadronPoints;
      var { killGain, deathGain, kdRatio, calculatedRank } = calculateStats();
      sendMessage(`#${calculatedRank()} F4WRD 🇺🇸🦅
Points: ${squadronPoints} (<:smallgreenuptriangle:1083528485890445342> +${pointsGained})
Kills: ${kills} (+${killGain})
Deaths: ${deaths} (+ ${deathGain})
K/D: ${kdRatio}
Players: ${squadronPlayerCount}
`);
    }
    if (squadronPoints < initialSessionStats.squadronPoints) {
      var pointsLost = initialSessionStats.squadronPoints - squadronPoints;
      var { killGain, deathGain, kdRatio, calculatedRank } = calculateStats();
      sendMessage(`#${calculatedRank()} F4WRD 🇺🇸🦅
Points: ${squadronPoints} (:small_red_triangle_down: -${pointsLost})
Kills: ${kills} (+${killGain})
Deaths: ${deaths} (+ ${deathGain})
K/D: ${kdRatio}
Players: ${squadronPlayerCount}
`);
    }
    if (squadronPoints == initialSessionStats.squadronPoints) {
      return;
    }
    normalizeUpdatedData();

    function calculateStats() {
      var kdRatio = (kills / deaths).toFixed(2);
      var killGain = kills - initialSessionStats.kills;
      var deathGain = deaths - initialSessionStats.deaths;
      var calculatedRank = () => {
        if (rank > initialSessionStats.rank) {
          return `${rank} :small_red_triangle_down: `;
        }
        if (rank < initialSessionStats.rank) {
          return `${rank} <:smallgreenuptriangle:1083528485890445342>`;
        } else {
          return rank;
        }
      };
      return { killGain, deathGain, kdRatio, calculatedRank };
    }
    function normalizeUpdatedData() {
      initialSessionStats.squadronPoints = squadronPoints;
      initialSessionStats.kills = kills;
      initialSessionStats.deaths = deaths;
      initialSessionStats.rank = rank;
    }
  }
  intervalId = setInterval(getUpdatedSquadronStats, 7 * 60 * 1000);

  async function updateGlobalVariables() {
    initialSessionStats = await getInitialSquadronData();
    endSessionStats = initialSessionStats;
  }
};

const stopScraping = async () => {
  clearInterval(intervalId);
  if(endSessionStats.squadronPoints > initialSessionStats.squadronPoints) {
    var calculatedRank = () => {
      if (endSessionStats.rank > initialSessionStats.rank) {
        return `:small_red_triangle_down: ${rank}`;
      }
      if (endSessionStats.rank < initialSessionStats.rank) {
        return `<:smallgreenuptriangle:1083528485890445342> ${rank}`;
      } else {
        return initialSessionStats.rank;
      }
    };
    var pointsGained = endSessionStats.squadronPoints - initialSessionStats.squadronPoints;
    sendMessage(`END OF SESSION
#${calculatedRank()} F4WRD 🇺🇸🦅
Points: ${endSessionStats.squadronPoints} (<:smallgreenuptriangle:1083528485890445342> +${pointsGained})
`);
  }
  if (endSessionStats.squadronPoints < initialSessionStats.squadronPoints) {
    var calculatedRank = () => {
      if (endSessionStats.rank > initialSessionStats.rank) {
        return `:small_red_triangle_down: ${rank}`;
      }
      if (endSessionStats.rank < initialSessionStats.rank) {
        return `<:smallgreenuptriangle:1083528485890445342> ${rank}`;
      } else {
        return rank;
      }
    };
    var pointsLost =
      initialSessionStats.squadronPoints - endSessionStats.squadronPoints;
    sendMessage(`END OF SESSION
    #${calculatedRank()} F4WRD 🇺🇸🦅
    Points: ${squadronPoints} (:small_red_triangle_down: -${pointsLost})
    `);
  }
  console.log("Stop scraping at:", new Date().toLocaleTimeString("en-US"));
};

// Schedule the cron job to start scraping at 10am EST every day
cron.schedule("0 10 * * *", () => {
  startScraping();
});

// Schedule the cron job to stop scraping at 6pm EST every day
cron.schedule("0 18 * * *", () => {
  stopScraping();
});

// Schedule the cron job to start scraping at 9pm EST every day
cron.schedule("22 22 * * *", () => {
  startScraping();
});
startScraping();

// Schedule the cron job to stop scraping at 2am EST every day
cron.schedule("* 2 * * *", () => {
  stopScraping();
});


cron.schedule("5 15 * * *", () => {
  startScraping();
});
// cron.schedule("45 20 * * *", () => {
//   stopScraping();
// });
