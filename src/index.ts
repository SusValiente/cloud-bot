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
import { GoogleCredentials } from '../credentials';
import { GoogleToken } from './models/googleToken';

//  JAVASCRIPT IMPORTS
const { createServer } = require('bottender/express'); // does not have @types
const { TelegramBot } = require('bottender');
const { google } = require('googleapis');

require('dotenv').config();

// typeorm config
const options: ConnectionOptions = {
    type: 'sqlite',
    database: './db/cloud-bot.db',
    entities: ['./dist/**/*.entity.js'],
    logging: true,
    synchronize: true
};

// bot initialization
const bot = new TelegramBot({
    accessToken: config.telegram.accessToken
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
const client = bot.connector.client;

async function main(dbx: DropboxUtils, client: any) {
    bot.onEvent(async (context: any) => {
        try {
            auxiliarContext = context;
            if (context.state.user) {
                console.log('CONTEXT USER : ' + context.state.user.id);
                console.log('CONTEXT USER : ' + context.state.user.username);
            } else {
                console.log('USER NULL');
            }
            if (context.event.isDocument) {
                await DocumentManager.manageDocument(context);
            }
            if (context.event.isPhoto) {
                await PhotoManager.managePhoto(context, dbx, client);
            }
            if (context.event.isText) {
                await TextManager.manageText(context, dbx);
            }
            if (context.event.isCallbackQuery) {
                await CallbackManager.manageCallback(context, dbx);
            }
        } catch (error) {
            await context.sendMessage(error.message);
        }
    });

    const server = createServer(bot, { ngrok: true });

    server.get('/auth', async (req: any, res: any) => {
        if (!_.isNil(auxiliarContext.state.user) && !_.isNil(req.query.code)) {
            const userRepository = await getConnection().getRepository(User);
            const user = await userRepository.findOne({ where: { id: auxiliarContext.state.user.id } });
            const token = await dbx.getToken(req.query.code);
            user.dropboxToken = token;
            await userRepository.save(user);

            const oauth2Client = new google.auth.OAuth2(
                GoogleCredentials.web.client_id,
                GoogleCredentials.web.client_secret,
                GoogleCredentials.web.redirect_uris[0]
            );

            google.options({ auth: oauth2Client });

            const scopes = ['https://www.googleapis.com/auth/plus.me'];
            const authorizeUrl = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: scopes.join(' '),
                prompt: 'consent'
            });

            await auxiliarContext.sendMessage(Messages.ASK_GOOGLE, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Vincular Google',
                                url: authorizeUrl
                            }
                        ],
                        [
                            {
                                text: 'No vincular',
                                callback_data: 'ignore_google'
                            }
                        ]
                    ]
                }
            });
        }
        res.send(html);
        res.end();
    });

    server.get('/google/auth', async (req: any, res: any) => {
        if (!_.isNil(auxiliarContext.state.user) && !_.isNil(req.query.code)) {
            const oAuth2Client = new google.auth.OAuth2(
                GoogleCredentials.web.client_id,
                GoogleCredentials.web.client_secret,
                GoogleCredentials.web.redirect_uris[0]
            );

            google.options({ auth: oAuth2Client });
            oAuth2Client.getToken(req.query.code, async (err: any, token: GoogleToken) => {
                if (err) {
                    return console.error('Error retrieving access token', err);
                }
                const userRepository = await getConnection().getRepository(User);
                const user = await userRepository.findOne({ where: { id: auxiliarContext.state.user.id } });
                user.googleRefreshToken = token.refresh_token;
                user.googleToken = token.access_token;
                await userRepository.save(user);
                await auxiliarContext.sendMessage(Messages.START_FINISHED);
            });
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
main(dbx, client);
