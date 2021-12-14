const router = require("express").Router();
const { Conversation, Message } = require("../../db/models");
const onlineUsers = require("../../onlineUsers");

// expects {recipientId, text, conversationId } in body (conversationId will be null if no conversation exists yet)
router.post("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const senderId = req.user.id;
    const { recipientId, text, conversationId, sender } = req.body;

    // if we don't have conversation id, find a conversation to make sure it doesn't already exist
    let conversation = await Conversation.findConversation(
      senderId,
      recipientId
    );

    // if we already know conversation id, we can save time and just add it to message and return
    if (conversationId) {
      await Conversation.update(
        { unreads: conversation.unreads + 1 },
        { where: { id: conversation.id } }
      );
      const message = await Message.create({ senderId, text, conversationId });
      return res.json({ message, sender });
    }
    /* // if we don't have conversation id, find a conversation to make sure it doesn't already exist
    let conversation = await Conversation.findConversation(
      senderId,
      recipientId
    ); */

    if (!conversation) {
      // create conversation
      conversation = await Conversation.create({
        user1Id: senderId,
        user2Id: recipientId,
        unreads: 1,
      });
      if (onlineUsers.includes(sender.id)) {
        sender.online = true;
      }
    } else {
      await Conversation.update(
        { unreads: conversation.unreads + 1 },
        { where: { id: conversation.id} }
      );
    }
    const message = await Message.create({
      senderId,
      text,
      conversationId: conversation.id,
    });
    res.json({ message, sender });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
