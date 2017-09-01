module.exports = class EmbedBuilder {
	constructor() {
		this.embed = {
			color: 0xDE5833,
			/* footer: {
				text: 'Results from DuckDuckGo | Bot by Luxizzle',
				icon_url: 'https://cdn.discordapp.com/attachments/168421568387612672/353125335425875969/DDG_Dax.1x.png'
			}, */
			author: {
				name: 'Results from DuckDuckGo | Bot By Luxizzle',
				url: 'https://discordapp.com/oauth2/authorize?client_id=353136023967891466&scope=bot&permissions=52224',
				icon_url: 'https://cdn.discordapp.com/attachments/168421568387612672/353125335425875969/DDG_Dax.1x.png'
			}
		}
	}

	title(t) {
		this.embed.title = t.slice(0, 100)
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