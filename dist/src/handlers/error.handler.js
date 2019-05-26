"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { TelegramHandler } = require('bottender');
exports.errorHandler = new TelegramHandler();
exports.errorHandler.onError(async (context) => {
    console.log(context);
    await context.sendMessage('Ha ocurrido un error');
});
//# sourceMappingURL=error.handler.js.map