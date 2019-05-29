"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialState = {
    data: {
        userId: null,
        username: null,
        password: null,
        dropboxEmail: null,
        dropboxPassword: null,
    },
    currentStatus: {
        dropboxActive: null,
        insertingUsername: false,
        insertingPassword: false,
        insertingDropboxEmail: false,
        insertingDropboxPassword: false,
        registering: false,
        logging: false,
        creatingTaskList: false,
    },
    auxData: {
        taskListName: null,
    },
};
//# sourceMappingURL=states.js.map