/* tslint:disable:max-line-length */
export enum Messages {
    ERROR = 'Algo ha ido mal, intentalo de nuevo porfavor',
    START = 'Bienvenido! Mi nombre es cloud bot y puedo ayudarte de muchas maneras, pero antes respondeme a una cosa, ¿Te conozco?',
    START_KNOWN_USER = 'En ese caso dime tu nombre porfavor',
    START_UNKNOWN_USER = 'Mi trabajo es ayudarte, puedo gestionar tus archivos de Dropbox o recordarte cosas para que no se te olviden, pero tengo que conocerte un poco antes, ¿Podrias decirme como quieres que te llame?',
    START_NAME_TAKEN = 'Ya conozco a un usuario con ese nombre, dime otro porfavor',
    START_ASK_PASSWORD = 'Necesito una contraseña que solo conozcamos tu y yo, para que asi pueda saber que eres tu realmente en un futuro, dime una contraseña porfavor',
    START_LOGIN_PASSWORD = 'Dime la contraseña que me dijiste cuando nos conocimos por primera vez',
    START_ASK_DROPBOX = 'Me facilitarias mucho mi trabajo si me proporcionaras una cuenta tuya de Dropbox, ¿Quieres vincular una cuenta de Dropbox?',
    START_ASK_DROPBOX_EMAIL = 'Dime el correo de tu cuenta',
    START_ASK_DROPBOX_PASSWORD = 'Dime la contraseña de tu cuenta, (no se la diré a nadie)',
    START_FINISHED = 'Todo listo entonces ! Utiliza el comando /help si necesitas mas información',
    START_UNKNOWN_NAME = 'No conozco a ningun usuario con ese nombre, prueba de nuevo',
    START_WRONG_PASSWORD = 'Contraseña incorrecta, prueba de nuevo',
    DONT_KNOW_YOU = 'Todavía no se quien eres, utiliza /start para que nos podamos conocer',
    TASK_LIST_NAME = '¿Como se va a llamar esa lista de tareas?',
    TASK_LIST_DONE = 'Lista creada correctamente',
    ADD_TASK = '¿En qué consiste la tarea?',
    TASK_LIST_UNDEFINED = 'No hay ninguna lista de tareas seleccionada',
    EMPTY_TASKS = 'No tienes ninguna lista actualmente, ¿Quieres crear una?',
    DONT_CREATE_TASKLIST = 'Para crear una mas adelante, puedes utilizar el comando /task',
    TASK_COMPLETED = 'Tarea completada'
}

export const HELP = `
    Lista de comandos disponibles:
     /start Cerrar sesión y empezar de nuevo
     /help  Mostrar ayuda e informacion disponible
     /me    Informacion sobre el usuario conectado

    Por el momento, solo puedo guardarte lista de tareas para que puedas organizarte mejor, pero proximamente podre ayudarte a subir y descargar archivos de Dropbox

     `;
