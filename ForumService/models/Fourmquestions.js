const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "Forum-question",
    tableName: "forum-question",
    columns: {
        userId: {
            primary: true,
            type: "int",
            generated: true,
        },
        title: {
            type: "varchar",
        },
        description: {
            type: "varchar",
        },
        views: {
            type: "int",
        },
        likes: {
            type: "int",
        },
        replies: {
            type: "int",
        },

    },
})