// - - - - - - - - - -  Initial messages - - - - - - - - - - - - - 
const startCommandMessage = 'Bienvenido ! Mi nombre es cloud-bot y estoy aquí para ayudarte';
// - - - - - - - - - -  Register messages - - - - - - - - - - - - - 

const regAskName = 'Dime tu nombre';
const regAskPassword = 'Dime tu contraseña';

// - - - - - - - - - -  Help messages - - - - - - - - - - - - - 

const helpCommandMessage = `
/reiniciar   Reiniciar el bot
/registro    Registrarse en la base de datos
/ayuda       Lista de comandos en <command>`;

module.exports = { regAskName, regAskPassword, startCommandMessage, helpCommandMessage };
