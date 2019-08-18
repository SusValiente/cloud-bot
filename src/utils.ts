import { getConnection } from 'typeorm';
import { User } from './entities/user.entity';
import { IUser } from './models/user.model';
import * as _ from 'lodash';
import { ITaskList } from './models/taskList.model';
import { TaskList } from './entities/taskList.entity';
import { ITask } from './models/task.model';
import { Task } from './entities/task.entity';
import { Messages } from './messages';
import { IGoogleCredential } from './models/googleToken.model';
import { GoogleCredential } from './entities/googleCredential.entity';

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
                    password: givenPassword
                },
                relations: ['googleCredential']
            });

        return Promise.resolve(user);
    }

    /**
     * @method deleteUser deletes user by its internal id
     *
     * @static
     * @param {string} userId
     * @returns {Promise<void>}
     * @memberof Utils
     */
    public static async deleteUser(userId: string): Promise<void> {
        await getConnection()
            .getRepository(User)
            .createQueryBuilder()
            .delete()
            .where('id = :value', { value: userId })
            .execute();
        return Promise.resolve();
    }

    /**
     * @method getUser returns the user by id
     *
     * @static
     * @param {string} userId
     * @returns {Promise<IUser>}
     * @memberof Utils
     */
    public static async getUser(userId: string): Promise<IUser> {
        const user = await getConnection()
            .getRepository(User)
            .findOne({
                where: {
                    id: userId
                },
                relations: ['googleCredential']
            });
        if (_.isNil(user)) {
            return Promise.reject('User not found');
        }

        return Promise.resolve(user);
    }

    /**
     * @method changeUsername changes the username, if the username is already taken
     * it will return false
     *
     * @static
     * @param {string} userId
     * @param {string} newUsername
     * @returns {Promise<boolean>}
     * @memberof Utils
     */
    public static async changeUsername(userId: string, newUsername: string): Promise<boolean> {
        const userRepo = getConnection().getRepository(User);
        const existantUser = await userRepo.findOne({ where: { username: newUsername } });
        if (!_.isNil(existantUser)) {
            return Promise.resolve(false);
        }

        const currentUser = await userRepo.findOne({ where: { id: userId } });
        if (_.isNil(currentUser)) {
            return Promise.reject('User not found');
        }
        currentUser.username = newUsername.toLocaleLowerCase();
        await userRepo.save(currentUser);
        return Promise.resolve(true);
    }

    /**
     * @method changePassword changes the password of the user
     *
     * @static
     * @param {string} userId
     * @param {string} newPassword
     * @returns {Promise<void>}
     * @memberof Utils
     */
    public static async changePassword(userId: string, newPassword: string): Promise<void> {
        const userRepo = getConnection().getRepository(User);
        const currentUser = await userRepo.findOne({ where: { id: userId } });
        if (_.isNil(currentUser)) {
            return Promise.reject('User not found');
        }
        currentUser.password = newPassword;
        await userRepo.save(currentUser);
        return Promise.resolve();
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
                where: { user: loggedUser }
            });
        return Promise.resolve(taskLists);
    }

    /**
     * @method changeTaskListName updates the name of a task list
     *
     * @static
     * @param {string} taskListId
     * @param {string} newName
     * @returns {Promise<void>}
     * @memberof Utils
     */
    public static async changeTaskListName(taskListId: string, newName: string): Promise<void> {
        const taskListRepo = await getConnection().getRepository(TaskList);
        const taskList: ITaskList = await taskListRepo.findOne({
            where: { id: taskListId }
        });

        if (_.isNil(taskList)) {
            return Promise.resolve();
        }

        taskList.name = newName;

        await taskListRepo.save(taskList);

        return Promise.resolve();
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
            .getRepository(TaskList)
            .findOne({
                where: { id: taskListId }
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
                id: userId
            }
        });
        if (user) {
            user.dropboxToken = null;
            await userRepository.save(user);
        }
        return Promise.resolve();
    }

    /**
     * @method getHiddenPassword returns the password of the user in hidden format
     *
     * @static
     * @param {string} password
     * @returns {string}
     * @memberof Utils
     */
    public static getHiddenPassword(password: string): string {
        const hiddenPassword = password[0] + '******' + password[password.length - 1];
        return hiddenPassword;
    }

    /**
     * update access token of google credential in database
     *
     * @param {string} idCredential
     * @param {string} newAccessToken
     * @returns {Promise<void>}
     * @memberof Utils
     */
    public static async updateAccessToken(idCredential: string, newAccessToken: string): Promise<void> {
        const googleRepo = await getConnection().getRepository(GoogleCredential);
        const credential = await googleRepo.findOne({ where: { id: idCredential } });
        if (_.isNil(credential)) {
            return;
        }
        credential.access_token = newAccessToken;
        await googleRepo.save(credential);
    }
}
