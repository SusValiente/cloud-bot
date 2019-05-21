import { getConnection } from 'typeorm';
import { User } from './entities/user';
import { Dropbox } from './entities/dropbox';
import { isNullOrUndefined } from 'util';
import { IData } from './states';

export class Utils {

    /**
     * @method validateExistingUsername returns true if the username given is not already taken
     *
     * @static
     * @param {string} givenName
     * @returns {Promise<boolean>}
     * @memberof Utils
     */
    public static async validateExistingUsername(givenName: string): Promise<boolean> {
        const userRepository = await getConnection().getRepository(User);
        if (isNullOrUndefined(await userRepository.findOne({ where: { username: givenName } }))) {
            return Promise.resolve(true);
        }
        return Promise.resolve(false);
    }

    /**
     * @method registerUser registers user with dropbox data
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
        const newUser = await userRepository.save({ username: givenUsername, password: givenPassword });
        let userData: IData = {
            userId: newUser.id,
            username: newUser.username,
            password: newUser.password
        };
        if (!isNullOrUndefined(givenDropboxEmail) && !isNullOrUndefined(givenDropboxPassword)) {
            const dropboxAccount = await dropboxRepository.save(
                {
                    email: givenDropboxEmail,
                    password: givenDropboxPassword,
                    user: newUser
                });
            userData = {
                userId: newUser.id,
                username: newUser.username,
                password: newUser.password,
                dropboxEmail: dropboxAccount.email,
                dropboxPassword: dropboxAccount.password
            };
        }
        context.setState({ data: userData });
        return Promise.resolve();
    }


}
