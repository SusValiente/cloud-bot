const { TelegramHandler } = require('bottender')
const { connection } = require('./../index')
const { messages } = require('./messages')
const _ = require('lodash');

const handler = new TelegramHandler()
    .onText(async context => {
        if (context.event.isText) {
            switch (context.event.text) {
                case '/start':
                    await context.sendText(messages.startCommandMessage)
                    break
                case '/me':
                    // - - - - - - - - Current logged in user - - - - - - - - -
                    if (context.state.currentUser) {
                        await context.sendText('Hola! ' + context.state.currentUser)
                    } else {
                        await context.sendText(messages.unknownUser)
                    }
                    break
                case '/register':
                    // - - - - - - - - Setting register status - - - - - - - - -
                    if (!context.state.registering) {
                        context.setState({ registering: true })
                        await context.sendText(messages.regAskName)
                    }
                    break

                case '/login':
                    break

                case '/help':
                    await context.sendText(messages.helpCommandMessage)
                    break

                default:
                    // - - - - - - - - Registering user - - - - - - - - -
                    if (context.state.registering) {
                        if (
                            _.isNull(context.state.registeredName) ||
                            _.isEmpty(context.state.registeredName)
                        ) {
                            context.setState({
                                registeredName: context.event.text,
                            })
                            await context.sendText(messages.regAskPassword)
                        } else {
                            if (
                                _.isNull(context.state.registeredPassword) ||
                                _.isEmpty(context.state.registeredPassword)
                            ) {
                                context.setState({
                                    registeredPassword: context.event.text,
                                })
                                if (
                                    !_.isNull(
                                        context.state.registeredPassword &&
                                        !_.isNull(
                                            context.state.registeredName
                                        )
                                    )
                                ) {
                                    await connection.getRepository('User')
                                        .save({
                                            username: context.state.registeredName,
                                            password: context.state.registeredPassword
                                        });

                                    await context.sendText(
                                        'Registrado correctamente: ' +
                                        context.state.registeredName +
                                        ' ' +
                                        context.state.registeredPassword
                                    )
                                    context.setState({
                                        registering: false,
                                        currentUser: context.state.registeredName
                                    })
                                }
                            }
                        }
                    }
                    break
            }
        }
    })
    .onError(async (context, error) => {
        await context.sendText(error.message)
    })

module.exports = { handler }
