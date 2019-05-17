// TYPESCRIPT IMPORTS
import { config } from './bottender.config';
import { ConnectionOptions, createConnection } from 'typeorm';
import { User } from './src/entities/user';
import { handler } from './src/handlers';
import * as _ from 'lodash';

//  JAVASCRIPT IMPORTS
const { createServer } = require('bottender/express'); // no tiene @types
const { TelegramBot } = require('bottender');

require('dotenv').config();

// typeorm config
const options: ConnectionOptions = {
    type: 'sqlite',
    database: './db/cloud-bot.db',
    entities: [User],
    logging: true,
};

// bot initialization
const bot = new TelegramBot({
    accessToken: config.telegram.accessToken,
});

async function main() {
    // typeorm connection
    const connection = await createConnection(options);

    if (!_.isNull(connection)) {
        console.log('Typeorm connected successfully');
    }

    bot.onEvent(handler);

    const server = createServer(bot, { ngrok: true });

    // Telegram currently only supports four ports for webhooks: 443, 80, 88 and 8443
    server.listen(process.env.PORT, () => {
        console.log(`server is running on ${process.env.PORT} port...`);
    });
}

main().catch(console.error);
