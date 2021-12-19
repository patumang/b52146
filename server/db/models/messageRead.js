const Sequelize = require("sequelize");
const db = require("../db");

const MessageRead = db.define('message_read', {
  lastMessageRead: {
    type: Sequelize.INTEGER,
    allowNull: false,
  }
});

MessageRead.findMessageRead = async function (userId, conversationId) {
  const messageRead = await MessageRead.findOne({
    where: { userId, conversationId }
  });

  return messageRead;
};

module.exports = MessageRead;