import { Messages, HELP } from '../messages';
import { IState, initialState } from '../states';
import { Utils } from '../utils';
/**
 * Class Text manager that manages all text event received
 *
 * @export
 * @class TextManager
 */
export class TextManager {
    public static async manageText(context: any): Promise<void> {
        try {
            let state: IState = context.state;
            switch (context.event.text) {
                case '/start':
                    context.setState(initialState);
                    state = initialState;
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

                case '/help':
                    context.sendMessage(HELP);
                    break;

                case '/settings':

                    await context.sendMessage('Ajustes', {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: 'Ajustes de Dropbox',
                                        callback_data: 'dropbox_settings',
                                    },
                                ],
                                [
                                    {
                                        text: 'Cambiar nombre de usuario',
                                        callback_data: 'change_username',
                                    },
                                ],
                                [
                                    {
                                        text: 'Cambiar contraseña',
                                        callback_data: 'change_password',
                                    },
                                ]
                            ],
                        },
                    });
                    break;

                case '/me':

                    if (state.data.username && state.data.password) {
                        // TODO: show only two last characters of password
                        context.sendMessage(
                            `
                            Tus datos:
                            Nombre de usuario: ${state.data.username}
                            Contraseña: ${state.data.password}
                            Cuenta de dropbox: ${(state.data.dropboxEmail != null) ? state.data.dropboxEmail : 'Sin definir'}

                            `
                        );
                    }

                    break;

                default:
                    if (state.currentStatus.registering) {
                        await this.manageRegisterStatus(context, state);
                    }
                    if (state.currentStatus.logging) {
                        await this.manageLoginStatus(context, state);
                    }

                    break;
            }
            context.setState(state);
            return Promise.resolve();
        } catch (error) {
            await context.sendMessage(error.message);
        }
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
        if (state.currentStatus.insertingUsername && state.data.username === null && next) {

            if (!await Utils.existsName(context.event.text)) {
                state.data.username = context.event.text;
                await context.sendMessage(Messages.START_ASK_PASSWORD);
                state.currentStatus.insertingPassword = true;
                state.currentStatus.insertingUsername = false;
                next = false;
            } else {
                await context.sendMessage(Messages.START_NAME_TAKEN);
            }

        }
        if (state.currentStatus.insertingPassword && state.data.password === null && next) {
            state.data.password = context.event.text;
            state.currentStatus.insertingPassword = false;
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
        if (state.currentStatus.insertingDropboxEmail && state.data.dropboxEmail === null && next) {
            state.data.dropboxEmail = context.event.text;
            state.currentStatus.insertingDropboxEmail = false;
            state.currentStatus.insertingDropboxPassword = true;
            await context.sendMessage(Messages.START_ASK_DROPBOX_PASSWORD);
            next = false;
        }

        if (state.currentStatus.insertingDropboxPassword && state.data.dropboxPassword === null && next) {
            state.data.dropboxPassword = context.event.text;
            state.currentStatus.insertingDropboxPassword = false;

            await Utils.registerUser(
                context,
                state.data.username,
                state.data.password,
                state.data.dropboxEmail,
                state.data.dropboxPassword
            );

            await context.sendMessage(Messages.START_FINISHED);
            next = false;
        }
        return Promise.resolve();

    }

    /**
     * @method manageLoginStatus manages messages when status is logging
     *
     * @static
     * @param {*} context
     * @param {IState} state
     * @returns {Promise<void>}
     * @memberof TextManager
     */
    public static async manageLoginStatus(context: any, state: IState): Promise<void> {
        let next = true;
        if (state.currentStatus.insertingUsername && state.data.username === null && next) {

            if (await Utils.existsName(context.event.text)) {
                state.data.username = context.event.text;
                await context.sendMessage(Messages.START_LOGIN_PASSWORD);
                state.currentStatus.insertingPassword = true;
                state.currentStatus.insertingUsername = false;
                next = false;
            } else {
                await context.sendMessage(Messages.START_UNKNOWN_NAME);
            }
        }
        if (state.currentStatus.insertingPassword && state.data.password === null && next) {
            state.data.password = context.event.text;

            const userLogged = await Utils.loginUser(state.data.username, state.data.password);
            if (userLogged != null) {
                state.data.password = userLogged.password;
                state.data.dropboxEmail = userLogged.dropbox.email;
                state.data.dropboxPassword = userLogged.dropbox.password;
                state.currentStatus.insertingPassword = false;
                state.currentStatus.insertingUsername = false;
                state.currentStatus.logging = false;
                next = false;
                await context.sendMessage('Bienvenido de nuevo ' + userLogged.username + ' !');
            } else {
                await context.sendMessage(Messages.START_WRONG_PASSWORD);
            }

        }
        return Promise.resolve();
    }
}
