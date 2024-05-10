const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "TransactionHistory",
    tableName: "transactionHistory",
    columns: {
        historyId: {
            primary: true,
            type: "int",
            generated: true,
        },
        userId: {
            type: "int",
            nullable: false,
        },
        coin: {
            type: "varchar",
            length: 10,
            nullable: false,
        },
        quantity: {
            type: "float",
            nullable: false,
        },
        date: {
            type: "timestamp with time zone",
            nullable: false,
        },
        sendingWallet: {
            type: "varchar",
            length: 25,
            nullable: false,
        },
        receivingWallet: {
            type: "varchar",
            length: 25,
            nullable: false,
        },
    },
})