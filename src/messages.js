// - - - - - - - - - -  Initial messages - - - - - - - - - - - - -
const startCommandMessage =
    'Bienvenido ! Mi nombre es cloud-bot y estoy aquí para ayudarte'
// - - - - - - - - - -  User me - - - - - - - - - - - - - - - - - -
const unknownUser = 'Lo siento pero no se quien eres . . ¿Porque no pruebas a registrarte o iniciar sesion?'
// - - - - - - - - - -  Register messages - - - - - - - - - - - - -

const regAskName = 'Dime tu nombre'
const regAskPassword = 'Dime tu contraseña'

// - - - - - - - - - -  Help messages - - - - - - - - - - - - -

const helpCommandMessage = `
/start   Reiniciar el bot
/register    Registrarse en la base de datos
/login      Iniciar sesion
/me         Informacion del usuario logueado
/help       Lista de comandos en <command>`

const messages = {
    startCommandMessage: startCommandMessage,
    regAskName: regAskName,
    regAskPassword: regAskPassword,
    helpCommandMessage,
    unknownUser: unknownUser
}

module.exports = { messages }
