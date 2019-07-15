import { Messages, HELP } from '../messages';
import { IState, initialState } from '../states';
import { Utils } from '../utils';
import * as _ from 'lodash';
import { getConnection } from 'typeorm';
import { TaskList } from '../entities/taskList.entity';
import { ITaskList } from '../models/taskList.model';
import { Task } from '../entities/task.entity';
import { DropboxUtils } from '../dropboxUtils';

/**
 * Class Text manager that manages all text event received
 *
 * @export
 * @class TextManager
 */
export class TextManager {
    public static async manageText(context: any, dbx: DropboxUtils): Promise<void> {
        const passwordRegexp: RegExp = new RegExp('(?=.{8,})');
        const usernameRegexp: RegExp = new RegExp('(?=.{4,})');
        let state: IState = context.state;
        switch (context.event.text) {
            case '/start':
                dbx.setToken(null);
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
                if (_.isNil(state.user.id)) {
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
                if (_.isNil(state.user)) {
                    await context.sendMessage(Messages.DONT_KNOW_YOU);
                } else {
                    await context.sendMessage('¿Que quieres hacer?', {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: 'Ver listas de tareas',
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
                if (state.userData.username && state.userData.password) {
                    // TODO: show only two last characters of password
                    context.sendMessage(
                        `
                            Tus datos:
                            Nombre de usuario: ${state.userData.username}
                            Contraseña: ${state.userData.password}
                        `
                    );
                } else {
                    await context.sendMessage(Messages.DONT_KNOW_YOU);
                }

                break;

            case '/testing':
                if (!_.isNil(context.state.user) && !_.isNil(context.state.user.dropboxToken)) {
                    try {
                        dbx.setToken(context.state.user.dropboxToken);
                        const files = await dbx.getFiles('/photos', 10);
                        await context.sendMessage(files);
                        console.log(files);
                    } catch (error) {
                        console.log(error);
                        await context.sendMessage(error.message);
                    }
                } else {
                    await context.sendMessage('No hay token');
                }

                break;

            default:
                if (state.currentStatus.registering) {
                    await this.manageRegisterStatus(context, state, dbx, usernameRegexp, passwordRegexp);
                }
                if (state.currentStatus.logging) {
                    await this.manageLoginStatus(context, state);
                }

                if (state.currentStatus.creatingTaskList) {
                    await this.manageCreateTaskListStatus(context, state);
                }
                if (state.currentStatus.addingTask) {
                    if (!_.isNil(state.taskList)) {
                        delete state.taskList.tasks;
                        await this.manageAddingTaskStatus(state.taskList, context, state);
                    } else {
                        await context.sendMessage(Messages.TASK_LIST_UNDEFINED);
                    }
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
     * @param {DropboxUtils} dbx
     * @param {RegExp} usernameRegexp
     * @param {RegExp} passwordRegexp
     * @returns {Promise<void>}
     * @memberof TextManager
     */
    public static async manageRegisterStatus(context: any, state: IState, dbx: DropboxUtils, usernameRegexp: RegExp, passwordRegexp: RegExp): Promise<void> {
        let next = true;
        if (state.currentStatus.insertingUsername && _.isNil(state.userData.username) && next) {
            if (!usernameRegexp.test(context.event.text)) {
                await context.sendMessage(Messages.USERNAME_TOO_SHORT);
                return Promise.resolve();
            }
            if (!(await Utils.existsName(context.event.text))) {
                state.userData.username = context.event.text;
                await context.sendMessage(Messages.START_ASK_PASSWORD);
                state.currentStatus.insertingPassword = true;
                state.currentStatus.insertingUsername = false;
                next = false;
            } else {
                await context.sendMessage(Messages.START_NAME_TAKEN);
            }
        }
        if (state.currentStatus.insertingPassword && _.isNil(state.userData.password) && next) {
            if (!passwordRegexp.test(context.event.text)) {
                await context.sendMessage(Messages.PASSWORD_TOO_SHORT);
                return Promise.resolve();
            }
            state.userData.password = context.event.text;
            state.currentStatus.insertingPassword = false;

            await Utils.registerUser(context, state.userData.username, context.event.text);

            const authUrl = dbx.getAuthUrl();

            await context.sendMessage(Messages.START_ASK_DROPBOX, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Vincular Dropbox',
                                url: authUrl,
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
        if (state.currentStatus.insertingUsername && _.isNil(state.userData.username) && next) {
            if (await Utils.existsName(context.event.text)) {
                state.userData.username = context.event.text;
                await context.sendMessage(Messages.START_LOGIN_PASSWORD);
                state.currentStatus.insertingPassword = true;
                state.currentStatus.insertingUsername = false;
                next = false;
            } else {
                await context.sendMessage(Messages.START_UNKNOWN_NAME);
            }
        }
        if (state.currentStatus.insertingPassword && next) {
            const userLogged = await Utils.loginUser(state.userData.username.toLocaleLowerCase(), context.event.text);
            if (!_.isNil(userLogged)) {
                state.user = userLogged;
                state.userData.userId = userLogged.id;
                state.userData.username = userLogged.username;
                state.userData.password = userLogged.password;
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

    /**
     * @method manageCreateTaskListStatus manages status when the user is creating a task list
     *
     * @static
     * @param {*} context
     * @param {IState} state
     * @returns {Promise<void>}
     * @memberof TextManager
     */
    public static async manageCreateTaskListStatus(context: any, state: IState): Promise<void> {
        const newTaskList = await getConnection()
            .getRepository(TaskList)
            .save({ name: context.event.text, user: state.user, tasks: [] });
        if (!_.isNull(newTaskList) && !_.isUndefined(newTaskList)) {
            state.currentStatus.creatingTaskList = false;
            state.taskList = newTaskList;
            await context.sendMessage('Lista de tareas creada correctamente,¿quieres añadirle alguna tarea?', {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Si',
                                callback_data: 'add_task',
                            },
                        ],
                        [
                            {
                                text: 'No',
                                callback_data: 'dont_add_task',
                            },
                        ],
                    ],
                },
            });
        } else {
            await context.sendMessage(Messages.ERROR);
        }
        return Promise.resolve();
    }

    public static async manageAddingTaskStatus(stateTaskList: ITaskList, context: any, state: IState): Promise<void> {
        const newTask = await getConnection()
            .getRepository(Task)
            .save({
                description: context.event.text,
                taskList: stateTaskList,
            });
        if (!_.isNil(newTask)) {
            await context.sendMessage('Tarea añadida correctamente a la lista: ' + state.taskList.name + ' ¿Quieres añadir otra más?', {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Si',
                                callback_data: 'add_task',
                            },
                        ],
                        [
                            {
                                text: 'No',
                                callback_data: 'dont_add_task',
                            },
                        ],
                    ],
                },
            });
        }
        return Promise.resolve();
    }
}
