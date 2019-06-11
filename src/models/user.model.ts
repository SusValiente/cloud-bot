import { IDropbox } from './dropbox.model';
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
    dropbox: IDropbox;
    taskLists: TaskList[];
}
