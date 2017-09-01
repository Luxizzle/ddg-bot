let config = {
	name: 'luxizzle-ddg-bot'
}

let fetch = require('node-fetch')
let query = require('querystring')

let ddgresponse = require('./response')

module.exports = async (term, qparams = {}, opts = {}) => {
	
	let url = 'https://api.duckduckgo.com/?' + query.stringify({
		t: config.name,
		q: term,
		pretty: qparams.pretty || '1',
		no_html: qparams.no_html || '1',
		no_redirect: '1',
		skip_disambig: opts.skip_disambig || '0',
		format: 'json'
	})

	var raw = await fetch(url)

	var result = ddgresponse(await raw.json(), term)

	return result
}