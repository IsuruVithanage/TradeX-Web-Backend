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
        Date: {
            type: "varchar",
        },
        NIC: {
            type: "varchar",
        },
        Contact: {
            type: "varchar",
        },
        Age: {
            type: "int",
        },
    },
})