var Shard = require('./Shard')

class ShardManager {
	constructor(totalShards, token) {
		this.totalShards = totalShards
		this.token = token

		this.shards = new Map()
	}

	createShard(id = this.shards.size) {
		console.log('spawning shard ' + id)
		var shard = new Shard(this, id)
		this.shards.set(id, shard)
	}

	start() {
		while (this.shards.size < this.totalShards) this.createShard();
	}

	restartAllShards() {
		for (var shard of this.shards.values()) {
			shard.restartShard()
		}
	}

	restartShard(shardNum) {
		var shard = this.shards.get(shardNum)
		if (!shard) return;
		shard.restartShard()
	}
}

module.exports = ShardManager