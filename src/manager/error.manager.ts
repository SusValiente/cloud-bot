const { TelegramHandler } = require('bottender');

export const errorHandler = new TelegramHandler();

errorHandler.onError(async (context: any) => {
    console.log(context);
    await context.sendMessage('Ha ocurrido un error');
});
