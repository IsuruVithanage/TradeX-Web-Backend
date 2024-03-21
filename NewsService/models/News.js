const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "News",
    tableName: "news",
    columns: {
        title: {
            primary: true,
            type: "varchar",
            length: 100,
            nullable: false
        },
        like: {
            type: "int",
            array: true
        },
        dislike: {
            type: "int",
            array: true
        },
        favorite:{
            type: "int",
            array: true
        }
        
    },
})