import { GoogleCredentials } from '../credentials';
import { getConnection } from 'typeorm';
import { User } from './entities/user.entity';
import axios from 'axios';
const { google } = require('googleapis');

export class GoogleUtils {
    private oAuth2Client: any;

    constructor() {
        this.oAuth2Client = new google.auth.OAuth2(
            GoogleCredentials.web.client_id,
            GoogleCredentials.web.client_secret,
            GoogleCredentials.web.redirect_uris[0]
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

    public getEvents(): any {
        // this.oAuth2Client.setCredentials(token);
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

    public async getNewAccessToken(refreshToken: string): Promise<string> {
        const newtoken = await this.oAuth2Client.refreshToken(refreshToken);
        return newtoken.res.data.access_token;
    }
}
