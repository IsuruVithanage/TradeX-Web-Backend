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
        Verified: {
            type: "varchar",
        },
    }
})