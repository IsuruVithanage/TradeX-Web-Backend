const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "Watchlist",
    tableName: "Watchlist",
    columns: {
        coinId: {
            primary: true,
            type: "int",
            generated: true,
        },
        coinName: {
            type: "varchar",
        },
    },
})