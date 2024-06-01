const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "News",
    tableName: "news",
    columns: {
        newsId: {
            type: "int",
            generated: true,
            primary: true,
            nullable: false
        },
        url: {
            type: "varchar",
            length: 255,
            nullable: false
        },
        image: {
            type: "varchar",
            length: 255,
            nullable: true
        },
        title: {
            type: "varchar",
            nullable: false
        },
        description: {
            type: "varchar",
            nullable: true
        },
        latest: {
            type: "boolean",
            nullable: false,
            default: true
        },
       
        favourite:{
            type: "boolean",
            nullable: false,
            default: false
        },
        
        
    },
})