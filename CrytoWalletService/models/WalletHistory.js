const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "WalletHistory",
    tableName: "walletHistory",
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
        type: {
            type: "varchar",
            length: 10,
            nullable: true,
        },
        quantity: {
            type: "float",
            nullable: false,
        },
        date: {
            type: "varchar",
            length: 10,
            nullable: false,
        },
        from_to: {
            type: "varchar",
            length: 15,
            nullable: true,
        },
       
    },
})