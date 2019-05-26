"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable:max-line-length */
var Messages;
(function (Messages) {
    Messages["START"] = "Bienvenido! Mi nombre es cloud bot y puedo ayudarte de muchas maneras, pero antes respondeme a una cosa, \u00BFTe conozco?";
    Messages["START_KNOWN_USER"] = "En ese caso dime tu nombre porfavor";
    Messages["START_UNKNOWN_USER"] = "Mi trabajo es ayudarte, puedo gestionar tus archivos de Dropbox o recordarte cosas para que no se te olviden, pero tengo que conocerte un poco antes, \u00BFPodrias decirme como quieres que te llame?";
    Messages["START_NAME_TAKEN"] = "Ya conozco a un usuario con ese nombre, dime otro porfavor";
    Messages["START_ASK_PASSWORD"] = "Necesito una contrase\u00F1a que solo conozcamos tu y yo, para que asi pueda saber que eres tu realmente en un futuro, dime una contrase\u00F1a porfavor";
    Messages["START_LOGIN_PASSWORD"] = "Dime la contrase\u00F1a que me dijiste cuando nos conocimos por primera vez";
    Messages["START_ASK_DROPBOX"] = "Me facilitarias mucho mi trabajo si me proporcionaras una cuenta tuya de Dropbox, \u00BFQuieres vincular una cuenta de Dropbox?";
    Messages["START_ASK_DROPBOX_EMAIL"] = "Dime el correo de tu cuenta";
    Messages["START_ASK_DROPBOX_PASSWORD"] = "Dime la contrase\u00F1a de tu cuenta, (no se la dir\u00E9 a nadie)";
    Messages["START_FINISHED"] = "Todo listo entonces ! Utiliza el comando /help si necesitas mas informaci\u00F3n";
    Messages["START_UNKNOWN_NAME"] = "No conozco a ningun usuario con ese nombre, prueba de nuevo";
    Messages["START_WRONG_PASSWORD"] = "Contrase\u00F1a incorrecta, prueba de nuevo";
})(Messages = exports.Messages || (exports.Messages = {}));
exports.HELP = `
    Lista de comandos disponibles:
     /start Cerrar sesión y empezar de nuevo
     /help  Mostrar ayuda e informacion disponible
     /me    Informacion sobre el usuario conectado

    Por el momento, solo puedo guardarte lista de tareas para que puedas organizarte mejor, pero proximamente podre ayudarte a subir y descargar archivos de Dropbox

     `;
//# sourceMappingURL=messages.js.map