/* tslint:disable:max-line-length */
export enum Messages {
    ERROR = 'Algo ha ido mal, intentalo de nuevo porfavor',
    START_KNOWN_USER = 'En ese caso dime como te llamas',
    START_UNKNOWN_USER = 'En ese caso primero tengo que conocerte un poco, dime ¿como te llamas?',
    START_NAME_TAKEN = 'Ya conozco a un usuario con ese nombre, dime otro porfavor',
    START_ASK_PASSWORD = 'Necesito una contraseña que solo conozcamos tu y yo, para que asi pueda saber que eres tu realmente en un futuro, dime una contraseña porfavor',
    START_LOGIN_PASSWORD = 'Ahora necesito que me digas tu contraseña para validar que eres quien dices ser',
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
    USERNAME_TOO_SHORT = 'Tu nombre de usuario debe contener al menos cuatro caracteres, todos ellos alfanuméricos, prueba de nuevo',
    PASSWORD_TOO_SHORT = 'Tu contraseña debe contener al menos ocho caracteres, todos ellos alfanuméricos, prueba de nuevo',
    UPLOAD_PHOTO_SUCCESS = 'Imagen subida correctamente',
    UNVALID_PHOTO = 'Parece que no puedo trabajar con esa imagen, prueba con otra diferente',
    UNLINKED_DROPBOX = 'Dropbox desvinculado con exito',
    CHANGE_USERNAME = '¿Cual es el nuevo nombre de usuario?',
    CHANGE_PASSWORD = '¿Cual será tu nueva contraseña?',
    CHANGE_USERNAME_SUCCESS = 'Hecho! De ahora en adelante te conoceré como ',
    CHANGE_PASSWORD_SUCCESS = 'Contraseña cambiada con éxito',
    VALIDATE_CHANGE_PASSWORD = 'Introduce primero tu actual contraseña',
    LOGOUT = 'Hasta luego!'
}

export const START = `
    Hola ! Mi nombre es Cloud Bot, soy una inteligencia artificial programada para ayudarte a subir archivos a tu cuenta de Dropbox de una manera cómoda y sencilla.

También puedo ayudarte a recordar tareas o cualquier cosa que quieras recordar y no perder en un futuro, para ello puedes crear listas de tareas utilizando el comando /task.

Por favor no olvides que todavía sigo en desarrollo y que todavía sigo aprendiendo, así que si notas por cualquier cosa que no estoy funcionando correctamente, no dudes en utilizar el comando /start para reiniciarme y así poder volver a la normalidad.

Y para cualquier duda que tengas sobre mi funcionamiento, puedes consultar la ayuda desde /help.

Para comenzar tengo que preguntarte una cosa ¿Es tu primera vez aqui?
`;

export const HELP = `
    Hola ! Mi nombre es Cloud Bot, soy una inteligencia artificial programada para ayudarte a subir archivos a tu cuenta de Dropbox de una manera cómoda y sencilla. Para ello, lo único que tienes que hacer es vincular una cuenta existente de Dropbox (si no lo has hecho ya) con el comando /settings, y a continuación pulsando en "Ajustes de Dropbox".

Una vez tengas vinculada una cuenta podrás mandarme cualquier archivo que ya me encargaré yo de subirlos a tu cuenta.

También puedo ayudarte a recordar tareas o cualquier cosa que quieras recordar y no perder en un futuro, para ello puedes crear listas de tareas utilizando el comando /task.

Por favor no olvides que todavía sigo en desarrollo y que todavía sigo aprendiendo, así que si notas por cualquier cosa que no estoy funcionando correctamente, por favor utiliza el comando /start para reiniciarme y así poder volver a la normalidad.

Muchas gracias por usar mis servicios!

    Lista de comandos disponibles:
     /start Reiniciar bot
     /help  Mostrar ayuda y comandos disponibles
     /settings Mostrar ajustes de usuario
     /task Abrir el gestor de tareas
     /me    Informacion sobre el usuario conectado
     /testing (Solo para el programador) NO TOCAR O ME ENFADO !
     `;
