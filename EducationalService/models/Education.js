const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "EduResources",
    tableName: "eduResources",
    columns: {
        EduId: {
            primary: true,
            type: "int",
            generated: true,
        },
        title: {
            type: "varchar",
        },
        author: {
            type: "varchar",
        },
    },
})