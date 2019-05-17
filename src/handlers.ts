const { TelegramHandler } = require('bottender');


export const handler = new TelegramHandler();

handler.onText(async (context: any) => {

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

handler.onCallbackQuery(async (context: any) => {
    console.log(context._event.callbackQuery.data);
});
