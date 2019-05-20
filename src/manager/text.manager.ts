import { Messages } from '../messages';
import { IState } from '../states';
// import * as _ from 'lodash';
import { isNullOrUndefined } from 'util';
/**
 * Class Text manager that manages all text event received
 *
 * @export
 * @class TextManager
 */
export class TextManager {
    public static async manageText(context: any): Promise<void> {
        const state: IState = context.state;
        switch (context.event.text) {
            case '/start':
                context.resetState();
                await context.sendMessage(Messages.START, {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: 'Soy un usuario nuevo',
                                    callback_data: 'new_user',
                                },
                            ],
                            [
                                {
                                    text: 'Ya he estado antes',
                                    callback_data: 'login_user',
                                },
                            ],
                        ],
                    },
                });
                break;

            default:
                await this.manageUnknownText(context, state);
                break;
        }
        return Promise.resolve();
    }

    public static async manageUnknownText(context: any, state: IState) {
        if (state.registering && isNullOrUndefined(state.username)) {
            state.username = context.event.text;
            await context.sendMessage(Messages.START_ASK_PASSWORD);
        }
        // me quede por aqui, necesito otro flag para comprobar la intro de la password
        if (state.registering && !isNullOrUndefined(state.username)) {
            state.password = context.event.text;
            await context.sendMessage(Messages.START_ASK_DROPBOX, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Vincular Dropbox',
                                callback_data: 'sync_dropbox',
                            },
                        ],
                        [
                            {
                                text: 'No vincular',
                                callback_data: 'ignore_dropbox',
                            },
                        ],
                    ],
                },
            });
        }
        context.setState(state);
        return Promise.resolve();
    }
}
