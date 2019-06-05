import { getConnection } from 'typeorm';
import { User } from './entities/user.entity';
import { IData } from './states';
import { IUser } from './models/user.model';
import { IDropbox } from './models/dropbox.model';
import { Dropbox } from './entities/dropbox.entity';
import * as _ from 'lodash';

export class Utils {
    /**
     * @method existsName returns true if the username exists in the database
     *
     * @static
     * @param {string} givenName
     * @returns {Promise<boolean>}
     * @memberof Utils
     */
    public static async existsName(givenName: string): Promise<boolean> {
        const userRepository = await getConnection().getRepository(User);
        const userWithName = await userRepository.findOne({ where: { username: givenName.toLocaleLowerCase() } });
        if (userWithName != null) {
            return Promise.resolve(true);
        }
        return Promise.resolve(false);
    }

    /**
     * @method registerUser registers users with dropbox data if exists
     *
     * @static
     * @param {*} context
     * @param {string} givenUsername
     * @param {string} givenPassword
     * @param {string} [givenDropboxEmail]
     * @param {string} [givenDropboxPassword]
     * @returns {Promise<void>}
     * @memberof Utils
     */
    public static async registerUser(
        context: any,
        givenUsername: string,
        givenPassword: string,
        givenDropboxEmail?: string,
        givenDropboxPassword?: string
    ): Promise<void> {
        const userRepository = await getConnection().getRepository(User);
        const dropboxRepository = await getConnection().getRepository(Dropbox);

        const newUser: IUser = await userRepository.save({ username: givenUsername.toLocaleLowerCase(), password: givenPassword });
        let userData: IData = {
            userId: newUser.id,
            username: newUser.username,
            password: newUser.password,
        };
        if (givenDropboxEmail != null && givenDropboxPassword != null) {
            const dropboxAccount: IDropbox = await dropboxRepository.save({
                email: givenDropboxEmail,
                password: givenDropboxPassword,
            });
            newUser.dropbox = dropboxAccount;
            await userRepository.save(newUser);
            userData = {
                userId: newUser.id,
                username: newUser.username,
                password: newUser.password,
                dropboxEmail: dropboxAccount.email,
                dropboxPassword: dropboxAccount.password,
            };
        }
        context.setState({ user: newUser, data: userData });
        return Promise.resolve();
    }

    /**
     * @method loginUser returns the logged user
     *
     * @param {string} givenUsername
     * @param {string} givenPassword
     * @returns {Promise<IUser>}
     * @memberof Utils
     */
    public static async loginUser(givenUsername: string, givenPassword: string): Promise<IUser> {
        const user = await getConnection()
            .getRepository(User)
            .findOne({
                where: {
                    username: givenUsername,
                    password: givenPassword,
                },
                relations: ['dropbox'],
            });

        return Promise.resolve(user);
    }

    /**
     * @method isNullOrUndefined returns true if the object is null or undefined
     *
     * @static
     * @param {*} data
     * @returns {boolean}
     * @memberof Utils
     */
    public static isNullOrUndefined(data: any): boolean {
        if (_.isNull(data) || _.isUndefined(data)) {
            return true;
        }
        return false;
    }
}
