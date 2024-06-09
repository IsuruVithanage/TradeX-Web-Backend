const EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "Forum-addlikes",
  tableName: "forum-addlikes",
  columns: {
    questionId: {
      primary: true,
      type: "int",
    },
    userId: {
      type: "int",
    },
  },
});
