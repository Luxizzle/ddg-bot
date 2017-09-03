var EmbedBuilder = require('./embed-builder')
var query = require('querystring')
var quacks = require('../quacks')

var PNG = require('pngjs').PNG
var fs = require('fs-extra')

var BlacklistedAnswerTypes = [
	'ip'
]

var SpecialAnswerTypes = {
	'color_code': (self, cb) => {
		self.builder.title('Color')
		self.builder.description(self.data.Answer.replace(/\s*~\s*/g, '\n'))
		self.builder.url('https://duckduckgo.com/?' + query.stringify({
			q: self.query
		}))

		var R, G, B, NAME
		self.data.Answer.replace(/Hex: #((?:\d|\w)+).*RGBA\((\d+),\s*(\d+),\s*(\d+),\s*\d+\)/, function(m, name, r, g, b) {
			NAME = name
			R = r
			G = g
			B = b
		})
		if (NAME && R && G && B) {
			img = new PNG({
				width: 80,
				height: 80,
				colorType: 2,
				bgColor: {
					red: R,
					green: G,
					blue: B
				}
			})

			self.builder.thumbnail(process.env.ROOT + '/colors/' + NAME + '.png')

			fs.ensureDirSync(__dirname+'/../static/colors')

			if (fs.pathExistsSync(__dirname + '/../static/colors/' + NAME + '.png')) {
				return cb('', self.builder.embed)
			} else {
				img.pack().pipe(fs.createWriteStream(__dirname + '/../static/colors/' + NAME + '.png'))
					.on('finish', () => {
						return cb('', self.builder.embed)
					})
			}
		} else {
			return cb('', self.builder.embed)
		}
	}
}

class DDGResponse {
	constructor(data, query) {// console.log(data)
		this.data = data
		this.query = query
		this.builder = new EmbedBuilder()
	}

	parse(cb) {
		switch(this.data.Type) {
			case 'A':	return this.Article(cb)
				break
			case 'D':	return this.Disambiguation(cb)
				break
			case 'C':	return this.Category(cb)
				break
			case 'N': return this.Name(cb)
				break
			case 'E': return this.Exclusive(cb)
				break
		}

		if (this.data.Redirect !== '') { // for "Im feeling ducky redirects"
			return this.Exclusive(cb)
		}

		cb(quacks.no_results[Math.floor(Math.random() * quacks.no_results.length)])
	}

	RelatedTopics() {
		if (this.data.RelatedTopics.length == 0) return;

		var desc = this.builder.embed.description || ''

		desc += '\nRelated:\n'

		for (var i = 0; i <= Math.min(10, this.data.RelatedTopics.length-1); i++) {
			var topic = this.data.RelatedTopics[i]
			if (topic.Topics) continue;

			var text = topic.Text.slice(0, 50) + (topic.Text.length > 50 ? '…' : '')
			var url = topic.FirstURL
				.replace(/\(/g, '%28')
				.replace(/\)/g, '%29')

			var ndesc = desc + `[${text}](${url})\n`
			if (ndesc.length > 2048) { break }
			desc = ndesc
		}

		this.builder.description(desc)
	}

	Article(cb) {
		this.builder.title(this.data.Heading)
		this.builder.url(this.data.AbstractURL)

		this.builder.thumbnail(this.data.Image)

		var desc = ''
		if (this.data.Results[0]) {
			desc += `[${this.data.Results[0].Text}](${this.data.Results[0].FirstURL})\n\n`
		}
		desc += this.data.AbstractText.slice(0, 1500) + '\n' // slice it by 1500, just to be safe
		desc += 'Source: ' + this.data.AbstractSource + '\n'

		this.builder.description(desc)

		this.RelatedTopics()

	 	return cb('', this.builder.embed)
	}

	Disambiguation(cb) {
		this.builder.title(this.data.Heading)
		this.builder.url(this.data.AbstractURL)

		var desc = ''
		desc += 'Source: ' + this.data.AbstractSource + '\n'
		this.builder.description(desc)

		this.RelatedTopics()

		return cb('', this.builder.embed)
	}

	Category(cb) {
		this.builder.title(this.data.Heading)
		this.builder.url(this.data.AbstractURL)

		var desc = ''
		desc += 'Source: ' + this.data.AbstractSource + '\n'
		this.builder.description(desc)

		this.RelatedTopics()

		return cb('', this.builder.embed)
	}

	Name(cb) { // Implement this, whatever it is.
		console.log('Unsupported query: ' + this.query)
		return cb('This appears to be an unsupported search, the owner has been notified.\n\n' + 'https://duckduckgo.com/?' + query.stringify({
			q: this.query
		}))
	}

	Exclusive(cb) {
		if (BlacklistedAnswerTypes.some((v) => v == this.data.AnswerType)) {
			return cb('Sorry, but this is a blacklisted answer.')
		}

		if (SpecialAnswerTypes[this.data.AnswerType]) return SpecialAnswerTypes[this.data.AnswerType](this, cb);

		if (this.data.Redirect !== '') {
			return cb(this.data.Redirect)
		}

		if (typeof this.data.Answer === 'string' && this.data.Answer !== '') {
			this.builder.title(this.data.Answer)
		} else {
			this.builder.title('Can\'t parse answer, click me to go to DuckDuckGo.')
		}

		this.builder.url('https://duckduckgo.com/?' + query.stringify({
			q: this.query
		}))
		return cb('', this.builder.embed)
	}

	Default(cb) {
		
	}
}

module.exports = (...args) => new DDGResponse(...args)