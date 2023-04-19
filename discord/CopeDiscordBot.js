import { Client, Events, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const token = process.env.TOKEN;
const channelId = process.env.CHANNELID;

client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

 function sendTopTenMessage(message) {
    const channel = client.channels.cache.get(channelId);
    const embed = new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle("Squadron points changes detected")
    .setDescription(message);

    channel.send({ embeds: [embed] });
}

function sendMessage(embed) {
    const channel = client.channels.cache.get(channelId);

    channel.send({ embeds: [embed] });
}

client.login(token);

export {sendTopTenMessage, sendMessage}


//discordbot will wait once a team is created
//a created team contains 8 members that are in game names
//once a team is created, script will call apropriate tracker file to track




