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
})

client.Dispatcher.on('GUILD_CREATE', (e) => {
	var guild = e.guild
	if (!e.becameAvailable) {
		console.log(`Joined ${guild.name}`)
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