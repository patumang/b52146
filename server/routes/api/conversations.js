const router = require("express").Router();
const { User, Conversation, Message, MessageRead } = require("../../db/models");
const { Op } = require("sequelize");
const onlineUsers = require("../../onlineUsers");

// get all conversations for a user, include latest message text for preview, and all messages
// include other user model so we have info on username/profile pic (don't include current user info)
router.get("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const userId = req.user.id;
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: {
          user1Id: userId,
          user2Id: userId,
        },
      },
      attributes: ["id"],
      order: [[Message, "createdAt", "DESC"]],
      include: [
        { model: Message },
        {
          model: User,
          as: "user1",
          where: {
            id: {
              [Op.not]: userId,
            },
          },
          attributes: ["id", "username", "photoUrl"],
          required: false,
        },
        {
          model: User,
          as: "user2",
          where: {
            id: {
              [Op.not]: userId,
            },
          },
          attributes: ["id", "username", "photoUrl"],
          required: false,
        },
        {
          model: MessageRead,
          as: "messageReadStatus",
          attributes: ["userId", "lastMessageRead"],
          required: false,
        },
      ],
    });

    for (let i = 0; i < conversations.length; i++) {
      const convo = conversations[i];
      const convoJSON = convo.toJSON();

      // set a property "otherUser" so that frontend will have easier access
      if (convoJSON.user1) {
        convoJSON.otherUser = convoJSON.user1;
        delete convoJSON.user1;
      } else if (convoJSON.user2) {
        convoJSON.otherUser = convoJSON.user2;
        delete convoJSON.user2;
      }

      // set property for online status of the other user
      if (onlineUsers.includes(convoJSON.otherUser.id)) {
        convoJSON.otherUser.online = true;
      } else {
        convoJSON.otherUser.online = false;
      }

      convoJSON.messageReadStatus = convoJSON.messageReadStatus.reduce((a, v) => ({ ...a, [v.userId]: v }), {});

      //count unread messages of otheruser by calculating sum of messages from latest until message match with last seen message
      let totalUnreads = 0;
      for (const message of convoJSON.messages) {
        if (message.senderId !== userId) {
          const currentUserReadStatus = convoJSON.messageReadStatus[userId];
          if (currentUserReadStatus && message.id === currentUserReadStatus.lastMessageRead) {
            break;
          }
          totalUnreads++;
        }
      }
      convoJSON.totalUnreads = totalUnreads;

      const otherUserReadStatus = convoJSON.messageReadStatus[convoJSON.otherUser.id];
      convoJSON.messageReadStatus = otherUserReadStatus ? otherUserReadStatus.lastMessageRead : "";

      // set properties for notification count and latest message preview
      convoJSON.latestMessageText = convoJSON.messages[0].text;

      convoJSON.messages.sort(function (a, b) {
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

      conversations[i] = convoJSON;
    }

    res.json(conversations);
  } catch (error) {
    next(error);
  }
});

router.put("/read_status", async (req, res, next) => {
  try {

    if (!req.user) {
      return res.sendStatus(401);
    }
    const userId = req.user.id;
    const { conversationId, messageId } = req.body;

    const conversation = await Conversation.findOne({
      where: {
        id: conversationId,
        [Op.or]: {
          user1Id: userId,
          user2Id: userId,
        }
      }
    });
    if (!conversation) {
      return res.sendStatus(403);
    }

    const messageRead = await MessageRead.update(
      { lastMessageRead: messageId },
      { where: { userId, conversationId } }
    );

    if (messageRead[0] > 0) {
      return res.sendStatus(204);
    }

    await MessageRead.create({ userId, conversationId, lastMessageRead: messageId });
    return res.sendStatus(204);

  } catch (error) {
    next(error);
  }
});

module.exports = router;