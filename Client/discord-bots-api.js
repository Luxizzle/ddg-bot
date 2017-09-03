var fetch = require('node-fetch')

module.exports = function(userid, shardid, shardcount, guilds) {
	if (!process.env.DISCORD_BOTS_TOKEN) return;
	fetch(`https://bots.discord.pw/api/bots/${userid}/stats`, {
		method: 'POST',
		headers: {
			'Authorization': process.env.DISCORD_BOTS_TOKEN
		},
		body: JSON.stringify({
			shard_id: shardid,
			shard_count: shardcount,
			server_count: guilds
		})
	})
		.then(() => {
			console.log('Pushed stats. Now in ' + guilds + ' guilds')
		})
		.catch(console.warn)
}