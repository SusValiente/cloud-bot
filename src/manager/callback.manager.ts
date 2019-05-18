import { Messages } from '../messages';
/**
 * Class Callback manager that manages all callback event received
 *
 * @export
 * @class CallbackManager
 */
export class CallbackManager {
    public static async manageCallback(context: any): Promise<void> {
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
