const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "WalletAddress",
    tableName: "walletAddress",
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