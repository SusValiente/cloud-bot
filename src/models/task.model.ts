import { ITaskList } from './taskList.model';

/**
 * Task class
 *
 * @export
 * @class ITask
 */
export class ITask {
    id: string;
    description: string;
    taskList: ITaskList;
    completed: boolean;
}
