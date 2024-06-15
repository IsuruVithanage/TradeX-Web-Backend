const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "Issue",
    tableName: "Issue",
    columns: {
        issueId: {
            type: "int",
            primary: true,
            generated: true
        },
        issueName: {
            type: "varchar",
        },
        
    },
})