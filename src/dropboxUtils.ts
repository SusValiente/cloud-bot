import fetch from 'isomorphic-fetch';
import { Dropbox } from 'dropbox';
import { DropboxConfig, KEY, config } from './../config';
import * as _ from 'lodash';
const aes256 = require('aes256');
/**
 * Class DropboxUtils that manages calls to the Dropbox API
 *
 * @export
 * @class DropboxUtils
 */
export class DropboxUtils {
    private dbx: Dropbox;

    constructor() {
        this.dbx = new Dropbox({
            fetch,
            clientId: DropboxConfig.clientId
        });
        this.dbx.setClientSecret(DropboxConfig.clientSecret);
    }

    /**
     * @method getAuthUrl returns the authentication link neccesary to get the user token
     *
     * @returns {string}
     * @memberof DropboxUtils
     */
    getAuthUrl(): string {
        const authUrl: string = this.dbx.getAuthenticationUrl(DropboxConfig.redirectUri, null, 'code');
        return authUrl;
    }

    /**
     * @method setToken sets the token of the Dropbox sdk, it is mandatory to use this method in order
     * to make calls to the API
     *
     * @param {string} token
     * @returns {void}
     * @memberof DropboxUtils
     */
    setToken(token: string): void {
        if (!_.isNil(token)) {
            token = aes256.decrypt(KEY, token);
        }
        this.dbx.setAccessToken(token);
        return;
    }

    /**
     * @method getToken returns the authentication token from the authentication code
     *
     * @param {string} code
     * @returns {Promise<string>}
     * @memberof DropboxUtils
     */
    async getToken(code: string): Promise<string> {
        const token: string = await this.dbx.getAccessTokenFromCode(DropboxConfig.redirectUri, code);
        return Promise.resolve(token);
    }

    /**
     * @method uploadFileByUrl uploads a file into the Dropbox user account
     *
     * @param {string} telegramFilePath
     * @returns {Promise<void>}
     * @memberof DropboxUtils
     */
    async uploadFileByUrl(telegramFilePath: string): Promise<void> {
        try {
            const downloadLink = `https://api.telegram.org/file/bot${config.telegram.accessToken}/${telegramFilePath}`;
            await this.dbx.filesSaveUrl({ path: '/' + telegramFilePath, url: downloadLink });
            return Promise.resolve();
        } catch (error) {
            console.log(error);
            return Promise.reject(error);
        }
    }

    async uploadPhotoByUrl(telegramFilePath: string, fileName: string): Promise<void> {
        try {
            const extensionAux = telegramFilePath.split('.');
            const extension = extensionAux[extensionAux.length - 1];
            const path = 'photos/' + fileName + '.' + extension;

            const downloadLink = `https://api.telegram.org/file/bot${config.telegram.accessToken}/${telegramFilePath}`;
            await this.dbx.filesSaveUrl({ path: '/' + path, url: downloadLink });
            return Promise.resolve();
        } catch (error) {
            console.log(error);
            return Promise.reject(error);
        }
    }

    // Unused for now
    // /**
    //  * @method getFiles returns the list of files of a folder
    //  *
    //  * @param {string} path
    //  * @param {number} limitEntries
    //  * @returns {Promise<DropboxTypes.files.ListFolderResult>}
    //  * @memberof DropboxUtils
    //  */
    // async getFiles(path: string, limitEntries: number): Promise<DropboxTypes.files.ListFolderResult> {
    //     const photos = await this.dbx.filesListFolder({ path: path, limit: limitEntries });
    //     return Promise.resolve(photos);
    // }

    unlinkDropboxAccount() {
        this.dbx.authTokenRevoke();
    }
}
