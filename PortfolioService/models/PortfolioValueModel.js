const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "PortfolioValue",
    tableName: "portfolioValue",
    columns: {
        userId: {
            primary: true,
            type: "int",
            nullable: false,
        },
        timePeriod: {
            primary: true,
            type: "varchar",
            length: 10,
            nullable: false,
        },
        recordNo: {
            primary: true,
            type: "int",
        },
        time: {
            type: "timestamp",
            nullable: true,
        },
        value: {
            type: "float",
            nullable: false,
        },
    },
})