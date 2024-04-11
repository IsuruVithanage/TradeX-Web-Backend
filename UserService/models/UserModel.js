const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "User",
    tableName: "user",
    columns: {
        userId: {
            primary: true,
            type: "int",
            generated: true,
        },
        userName: {
            type: "varchar",
            
        },
        Date: {
            type: "varchar",
            nullable:true
        },
        NIC: {
            type: "varchar",
            nullable:true
        },
        Contact: {
            type: "varchar",
            nullable:true
        },
        Age: {
            type: "int",
            nullable:true
        },
        Verified: {
            type: "varchar",
            nullable:true
        },
    },

})