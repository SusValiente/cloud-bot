const { createServer } = require('bottender/express');
const { bot, handler } = require('./handlers');

require('dotenv').config();

bot.onEvent(handler);

const server = createServer(bot, { ngrok: true });


// Telegram currently only supports four ports for webhooks: 443, 80, 88 and 8443
server.listen(process.env.PORT, () => {
  console.log(`server is running on ${process.env.PORT} port...`);
});
