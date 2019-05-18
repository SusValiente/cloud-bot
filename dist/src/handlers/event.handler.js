"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { TelegramHandler } = require('bottender');
exports.eventHandler = new TelegramHandler();
exports.eventHandler.onText(async (context) => {
    if (context.event.isText) {
        // await context.sendMessage('Testing', {
        //     reply_markup: {
        //         inline_keyboard: [
        //             [
        //                 {
        //                     text: 'Login',
        //                     callback_data: 'casoLogin',
        //                 },
        //             ],
        //             [
        //                 {
        //                     text: 'Registro',
        //                     callback_data: 'casoLogin',
        //                 },
        //             ],
        //         ],
        //     },
        // });
        switch (context.event.text) {
            case '/start':
                context.resetState();
                break;
            default:
                break;
        }
    }
});
//# sourceMappingURL=event.handler.js.map