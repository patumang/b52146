const Conversation = require("./conversation");
const User = require("./user");
const Message = require("./message");
const MessageRead = require("./messageRead");

// associations

User.hasMany(Conversation);
Conversation.belongsTo(User, { as: "user1" });
Conversation.belongsTo(User, { as: "user2" });
Message.belongsTo(Conversation);
Conversation.hasMany(Message);
MessageRead.belongsTo(User);
User.hasMany(MessageRead);
MessageRead.belongsTo(Conversation);
Conversation.hasMany(MessageRead, { as: "messageReadStatus" });

module.exports = {
  User,
  Conversation,
  Message,
  MessageRead
};
