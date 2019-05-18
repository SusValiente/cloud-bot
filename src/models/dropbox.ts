import { IUser } from '../models/user';
// Dropbox interface
export interface IDropbox {
    id: string;
    email: string;
    password: string;
    user: IUser;
}
