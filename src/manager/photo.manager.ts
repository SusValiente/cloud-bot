import { DropboxUtils } from '../dropboxUtils';
import * as _ from 'lodash';
import { Utils } from '../utils';
import { Messages } from '../messages';

/**
 * Class representing Photo Manager
 *
 * @export
 * @class PhotoManager
 */
export class PhotoManager {
    public static async managePhoto(context: any, dbx: DropboxUtils, client: any): Promise<void> {
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
        let photo = null;
        if (!_.isNil(context.event.photo[2])) {
            photo = await client.getFile(context.event.photo[2].file_id);
        }
        if (_.isNil(photo) && !_.isNil(context.event.photo[1])) {
            photo = await client.getFile(context.event.photo[1].file_id);
        }
        if (_.isNil(photo) && !_.isNil(context.event.photo[0])) {
            photo = await client.getFile(context.event.photo[0].file_id);
        }
        if (_.isNil(photo)) {
            await context.sendMessage(Messages.INVALID_FILE);
            return Promise.resolve();
        }
        try {
            if (_.isNil(context.event.message.caption)) {
                await dbx.uploadFileByUrl(photo.file_path);
            } else {
                await dbx.uploadPhotoByUrl(photo.file_path, context.event.message.caption);
            }

            await context.sendMessage(Messages.UPLOAD_PHOTO_SUCCESS);
        } catch (error) {
            console.log(error);
            await context.sendMessage(error.message);
        }
        return Promise.resolve();
    }
}
