import { TaskList } from '../entities/taskList.entity';
import { IGoogleCredential } from './googleToken.model';

/**
 * User class
 *
 * @export
 * @class IUser
 */
export class IUser {
    id: string;
    username: string;
    password?: string;
    taskLists?: TaskList[];
    dropboxToken: string;
    googleCredential?: IGoogleCredential;
}
