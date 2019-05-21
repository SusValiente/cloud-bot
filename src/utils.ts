import { getConnection } from 'typeorm';
import { User } from './entities/user';
import { isNullOrUndefined } from 'util';

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

    public static async registerUser(): Promise<boolean> {
        return Promise.resolve(true);
    }


}
