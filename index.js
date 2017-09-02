require('dotenv').config()

var ShardManager = require('./Client/ShardManager')

var manager = new ShardManager(process.env.SHARDS, process.env.TOKEN)
manager.start()

var express = require('express')
var app = express()

app.use('/', express.static('./static'))

app.listen(process.env.PORT)

// https://discordapp.com/oauth2/authorize?client_id=353136023967891466&scope=bot&permissions=52224