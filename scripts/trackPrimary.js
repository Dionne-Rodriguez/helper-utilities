import { sendMessage } from "../discord/CopeDiscordBot.js";
import puppeteer from "puppeteer";
import cron from "node-cron";

var intervalId, initialSessionStats, endSessionStats;

const startScraping = async () => {
  console.log("Start scraping at:", new Date().toLocaleTimeString("en-US"));

  const getInitialSquadronData = async () => {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: 'chromium-browser',
      slowMo: 1000,
    });
    const [page] = await browser.pages()
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

    var players = await page.evaluate(() => {
      var filteredPlayers = [];
      for (
        let i = 0;
        i < document.querySelectorAll(".squadrons-members__grid-item").length;
        i++
      ) {
        if (
          document.querySelectorAll(".squadrons-members__grid-item")[i]
            .childNodes[1]
        ) {
          filteredPlayers.push([
            document.querySelectorAll(".squadrons-members__grid-item")[i]
              .childNodes[1].innerText,
            parseInt(
              document.querySelectorAll(".squadrons-members__grid-item")[i + 1]
                .innerText
            ),
          ]);
        }
      }
      console.log(filteredPlayers);
      return filteredPlayers;
    });
    players = new Map(players);

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
    return {
      kills,
      rank,
      deaths,
      squadronPlayerCount,
      squadronPoints,
      players,
    };
  };

  await updateGlobalVariables();
  console.log("Initial value:", initialSessionStats);

  async function getUpdatedSquadronStats() {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: 'chromium-browser',
      slowMo: 1000,
    });
    const [page] = await browser.pages();
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

    var players = await page.evaluate(() => {
      var filteredPlayers = [];
      for (
        let i = 0;
        i < document.querySelectorAll(".squadrons-members__grid-item").length;
        i++
      ) {
        if (
          document.querySelectorAll(".squadrons-members__grid-item")[i]
            .childNodes[1]
        ) {
          filteredPlayers.push([
            document.querySelectorAll(".squadrons-members__grid-item")[i]
              .childNodes[1].innerText,
            document.querySelectorAll(".squadrons-members__grid-item")[i + 1]
              .innerText,
          ]);
        }
      }
      console.log(filteredPlayers);
      return filteredPlayers;
    });
    players = new Map(players);

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
      players,
      new Date().toLocaleTimeString("en-US")
    );
    await browser.close();

    var { kdRatio, calculatedRank, playersPointChange } = calculateStats();
    if (squadronPoints > initialSessionStats.squadronPoints) {
      var pointsGained = squadronPoints - initialSessionStats.squadronPoints;
      var embedObject = {
        color: "#00FF00",
        title: `#${calculatedRank()} F4WRD 🇺🇸🦅
Points: ${squadronPoints} (<:smallgreenuptriangle:1083528485890445342> +${pointsGained})
K/D: ${kdRatio}`,
        fields: [
          {
            name: "",
            value: "",
            inline: true,
          },
          { name: "Players -----------------", value: "" },
          {
            name: "",
            value: "",
            inline: true,
          },
          ...playersPointChange(),
        ],
      };
      sendMessage(embedObject);
    }
    if (squadronPoints < initialSessionStats.squadronPoints) {
      var pointsLost = initialSessionStats.squadronPoints - squadronPoints;
      var embedObject = {
        color: "#FF0000",
        title: `#${calculatedRank()} F4WRD 🇺🇸🦅
Points: ${squadronPoints} (:small_red_triangle_down: ${pointsLost})
K/D: ${kdRatio}`,
        fields: [
          {
            name: "",
            value: "",
            inline: true,
          },
          { name: "Players -----------------", value: "" },
          {
            name: "",
            value: "",
            inline: true,
          },
          ...playersPointChange(),
        ],
      };
      sendMessage(embedObject);
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
      var playersPointChange = () => {
        var playerChangedPoints = [];
        for (const [
          playerName,
          initialPlayerPoints,
        ] of initialSessionStats.players.entries()) {
          const updatedPoints = players.get(playerName);
          if (initialPlayerPoints !== updatedPoints) {
            const pointsDifference = updatedPoints - initialPlayerPoints;
            const differenceSymbol =
              pointsDifference > 0
                ? "<:smallgreenuptriangle:1083528485890445342>"
                : ":small_red_triangle_down:";
            playerChangedPoints.push({
              name: `${playerName}`,
              value: `**${updatedPoints} (${differenceSymbol} ${pointsDifference})**`,
            });
          }
        }
        return playerChangedPoints;
      };
      return {
        killGain,
        deathGain,
        kdRatio,
        calculatedRank,
        playersPointChange,
      };
    }
    function normalizeUpdatedData() {
      initialSessionStats.squadronPoints = squadronPoints;
      initialSessionStats.kills = kills;
      initialSessionStats.deaths = deaths;
      initialSessionStats.rank = rank;
      initialSessionStats.players = players;
    }
  }
  intervalId = setInterval(getUpdatedSquadronStats, 7 * 60 * 1000);

  async function updateGlobalVariables() {
    initialSessionStats = await getInitialSquadronData();
    endSessionStats = initialSessionStats;
    console.log("UPDATING GLOBAL VARIABLES");
  }
};

const stopScraping = async () => {
  clearInterval(intervalId);
  console.log(
    endSessionStats.squadronPoints,
    initialSessionStats.squadronPoints
  );
  if (endSessionStats.squadronPoints > initialSessionStats.squadronPoints) {
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
    var pointsGained =
      endSessionStats.squadronPoints - initialSessionStats.squadronPoints;
    sendMessage(`END OF SESSION
#${calculatedRank()} F4WRD 🇺🇸🦅
Points: ${
      endSessionStats.squadronPoints
    } (<:smallgreenuptriangle:1083528485890445342> +${pointsGained})
`);
    console.log("End of session message sent");
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
    console.log("End of session message sent");
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
cron.schedule("0 21 * * *", () => {
  startScraping();
});

// Schedule the cron job to stop scraping at 2am EST every day
cron.schedule("0 2 * * *", () => {
  stopScraping();
});
startScraping();
