var EmbedBuilder = require('./embed-builder')
var query = require('querystring')

var BlacklistedAnswerTypes = [
	'ip',

]

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
		//	case 'N': return this.Name(cb)
		//		break
			case 'E': return this.Exclusive(cb)
				break
		//	default: return this.Default(cb)
		//		break
		}

		if (this.data.Redirect !== '') { // for "Im feeling ducky redirects"
			return this.Exclusive(cb)
		}
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
				.replace('(', '%28')
				.replace(')', '%29')

			var ndesc = desc + `[${text}](${url})\n`
			//console.log(ndesc.length)
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
		return cb('', false, this.builder.embed)
	}

	Default(cb) {
		
	}
}

module.exports = (...args) => new DDGResponse(...args)