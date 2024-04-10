const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "UserDetail",
    tableName: "userdetail",
    columns: {
        userId: {
            type: "int",
            nullable: false,
            generated: true,
        },
        userName: {
            primary: true,
            type: "varchar",
            length: 15,
            nullable: false,
        },
        password: {
            type: "varchar",
            length:100,
            nullable: false,
        },
      
    },
})