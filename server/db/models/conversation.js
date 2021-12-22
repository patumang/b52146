const Sequelize = require("sequelize");
const db = require("../db");

const Conversation = db.define("conversation", {
  isGroup: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  }
});

module.exports = Conversation;
