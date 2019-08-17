import { IUser } from './models/user.model';
import { ITaskList } from './models/taskList.model';
import { Dropbox } from 'dropbox';

export interface IState {
    userData: IData;
    currentStatus: IChatStatus;
    user: IUser;
    taskList: ITaskList;
    dbx: Dropbox;
    event: IEvent;
}

export interface IEvent {
    date: Date;
    summary: string;
    location: string;
    duration: number;
    description: string;
    hourAndMin: string;
}

export interface IData {
    userId: string;
    username: string;
    password: string;
}

export interface IChatStatus {
    insertingUsername: boolean;
    insertingPassword: boolean;
    insertingDropboxEmail: boolean;
    insertingGoogleAccount: boolean;
    insertingEventLocation: boolean;
    insertingEventSummary: boolean;
    insertingEventDescription: boolean;
    creatingEvent: boolean;
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
        insertingUsername: false,
        insertingPassword: false,
        insertingDropboxEmail: false,
        insertingGoogleAccount: false,
        insertingEventSummary: false,
        insertingEventLocation: false,
        insertingEventDescription: false,
        registering: false,
        creatingEvent: false,
        logging: false,
        creatingTaskList: false,
        addingTask: false,
        changingUsername: false,
        changingPassword: false,
        validatingChangePassword: false
    },
    dbx: null,
    event: {
        date: null,
        summary: null,
        location: null,
        duration: null,
        description: null,
        hourAndMin: null
    }
};
