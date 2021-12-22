const Sequelize = require("sequelize");
const db = require("../db");

const MessageRead = db.define('message_read', {
  lastMessageRead: {
    type: Sequelize.INTEGER,
    allowNull: false,
  }
});

module.exports = MessageRead;