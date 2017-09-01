var clientFile = './Client/client.js'

var childProcess = require('child_process');

class Shard {
	constructor(manager, id) {

		this.manager = manager

		this.id = id

		this.env = Object.assign({}, process.env, {
			SHARD_ID: this.id,
			SHARD_COUNT: this.manager.totalShards,
			CLIENT_TOKEN: this.manager.token
		})

		this.process = childProcess.fork(clientFile, [], {
			env: this.env
		})

		this.process.on('message', this.handleMessage.bind(this))
		this.process.on('exit', () => {
			this.manager.createShard(this.id)
		})
	}

	restartShard(shard) {
		if (!shard || shard === this.id) return this.process.send({ cmd: 'restart-shard' })
		if (shard === 'all') {
			this.manager.restartAllShards()
		} else if (typeof shard === 'number' && Number.isInteger(shard)) {
			this.manager.restartShard(shard)
		}
	}

	handleMessage(msg) {
		console.log(msg)
		var cmd = msg.cmd
		var args = msg.args || []
		switch (cmd) {
			case 'restart-shard':
				this.restartShard(...args)
				break;
			default:
				break;
		}
	}
}

module.exports = Shard