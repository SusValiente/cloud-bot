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
import { IUser } from './models/user.model';
import { getConnection } from 'typeorm';
import { IGoogleToken, IGoogleCredential } from './models/googleToken.model';
import { GoogleUtils } from './googleUtils';
import { GoogleCredential } from './entities/googleCredential.entity';

//  JAVASCRIPT IMPORTS
const { createServer } = require('bottender/express'); // does not have @types
const { TelegramBot } = require('bottender');
const { google } = require('googleapis');
const Calendar = require('telegraf-calendar-telegram');
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

// instantiate the calendar
const calendar = new Calendar(bot, {
    startWeekDay: 1,
    weekDayNames: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
    monthNames: [
        'En', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ]
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
const ggl = new GoogleUtils();
const client = bot.connector.client;

async function main(dbx: DropboxUtils, ggl: GoogleUtils, client: any, calendar: any) {
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
                await TextManager.manageText(context, dbx, ggl, calendar);
            }
            if (context.event.isCallbackQuery) {
                await CallbackManager.manageCallback(context, dbx, ggl, calendar);
            }
        } catch (error) {
            await context.sendMessage(error.message);
        }
    });

    const server = createServer(bot);

    server.get('/auth', async (req: any, res: any) => {
        if (!_.isNil(auxiliarContext.state.user) && !_.isNil(req.query.code)) {
            const userRepository = await getConnection().getRepository(User);
            const user = await userRepository.findOne({ where: { id: auxiliarContext.state.user.id } });
            const token = await dbx.getToken(req.query.code);
            user.dropboxToken = token;
            await userRepository.save(user);

            const google = new GoogleUtils();
            const authorizeUrl = google.getAuthorizeUrl();

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
            const oAuth2Client = ggl.getCredentials();

            google.options({ auth: oAuth2Client });
            oAuth2Client.getToken(req.query.code, async (err: any, token: IGoogleToken) => {
                if (err) {
                    return console.error('Error retrieving access token', err);
                }
                oAuth2Client.setCredentials(token);
                ggl.setCredentials(oAuth2Client);
                const userRepository = await getConnection().getRepository(User);
                const googleRepository = await getConnection().getRepository(GoogleCredential);
                const findUser: IUser = await userRepository.findOne({ where: { id: auxiliarContext.state.user.id } });

                const newCredential: IGoogleCredential = {
                    user: findUser,
                    access_token: token.access_token,
                    refresh_token: token.refresh_token,
                    scope: token.scope,
                    token_type: token.token_type,
                    id_token: token.id_token,
                    expiry_date: token.expiry_date
                };
                findUser.googleEmail = await ggl.getCalendarId(token.access_token);
                await userRepository.save(findUser);
                await googleRepository.save(newCredential);
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
main(dbx, ggl, client, calendar);
