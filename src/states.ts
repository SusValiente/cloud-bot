export interface IState {
    data: IData;
    currentStatus: IChatStatus;
    auxData: IAuxData;
}

export interface IAuxData {
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
}

export const initialState: IState = {
    data: {
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
    },
    auxData: {
        taskListName: null,
    },
};
