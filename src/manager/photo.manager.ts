import { DropboxUtils } from '../dropboxUtils';
import * as _ from 'lodash';

/**
 * Class representing Photo Manager
 *
 * @export
 * @class PhotoManager
 */
export class PhotoManager {
    public static async managePhoto(context: any, dbx: DropboxUtils, client: any): Promise<void> {
        if (_.isNil(context.state.user)) {
            await context.sendMessage('no estas conectado pedazo de subnormal, utiliza antes /start');
            return Promise.resolve();
        }

        const dbxToken = context.state.user.dropboxToken;

        if (_.isNil(dbxToken)) {
            await context.sendMessage('No tienes vinculada ninguna cuenta de dropbox subnormal, vincula una antes');
            return Promise.resolve();
        }

        /**
         * Pasos a seguir para subir un archivo a dropbox . .
         *
         * 1 - Cuando le pase la imagen desde telegram, debo conseguir el file_id
         *     para llamar a la api de telegram "GET FILE" y asi conseguir el path de ese archivo
         *
         * 2 - Una vez conseguido el path del archivo debemos montar el enlace de descarga
         *     para poder mandarselo a la peticion de subida de dropbox save_url, mirar ejemplo
         *     "Download file"
         *
         * 3 - Una vez montado el enlace de descarga del archivo llamar a "Upload file by URL" de
         *     dropbox, y el archivo será mandado
         *
         * Sera necesario (seguramente) implementar esas llamadas a las APIs
         * para ello creo que typescript tiene como nativo algo llamado fetch
         *
         */
        const photo = await client.getFile(context.event.photo[2].file_id);
        await dbx.uploadFileByUrl(photo.file_path);
        await context.sendMessage('Foto subida correctamente');
        return Promise.resolve();
    }
}
