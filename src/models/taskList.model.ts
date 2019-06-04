import { ITask } from './task.model';
import { IUser } from './user.model';

/**
 * Task list class
 *
 * @export
 * @class ITaskList
 */
export class ITaskList {
    id: string;
    name: string;
    user: IUser;
    tasks: ITask[];
}
