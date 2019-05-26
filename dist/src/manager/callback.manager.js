"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messages_1 = require("../messages");
const utils_1 = require("../utils");
/**
 * Class Callback manager that manages all callback event received
 *
 * @export
 * @class CallbackManager
 */
class CallbackManager {
    static async manageCallback(context) {
        try {
            const state = context.state;
            switch (context.event.payload) {
                case 'new_user':
                    await context.sendMessage(messages_1.Messages.START_UNKNOWN_USER);
                    state.currentStatus.insertingUsername = true;
                    state.currentStatus.registering = true;
                    break;
                case 'login_user':
                    await context.sendMessage(messages_1.Messages.START_KNOWN_USER);
                    state.currentStatus.insertingUsername = true;
                    state.currentStatus.logging = true;
                    break;
                case 'sync_dropbox':
                    state.currentStatus.insertingDropboxEmail = true;
                    await context.sendMessage(messages_1.Messages.START_ASK_DROPBOX_EMAIL);
                    break;
                case 'ignore_dropbox':
                    state.currentStatus.dropboxActive = false;
                    state.currentStatus.registering = false;
                    await utils_1.Utils.registerUser(context, state.data.username, state.data.password);
                    await context.sendMessage(messages_1.Messages.START_FINISHED);
                    break;
                default:
                    break;
            }
            context.setState(state);
            return Promise.resolve();
        }
        catch (error) {
            context.sendMessage(error.message);
        }
    }
}
exports.CallbackManager = CallbackManager;
//# sourceMappingURL=callback.manager.js.map