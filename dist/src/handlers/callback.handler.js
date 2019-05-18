"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { TelegramHandler } = require('bottender');
exports.callbackHandler = new TelegramHandler();
exports.callbackHandler.onCallbackQuery(async (context) => {
    console.log(context._event.callbackQuery.data);
});
//# sourceMappingURL=callback.handler.js.map