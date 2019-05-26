"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const user_1 = require("./entities/user");
const dropbox_1 = require("./entities/dropbox");
class Utils {
    /**
     * @method existsName returns true if the username exists in the database
     *
     * @static
     * @param {string} givenName
     * @returns {Promise<boolean>}
     * @memberof Utils
     */
    static async existsName(givenName) {
        const userRepository = await typeorm_1.getConnection().getRepository(user_1.User);
        const userWithName = await userRepository.findOne({ where: { username: givenName } });
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
    static async registerUser(context, givenUsername, givenPassword, givenDropboxEmail, givenDropboxPassword) {
        const userRepository = await typeorm_1.getConnection().getRepository(user_1.User);
        const dropboxRepository = await typeorm_1.getConnection().getRepository(dropbox_1.Dropbox);
        const newUser = await userRepository.save({ username: givenUsername, password: givenPassword });
        let userData = {
            userId: newUser.id,
            username: newUser.username,
            password: newUser.password
        };
        if (givenDropboxEmail != null && givenDropboxPassword != null) {
            const dropboxAccount = await dropboxRepository.save({
                email: givenDropboxEmail,
                password: givenDropboxPassword
            });
            newUser.dropbox = dropboxAccount;
            await userRepository.save(newUser);
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
    /**
     * @method loginUser returns the logged user
     *
     * @param {string} givenUsername
     * @param {string} givenPassword
     * @returns {Promise<IUser>}
     * @memberof Utils
     */
    static async loginUser(givenUsername, givenPassword) {
        const user = await typeorm_1.getConnection().getRepository(user_1.User).findOne({
            where: {
                username: givenUsername,
                password: givenPassword
            },
            relations: ['dropbox']
        });
        return Promise.resolve(user);
    }
}
exports.Utils = Utils;
//# sourceMappingURL=utils.js.map