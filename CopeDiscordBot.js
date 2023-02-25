import { Client, Events, GatewayIntentBits } from 'discord.js'
// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const token =  process.env.TOKEN
const channelId = process.env.CHANNELID



client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(token);

export default function sendMessage(message) {
    const channel = client.channels.cache.get(channelId);
    channel.send(message);
}