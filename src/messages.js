// mensaje bienvenida
const startCommandMessage = 'Bienvenido ! Mi nombre es cloud-bot y puedo hacer muchas cosas por ti, si quieres saber más, utiliza el comando /help';
const unknownUser = 'Lo siento pero no se quien eres . . ¿Porque no pruebas a registrarte o iniciar sesion?';
const regAskName = `Vas a proceder a registrarte en mi base de datos, para ello, primero dime que nombre de usuario quieres`;
const askPassword = 'Ahora dime tu contraseña';
const logAskName = `Vas a proceder a identificarte como un usuario registrado, primero, dime tu nombre de usuario`;
const logNameNotFound = `Lo siento, no encuentro ningun usuario con ese nombre, prueba de nuevo`;
const wrongUsername = 'Tu contraseña no es correcta, prueba de nuevo porfavor';
const tryAgain = 'Vuelve a intentarlo por favor';

const pleaseLogIn = 'Antes de eso, inicia sesion por favor';

// - - - - - - - - - -  Help messages - - - - - - - - - - - - -

const helpCommandMessage = `
/start              Reiniciame
/register           Registrate en mi base de datos
/login              Identificate
/logout             Cerrar sesion
/dropbox_login      (usuario registrado) Iniciar sesion en dropbox
/dropbox_register   (usuario registrado) Insertar una cuenta de dropbox
/me                 Informacion sobre ti
/help               Lista de comandos disponibles`;

const messages = {
    startCommandMessage: startCommandMessage,
    regAskName: regAskName,
    askPassword: askPassword,
    helpCommandMessage,
    logAskName: logAskName,
    tryAgain: tryAgain,
    pleaseLogIn: pleaseLogIn,
    wrongUsername: wrongUsername,
    logNameNotFound: logNameNotFound,
    unknownUser: unknownUser,
};

module.exports = { messages };
