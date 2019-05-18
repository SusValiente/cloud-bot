"use strict";
// const { TelegramHandler } = require('bottender');
Object.defineProperty(exports, "__esModule", { value: true });
// export const eventHandler = new TelegramHandler();
// eventHandler.onText(async (context: any) => {
//     if (context.event.isText) {
//         // await context.sendMessage('Testing', {
//         //     reply_markup: {
//         //         inline_keyboard: [
//         //             [
//         //                 {
//         //                     text: 'Login',
//         //                     callback_data: 'casoLogin',
//         //                 },
//         //             ],
//         //             [
//         //                 {
//         //                     text: 'Registro',
//         //                     callback_data: 'casoLogin',
//         //                 },
//         //             ],
//         //         ],
//         //     },
//         // });
//         switch (context.event.text) {
//             case '/start':
//                 context.resetState();
//                 break;
//             default:
//                 break;
//         }
//     }
// });
class TextHandler {
    static async manageText(event) {
        console.log(event);
    }
}
exports.TextHandler = TextHandler;
//# sourceMappingURL=text.handler.js.map