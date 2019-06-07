import { IUser } from './models/user.model';
import { ITaskList } from './models/taskList.model';

export interface IState {
    userData: IData;
    currentStatus: IChatStatus;
    taskListData: ITaskListData;
    user: IUser;
    taskList: ITaskList;
}

export interface ITaskListData {
    taskListName: string;
}

export interface IData {
    userId: string;
    username: string;
    password: string;
    dropboxEmail?: string;
    dropboxPassword?: string;
}

export interface IChatStatus {
    dropboxActive: boolean;
    insertingUsername: boolean;
    insertingPassword: boolean;
    insertingDropboxEmail: boolean;
    insertingDropboxPassword: boolean;
    registering: boolean;
    logging: boolean;
    creatingTaskList: boolean;
    addingTask: boolean;
}

export const initialState: IState = {
    taskList: null,
    user: null,
    userData: {
        userId: null,
        username: null,
        password: null,
        dropboxEmail: null,
        dropboxPassword: null,
    },
    currentStatus: {
        dropboxActive: null, // to know if the user has dropbox account
        insertingUsername: false, // to know if the user is inserting a username
        insertingPassword: false, // to know if the user is inserting a password
        insertingDropboxEmail: false, // to know if the user is inserting a dropbox email
        insertingDropboxPassword: false, // to know if the user is inserting a dropbox password
        registering: false,
        logging: false,
        creatingTaskList: false,
        addingTask: false,
    },
    taskListData: {
        taskListName: null,
    },
};
