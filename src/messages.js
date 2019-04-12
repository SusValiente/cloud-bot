// - - - - - - - - - -  Initial messages - - - - - - - - - - - - -
const startCommandMessage = 'Bienvenido ! Mi nombre es cloud-bot y estoy aquí para ayudarte';
// - - - - - - - - - -  User me - - - - - - - - - - - - - - - - - -
const unknownUser = 'Lo siento pero no se quien eres . . ¿Porque no pruebas a registrarte o iniciar sesion?';
// - - - - - - - - - -  Register messages - - - - - - - - - - - - -

const regAskName = `Vas a proceder a registrarte en mi base de datos, para ello, primero dime que nombre de usuario quieres`;
const askPassword = 'Ahora dime tu contraseña';

const logAskName = `Vas a proceder a identificarte como un usuario registrado, primero, dime tu nombre de usuario`;
const logNameNotFound = `Lo siento, no encuentro ningun usuario con ese nombre, prueba de nuevo`;
const wrongUsername = 'Tu contraseña no es correcta, prueba de nuevo porfavor';

const tryAgain = 'Vuelve a intentarlo porfavor';

// - - - - - - - - - -  Help messages - - - - - - - - - - - - -

const helpCommandMessage = `
/start   Reiniciar el bot
/register    Registrarse en la base de datos
/login      Iniciar sesion
/me         Informacion del usuario logueado
/help       Lista de comandos en <command>`;

const messages = {
    startCommandMessage: startCommandMessage,
    regAskName: regAskName,
    askPassword: askPassword,
    helpCommandMessage,
    logAskName: logAskName,
    tryAgain: tryAgain,
    wrongUsername: wrongUsername,
    logNameNotFound: logNameNotFound,
    unknownUser: unknownUser,
};

module.exports = { messages };
