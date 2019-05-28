import { ITaskList } from './taskList.model';

/**
 * Task class
 *
 * @export
 * @class ITask
 */
export class ITask {
    id: string;
    name: string;
    description: string;
    taskList: ITaskList;
}
