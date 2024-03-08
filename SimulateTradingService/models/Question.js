const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "Question",
    tableName: "question",
    columns: {
        questionId: {
            primary: true,
            type: "int",
            generated: true,
        },
        question: {
            type: "varchar",
        },
        answer1: {
            type: "varchar",
        },
        answer2: {
            type: "varchar",
        },
        answer3: {
            type: "varchar",
        },
        answer4: {
            type: "varchar",
        },
        correct_answer: {
            type: "int",
        },
    },
})