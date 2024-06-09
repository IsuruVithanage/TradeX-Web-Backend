const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "SeedPhrase",
    tableName: "seedphrase",
    columns: {

        id: {
            primary: true,
            type: "int",
            nullable: false,
            generated: true,
        },
        userId: {
            primary: true,
            type: "int",
            nullable: false,
        },
        seedphrase: {
            type: "varchar",
            nullable: false,
        },
        
    },
})