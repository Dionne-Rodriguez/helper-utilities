import { Client, Events, GatewayIntentBits, EmbedBuilder } from "discord.js";
import moment from "moment";
import dotenv from "dotenv";
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildScheduledEvents,
  ],
});

// ✨ Global error handler
client.on("error", (error) => {
  console.error("🚨 Client Error Event:", error);
});

const token = process.env.TOKEN;
const channelId = process.env.CHANNELID;
const voiceChannelId = "1160664568494821451"; // Your VC

let messageId = null; // Save scrim check message ID
const eventCreated = {}; // Track which day events are already created

const numberEmojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣"];
const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday"];

client.once(Events.ClientReady, async (c) => {
  console.log(`✅ Ready! Logged in as ${c.user.tag}`);

  const today = moment.utc();
  const timestamp18UTC = today
    .clone()
    .set({ hour: 18, minute: 0, second: 0, millisecond: 0 })
    .unix();

  const embed = new EmbedBuilder()
    .setTitle("In-house Scrims Interest Check 🕐")
    .setDescription(
      `Weekly in-house scrims at <t:${timestamp18UTC}:t> (**18:00 UTC**).\n` +
        `React to the number for the day you're available!\nSession happens if 8 or more react.\n\n` +
        `1️⃣ Monday\n2️⃣ Tuesday\n3️⃣ Wednesday\n4️⃣ Thursday`
    )
    .setColor(0x00ff00);

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) {
      console.error("❌ Channel not found or not text-based!");
      return;
    }

    const message = await channel.send({ embeds: [embed] });
    messageId = message.id;

    for (const emoji of numberEmojis) {
      await message.react(emoji);
    }

    console.log("✅ Scrim check posted successfully!");
  } catch (error) {
    console.error("❌ Failed to fetch channel or send message:", error);
  }
});

client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;
  if (!reaction.message.guild) return;
  if (reaction.message.id !== messageId) return;
  if (!numberEmojis.includes(reaction.emoji.name)) return;

  try {
    const fetchedReaction = await reaction.message.reactions.cache
      .get(reaction.emoji.name)
      ?.fetch();
    const count = fetchedReaction?.count || 0;

    console.log(`🔎 Reaction ${reaction.emoji.name} now has ${count} reacts`);

    const emojiIndex = numberEmojis.indexOf(reaction.emoji.name);

    if (count >= 9 && !eventCreated[reaction.emoji.name]) {
      eventCreated[reaction.emoji.name] = true;

      const dayName = dayNames[emojiIndex];
      console.log(`🎉 8 or more people for ${dayName}, creating event!`);

      const guild = reaction.message.guild;

      const today = moment.utc();
      const todayDayIndex = today.isoWeekday(); // Monday = 1, Sunday = 7
      let targetDayIndex = emojiIndex + 1; // 1️⃣ Monday = 1
      let daysToAdd = targetDayIndex - todayDayIndex;
      if (daysToAdd < 0) daysToAdd += 7; // If already passed, move to next week

      const eventMoment = today
        .clone()
        .add(daysToAdd, "days")
        .set({ hour: 18, minute: 0, second: 0, millisecond: 0 });

      // Create the voice channel event
      const createdEvent = await guild.scheduledEvents.create({
        name: `4v4 Jetstrike Scrims - ${dayName}`,
        scheduledStartTime: eventMoment.toDate(),
        privacyLevel: 2, // GUILD_ONLY
        entityType: 2, // Voice event
        channel: voiceChannelId,
        description: `Weekly in-house scrims happening on ${dayName} at **18:00 UTC**!\n\n🕐 **Duration:** Approx 1 Hour\n🎯 **Requirements:** 8 players minimum\n`,
      });

      console.log(`✅ Event created for ${dayName}!`);

      // Set up reminder
      const reminderMoment = eventMoment.clone().subtract(15, "minutes");
      const timeUntilReminder = reminderMoment.diff(moment.utc());

      // Test reminder message config
      //   const reminderMoment = moment.utc().add(30, "seconds"); // 🆕 30 seconds from now
      //   const timeUntilReminder = reminderMoment.diff(moment.utc());

      if (timeUntilReminder > 0) {
        console.log(
          `⏰ Scheduling reminder for ${dayName} scrim in ${Math.floor(
            timeUntilReminder / 1000 / 60
          )} minutes.`
        );

        setTimeout(async () => {
          try {
            const channel = await client.channels.fetch(channelId);
            const scrimMessage = await channel.messages.fetch(messageId);
            const reaction = scrimMessage.reactions.cache.get(
              numberEmojis[emojiIndex]
            );
            if (!reaction) {
              console.log(`⚠️ No reaction found for ${reaction.emoji.name}`);
              return;
            }

            const users = await reaction.users.fetch();
            const nonBotUsers = users.filter((u) => !u.bot);

            if (nonBotUsers.size === 0) {
              console.log(`⚠️ No real users reacted for ${dayName}.`);
              return;
            }

            const mentions = nonBotUsers.map((u) => `<@${u.id}>`).join(" ");

            await channel.send(
              `⏰ **Reminder!** In-house scrims for **${dayName}** start in 15 minutes!\n` +
                `${mentions}`
            );

            console.log(`✅ Reminder sent for ${dayName}!`);
          } catch (error) {
            console.error("❌ Failed to send reminder:", error);
          }
        }, timeUntilReminder);
      }
    }
  } catch (error) {
    console.error("❌ Failed to handle reaction or create event:", error);
  }
});

client.login(token);
