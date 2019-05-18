"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Class Callback manager that manages all callback event received
 *
 * @export
 * @class CallbackManager
 */
class CallbackManager {
    static async manageCallback(context) {
        switch (context.event.payload) {
            case 'new_user':
                await context.sendMessage('Eres un nuevo usuario');
                break;
            case 'login_user':
                await context.sendMessage('NO Eres un nuevo usuario');
                break;
            default:
                break;
        }
    }
}
exports.CallbackManager = CallbackManager;
//# sourceMappingURL=callback.manager.js.map