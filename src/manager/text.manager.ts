import { Messages } from '../messages';
/**
 * Class Text manager that manages all text event received
 *
 * @export
 * @class TextManager
 */
export class TextManager {
    public static async manageText(context: any): Promise<void> {
        switch (context.event.text) {
            case '/start':
                context.resetState();
                await context.sendMessage(Messages.START, {
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
