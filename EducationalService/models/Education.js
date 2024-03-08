const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "Education",
    tableName: "Education",
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