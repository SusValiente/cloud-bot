import { DropboxUtils } from '../dropboxUtils';
import * as _ from 'lodash';
import { Utils } from '../utils';
import { Messages } from '../messages';

/**
 * Class representing File Manager
 *
 * @export
 * @class FileManager
 */
export class FileManager {
    public static async manageFile(context: any, dbx: DropboxUtils, client: any): Promise<void> {
        if (_.isNil(context.state.user)) {
            await context.sendMessage(Messages.DONT_KNOW_YOU);
            return Promise.resolve();
        }

        let dbxToken = context.state.user.dropboxToken;

        if (_.isNil(dbxToken)) {
            const loggedUser = await Utils.getUser(context.state.user.id);
            dbxToken = loggedUser.dropboxToken;
            context.setState({ user: loggedUser });
            if (_.isNil(dbxToken)) {
                await context.sendMessage(Messages.NO_DROPBOX);
                return Promise.resolve();
            }
        }

        dbx.setToken(dbxToken);
        let file = null;
        if (!_.isNil(context.event.message.document)) {
            file = await client.getFile(context.event.message.document.file_id);
        }
        if (_.isNil(file)) {
            await context.sendMessage(Messages.INVALID_FILE);
            return Promise.resolve();
        }
        try {
            await dbx.uploadFileByUrl(file.file_path);
            await context.sendMessage('Archivo subido correctamente');
        } catch (error) {
            console.log(error);
            await context.sendMessage(error.message);
        }
        return Promise.resolve();
    }
}
