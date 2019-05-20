export interface IState {
    userId: string;
    username: string;
    password: string;
    dropboxEmail: string;
    dropboxPassword: string;
    dropboxActive: boolean;
    registering: boolean;
    logging: boolean;
}

export const initialState: IState = {
    userId: null,
    username: null,
    password: null,
    dropboxEmail: null,
    dropboxPassword: null,
    dropboxActive: false,
    registering: false,
    logging: false,
};
