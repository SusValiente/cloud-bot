"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const dropbox_entity_1 = require("./entities/dropbox.entity");
const _ = __importStar(require("lodash"));
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
        const userRepository = await typeorm_1.getConnection().getRepository(user_entity_1.User);
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
    static async registerUser(context, givenUsername, givenPassword, givenDropboxEmail, givenDropboxPassword) {
        const userRepository = await typeorm_1.getConnection().getRepository(user_entity_1.User);
        const dropboxRepository = await typeorm_1.getConnection().getRepository(dropbox_entity_1.Dropbox);
        const newUser = await userRepository.save({ username: givenUsername.toLocaleLowerCase(), password: givenPassword });
        let userData = {
            userId: newUser.id,
            username: newUser.username,
            password: newUser.password,
        };
        if (givenDropboxEmail != null && givenDropboxPassword != null) {
            const dropboxAccount = await dropboxRepository.save({
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
    static async loginUser(givenUsername, givenPassword) {
        const user = await typeorm_1.getConnection()
            .getRepository(user_entity_1.User)
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
    static isNullOrUndefined(data) {
        if (_.isNull(data) || _.isUndefined(data)) {
            return true;
        }
        return false;
    }
}
exports.Utils = Utils;
//# sourceMappingURL=utils.js.map