var ddg = require('./index.js');

(async function() {
	var r = await ddg('1+1')
	r.parse(function(content, embed) {
		console.log(content)
		console.log(embed)
	})
})()
