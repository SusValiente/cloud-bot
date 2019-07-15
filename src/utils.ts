import { getConnection } from 'typeorm';
import { User } from './entities/user.entity';
import { IUser } from './models/user.model';
import * as _ from 'lodash';
import { ITaskList } from './models/taskList.model';
import { TaskList } from './entities/taskList.entity';
import { ITask } from './models/task.model';
import { Task } from './entities/task.entity';
import { Messages } from './messages';

export class Utils {
    /**
     * @method existsName returns true if the username exists in the database
     *
     * @static
     * @param {string} givenName
     * @returns {Promise<boolean>}
     * @memberof Utils
     */
    public static async existsName(givenName: string): Promise<boolean> {
        const userRepository = await getConnection().getRepository(User);
        const userWithName = await userRepository.findOne({ where: { username: givenName.toLocaleLowerCase() } });
        if (userWithName != null) {
            return Promise.resolve(true);
        }
        return Promise.resolve(false);
    }

    /**
     * @method registerUser registers users with dropbox data if exists
     *
     * @static
     * @param {*} context
     * @param {string} givenUsername
     * @param {string} givenPassword
     * @param {string} [givenDropboxEmail]
     * @param {string} [givenDropboxPassword]
     * @returns {Promise<void>}
     * @memberof Utils
     */
    public static async registerUser(context: any, givenUsername: string, givenPassword: string): Promise<void> {
        try {
            const userRepository = await getConnection().getRepository(User);

            const newUser: IUser = await userRepository.save({ username: givenUsername.toLocaleLowerCase(), password: givenPassword });
            context.setState({ user: newUser });
            await context.sendMessage(Messages.REGISTERED_COMPLETE);
            return Promise.resolve();
        } catch (error) {
            await context.sendMessage(error.message);
        }
    }

    /**
     * @method loginUser returns the logged user
     *
     * @param {string} givenUsername
     * @param {string} givenPassword
     * @returns {Promise<IUser>}
     * @memberof Utils
     */
    public static async loginUser(givenUsername: string, givenPassword: string): Promise<IUser> {
        const user = await getConnection()
            .getRepository(User)
            .findOne({
                where: {
                    username: givenUsername,
                    password: givenPassword,
                },
            });

        return Promise.resolve(user);
    }

    /**
     * @method getUser returns the user by id
     *
     * @static
     * @param {string} id
     * @returns {Promise<IUser>}
     * @memberof Utils
     */
    public static async getUser(id: string): Promise<IUser> {
        const user = await getConnection()
            .getRepository(User)
            .findOne({
                where: {
                    userId: id,
                },
            });

        return Promise.resolve(user);
    }

    /**
     * @method getTasksLists returns task list of the user
     *
     * @static
     * @param {IUser} loggedUser
     * @returns {Promise<ITaskList[]>}
     * @memberof Utils
     */
    public static async getTasksLists(loggedUser: IUser): Promise<ITaskList[]> {
        const taskLists: ITaskList[] = await getConnection()
            .getRepository(TaskList)
            .find({
                where: { user: loggedUser },
            });
        return Promise.resolve(taskLists);
    }

    /**
     * @method getTasks returns the list of tasks of a task list
     *
     * @static
     * @param {ITaskList} givenTaskList
     * @returns {Promise<ITask[]>}
     * @memberof Utils
     */
    public static async getTasks(givenTaskList: ITaskList): Promise<ITask[]> {
        const tasks: ITask[] = await getConnection()
            .getRepository(Task)
            .find({
                where: { taskList: givenTaskList },
            });
        return Promise.resolve(tasks);
    }

    /**
     * @method getTaskList returns the task list by id
     *
     * @static
     * @param {string} taskListId
     * @returns {Promise<ITaskList>}
     * @memberof Utils
     */
    public static async getTaskList(taskListId: string): Promise<ITaskList> {
        const taskList: ITaskList = await getConnection()
            .getRepository(TaskList)
            .findOne({
                where: { id: taskListId },
            });
        return Promise.resolve(taskList);
    }

    /**
     * @method deleteDropboxToken deletes the token of the user from database
     *
     * @static
     * @param {string} userId
     * @returns {Promise<void>}
     * @memberof Utils
     */
    public static async deleteDropboxToken(userId: string): Promise<void> {
        const userRepository = await getConnection().getRepository(User);
        const user = await userRepository.findOne({
            where: {
                id: userId,
            },
        });
        if (user) {
            user.dropboxCode = null;
            user.dropboxToken = null;
            await userRepository.save(user);
        }
        return Promise.resolve();
    }
}
