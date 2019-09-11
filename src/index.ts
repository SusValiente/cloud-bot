// TYPESCRIPT IMPORTS
import { config , KEY, GoogleCredentials } from '../config';
import { ConnectionOptions, createConnection } from 'typeorm';
import { TextManager } from './manager/text.manager';
import { CallbackManager } from './manager/callback.manager';
import { PhotoManager } from './manager/photo.manager';
import { VideoManager } from './manager/video.manager';
import { AudioManager } from './manager/audio.manager';
import { FileManager } from './manager/file.manager';
import * as _ from 'lodash';
import { initialState } from './states';
import { Messages } from './messages';
import { DropboxUtils } from './dropboxUtils';
import { User } from './entities/user.entity';
import { IUser } from './models/user.model';
import { getConnection } from 'typeorm';
import { IGoogleToken, IGoogleCredential } from './models/googleToken.model';
import { GoogleUtils, IGoogleEvent } from './googleUtils';
import { GoogleCredential } from './entities/googleCredential.entity';
import { CronJob } from 'cron';
import moment from 'moment';
import { successHTML } from './success';

//  JAVASCRIPT IMPORTS
const { createServer } = require('bottender/express'); // does not have @types
const { TelegramBot } = require('bottender');
const { google } = require('googleapis');
const Calendar = require('telegraf-calendar-telegram');
const aes256 = require('aes256');

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
    monthNames: ['En', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
});

bot.setInitialState(initialState);

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
                await FileManager.manageFile(context, dbx, client);
            }
            if (context.event.isPhoto) {
                await PhotoManager.managePhoto(context, dbx, client);
            }
            if (context.event.isVideo) {
                await VideoManager.manageVideo(context, dbx, client);
            }
            if (context.event.isAudio || context.event.isVoice) {
                await AudioManager.manageAudio(context, dbx, client);
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
        if (auxiliarContext && !_.isNil(auxiliarContext.state.user) && !_.isNil(req.query.code)) {
            const userRepository = await getConnection().getRepository(User);
            const user = await userRepository.findOne({ where: { id: auxiliarContext.state.user.id } });
            const token = await dbx.getToken(req.query.code);
            user.dropboxToken = aes256.encrypt(KEY, token);
            await userRepository.save(user);

            const oauth2Client = new google.auth.OAuth2(
                GoogleCredentials.web.client_id,
                GoogleCredentials.web.client_secret,
                GoogleCredentials.web.redirect_uris[1]
            );

            google.options({ auth: oauth2Client });

            const scopes = ['https://www.googleapis.com/auth/calendar'];
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
        res.send(successHTML);
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
                    access_token: aes256.encrypt(KEY, token.access_token),
                    refresh_token: aes256.encrypt(KEY, token.refresh_token),
                    scope: token.scope,
                    token_type: token.token_type,
                    expiry_date: token.expiry_date
                };
                findUser.googleEmail = await ggl.getCalendarId(token.access_token);
                await userRepository.save(findUser);
                await googleRepository.save(newCredential);
                await auxiliarContext.sendMessage(Messages.START_FINISHED);
            });
        }
        res.send(successHTML);
        res.end();
    });

    // Telegram currently only supports four ports for webhooks: 443, 80, 88 and 8443
    server.listen(process.env.PORT, () => {
        console.log(`server is running on ${process.env.PORT} port...`);
    });
}

const task = new CronJob(
    '1 */1 * * *',
    async () => {
        console.log('Cron task every hour and one minute');
        if (
            auxiliarContext &&
            auxiliarContext.state.user &&
            auxiliarContext.state.user.googleEmail &&
            auxiliarContext.state.user.googleCredential &&
            auxiliarContext.state.user.googleCredential.access_token
        ) {
            try {
                let token = auxiliarContext.state.user.googleCredential.access_token;
                const isExpired = await ggl.isTokenExpired(token);
                if (isExpired) {
                    token = await ggl.getNewAccessToken(auxiliarContext.state.user.googleCredential.refresh_token);
                }
                const nextEvents: IGoogleEvent[] = await ggl.getEvents(token, auxiliarContext.state.user.googleEmail, 10);
                const now = moment.utc(moment.now()).format();
                const maxIntervalTime = moment(
                    moment
                        .utc(moment.now())
                        .add(1, 'hours')
                        .add(1, 'minutes')
                ).format();
                for (const event of nextEvents) {
                    const eventDate = event.startDate;

                    if (moment(eventDate).isBetween(moment.utc(now), moment.utc(maxIntervalTime))) {
                        await auxiliarContext.sendMessage(
                            `
                    Dentro de una hora empezará el siguiente evento:\n` + event.summary
                        );
                    }
                }
            } catch (error) {
                console.log(error);
            }
        } else {
            console.log('There is no context');
        }
    },
    null,
    true,
    null
);

connectTypeorm();
main(dbx, ggl, client, calendar);
