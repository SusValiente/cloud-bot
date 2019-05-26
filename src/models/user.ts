import { IDropbox } from './dropbox';

// User interface
export interface IUser {
    id: string;
    username: string;
    password: string;
    dropbox: IDropbox;
}
