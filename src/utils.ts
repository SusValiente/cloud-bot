import { getConnection } from 'typeorm';
import { User } from './entities/user.entity';
import { IData } from './states';
import { IUser } from './models/user.model';
import { IDropbox } from './models/dropbox.model';
import { Dropbox } from './entities/dropbox.entity';
import * as _ from 'lodash';
import { ITaskList } from './models/taskList.model';
import { TaskList } from './entities/taskList.entity';
import { ITask } from './models/task.model';
import { Task } from './entities/task.entity';

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
    public static async registerUser(
        context: any,
        givenUsername: string,
        givenPassword: string,
        givenDropboxEmail?: string,
        givenDropboxPassword?: string
    ): Promise<void> {
        const userRepository = await getConnection().getRepository(User);
        const dropboxRepository = await getConnection().getRepository(Dropbox);

        const newUser: IUser = await userRepository.save({ username: givenUsername.toLocaleLowerCase(), password: givenPassword });
        let userData: IData = {
            userId: newUser.id,
            username: newUser.username,
            password: newUser.password,
        };
        if (givenDropboxEmail != null && givenDropboxPassword != null) {
            const dropboxAccount: IDropbox = await dropboxRepository.save({
                email: givenDropboxEmail,
                password: givenDropboxPassword,
            });
            newUser.dropbox = dropboxAccount;
            await userRepository.save(newUser);
            userData = {
                userId: newUser.id,
                username: newUser.username,
                password: newUser.password,
                dropboxEmail: dropboxAccount.email,
                dropboxPassword: dropboxAccount.password,
            };
        }
        context.setState({ user: newUser, data: userData });
        return Promise.resolve();
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
                relations: ['dropbox'],
            });

        return Promise.resolve(user);
    }

    /**
     * @method isNullOrUndefined returns true if the object is null or undefined
     *
     * @static
     * @param {*} data
     * @returns {boolean}
     * @memberof Utils
     */
    public static isNullOrUndefined(data: any): boolean {
        if (_.isNull(data) || _.isUndefined(data)) {
            return true;
        }
        return false;
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
            .getRepository(TaskList).find({
                where: { user: loggedUser }
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
            .getRepository(Task).find({
                where: { taskList: givenTaskList }
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
            .getRepository(TaskList).findOne({
                where: { id: taskListId }
            });
        return Promise.resolve(taskList);
    }

    /**
     * @method completeTask deletes task
     *
     * @static
     * @param {string} taskId
     * @returns {Promise<void>}
     * @memberof Utils
     */
    public static async completeTask(taskId: string): Promise<void> {

        await await getConnection()
            .getRepository(Task)
            .createQueryBuilder()
            .delete()
            .where('id = :value', { value: taskId })
            .execute();

        return Promise.resolve();
    }
}
