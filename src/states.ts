import { IUser } from './models/user.model';
import { ITaskList } from './models/taskList.model';
import { Dropbox } from 'dropbox';

export interface IState {
    userData: IData;
    currentStatus: IChatStatus;
    user: IUser;
    taskList: ITaskList;
    dbx: Dropbox;
}

export interface IData {
    userId: string;
    username: string;
    password: string;
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
    changingUsername: boolean;
    validatingChangePassword: boolean;
    changingPassword: boolean;
}

export const initialState: IState = {
    taskList: null,
    user: null,
    userData: {
        userId: null,
        username: null,
        password: null
    },
    currentStatus: {
        dropboxActive: null,
        insertingUsername: false,
        insertingPassword: false,
        insertingDropboxEmail: false,
        insertingDropboxPassword: false,
        registering: false,
        logging: false,
        creatingTaskList: false,
        addingTask: false,
        changingUsername: false,
        changingPassword: false,
        validatingChangePassword: false
    },
    dbx: null
};