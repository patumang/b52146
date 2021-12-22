const Sequelize = require("sequelize");
const db = require("../db");

const ConversationUser = db.define('conversation_user', {
  lastMessageRead: {
    type: Sequelize.INTEGER,
  }
});

module.exports = ConversationUser;