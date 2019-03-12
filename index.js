require('dotenv').config();
const { TelegramBot } = require('bottender');
const { createServer } = require('bottender/express');

const config = require('./bottender.config.js').telegram;

const bot = new TelegramBot({
  accessToken: config.accessToken,
});

bot.onEvent(async context => {
  await context.sendMessage('Hello World');
});

const server = createServer(bot, { ngrok: true });


// Telegram currently only supports four ports for webhooks: 443, 80, 88 and 8443
server.listen(process.env.PORT, () => {
  console.log(`server is running on ${process.env.PORT} port...`);
});
