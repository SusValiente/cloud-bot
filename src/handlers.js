const { TelegramHandler } = require('bottender');
const typeorm = require('typeorm');
const { messages } = require('./messages');
const _ = require('lodash');
const { User } = require('./models/user');

const handler = new TelegramHandler()
    .onText(async context => {
        const connection = typeorm.getConnection('typeorm');
        const userRepository = connection.getRepository(User);

        if (context.event.isText) {
            switch (context.event.text) {
                case '/start':
                    context.resetState();
                    await context.sendText(messages.startCommandMessage);
                    break;
                case '/users':
                    // - - - - - - - - Return list of users - - - - - - - - - -
                    const userList = await userRepository.find({ select: ['username'] });
                    if (!_.isEmpty(userList)) {
                        await context.sendText(_.map(userList, obj => obj.username));
                    } else {
                        await context.sendText('No hay usuarios registrados actualmente');
                    }

                    break;
                case '/me':
                    // - - - - - - - - Current logged in user - - - - - - - - -
                    if (context.state.currentUser) {
                        await context.sendText('Hola! ' + context.state.currentUser);
                    } else {
                        await context.sendText(messages.unknownUser);
                    }
                    break;
                case '/register':
                    // - - - - - - - - Setting register status - - - - - - - - -
                    if (!context.state.registering && _.isNull(context.state.currentUser)) {
                        context.setState({
                            registering: true,
                            logging: false,
                        });
                        await context.sendText(messages.regAskName);
                    }
                    if (!_.isNull(context.state.currentUser)) {
                        await context.sendText(
                            'Ya estas registrado, si tu no eres ' + context.state.currentUser + ' puedes cerrar sesion con /start y registrarte'
                        );
                    }
                    break;

                case '/login':
                    // - - - - - - - - Setting logging status - - - - - - - - -
                    if (!context.state.logging) {
                        context.setState({
                            logging: true,
                            registering: false,
                        });
                        await context.sendText(messages.logAskName);
                    }
                    break;

                case '/logout':
                    if (context.state.currentUser) {
                        context.resetState();
                        await context.sendText('Bye!');
                    } else {
                        await context.sendText('No se quien eres pero . . . hasta luego !');
                    }
                    break;

                case '/dropbox_login':
                    context.setState({
                        logging: false,
                        registering: false,
                    });
                    if (!context.state.currentUser) {
                        await context.sendText(messages.pleaseLogIn);
                    } else {
                        await context.sendText('Todavia no he implementado esta parte . .  no seas ansias');
                    }
                    break;

                case '/dropbox_register':
                    context.setState({
                        logging: false,
                        registering: false,
                    });
                    if (!context.state.currentUser) {
                        await context.sendText(messages.pleaseLogIn);
                    } else {
                        await context.sendText('Todavia no he implementado esta parte . .  no seas ansias');
                    }
                    break;

                case '/help':
                    await context.sendText(messages.helpCommandMessage);
                    break;

                default:
                    // # # # # # # # # # # # # # # # # # # # # # # # # # #
                    // # # # # # # # # Registering user # # # # # # # # #
                    // # # # # # # # # # # # # # # # # # # # # # # # # # #
                    if (context.state.registering) {
                        if (_.isNull(context.state.registeredName) || _.isEmpty(context.state.registeredName)) {
                            if (!_.isUndefined(await userRepository.findOne({ username: context.event.text }))) {
                                await context.sendText('Lo siento, pero el nombre de usuario: ' + context.event.text + ' ya está ocupado por otro usuario');
                                await context.sendText('Vuelve a intentarlo por favor');
                            } else {
                                context.setState({
                                    registeredName: context.event.text,
                                });
                                await context.sendText(messages.askPassword);
                            }
                        } else {
                            if (_.isNull(context.state.registeredPassword) || _.isEmpty(context.state.registeredPassword)) {
                                context.setState({
                                    registeredPassword: context.event.text,
                                });
                                if (!_.isNull(context.state.registeredPassword && !_.isNull(context.state.registeredName))) {
                                    connection.getRepository('User').save({
                                        username: context.state.registeredName,
                                        password: context.state.registeredPassword,
                                    });

                                    await context.sendText(
                                        'Registrado correctamente: ' + context.state.registeredName + ' ' + context.state.registeredPassword
                                    );
                                    context.setState({
                                        registering: false,
                                        currentUser: context.state.registeredName,
                                        registeredName: null,
                                        registeredPassword: null,
                                    });
                                }
                            }
                        }
                    }
                    // # # # # # # # # # # # # # # # # # # # # # # # # # #
                    // # # # # # # # # Logging user  # # # # # # # # # # #
                    // # # # # # # # # # # # # # # # # # # # # # # # # # #
                    if (context.state.logging) {
                        if (_.isNull(context.state.loggedName) || _.isEmpty(context.state.loggedName)) {
                            if (_.isNull(context.state.loggedName) && _.isUndefined(await userRepository.findOne({ username: context.event.text }))) {
                                await context.sendText(messages.logNameNotFound);
                                await context.sendText(messages.tryAgain);
                            } else {
                                context.setState({
                                    loggedName: context.event.text,
                                });
                                await context.sendText(messages.askPassword);
                            }
                        } else {
                            if (_.isUndefined(await userRepository.findOne({ username: context.state.loggedName, password: context.event.text }))) {
                                await context.sendText(messages.wrongUsername);
                            } else {
                                context.setState({
                                    currentUser: context.state.loggedName,
                                    loggedName: null,
                                    logging: false,
                                });
                                await context.sendText('Bienvenido ! ' + context.state.currentUser);
                            }
                        }
                    }
                    break;
            }
        }
    })
    .onError(async (context, error) => {
        await context.sendText(error.message);
    });

module.exports = { handler };
