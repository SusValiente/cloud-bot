import { Messages } from '../messages';
import { IState } from '../states';
import { Utils } from '../utils';
import { ITaskList } from '../models/taskList.model';
import * as _ from 'lodash';
/**
 * Class Callback manager that manages all callback event received
 *
 * @export
 * @class CallbackManager
 */
export class CallbackManager {

    public static async manageCallback(context: any): Promise<void> {
        const state: IState = context.state;

        const viewRegex: RegExp = new RegExp('view\/[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}\/task-list');
        const completeTaskRegex: RegExp = new RegExp('complete\/[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}\/task');
        
        if (viewRegex.test(context.event.payload)) {
            const taskListId: string = context.event.payload.split('/')[1];
            const taskList = await Utils.getTaskList(taskListId);
            const tasks = await Utils.getTasks(taskList);
            // TODO arreglar la lista de tareas cuando esto llega vacio
            // la lista esta vacia . . . ¿ quieres añadirle tareas ? 
            for (const task of tasks) {
                await context.sendMessage(task.description, {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: 'Completar tarea',
                                    callback_data: 'complete/' + task.id + '/task',
                                },
                            ]
                        ],
                    },
                });
            }
            return Promise.resolve();
        }

        if (completeTaskRegex.test(context.event.payload)) {
            const taskId: string = context.event.payload.split('/')[1];
            await Utils.completeTask(taskId);
            await context.sendMessage(Messages.TASK_COMPLETED);
        }


        switch (context.event.payload) {
            case 'new_user':
                await context.sendMessage(Messages.START_UNKNOWN_USER);
                state.currentStatus.insertingUsername = true;
                state.currentStatus.registering = true;
                break;
            case 'login_user':
                await context.sendMessage(Messages.START_KNOWN_USER);
                state.currentStatus.insertingUsername = true;
                state.currentStatus.logging = true;
                break;
            case 'sync_dropbox':
                state.currentStatus.insertingDropboxEmail = true;
                await context.sendMessage(Messages.START_ASK_DROPBOX_EMAIL);
                break;
            case 'ignore_dropbox':
                state.currentStatus.dropboxActive = false;
                state.currentStatus.registering = false;
                await Utils.registerUser(context, state.userData.username, state.userData.password);
                await context.sendMessage(Messages.START_FINISHED);
                break;

            case 'create_task_list':
                state.currentStatus.creatingTaskList = true;
                await context.sendMessage(Messages.TASK_LIST_NAME);
                break;

            case 'dont_create_task_list':
                await context.sendMessage(Messages.DONT_CREATE_TASKLIST);
                break;

            case 'add_task':
                state.currentStatus.addingTask = true;
                await context.sendMessage(Messages.ADD_TASK);
                break;

            case 'dont_add_task':
                state.currentStatus.addingTask = false;
                await context.sendMessage(Messages.TASK_LIST_DONE);
                break;

            case 'task_list':
                const taskLists: ITaskList[] = await Utils.getTasksLists(state.user);
                if (_.isEmpty(taskLists)) {
                    await context.sendMessage(Messages.EMPTY_TASKS, {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: 'Si',
                                        callback_data: 'create_task_list',
                                    },
                                ],
                                [
                                    {
                                        text: 'No',
                                        callback_data: 'dont_create_task_list',
                                    },
                                ],
                            ],
                        },
                    });
                } else {
                    for (const list of taskLists) {
                        await context.sendMessage(list.name, {
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        {
                                            text: 'Ver lista',
                                            callback_data: 'view/' + list.id + '/task-list',
                                        },
                                    ],
                                    [
                                        {
                                            text: 'Borrar lista',
                                            callback_data: 'delete/' + list.id + '/task-list',
                                        },
                                    ],
                                ],
                            },
                        });
                    }
                }
                break;
            default:
                break;
        }
        return Promise.resolve();
    }
}
