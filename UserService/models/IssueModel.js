const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "Issue",
    tableName: "Issue",
    columns: {
        IssueId: {
            type: "varchar",
            primary: true,
        },
        IssueName: {
            type: "varchar",
        },
        
    },

    relations: {
        user: {
            type: "many-to-one",
            target: "user",
            inverseSide: "Issue"
        }
    }
})