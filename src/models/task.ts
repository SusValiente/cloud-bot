import { IUser } from './user';

// Task interface
export interface ITask {
    id: string;
    name: string;
    description: string;
    user: IUser;
}
