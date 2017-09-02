var ddg = require('./index.js')
var fs = require('fs')

;(async function() {
	var r = await ddg('color #C0FFEE')
	r.parse(function(content, embed, file) {
		console.log(content)
		console.log(embed)
		console.log(file) // { file: Stream, name: String}

		if (file) {
			file.file
				.pipe(fs.createWriteStream(__dirname + '/' + file.name))
				.on('finish', () => console.log('File written'))
		}
		
	})
})()
