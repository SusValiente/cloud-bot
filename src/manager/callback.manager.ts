import { Messages } from '../messages';
import { IState } from '../states';
/**
 * Class Callback manager that manages all callback event received
 *
 * @export
 * @class CallbackManager
 */
export class CallbackManager {
    public static async manageCallback(context: any): Promise<void> {
        const state: IState = context.state;
        switch (context.event.payload) {
            case 'new_user':
                await context.sendMessage(Messages.START_UNKNOWN_USER);
                state.registering = true;
                break;
            case 'login_user':
                await context.sendMessage(Messages.START_KNOWN_USER);
                state.logging = true;
                break;

            default:
                break;
        }
        context.setState(state);
        return Promise.resolve();
    }
}
