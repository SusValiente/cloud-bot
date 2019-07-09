// TYPESCRIPT IMPORTS
import { config } from '../bottender.config';
import { ConnectionOptions, createConnection } from 'typeorm';
import { TextManager } from './manager/text.manager';
import { CallbackManager } from './manager/callback.manager';
import { PhotoManager } from './manager/photo.manager';
import { DocumentManager } from './manager/document.manager';
import * as _ from 'lodash';
import { initialState } from './states';
import { Messages } from './messages';
import { DropboxUtils } from './dropboxUtils';
import { User } from './entities/user.entity';
import { getConnection } from 'typeorm';

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

bot.setInitialState(initialState);

const html = '<!DOCTYPE html>\n<html>\n    <head>\n    </head>\n <body>\n      <h1>Puedes volver al bot</h1>\n   </body>\n</html>';

async function connectTypeorm() {
    const connection = await createConnection(options);
    if (!_.isNull(connection)) {
        console.log('Typeorm connected successfully');
    }
    return;
}
let auxiliarContext: any = null;

const dbx = new DropboxUtils();

async function main(dbx: DropboxUtils) {
    bot.onEvent(async (context: any) => {
        try {
            auxiliarContext = context;
            if (context.event.isDocument) {
                await DocumentManager.manageDocument(context);
            }
            if (context.event.isPhoto) {
                await PhotoManager.managePhoto(context);
            }
            if (context.event.isText) {
                await TextManager.manageText(context, dbx);
            }
            if (context.event.isCallbackQuery) {
                await CallbackManager.manageCallback(context);
            }
        } catch (error) {
            await context.sendMessage(error.message);
        }
    });

    const server = createServer(bot);

    server.get('/auth', async (req: any, res: any) => {
        if (!_.isNil(auxiliarContext) && !_.isNil(req.query)) {
            await auxiliarContext.sendMessage(Messages.START_FINISHED);
            const userRepository = await getConnection().getRepository(User);
            const user = await userRepository.findOne({ where: { userId: auxiliarContext.state.user.userId } });
            user.dropboxCode = req.query.code;
            await userRepository.save(user);
        }
        res.send(html);
        res.end();
    });

    // Telegram currently only supports four ports for webhooks: 443, 80, 88 and 8443
    server.listen(process.env.PORT, () => {
        console.log(`server is running on ${process.env.PORT} port...`);
    });
}
connectTypeorm();
main(dbx);
