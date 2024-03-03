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
            type: "date",
            nullable: false,
        },
        sendingWallet: {
            type: "varchar",
            nullable: false,
        },
        receivingWallet: {
            type: "varchar",
            nullable: false,
        },
    },
})