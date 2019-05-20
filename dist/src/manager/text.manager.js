"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messages_1 = require("../messages");
// import * as _ from 'lodash';
const util_1 = require("util");
/**
 * Class Text manager that manages all text event received
 *
 * @export
 * @class TextManager
 */
class TextManager {
    static async manageText(context) {
        const state = context.state;
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
                await this.manageUnknownText(context, state);
                break;
        }
        return Promise.resolve();
    }
    static async manageUnknownText(context, state) {
        if (state.registering && util_1.isNullOrUndefined(state.username)) {
            state.username = context.event.text;
            await context.sendMessage(messages_1.Messages.START_ASK_PASSWORD);
        }
        if (state.registering && !util_1.isNullOrUndefined(state.username)) {
            state.password = context.event.text;
            await context.sendMessage(messages_1.Messages.START_ASK_DROPBOX, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Vincular Dropbox',
                                callback_data: 'sync_dropbox',
                            },
                        ],
                        [
                            {
                                text: 'No vincular',
                                callback_data: 'ignore_dropbox',
                            },
                        ],
                    ],
                },
            });
        }
        context.setState(state);
        return Promise.resolve();
    }
}
exports.TextManager = TextManager;
//# sourceMappingURL=text.manager.js.map