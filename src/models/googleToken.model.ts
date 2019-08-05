import { IUser } from './user.model';

export class IGoogleToken {
    access_token: string;
    refresh_token: string;
    scope: string;
    token_type: string;
    id_token: string;
    expiry_date: number;
}

export class IGoogleCredential extends IGoogleToken {
    id?: string;
    user?: IUser;
}
