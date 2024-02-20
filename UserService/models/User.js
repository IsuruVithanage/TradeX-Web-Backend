const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "User",
    tableName: "user",
    columns: {
        userId: {
            primary: true,
            type: "int",
            generated: true,
        },
        userName: {
            type: "varchar",
        },
        email: {
            type: "varchar",
        },
        password: {
            type: "varchar",
        },
    },
})