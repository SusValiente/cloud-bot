const { TelegramBot, TelegramHandler } = require('bottender');
const config = require('./bottender.config.js').telegram;

const bot = new TelegramBot({
    accessToken: config.accessToken,
});

const handler = new TelegramHandler()
    .onText(/yo/i, async context => {
        const options = {
            parse_mode: 'Markdown',
        };
        await context.sendMessage('*Hi* there!', options);
    })
    .onEvent(async context => {
        await context.sendMessage("Sorry, I don't know what you say.");
    });

module.exports = { bot, handler };