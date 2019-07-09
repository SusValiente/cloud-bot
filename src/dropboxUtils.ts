import fetch from 'isomorphic-fetch';
import { Dropbox } from 'dropbox';
import { DropboxConfig } from './../dropbox.config';

export class DropboxUtils {
    private dbx: Dropbox;

    constructor() {
        this.dbx = new Dropbox({
            fetch,
            clientId: DropboxConfig.clientId,
        });
        this.dbx.setClientSecret(DropboxConfig.clientSecret);
    }

    getAuthUrl(): string {
        const authUrl: string = this.dbx.getAuthenticationUrl(DropboxConfig.redirectUri, null, 'code');
        return authUrl;
    }

    async getToken(code: string): Promise<string> {
        const token: string = await this.dbx.getAccessTokenFromCode(DropboxConfig.redirectUri, code);
        return Promise.resolve(token);
    }
}
