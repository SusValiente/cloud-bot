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
const bottender_config_1 = require("./bottender.config");
const typeorm_1 = require("typeorm");
const user_1 = require("./src/entities/user");
const handlers_1 = require("./src/handlers");
const _ = __importStar(require("lodash"));
//  JAVASCRIPT IMPORTS
const { createServer } = require('bottender/express'); // no tiene @types
const { TelegramBot } = require('bottender');
require('dotenv').config();
// typeorm config
const options = {
    type: 'sqlite',
    database: './db/cloud-bot.db',
    entities: [user_1.User],
    logging: true,
};
// bot initialization
const bot = new TelegramBot({
    accessToken: bottender_config_1.config.telegram.accessToken,
});
async function main() {
    // typeorm connection
    const connection = await typeorm_1.createConnection(options);
    if (!_.isNull(connection)) {
        console.log('Typeorm connected successfully');
    }
    bot.onEvent(handlers_1.handler);
    const server = createServer(bot, { ngrok: true });
    // Telegram currently only supports four ports for webhooks: 443, 80, 88 and 8443
    server.listen(process.env.PORT, () => {
        console.log(`server is running on ${process.env.PORT} port...`);
    });
}
main().catch(console.error);
//# sourceMappingURL=index.js.map