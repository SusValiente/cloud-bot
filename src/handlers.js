const { TelegramHandler } = require('bottender')

const handler = new TelegramHandler()
    .onText(async context => {
        if (context.event.isText) {
        }
    })
    .onError(async (context, error) => {
        await context.sendText(error.message)
    })

module.exports = { handler }
