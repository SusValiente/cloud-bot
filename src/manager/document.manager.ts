/**
 * Class representing Document Manager
 *
 * @export
 * @class DocumentManager
 */
export class DocumentManager {
    public static async manageDocument(context: any): Promise<void> {
        await context.sendMessage('Ey, esto es un documento amigo');
        return Promise.resolve();
    }
}
