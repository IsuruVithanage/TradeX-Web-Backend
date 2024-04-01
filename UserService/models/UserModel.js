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
    },

    relations: {
        Issue: {
            type: "one-to-many",
            target: "Issue", // Name of the Issue entity
            inverseSide: "user" // Name of the property in the Issue entity that maps back to User
        }
    }
})