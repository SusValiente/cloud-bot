"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// TYPESCRIPT IMPORTS
const bottender_config_1 = require("../bottender.config");
const typeorm_1 = require("typeorm");
const user_1 = require("./entities/user");
const text_manager_1 = require("./manager/text.manager");
const callback_manager_1 = require("./manager/callback.manager");
const _ = __importStar(require("lodash"));
const task_1 = require("./entities/task");
const dropbox_1 = require("./entities/dropbox");
const states_1 = require("./states");
//  JAVASCRIPT IMPORTS
const { createServer } = require('bottender/express'); // does not have @types
const { TelegramBot } = require('bottender');
require('dotenv').config();
// typeorm config
const options = {
    type: 'sqlite',
    database: './db/cloud-bot.db',
    entities: [user_1.User, task_1.Task, dropbox_1.Dropbox],
    logging: true,
    synchronize: true,
};
// bot initialization
const bot = new TelegramBot({
    accessToken: bottender_config_1.config.telegram.accessToken,
});
bot.setInitialState(states_1.initialState);
async function main() {
    // typeorm connection
    const connection = await typeorm_1.createConnection(options);
    if (!_.isNull(connection)) {
        console.log('Typeorm connected successfully');
    }
    bot.onEvent(async (context) => {
        try {
            if (context.event.isText) {
                await text_manager_1.TextManager.manageText(context);
            }
            if (context.event.isCallbackQuery) {
                await callback_manager_1.CallbackManager.manageCallback(context);
            }
        }
        catch (error) {
            console.log(error);
        }
    });
    const server = createServer(bot, { ngrok: true });
    // Telegram currently only supports four ports for webhooks: 443, 80, 88 and 8443
    server.listen(process.env.PORT, () => {
        console.log(`server is running on ${process.env.PORT} port...`);
    });
}
main();
//# sourceMappingURL=index.js.map