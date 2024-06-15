const EntitySchema = require("typeorm").EntitySchema;

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
      nullable: true,
    },
    email: {
      type: "varchar",
      nullable: true,
    },
    password: {
      type: "varchar",
    },
    isVerified: {
      type: "varchar",
    },
    issueId: {
      type: "int",
      nullable: true
    },
    hasTakenQuiz: {
      type: "boolean",
    },
    level: {
      type: "varchar",
    },
    role: {
      type: "varchar",
    },
  },

  relations: {
    user_verification_detail: {
      type: "one-to-one",
      target: "UserVerificationDetail",
      joinColumn: {name: "userId"}
    },
    Issue: {
      type: "many-to-one",
      target: "Issue",
      joinColumn: { name: "issueId"}
    }
  }
});

