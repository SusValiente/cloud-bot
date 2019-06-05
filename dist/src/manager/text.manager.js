"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const messages_1 = require("../messages");
const states_1 = require("../states");
const utils_1 = require("../utils");
const _ = __importStar(require("lodash"));
const typeorm_1 = require("typeorm");
const taskList_entity_1 = require("../entities/taskList.entity");
/**
 * Class Text manager that manages all text event received
 *
 * @export
 * @class TextManager
 */
class TextManager {
    static async manageText(context) {
        let state = context.state;
        switch (context.event.text) {
            case '/start':
                context.setState(states_1.initialState);
                state = states_1.initialState;
                await context.sendMessage(messages_1.Messages.START, {
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
                context.sendMessage(messages_1.HELP);
                break;
            case '/settings':
                if (utils_1.Utils.isNullOrUndefined(state.data.userId)) {
                    await context.sendMessage(messages_1.Messages.DONT_KNOW_YOU);
                }
                else {
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
                if (utils_1.Utils.isNullOrUndefined(state.user)) {
                    await context.sendMessage(messages_1.Messages.DONT_KNOW_YOU);
                }
                else {
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
                    context.sendMessage(`
                            Tus datos:
                            Nombre de usuario: ${state.data.username}
                            Contraseña: ${state.data.password}
                            Cuenta de dropbox: ${state.data.dropboxEmail != null ? state.data.dropboxEmail : 'Sin definir'}

                            `);
                }
                else {
                    await context.sendMessage(messages_1.Messages.DONT_KNOW_YOU);
                }
                break;
            case '/testing':
                const connection = await typeorm_1.getConnection();
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
    static async manageRegisterStatus(context, state) {
        let next = true;
        if (state.currentStatus.insertingUsername && utils_1.Utils.isNullOrUndefined(state.data.username) && next) {
            if (!(await utils_1.Utils.existsName(context.event.text))) {
                state.data.username = context.event.text;
                await context.sendMessage(messages_1.Messages.START_ASK_PASSWORD);
                state.currentStatus.insertingPassword = true;
                state.currentStatus.insertingUsername = false;
                next = false;
            }
            else {
                await context.sendMessage(messages_1.Messages.START_NAME_TAKEN);
            }
        }
        if (state.currentStatus.insertingPassword && utils_1.Utils.isNullOrUndefined(state.data.password) && next) {
            state.data.password = context.event.text;
            state.currentStatus.insertingPassword = false;
            await context.sendMessage(messages_1.Messages.START_ASK_DROPBOX, {
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
        if (state.currentStatus.insertingDropboxEmail && utils_1.Utils.isNullOrUndefined(state.data.dropboxEmail) && next) {
            state.data.dropboxEmail = context.event.text;
            state.currentStatus.insertingDropboxEmail = false;
            state.currentStatus.insertingDropboxPassword = true;
            await context.sendMessage(messages_1.Messages.START_ASK_DROPBOX_PASSWORD);
            next = false;
        }
        if (state.currentStatus.insertingDropboxPassword && utils_1.Utils.isNullOrUndefined(state.data.dropboxPassword) && next) {
            state.data.dropboxPassword = context.event.text;
            state.currentStatus.insertingDropboxPassword = false;
            await utils_1.Utils.registerUser(context, state.data.username, state.data.password, state.data.dropboxEmail, state.data.dropboxPassword);
            await context.sendMessage(messages_1.Messages.START_FINISHED);
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
    static async manageLoginStatus(context, state) {
        let next = true;
        if (state.currentStatus.insertingUsername && utils_1.Utils.isNullOrUndefined(state.data.username) && next) {
            if (await utils_1.Utils.existsName(context.event.text)) {
                state.data.username = context.event.text;
                await context.sendMessage(messages_1.Messages.START_LOGIN_PASSWORD);
                state.currentStatus.insertingPassword = true;
                state.currentStatus.insertingUsername = false;
                next = false;
            }
            else {
                await context.sendMessage(messages_1.Messages.START_UNKNOWN_NAME);
            }
        }
        if (state.currentStatus.insertingPassword && next) {
            const userLogged = await utils_1.Utils.loginUser(state.data.username.toLocaleLowerCase(), context.event.text);
            if (!utils_1.Utils.isNullOrUndefined(userLogged)) {
                state.user = userLogged;
                state.data.userId = userLogged.id;
                state.data.username = userLogged.username;
                state.data.password = userLogged.password;
                if (!utils_1.Utils.isNullOrUndefined(userLogged.dropbox) &&
                    !utils_1.Utils.isNullOrUndefined(userLogged.dropbox.email) &&
                    !utils_1.Utils.isNullOrUndefined(userLogged.dropbox.password)) {
                    state.data.dropboxEmail = userLogged.dropbox.email;
                    state.data.dropboxPassword = userLogged.dropbox.password;
                }
                state.currentStatus.insertingPassword = false;
                state.currentStatus.insertingUsername = false;
                state.currentStatus.logging = false;
                next = false;
                await context.sendMessage('Bienvenido de nuevo ' + userLogged.username + ' !');
            }
            else {
                await context.sendMessage(messages_1.Messages.START_WRONG_PASSWORD);
            }
        }
        return Promise.resolve();
    }
    static async manageCreateTaskListStatus(context, state) {
        if (utils_1.Utils.isNullOrUndefined(state.auxData.taskListName)) {
            const newTaskList = await typeorm_1.getConnection()
                .getRepository(taskList_entity_1.TaskList)
                .save({ name: context.event.text, user: state.user, tasks: [] });
            if (!_.isNull(newTaskList) && !_.isUndefined(newTaskList)) {
                await context.sendMessage('Lista de tareas creada correctamente,¿quieres añadirle tareas?');
                await context.sendMessage('Falta por programar este camino');
                state.currentStatus.creatingTaskList = false;
            }
            else {
                await context.sendMessage('Algo ha fallado, intentalo de nuevo porfavor');
            }
        }
        return Promise.resolve();
    }
}
exports.TextManager = TextManager;
//# sourceMappingURL=text.manager.js.map