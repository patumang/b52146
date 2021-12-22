const Conversation = require("./conversation");
const User = require("./user");
const Message = require("./message");
const ConversationUser = require("./conversationUser");
const Group = require("./group");

// associations

Conversation.hasOne(Group);
Message.belongsTo(Conversation);
Conversation.hasMany(Message);
ConversationUser.belongsTo(User);
User.hasMany(ConversationUser);
ConversationUser.belongsTo(Conversation);
Conversation.hasMany(ConversationUser, { as: "conversationUsers" });

module.exports = {
  User,
  Conversation,
  Message,
  ConversationUser,
  Group
};
