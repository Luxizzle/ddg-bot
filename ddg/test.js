var ddg = require('./index.js');

(async function() {
	var r = await ddg('1+1')
	r.parse({
		sendMessage: function(content, tts, embed) {
			console.log('content:',content)
			console.log('embed:',embed)
		}
	})
})()
