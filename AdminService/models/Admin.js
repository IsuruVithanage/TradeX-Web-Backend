const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "Admin",
    tableName: "admin",
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
        NIC: {
            type: "varchar",
        },
        Contact: {
            type: "varchar",
        },
        role: {
            type: "varchar",
        },
    },
})