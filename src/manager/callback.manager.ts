import { Messages } from '../messages';
import { IState, initialState } from '../states';
import { Utils } from '../utils';
import { ITaskList } from '../models/taskList.model';
import * as _ from 'lodash';
import { getConnection } from 'typeorm';
import { Task } from '../entities/task.entity';
import { TaskList } from '../entities/taskList.entity';
import { DropboxUtils } from '../dropboxUtils';
import { IUser } from '../models/user.model';
import { GoogleCredentials } from '../../credentials';
import { GoogleUtils, IGoogleEvent } from '../googleUtils';
import { dayHours, durations } from './../models/time.model';

const { google } = require('googleapis');

/**
 * Class Callback manager that manages all callback event received
 *
 * @export
 * @class CallbackManager
 */
export class CallbackManager {
    public static async manageCallback(context: any, dbx: DropboxUtils, ggl: GoogleUtils, calendar: any): Promise<void> {
        let state: IState = context.state;

        const viewRegex: RegExp = new RegExp('view/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/task-list');
        const completeTaskRegex: RegExp = new RegExp('complete/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/task');
        const deleteTaskListRegex: RegExp = new RegExp('delete/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/task-list');
        const deleteEventRegex: RegExp = new RegExp('d/.*/e');
        const dateRegexp: RegExp = new RegExp('calendar-telegram-date-.*');
        const alsoDateRegexp: RegExp = new RegExp('calendar-telegram-ignore-([12]\\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01]))');
        const nextDateRegexp: RegExp = new RegExp('calendar-telegram-next-.*');
        const prevDateRegexp: RegExp = new RegExp('calendar-telegram-prev-.*');
        const hourRegexp: RegExp = new RegExp('^[0-2][0-9]:[0-5][0-9]$');
        const durationRegexp: RegExp = new RegExp('duration/.*');

        // view task list
        if (viewRegex.test(context.event.payload)) {
            if (!this.userStillExistant(context)) {
                return Promise.resolve();
            }
            await this.getTaskList(context.event.payload, context);
            return Promise.resolve();
        }
        // complete task
        if (completeTaskRegex.test(context.event.payload)) {
            if (!this.userStillExistant(context)) {
                return Promise.resolve();
            }
            await this.completeTask(context.event.payload, context);
            return Promise.resolve();
        }

        // delete task
        if (deleteTaskListRegex.test(context.event.payload)) {
            if (!this.userStillExistant(context)) {
                return Promise.resolve();
            }
            await this.deleteTaskList(context.event.payload, context);
            return Promise.resolve();
        }

        // delete event
        if (deleteEventRegex.test(context.event.payload)) {
            if (!this.userStillExistant(context)) {
                return Promise.resolve();
            }
            const eventId: string = context.event.payload.split('/')[1];
            await ggl.deleteEvent(eventId, context.state.user.googleEmail, context.state.user.googleCredential.access_token);
            await context.sendMessage('Evento eliminado correctamente');
            return Promise.resolve();
        }

        // pickHour
        if (hourRegexp.test(context.event.payload)) {
            if (!this.userStillExistant(context)) {
                return Promise.resolve();
            }
            const hour: string = context.event.payload.split(':')[0];
            const min: string = context.event.payload.split(':')[1];

            const dateWithHourAndMinutes = context.state.event.date;
            dateWithHourAndMinutes.setHours(hour);
            dateWithHourAndMinutes.setMinutes(min);

            context.setState({
                event: {
                    summary: context.state.event.summary,
                    location: context.state.event.location,
                    date: dateWithHourAndMinutes,
                    duration: context.state.event.duration,
                    description: context.state.event.description,
                    hourAndMin: context.event.payload
                }
            });

            await context.sendMessage('¿Cuanto va a durar el evento?', {
                reply_markup: {
                    inline_keyboard: durations
                }
            });
        }

        // pick duration and create event
        if (durationRegexp.test(context.event.payload)) {
            if (!this.userStillExistant(context)) {
                return Promise.resolve();
            }
            const durationMinutes: string = context.event.payload.split('/')[1];
            const durationMinutesNumber: number = +durationMinutes;
            const date = context.state.event.date;
            const location = context.state.event.location;
            const description = context.state.event.description;
            const summary = context.state.event.summary;

            if (_.isNil(durationMinutesNumber) || _.isNil(date) || _.isNil(location) || _.isNil(summary)) {
                await context.sendMessage(Messages.ERROR);
                return Promise.resolve();
            }
            try {
                await ggl.createEvent(
                    context.state.user.googleCredential.access_token,
                    context.state.user.googleEmail,
                    summary,
                    date,
                    description,
                    location,
                    durationMinutesNumber
                );
            } catch (error) {
                await context.sendMessage(error.message);
            }
            await context.sendMessage('Evento creado correctamente');
            return Promise.resolve();
        }

        // pickDate
        if (dateRegexp.test(context.event.payload) || alsoDateRegexp.test(context.event.payload)) {
            if (!this.userStillExistant(context)) {
                return Promise.resolve();
            }
            const year: string = context.event.payload.split('-')[3];
            const month: string = context.event.payload.split('-')[4];
            const day: string = context.event.payload.split('-')[5];

            context.setState({
                event: {
                    location: context.state.event.location,
                    duration: context.state.event.duration,
                    summary: context.state.event.summary,
                    description: context.state.event.description,
                    date: new Date(year + '-' + month + '-' + day)
                }
            });

            await context.sendMessage('Selecciona una hora: ', {
                reply_markup: {
                    inline_keyboard: dayHours
                }
            });
            return Promise.resolve();
        }

        // prevDate and next date
        if (prevDateRegexp.test(context.event.payload) || nextDateRegexp.test(context.event.payload)) {
            if (!this.userStillExistant(context)) {
                return Promise.resolve();
            }
            const year: string = context.event.payload.split('-')[3];
            const month: string = context.event.payload.split('-')[4];
            const day: string = context.event.payload.split('-')[5];
            const date: Date = new Date(year + '-' + month + '-' + day);
            if (prevDateRegexp.test(context.event.payload)) {
                date.setMonth(date.getMonth() - 1);
            } else {
                date.setMonth(date.getMonth() + 1);
            }
            const maxDate = new Date();
            maxDate.setMonth(date.getMonth() + 12);
            // maxDate.setDate(date.getDate());
            context.sendMessage(
                'Selecciona la fecha del evento: ',
                calendar
                    .setMinDate(date)
                    .setMaxDate(maxDate)
                    .getCalendar()
            );
            return Promise.resolve();
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
                const oauth2Client = new google.auth.OAuth2(
                    GoogleCredentials.web.client_id,
                    GoogleCredentials.web.client_secret,
                    GoogleCredentials.web.redirect_uris[1]
                );

                google.options({ auth: oauth2Client });

                const scopes = ['https://www.googleapis.com/auth/calendar'];
                const authorizeUrl = oauth2Client.generateAuthUrl({
                    access_type: 'offline',
                    scope: scopes.join(' '),
                    prompt: 'consent'
                });

                await context.sendMessage(Messages.ASK_GOOGLE, {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: 'Vincular Google',
                                    url: authorizeUrl
                                }
                            ],
                            [
                                {
                                    text: 'No vincular',
                                    callback_data: 'ignore_google'
                                }
                            ]
                        ]
                    }
                });
                break;

            case 'ignore_google':
                state.currentStatus.registering = false;
                await context.sendMessage(Messages.START_FINISHED);
                break;

            case 'create_task_list':
                if (!this.userStillExistant(context)) {
                    return Promise.resolve();
                }
                state.currentStatus.creatingTaskList = true;
                await context.sendMessage(Messages.TASK_LIST_NAME);
                break;

            case 'dont_create_task_list':
                if (!this.userStillExistant(context)) {
                    return Promise.resolve();
                }
                await context.sendMessage(Messages.DONT_CREATE_TASKLIST);
                break;

            case 'add_task':
                if (!this.userStillExistant(context)) {
                    return Promise.resolve();
                }
                state.currentStatus.addingTask = true;
                await context.sendMessage(Messages.ADD_TASK);
                break;

            case 'dont_add_task':
                if (!this.userStillExistant(context)) {
                    return Promise.resolve();
                }
                state.currentStatus.addingTask = false;
                await context.sendMessage(Messages.TASK_LIST_DONE);
                break;

            case 'task_list':
                if (!this.userStillExistant(context)) {
                    return Promise.resolve();
                }
                const taskLists: ITaskList[] = await Utils.getTasksLists(state.user);
                if (_.isEmpty(taskLists)) {
                    await context.sendMessage(Messages.EMPTY_TASKS, {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: 'Si',
                                        callback_data: 'create_task_list'
                                    }
                                ],
                                [
                                    {
                                        text: 'No',
                                        callback_data: 'dont_create_task_list'
                                    }
                                ]
                            ]
                        }
                    });
                } else {
                    for (const list of taskLists) {
                        await context.sendMessage(list.name, {
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        {
                                            text: 'Ver lista',
                                            callback_data: 'view/' + list.id + '/task-list'
                                        },
                                        {
                                            text: 'Borrar lista',
                                            callback_data: 'delete/' + list.id + '/task-list'
                                        }
                                    ]
                                ]
                            }
                        });
                    }
                }
                break;

            case 'dropbox_settings':
                if (!this.userStillExistant(context)) {
                    return Promise.resolve();
                }
                const authUrl = dbx.getAuthUrl();
                await context.sendMessage('Ajustes cuenta de Dropbox', {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: 'Vincular Dropbox',
                                    url: authUrl
                                }
                            ],
                            [
                                {
                                    text: 'Desvincular Dropbox',
                                    callback_data: 'unlink_dropbox'
                                }
                            ]
                        ]
                    }
                });
                break;

            case 'unlink_dropbox':
                if (!this.userStillExistant(context)) {
                    return Promise.resolve();
                }
                const auxUser: IUser = {
                    id: context.state.user.id,
                    username: context.state.user.username,
                    password: context.state.user.password,
                    dropboxToken: null
                };
                context.setState({ user: auxUser });
                await dbx.unlinkDropboxAccount();
                await Utils.deleteDropboxToken(context.state.user.id);
                await context.sendMessage(Messages.UNLINKED_DROPBOX);
                break;

            case 'change_username':
                if (!this.userStillExistant(context)) {
                    return Promise.resolve();
                }
                await context.sendMessage(Messages.CHANGE_USERNAME);
                state.currentStatus.changingUsername = true;
                break;

            case 'change_password':
                if (!this.userStillExistant(context)) {
                    return Promise.resolve();
                }
                await context.sendMessage(Messages.VALIDATE_CHANGE_PASSWORD);
                state.currentStatus.validatingChangePassword = true;
                break;
            case 'logout':
                dbx.setToken(null);
                context.setState(initialState);
                state = initialState;
                await context.sendMessage(Messages.LOGOUT);
                break;
            case 'see_events':
                if (!this.userStillExistant(context)) {
                    return Promise.resolve();
                }
                const nextEvents: IGoogleEvent[] = await ggl.getEvents(state.user.googleCredential.access_token, state.user.googleEmail, 10);
                if (_.isNil(nextEvents)) {
                    await context.sendMessage('Parece que no hay eventos disponibles');
                    return Promise.resolve();
                }
                for (const event of nextEvents) {
                    await context.sendMessage(`Evento: ${event.summary}\nFecha:  ${event.endDate}\nLugar:  ${event.location}`, {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: 'Eliminar evento',
                                        callback_data: `d/${event.id}/e`
                                    }
                                ]
                            ]
                        }
                    });
                }
                break;
            case 'create_event':
                if (!this.userStillExistant(context)) {
                    return Promise.resolve();
                }
                context.sendMessage('¿Como se llamará el evento?');
                context.setState({
                    currentStatus: {
                        insertingEventSummary: true,
                        creatingEvent: true
                    }
                });

                break;

            case 'ignore_description':
                if (!this.userStillExistant(context)) {
                    return Promise.resolve();
                }
                context.setState({
                    event: {
                        summary: context.state.event.summary,
                        location: context.state.event.location,
                        date: context.state.event.date,
                        duration: context.state.event.duration,
                        description: null
                    }
                });

                const today = new Date();
                const minDate = new Date();
                minDate.setMonth(today.getMonth() - 12);
                const maxDate = new Date();
                maxDate.setMonth(today.getMonth() + 12);
                maxDate.setDate(today.getDate());
                context.sendMessage(
                    'Selecciona la fecha del evento: ',
                    calendar
                        .setMinDate(minDate)
                        .setMaxDate(maxDate)
                        .getCalendar()
                );

                break;

            case 'add_description':
                if (!this.userStillExistant(context)) {
                    return Promise.resolve();
                }
                context.setState({
                    currentStatus: {
                        creatingEvent: true,
                        insertingEventDescription: true
                    }
                });

                context.sendMessage('Escribe una description para el evento:');

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
                                    callback_data: 'complete/' + task.id + '/task'
                                }
                            ]
                        ]
                    }
                });
            }
        } else {
            await context.sendMessage(Messages.EMPTY_TASK_LIST, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Si',
                                callback_data: 'add_task'
                            }
                        ],
                        [
                            {
                                text: 'No',
                                callback_data: 'dont_add_task'
                            }
                        ]
                    ]
                }
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

    private static async userStillExistant(context: any): Promise<boolean> {
        if (_.isNil(context.state.user)) {
            await context.sendMessage(Messages.USER_FORGOTTEN);
            return Promise.resolve(false);
        }
        return Promise.resolve(true);
    }
}
