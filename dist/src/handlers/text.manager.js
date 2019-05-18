"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messages_1 = require("../messages");
/**
 * Class Text manager that manages all text event received
 *
 * @export
 * @class TextManager
 */
class TextManager {
    static async manageText(context) {
        switch (context.event.text) {
            case '/start':
                context.resetState();
                await context.sendMessage(messages_1.Messages.START, {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: 'Soy un usuario nuevo',
                                    callback_data: 'new_user',
                                },
                            ],
                            [
                                {
                                    text: 'Ya he estado antes',
                                    callback_data: 'login_user',
                                },
                            ],
                        ],
                    },
                });
                break;
            default:
                await context.sendMessage('WTF are u saying bro');
                break;
        }
    }
}
exports.TextManager = TextManager;
//# sourceMappingURL=text.manager.js.map