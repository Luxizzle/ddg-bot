var ddg = require('./index.js');

(async function() {
	var r = await ddg('Valley Forge National Historical Park')
	console.log(r.parse())
})()
