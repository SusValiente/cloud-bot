import { TaskList } from '../entities/taskList.entity';

/**
 * User class
 *
 * @export
 * @class IUser
 */
export class IUser {
    id: string;
    username: string;
    password: string;
    taskLists: TaskList[];
    dropboxCode: string;
    dropboxToken: string;
}
