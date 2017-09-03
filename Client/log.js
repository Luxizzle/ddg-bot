module.exports = function(...args) {
	console.log(`[${process.env.SHARD_ID}]`, ...args)
}