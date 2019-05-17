"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { TelegramHandler } = require('bottender');
exports.handler = new TelegramHandler();
exports.handler.onText(async (context) => {
    if (context.event.isText) {
        await context.sendMessage('Testing', {
            reply_markup: {
                inline_keyboard: [
                    [{
                            text: 'Login',
                            callback_data: 'casoLogin'
                        }],
                    [{
                            text: 'Registri',
                            callback_data: 'casoLogin'
                        }]
                ]
            }
        });
    }
});
exports.handler.onCallbackQuery(async (context) => {
    console.log(context._event.callbackQuery.data);
});
//# sourceMappingURL=handlers.js.map