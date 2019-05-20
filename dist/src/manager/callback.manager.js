"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messages_1 = require("../messages");
/**
 * Class Callback manager that manages all callback event received
 *
 * @export
 * @class CallbackManager
 */
class CallbackManager {
    static async manageCallback(context) {
        const state = context.state;
        switch (context.event.payload) {
            case 'new_user':
                await context.sendMessage(messages_1.Messages.START_UNKNOWN_USER);
                state.registering = true;
                break;
            case 'login_user':
                await context.sendMessage(messages_1.Messages.START_KNOWN_USER);
                state.logging = true;
                break;
            default:
                break;
        }
        context.setState(state);
        return Promise.resolve();
    }
}
exports.CallbackManager = CallbackManager;
//# sourceMappingURL=callback.manager.js.map