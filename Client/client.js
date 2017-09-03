process.on('message', (msg) => {
	var cmd = msg.cmd
	var args = msg.args
	switch (cmd) {
		case 'restart-shard':
			process.exit()
			break;
		default:
			break;
	}
})

var Discordie = require('discordie');
var ddg = require('../ddg')
var fs = require('fs')
var quacks = require('../quacks')
var discordBotsApi
try { discordBotsApi = require('./discord-bots-api') } catch(e) {}

var client = new Discordie({
	autoReconnect: true,
	shardId: parseInt(process.env.SHARD_ID),
	shardCount: parseInt(process.env.SHARD_COUNT)
})

function setGame() {
	client.User.setGame(quacks.games[Math.floor(Math.random() * quacks.games.length)])
}

client.Dispatcher.once('GATEWAY_READY', () => {
	console.log(`[${process.env.SHARD_ID}] ready - guilds: ` + client.Guilds.map((g) => g.name))

	setInterval(setGame, 1000*60*5)
	setGame()

	if (discordBotsApi) {
		discordBotsApi(
			client.User.id,
			parseInt(process.env.SHARD_ID),
			parseInt(process.env.SHARD_COUNT),
			client.Guilds.length
		)
	}
})

client.Dispatcher.on('GUILD_CREATE', (e) => {
	var guild = e.guild
	if (e.becameAvailable) return;
	
	console.log(`Joined ${guild.name}`)

	if (discordBotsApi) {
		discordBotsApi(
			client.User.id,
			parseInt(process.env.SHARD_ID),
			parseInt(process.env.SHARD_COUNT),
			client.Guilds.length
		)
	}
})

client.Dispatcher.on('GUILD_DELETE', (e) => {
	var guild = e.getCachedData()
	if (guild.name) console.log(`Left ${guild.name}`);

	if (discordBotsApi) {
		discordBotsApi(
			client.User.id,
			parseInt(process.env.SHARD_ID),
			parseInt(process.env.SHARD_COUNT),
			client.Guilds.length
		)
	}
})

client.Dispatcher.on('MESSAGE_CREATE', async (e) => {

	var msg = e.message
	var author = msg.member || msg.author
	var content = msg.content

	if (client.User.can(Discordie.Permissions.Text.SEND_MESSAGES, msg.channel) == false) return;

	if (author.bot || author.isWebhook) return;

	var valid = false

	content = content.replace(/^(<@\d+>|!|\\)(.+)/, function(match, p1, p2) {
		
		if (p1 === '!' || p1 === '\\') {
			valid = true
			return match
		} else if (p2 === undefined) {
			return null
		} else if (p1 === `<@${client.User.id}>`) {
			valid = true
			return p2.trim()
		}
	})

	if (valid === false) return;
	
	(await ddg(content)).parse(function(content, embed) {
		msg.channel.sendMessage(content || '', false, embed)
	})
})

client.connect({ token: process.env.CLIENT_TOKEN })

process.on('disconnect', code => {
	process.exit()
})