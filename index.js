const typeorm = require('typeorm');
const { createServer } = require('bottender/express');
const { TelegramBot } = require('bottender');
const config = require('./bottender.config.js').telegram;
const { handler } = require('./src/handlers');
const { UserModel } = require('./src/models/user').User;
const { UserEntity } = require('./src/entities/user');

require('dotenv').config();

// typeorm config
typeorm.createConnection({
  type: 'sqlite',
  database: '/db/cloud-bot.db',
  entities: [UserEntity],
  logging: true
}).then(function (connection) {
  const firstUser = {
    id: '1',
    username: 'John doe',
    password: '4242'
  };

  const userRepository = connection.getRepository('User').save(firstUser).then(function (savedUser) {
    console.log("User has been saved: ", savedUser);
    return userRepository.find();
  })

}).catch(function (error) {
  console.log("Error: ", error);
});


// bot initialization
const bot = new TelegramBot({
  accessToken: config.accessToken,
});


// bot.setInitialState(states.initialState);
bot.onEvent(handler);

const server = createServer(bot, { ngrok: true });


// Telegram currently only supports four ports for webhooks: 443, 80, 88 and 8443
server.listen(process.env.PORT, () => {
  console.log(`server is running on ${process.env.PORT} port...`);
});
