const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "Asset",
    tableName: "asset",
    columns: {
        assetId: {
            primary: true,
            type: "int",
            generated: true,
        },
        userId: {
            type: "int",
            nullable: false,
        },
        symbol: {
            type: "varchar",
            length: 10,
            nullable: false,
        },
        tradingBalance: {
            type: "float",
            nullable: true,
        },
        holdingBalance: {
            type: "float",
            nullable: true,
        },
        fundingBalance: {
            type: "float",
            nullable: true,
        },
        AvgPurchasePrice: {
            type: "float",
            nullable: false,
        },
    },
})