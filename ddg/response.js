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

	parse(channel) {
		switch(this.data.Type) {
			case 'A':	return this.Article(channel)
				break
			case 'D':	return this.Disambiguation(channel)
				break
			case 'C':	return this.Category(channel)
				break
		//	case 'N': return this.Name(channel)
		//		break
			case 'E': return this.Exclusive(channel)
				break
		//	default: return this.Default(channel)
		//		break
		}

		if (this.data.Redirect !== '') { // for "Im feeling ducky redirects"
			return this.Exclusive(channel)
		}
	}

	RelatedTopics() {
		if (this.data.RelatedTopics.length == 0) return;

		var desc = this.builder.embed.description || ''

		desc += '\nRelated:\n'

		for (var i = 0; i <= Math.min(10, this.data.RelatedTopics.length-1); i++) {
			var topic = this.data.RelatedTopics[i]
			if (topic.Topics) continue;
			var ndesc = desc + `[${topic.Text.slice(0, 50) + (topic.Text.length > 50 ? '…' : '')}](${topic.FirstURL})\n`
			//console.log(ndesc.length)
			if (ndesc.length > 2048) { break }
			desc = ndesc
		}

		this.builder.description(desc)
	}

	Article(channel) {
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

	 	return channel.sendMessage('', false, this.builder.embed)
	}

	Disambiguation(channel) {
		this.builder.title(this.data.Heading)
		this.builder.url(this.data.AbstractURL)

		var desc = ''
		desc += 'Source: ' + this.data.AbstractSource + '\n'
		this.builder.description(desc)

		this.RelatedTopics()

		return channel.sendMessage('', false, this.builder.embed)
	}

	Category(channel) {
		this.builder.title(this.data.Heading)
		this.builder.url(this.data.AbstractURL)

		var desc = ''
		desc += 'Source: ' + this.data.AbstractSource + '\n'
		this.builder.description(desc)

		this.RelatedTopics()

		return channel.sendMessage('', false, this.builder.embed)
	}

	Name(channel) { // Implement this, whatever it is.
		console.log('Unsupported query: ' + this.query)
		return channel.sendMessage('This appears to be an unsupported search, the owner has been notified.\n\n' + 'https://duckduckgo.com/?' + query.stringify({
			q: this.query
		}))
	}

	Exclusive(channel) {
		if (BlacklistedAnswerTypes.some((v) => v == this.data.AnswerType)) {
			return channel.sendMessage('Sorry, but this is a blacklisted answer.')
		}

		if (this.data.Redirect !== '') {
			return channel.sendMessage(this.data.Redirect)
		}
		
		console.log(this.query)
		console.log(this.data)
		console.log(this.data.Answer)
		console.log(typeof(this.data.Answer))

		if (typeof this.data.Answer === 'string' && this.data.Answer !== '') {
			this.builder.title(this.data.Answer)
		} else {
			this.builder.title('Can\'t parse answer, click me to go to DuckDuckGo.')
		}

		console.log(this.builder.embed.title)

		this.builder.url('https://duckduckgo.com/?' + query.stringify({
			q: this.query
		}))
		return channel.sendMessage('', false, this.builder.embed)
	}

	Default(channel) {
		
	}
}

module.exports = (...args) => new DDGResponse(...args)