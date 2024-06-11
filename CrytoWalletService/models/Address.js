const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "Address",
    tableName: "address",
    columns: {
        userId: {
            primary: true,
            type: "int",
            nullable: false,
        },
        walletAddress: {
            type: "varchar",
            length: 65,
            nullable: false,
        },
    },
})