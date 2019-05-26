export interface IState {
    data: IData;
    currentStatus: IChatStatus;
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
}

export const initialState: IState = {
    data: {
        userId: null,
        username: null,
        password: null,
        dropboxEmail: null,
        dropboxPassword: null
    },
    currentStatus: {
        dropboxActive: null,
        insertingUsername: false,
        insertingPassword: false,
        insertingDropboxEmail: false,
        insertingDropboxPassword: false,
        registering: false,
        logging: false
    }
};
