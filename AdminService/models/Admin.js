const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "Admin",
    tableName: "Admin",
    columns: {
        AdminId: {
            primary: true,
            type: "int",
            generated: true,
        },
        AdminName: {
            type: "varchar",
        },
        email: {
            type: "varchar",
        },
        password: {
            type: "varchar",
        },
        contact: {
            type: "varchar",
        },
    },
})