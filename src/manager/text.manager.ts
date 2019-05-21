import { Messages } from '../messages';
import { IState, initialState } from '../states';
import { isNullOrUndefined } from 'util';
import { Utils } from '../utils';
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
                context.setState(initialState);
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
                if (state.currentStatus.registering) {
                    await this.manageRegisterStatus(context, state);
                }
                if (state.currentStatus.logging) {
                    //     await this.loginUser(context, state);
                }

                break;
        }
        return Promise.resolve();
    }


    /**
     * @method manageRegisterStatus manages messages when the status is registering
     *
     * @static
     * @param {*} context
     * @param {IState} state
     * @returns {Promise<void>}
     * @memberof TextManager
     */
    public static async manageRegisterStatus(context: any, state: IState): Promise<void> {
        let next = true;
        if (state.currentStatus.insertingUsername && isNullOrUndefined(state.data.username) && next) {

            if (await Utils.validateExistingUsername(context.event.text)) {
                state.data.username = context.event.text;
                await context.sendMessage(Messages.START_ASK_PASSWORD);
                state.currentStatus.insertingPassword = true;
                state.currentStatus.insertingUsername = false;
                next = false;
            } else {
                await context.sendMessage(Messages.START_NAME_TAKEN);
            }

        }
        if (state.currentStatus.insertingPassword && isNullOrUndefined(state.data.password) && next) {
            state.data.password = context.event.text;
            state.currentStatus.insertingPassword = false;
            // comprobar antes los datos del usuario
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
            next = false;
        }
        context.setState(state);
        return Promise.resolve();
    }
}
