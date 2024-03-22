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
        coin: {
            type: "varchar",
        },
        price: {
            type: "varchar",
        },
        quantity: {
            type: "varchar",
        },
        totalPrice: {
            type: "varchar",
        },
    },
})