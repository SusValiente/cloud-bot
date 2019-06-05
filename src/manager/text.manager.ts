import { Messages, HELP } from '../messages';
import { IState, initialState } from '../states';
import { Utils } from '../utils';
import * as _ from 'lodash';
import { getConnection } from 'typeorm';
import { TaskList } from '../entities/taskList.entity';
/**
 * Class Text manager that manages all text event received
 *
 * @export
 * @class TextManager
 */
export class TextManager {
    public static async manageText(context: any): Promise<void> {
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
                if (Utils.isNullOrUndefined(state.data.userId)) {
                    await context.sendMessage(Messages.DONT_KNOW_YOU);
                } else {
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
                                ],
                                [
                                    {
                                        text: 'Cerrar sesión',
                                        callback_data: 'logout',
                                    },
                                ],
                            ],
                        },
                    });
                }
                break;

            case '/task':
                if (Utils.isNullOrUndefined(state.user)) {
                    await context.sendMessage(Messages.DONT_KNOW_YOU);
                } else {
                    await context.sendMessage('¿Que quieres hacer?', {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: 'Ver lista de tareas',
                                        callback_data: 'task_list',
                                    },
                                ],
                                [
                                    {
                                        text: 'Crear lista de tareas',
                                        callback_data: 'create_task_list',
                                    },
                                ],
                            ],
                        },
                    });
                }
                break;

            case '/me':
                if (state.data.username && state.data.password) {
                    // TODO: show only two last characters of password
                    context.sendMessage(
                        `
                            Tus datos:
                            Nombre de usuario: ${state.data.username}
                            Contraseña: ${state.data.password}
                            Cuenta de dropbox: ${state.data.dropboxEmail != null ? state.data.dropboxEmail : 'Sin definir'}

                            `
                    );
                } else {
                    await context.sendMessage(Messages.DONT_KNOW_YOU);
                }

                break;

            case '/testing':
                const connection = await getConnection();
                await context.sendMessage(connection);
                break;

            default:
                if (state.currentStatus.registering) {
                    await this.manageRegisterStatus(context, state);
                }
                if (state.currentStatus.logging) {
                    await this.manageLoginStatus(context, state);
                }

                if (state.currentStatus.creatingTaskList) {
                    await this.manageCreateTaskListStatus(context, state);
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
        if (state.currentStatus.insertingUsername && Utils.isNullOrUndefined(state.data.username) && next) {
            if (!(await Utils.existsName(context.event.text))) {
                state.data.username = context.event.text;
                await context.sendMessage(Messages.START_ASK_PASSWORD);
                state.currentStatus.insertingPassword = true;
                state.currentStatus.insertingUsername = false;
                next = false;
            } else {
                await context.sendMessage(Messages.START_NAME_TAKEN);
            }
        }
        if (state.currentStatus.insertingPassword && Utils.isNullOrUndefined(state.data.password) && next) {
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
        if (state.currentStatus.insertingDropboxEmail && Utils.isNullOrUndefined(state.data.dropboxEmail) && next) {
            state.data.dropboxEmail = context.event.text;
            state.currentStatus.insertingDropboxEmail = false;
            state.currentStatus.insertingDropboxPassword = true;
            await context.sendMessage(Messages.START_ASK_DROPBOX_PASSWORD);
            next = false;
        }

        if (state.currentStatus.insertingDropboxPassword && Utils.isNullOrUndefined(state.data.dropboxPassword) && next) {
            state.data.dropboxPassword = context.event.text;
            state.currentStatus.insertingDropboxPassword = false;

            await Utils.registerUser(context, state.data.username, state.data.password, state.data.dropboxEmail, state.data.dropboxPassword);

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
        if (state.currentStatus.insertingUsername && Utils.isNullOrUndefined(state.data.username) && next) {
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
        if (state.currentStatus.insertingPassword && next) {
            const userLogged = await Utils.loginUser(state.data.username.toLocaleLowerCase(), context.event.text);
            if (!Utils.isNullOrUndefined(userLogged)) {
                state.user = userLogged;
                state.data.userId = userLogged.id;
                state.data.username = userLogged.username;
                state.data.password = userLogged.password;
                if (
                    !Utils.isNullOrUndefined(userLogged.dropbox) &&
                    !Utils.isNullOrUndefined(userLogged.dropbox.email) &&
                    !Utils.isNullOrUndefined(userLogged.dropbox.password)
                ) {
                    state.data.dropboxEmail = userLogged.dropbox.email;
                    state.data.dropboxPassword = userLogged.dropbox.password;
                }
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

    public static async manageCreateTaskListStatus(context: any, state: IState): Promise<void> {
        if (Utils.isNullOrUndefined(state.auxData.taskListName)) {
            const newTaskList = await getConnection()
                .getRepository(TaskList)
                .save({ name: context.event.text, user: state.user, tasks: [] });
            if (!_.isNull(newTaskList) && !_.isUndefined(newTaskList)) {
                await context.sendMessage('Lista de tareas creada correctamente,¿quieres añadirle tareas?');
                await context.sendMessage('Falta por programar este camino');
                state.currentStatus.creatingTaskList = false;
            } else {
                await context.sendMessage('Algo ha fallado, intentalo de nuevo porfavor');
            }
        }
        return Promise.resolve();
    }
}
