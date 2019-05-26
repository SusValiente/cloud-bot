import { Messages } from '../messages';
import { IState } from '../states';
import { Utils } from '../utils';
/**
 * Class Callback manager that manages all callback event received
 *
 * @export
 * @class CallbackManager
 */
export class CallbackManager {
    public static async manageCallback(context: any): Promise<void> {
        try {
            const state: IState = context.state;
            switch (context.event.payload) {
                case 'new_user':
                    await context.sendMessage(Messages.START_UNKNOWN_USER);
                    state.currentStatus.insertingUsername = true;
                    state.currentStatus.registering = true;
                    break;
                case 'login_user':
                    await context.sendMessage(Messages.START_KNOWN_USER);
                    state.currentStatus.insertingUsername = true;
                    state.currentStatus.logging = true;
                    break;
                case 'sync_dropbox':
                    state.currentStatus.insertingDropboxEmail = true;
                    await context.sendMessage(Messages.START_ASK_DROPBOX_EMAIL);
                    break;
                case 'ignore_dropbox':
                    state.currentStatus.dropboxActive = false;
                    state.currentStatus.registering = false;
                    await Utils.registerUser(context, state.data.username, state.data.password);
                    await context.sendMessage(Messages.START_FINISHED);
                    break;

                default:
                    break;
            }
            context.setState(state);
            return Promise.resolve();
        } catch (error) {
            context.sendMessage(error.message);
        }
    }
}
