const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "Order",
    tableName: "order",
    columns: {
        orderId: {
            primary: true,
            type: "int",
            generated: true,
        },
        userId: {
            type: "int",
        },
        type: {
            type: "varchar",
        },
        date: {
            type: "varchar",
            nullable: true
        },
        coin: {
            type: "varchar",
        },
        price: {
            type: "float",
        },
        quantity: {
            type: "float",
        },
        totalPrice: {
            type: "float",
        },
    },
})