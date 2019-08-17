import { GoogleCredentials } from '../credentials';
import { getConnection } from 'typeorm';
import { User } from './entities/user.entity';
import axios from 'axios';
import * as _ from 'lodash';
const { google } = require('googleapis');
import Moment from 'moment';

export interface IGoogleEvent {
    id: string;
    summary: string;
    endDate: string;
    location: string;
}

export class GoogleUtils {
    private oAuth2Client: any;

    constructor() {
        this.oAuth2Client = new google.auth.OAuth2(
            GoogleCredentials.web.client_id,
            GoogleCredentials.web.client_secret,
            GoogleCredentials.web.redirect_uris[1]
        );
    }

    public getAuthorizeUrl(): string {
        google.options({ auth: this.oAuth2Client });

        const scopes = ['https://www.googleapis.com/auth/plus.me'];
        const authorizeUrl = this.oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes.join(' '),
            prompt: 'consent'
        });

        return authorizeUrl;
    }

    public getCredentials(): any {
        return this.oAuth2Client;
    }

    public setCredentials(credentials: any): void {
        this.oAuth2Client = credentials;
    }

    public async refreshAndGetCredentials(userId: string): Promise<any> {
        const user = await getConnection()
            .getRepository(User)
            .findOne({
                where: {
                    id: userId
                },
                relations: ['googleCredential']
            });

        const credential = user.googleCredential;
        this.oAuth2Client.setCredentials(credential);

        return this.oAuth2Client;
    }

    public async isTokenExpired(token: string): Promise<boolean> {
        const uri = `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`;
        try {
            await axios.get(uri);
            return false;
        } catch (error) {
            return true;
        }
    }

    public async createEvent(
        accessToken: string,
        calendarId: string,
        eventSummary: string,
        date: Date,
        descriptionEvent: string,
        locationEvent: string,
        duration?: number
    ): Promise<void> {
        const uri = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;
        const config = {
            headers: {
                Authorization: 'Bearer ' + accessToken
            }
        };
        const endDate: Date = new Date(date);
        endDate.setMinutes(date.getMinutes() + duration);
        try {
            const body: any = {
                summary: eventSummary,
                location: locationEvent,
                end: {
                    dateTime: `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getUTCDate()}T${endDate.getHours() -
                        2}:${endDate.getMinutes()}:00.000Z`
                },
                start: {
                    dateTime: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getUTCDate()}T${date.getHours() - 2}:${date.getMinutes()}:00.000Z`
                }
            };
            if (!_.isNil(descriptionEvent)) {
                body.description = descriptionEvent;
            }
            await axios.post(uri, body, config);
            return Promise.resolve();
        } catch (error) {
            console.log(error);
        }
    }

    public async getNewAccessToken(refreshToken: string): Promise<string> {
        const newtoken = await this.oAuth2Client.refreshToken(refreshToken);
        return newtoken.res.data.access_token;
    }

    public async getEvents(accessToken: string, calendarId: string, take: number): Promise<IGoogleEvent[]> {
        const now = Moment.utc(Moment.now()).format();
        const uri = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${now}&maxResults=${take}&orderBy=starttime&singleEvents=true`;
        const config = {
            headers: {
                Authorization: 'Bearer ' + accessToken
            }
        };
        const events: IGoogleEvent[] = [];
        try {
            const userEvents: any = await axios.get(uri, config);
            if (_.isEmpty(userEvents.data.items)) {
                return null;
            }
            userEvents.data.items.forEach((element: any) => {
                events.push({
                    id: element.id,
                    summary: element.summary,
                    endDate: !_.isNil(element.end.date)
                        ? Moment.utc(element.end.date)
                              .locale('es')
                              .format('dddd, MMMM Do YYYY, h:mm:ss a')
                        : !_.isNil(element.end.dateTime)
                        ? Moment.utc(element.end.dateTime)
                              .locale('es')
                              .format('dddd, MMMM Do YYYY, h:mm:ss a')
                        : 'No definido',
                    location: _.isNil(element.location) ? 'No definido' : element.location
                });
            });
            return events;
        } catch (error) {
            return null;
        }
    }

    public async getCalendarId(accessToken: string): Promise<string> {
        const uri = `https://www.googleapis.com/calendar/v3/users/me/calendarList`;
        const config = {
            headers: { Authorization: 'Bearer ' + accessToken }
        };
        try {
            const userCalendars: any = await axios.get(uri, config);
            if (_.isEmpty(userCalendars.data.items)) {
                return null;
            }
            const calendarId = userCalendars.data.items[0].summary;

            return calendarId;
        } catch (error) {
            return null;
        }
    }

    public async deleteEvent(eventId: string, calendarId: string, accessToken: string): Promise<void> {
        const uri = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`;
        const config = {
            headers: { Authorization: 'Bearer ' + accessToken }
        };
        try {
            await axios.delete(uri, config);
            return;
        } catch (error) {
            console.log(error.message);
        }
    }
}
