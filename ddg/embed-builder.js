module.exports = class EmbedBuilder {
	constructor() {
		this.embed = {
			color: 0xDE5833,
			footer: {
				text: 'Results from DuckDuckGo',
				icon_url: process.env.ROOT + '/logos/DDG_Dax.2x.png'
			},
			author: {
				name: 'DuckDuckGo Bot Server',
				url: 'https://discord.gg/rWaU5KZ',
				icon_url: process.env.ROOT + '/logos/DDG_Dax.2x.png'
			},
			description: ''
		}
	}

	title(t) {
		this.embed.title = t.slice(0, 256)
		return this
	}

	url(u) {
		this.embed.url = u
		return this
	}

	thumbnail(img) {
		this.embed.thumbnail = {
			url: img
		}
		return this
	}

	image(url) {
		this.embed.image = {
			url: url
		}
	}

	description(t) {

		t = t
			.replace('*', '\*')
			.replace('_', '\_')
			.replace('~', '\~')


		this.embed.description = t.slice(0, 2048)
		return this
	}

	color(c) {
		this.embed.color = c
		return this
	}

	footer(t, icon) {
		this.embed.footer = this.embed.footer || {}
		this.embed.footer = {
			text: (t || this.embed.footer.text || '').slice(0, 100),
			icon_url: icon || this.embed.footer.icon_url || ''
		}
		return this
	}

	field(title = 'title', content = '', inline = false) {
		this.embed.fields = this.embed.fields || []
		this.embed.fields.push({
			title: title.slice(0, 50),
			content: content.slice(0, 100),
			inline: inline
		})
		return this
	}
}