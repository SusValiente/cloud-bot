/* tslint:disable:max-line-length */
export enum Messages {
    ERROR = 'Algo ha ido mal, intentalo de nuevo porfavor',
    START = 'Bienvenido! Mi nombre es cloud bot y puedo ayudarte de muchas maneras, pero antes respondeme a una cosa, ¿Te conozco?',
    START_KNOWN_USER = 'Dime tu nombre de usuario',
    START_UNKNOWN_USER = 'Mi trabajo es ayudarte, puedo gestionar tus archivos de Dropbox o recordarte cosas para que no se te olviden, pero tengo que conocerte un poco antes, ¿Podrias decirme como quieres que te llame?',
    START_NAME_TAKEN = 'Ya conozco a un usuario con ese nombre, dime otro porfavor',
    START_ASK_PASSWORD = 'Necesito una contraseña que solo conozcamos tu y yo, para que asi pueda saber que eres tu realmente en un futuro, dime una contraseña porfavor',
    START_LOGIN_PASSWORD = 'Dime la contraseña que me dijiste cuando nos conocimos por primera vez',
    START_ASK_DROPBOX = 'Mi principal funcionalidad requiere que me vincules con tu cuenta de Dropbox, ¿Estas deacuerdo?',
    START_FINISHED = 'Todo listo ! Para empezar a subir archivos a Dropbox mandamelos en cualquier momento y los subiré por ti. Si necesitas ayuda puedes usar el comando /help',
    START_UNKNOWN_NAME = 'No conozco a ningun usuario con ese nombre, prueba de nuevo',
    START_WRONG_PASSWORD = 'Contraseña incorrecta, prueba de nuevo',
    DONT_KNOW_YOU = 'Me temo que no se quien eres, utiliza /start para que pueda recordarte',
    NO_DROPBOX = 'Para trabajar con archivos necesito antes que me des acceso a tu cuenta de Dropbox',
    TASK_LIST_NAME = '¿Como se va a llamar esa lista de tareas?',
    TASK_LIST_DONE = 'Hecho',
    ADD_TASK = '¿En qué consiste la tarea?',
    TASK_LIST_UNDEFINED = 'No hay ninguna lista de tareas seleccionada',
    EMPTY_TASKS = 'No tienes ninguna lista actualmente, ¿Quieres crear una?',
    DONT_CREATE_TASKLIST = 'Para crear una mas adelante, puedes utilizar el comando /task',
    TASK_COMPLETED = 'Tarea completada',
    EMPTY_TASK_LIST = 'La lista no contiene ninguna tarea actuamente, ¿Quieres añadirle una?',
    REGISTERED_COMPLETE = 'Perfecto, te he registrado correctamente',
    USERNAME_TOO_SHORT = 'Tu nombre de usuario debe contener al menos cuatro caracteres, prueba de nuevo',
    PASSWORD_TOO_SHORT = 'Tu contraseña debe contener al menos ocho caracteres, prueba de nuevo',
    UPLOAD_PHOTO_SUCCESS = 'Imagen subida correctamente',
    UNVALID_PHOTO = 'Parece que no puedo trabajar con esa imagen, prueba con otra diferente',
}

export const HELP = `


    Lista de comandos disponibles:
     /start Cerrar sesión y empezar de nuevo
     /help  Mostrar ayuda e informacion disponible
     /me    Informacion sobre el usuario conectado
     `;
