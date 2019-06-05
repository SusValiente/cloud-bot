// TYPESCRIPT IMPORTS
import { config } from '../bottender.config';
import { ConnectionOptions, createConnection } from 'typeorm';
import { TextManager } from './manager/text.manager';
import { CallbackManager } from './manager/callback.manager';
import * as _ from 'lodash';
import { initialState } from './states';

//  JAVASCRIPT IMPORTS
const { createServer } = require('bottender/express'); // does not have @types
const { TelegramBot } = require('bottender');

require('dotenv').config();

// typeorm config
const options: ConnectionOptions = {
    type: 'sqlite',
    database: './db/cloud-bot.db',
    entities: ['./dist/**/*.entity.js'],
    logging: true,
    synchronize: true,
};

// bot initialization
const bot = new TelegramBot({
    accessToken: config.telegram.accessToken,
});

async function main() {
    bot.setInitialState(initialState);
    // typeorm connection
    const connection = await createConnection(options);

    if (!_.isNull(connection)) {
        console.log('Typeorm connected successfully');
    }

    bot.onEvent(async (context: any) => {
        try {
            if (context.event.isText) {
                await TextManager.manageText(context);
            }
            if (context.event.isCallbackQuery) {
                await CallbackManager.manageCallback(context);
            }
        } catch (error) {
            await context.sendMessage(error);
        }
    });

    const server = createServer(bot, { ngrok: true });

    // Telegram currently only supports four ports for webhooks: 443, 80, 88 and 8443
    server.listen(process.env.PORT, () => {
        console.log(`server is running on ${process.env.PORT} port...`);
    });
}

main();
