import { Messages } from '../messages';
import { IState } from '../states';
import { Utils } from '../utils';
import { ITaskList } from '../models/taskList.model';
import * as _ from 'lodash';
import { getConnection } from 'typeorm';
import { Task } from '../entities/task.entity';
import { TaskList } from '../entities/taskList.entity';

/**
 * Class Callback manager that manages all callback event received
 *
 * @export
 * @class CallbackManager
 */
export class CallbackManager {
    public static async manageCallback(context: any): Promise<void> {
        const state: IState = context.state;

        const viewRegex: RegExp = new RegExp('view/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/task-list');
        const completeTaskRegex: RegExp = new RegExp('complete/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/task');
        const deleteTaskListRegex: RegExp = new RegExp('delete/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/task-list');

        // view task list
        if (viewRegex.test(context.event.payload)) {
            await this.getTaskList(context.event.payload, context);
            return Promise.resolve();
        }
        // complete task
        if (completeTaskRegex.test(context.event.payload)) {
            await this.completeTask(context.event.payload, context);
            return Promise.resolve();
        }

        // delete task
        if (deleteTaskListRegex.test(context.event.payload)) {
            await this.deleteTaskList(context.event.payload, context);
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

    /**
     * @method getTaskList returns all task of a task list
     *
     * @private
     * @static
     * @param {string} payload
     * @param {*} context
     * @returns {Promise<void>}
     * @memberof CallbackManager
     */
    private static async getTaskList(payload: string, context: any): Promise<void> {
        const taskListId: string = payload.split('/')[1];
        const taskList = await Utils.getTaskList(taskListId);
        const tasks = await Utils.getTasks(taskList);
        context.state.taskLists = taskList;

        if (!_.isEmpty(tasks)) {
            for (const task of tasks) {
                await context.sendMessage(task.description, {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: 'Completar tarea',
                                    callback_data: 'complete/' + task.id + '/task',
                                },
                            ],
                        ],
                    },
                });
            }
        } else {
            await context.sendMessage(Messages.EMPTY_TASK_LIST, {
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

    /**
     * @method completeTask deletes task
     *
     * @private
     * @static
     * @param {string} taskId
     * @returns {Promise<void>}
     * @memberof CallbackManager
     */
    private static async completeTask(payload: string, context: any): Promise<void> {
        const taskId: string = payload.split('/')[1];

        await await getConnection()
            .getRepository(Task)
            .createQueryBuilder()
            .delete()
            .where('id = :value', { value: taskId })
            .execute();
        await context.sendMessage(Messages.TASK_COMPLETED);
        return Promise.resolve();
    }

    /**
     * @method deleteTaskList deletes task list
     *
     * @private
     * @static
     * @param {string} payload
     * @param {*} context
     * @returns {Promise<void>}
     * @memberof CallbackManager
     */
    private static async deleteTaskList(payload: string, context: any): Promise<void> {
        const taskListId: string = payload.split('/')[1];

        await await getConnection()
            .getRepository(TaskList)
            .createQueryBuilder()
            .delete()
            .where('id = :value', { value: taskListId })
            .execute();
        await context.sendMessage(Messages.TASK_COMPLETED);
        return Promise.resolve();
    }
}
