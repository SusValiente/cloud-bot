const typeorm = require('typeorm')
const { createServer } = require('bottender/express')
const { TelegramBot } = require('bottender')
const config = require('./bottender.config.js').telegram
const { handler } = require('./src/handlers')
const _ = require('lodash')
const { status } = require('./src/states')
require('dotenv').config()

// bot initialization
const bot = new TelegramBot({
    accessToken: config.accessToken,
})

bot.setInitialState(status)
// typeorm initialization
const connection = typeorm
    .createConnection({
        type: 'sqlite',
        name: 'typeorm',
        database: './db/cloud-bot.db',
        entities: [require('./src/entities/User')],
        logging: true,
    })
    .then(async function (connection) {
        console.log('Connected successfully: ' + !_.isNull(connection))
    })
    .catch(function (error) {
        console.error(`Connection Error` + error)
    })

bot.onEvent(handler)

const server = createServer(bot, { ngrok: true })

// Telegram currently only supports four ports for webhooks: 443, 80, 88 and 8443
server.listen(process.env.PORT, () => {
    console.log(`server is running on ${process.env.PORT} port...`)
})

module.exports = { connection }
