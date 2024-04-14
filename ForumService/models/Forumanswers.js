const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "Forum-answers",
    tableName: "forum-answers",
    columns: {
        answerId: {
            primary: true,
            type: "int",
            generated: true,
        },
        questionId: {
            type: "int",

        },
        username: {
            type:"varchar",
        },
        userId: {
            type: "int",
        },
        comment: {
            type: "varchar",
        },
        likes: {
            type: "int",
        },

    },
})