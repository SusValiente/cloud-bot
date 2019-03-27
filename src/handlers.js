const { TelegramHandler } = require('bottender');
const states = require('./states')
const messages = require('./messages')

const handler = new TelegramHandler()
    .onText(async context => {
        if (context.event.isText) {
            switch (context.event.text) {
                case '/registro':
                    // set register state only once
                    if (context.state !== states.registerState) {
                        context.setState(states.registerState);
                    }

                    // registering username
                    if (context.state.registeringName) {
                        await context.sendMessage(messages.regAskName);
                        context.setState({ registeringName: false, registeringName: true });

                    }
                    // registering password
                    if (context.state.registeringPassword) {
                        await context.sendMessage(messages.regAskPassword);
                        context.setState({ registeringPassword: false });
                    }
                    context.resetState();
                    break;
                case '/reiniciar':
                    await context.sendMessage(messages.initialMessage);
                    break;
                case '/ayuda':
                    await context.sendMessage(messages.helpCommandMessage);
                    break;
                default:
                    await context.sendText(`${context.event.text} no es un comando válido.`);
            }
        }
    })
    .onError(async (context, error) => {
        await context.sendText(error.message);
    });

module.exports = { handler };