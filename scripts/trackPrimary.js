  import { sendMessage } from "../discord/CopeDiscordBot.js";
  import puppeteer from "puppeteer";
  import cron from "node-cron";

  var intervalId, initialSessionStats, endSessionStats;

  const startScraping = async () => {
    const sessionStartTime = new Date().toLocaleTimeString("en-US");
    console.log("Start scraping at:", sessionStartTime);

    const getInitialSquadronData = async () => {
      const browser = await puppeteer.launch({
        headless: true,
        slowMo: 1000,
      });
      const page = await browser.newPage();
      await page.setDefaultNavigationTimeout(0);
      await page.goto(
        "https://warthunder.com/en/community/claninfo/COPE--Fight%204%20Whats%20Right%20or%20Die",
        {waitUntil: "domcontentloaded"}
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
        
        filteredPlayers.sort((a, b) => b[1] - a[1]);
        
        console.log(filteredPlayers);
        return filteredPlayers;
      });
      players = new Map(players);

      let sortedPlayers = [...players.entries()].sort((a, b) => b[1] - a[1]);

      players = new Map(sortedPlayers);


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
      await page.goto("https://warthunder.com/en/community/clansleaderboard/",{waitUntil: "domcontentloaded"});

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
        slowMo: 1000,
      });
      const page = await browser.newPage();
      await page.setDefaultNavigationTimeout(0);
      await page.goto(
        "https://warthunder.com/en/community/claninfo/COPE--Fight%204%20Whats%20Right%20or%20Die",{waitUntil: "domcontentloaded"}
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
                parseInt(
                  document.querySelectorAll(".squadrons-members__grid-item")[i + 1]
                    .innerText
                )
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
      await page.goto("https://warthunder.com/en/community/clansleaderboard/",{waitUntil: "domcontentloaded"});
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
        endSessionStats.netSessionPoints += pointsGained 
        console.log("net calculation", endSessionStats.netSessionPoints);
        var embedObject = {
          title: `#${calculatedRank()} F4WRD 🇺🇸🦅
  Points: ${squadronPoints} (<:smallgreenuptriangle:1083528485890445342> +${pointsGained})
  K/D: ${kdRatio}
  Net Session Points: ${endSessionStats.netSessionPoints}
  Tracking Since: ${sessionStartTime}
  `,
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
        endSessionStats.netSessionPoints -= pointsLost 
        console.log("net calculation", endSessionStats.netSessionPoints);
        var embedObject = {
          title: `#${calculatedRank()} F4WRD 🇺🇸🦅
  Points: ${squadronPoints} (:small_red_triangle_down: ${pointsLost})
  K/D: ${kdRatio}
  Net Session Points: ${endSessionStats.netSessionPoints}
  Tracking Since: ${sessionStartTime}
  `,
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

      console.log(endSessionStats.netSessionPoints, "net points");
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
                value: `psr: ${updatedPoints}  (${differenceSymbol} ${pointsDifference})`,
              });
            }
          }
          console.log(playerChangedPoints,"in function");
          playerChangedPoints.sort((a,b) => { a.value - b.value })
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
      endSessionStats.netSessionPoints = 0
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
      var pointsGained = endSessionStats.squadronPoints - initialSessionStats.squadronPoints;
      endSessionStats.netSessionPoints += pointsGained 
      console.log("net calculation", endSessionStats.netSessionPoints);
    }
    
    if (squadronPoints < initialSessionStats.squadronPoints) {
      var pointsLost = initialSessionStats.squadronPoints - squadronPoints;
      endSessionStats.netSessionPoints -= pointsLost 
      console.log("net calculation", endSessionStats.netSessionPoints);
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
