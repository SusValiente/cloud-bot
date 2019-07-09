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
                if (Utils.isNullOrUndefined(state.userData.userId)) {
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
                /**
                 * Pasos a seguir para subir un archivo a dropbox . .
                 *
                 * 1 - Cuando le pase la imagen desde telegram, debo conseguir el file_id
                 *     para llamar a la api de telegram "GET FILE" y asi conseguir el path de ese archivo
                 *
                 * 2 - Una vez conseguido el path del archivo debemos montar el enlace de descarga
                 *     para poder mandarselo a la peticion de subida de dropbox save_url, mirar ejemplo
                 *     "Download file"
                 *
                 * 3 - Una vez montado el enlace de descarga del archivo llamar a "Upload file by URL" de
                 *     dropbox, y el archivo será mandado
                 *
                 * Sera necesario (seguramente) implementar esas llamadas a las APIs
                 * para ello creo que typescript tiene como nativo algo llamado fetch
                 *
                 */

                // por algun motivo, esta mierda me está redirigiendo a la api de telegram, no a la de dropbox
                // const dbx = new Dropbox({
                //     fetch
                // });

                // dbx.setClientId('1');
                // dbx.setClientSecret('1');
                // const intentoDeToken = await dbx.getAccessTokenFromCode('', '');
                // console.log(intentoDeToken);

                if (context.state.user) {
                    const user = await Utils.getUser(context.state.user.userId);
                    console.log('user -> ' + user.username + ' code - > ' + user.dropboxCode);
                    const token = await dbx.getToken(user.dropboxCode);
                    console.log('TOKEN -> ' + token);
                } else {
                    console.log('no hay usuario');
                }

                break;

            default:
                if (state.currentStatus.registering) {
                    await this.manageRegisterStatus(context, state, dbx);
                }
                if (state.currentStatus.logging) {
                    await this.manageLoginStatus(context, state);
                }

                if (state.currentStatus.creatingTaskList) {
                    await this.manageCreateTaskListStatus(context, state);
                }
                if (state.currentStatus.addingTask) {
                    if (!Utils.isNullOrUndefined(state.taskList)) {
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
     * @returns {Promise<void>}
     * @memberof TextManager
     */
    public static async manageRegisterStatus(context: any, state: IState, dbx: DropboxUtils): Promise<void> {
        let next = true;
        if (state.currentStatus.insertingUsername && Utils.isNullOrUndefined(state.userData.username) && next) {
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
        if (state.currentStatus.insertingPassword && Utils.isNullOrUndefined(state.userData.password) && next) {
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
        if (state.currentStatus.insertingUsername && Utils.isNullOrUndefined(state.userData.username) && next) {
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
            if (!Utils.isNullOrUndefined(userLogged)) {
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
        if (!Utils.isNullOrUndefined(newTask)) {
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
