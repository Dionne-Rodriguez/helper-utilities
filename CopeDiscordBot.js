import { Client, Events, GatewayIntentBits } from 'discord.js'
import dotenv from 'dotenv'
dotenv.config()
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const token = process.env.TOKEN
const channelId = process.env.CHANNELID

client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});


export default function sendMessage(message) {
    const channel = client.channels.cache.get(channelId);
    channel.send(message);
}

client.login(token);




//discordbot will wait once a team is created
//a created team contains 8 members that are in game names
//once a team is created, script will call apropriate tracker file to track




