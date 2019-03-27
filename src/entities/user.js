const EntitySchema = require('typeorm').EntitySchema;

module.exports = new EntitySchema({
    name: 'User',
    target: 'User',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true
        },
        username: {
            type: 'varchar'
        },
        password: {
            type: 'varchar'
        }
    }
});