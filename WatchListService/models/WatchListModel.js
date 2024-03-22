const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "watchlist",
    tableName: "watchlist",
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