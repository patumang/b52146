export const getLastSeenMessage = (conversation) => {
  let lastSeenMessage;
  const totalMsgsInConvo = conversation.messages ? conversation.messages.length : 0;
  if (totalMsgsInConvo > 0) {
    let index = totalMsgsInConvo - 1;
    while (index >= 0) {
      if (conversation.messages[index].senderId === conversation.otherUser.id) {
        lastSeenMessage = conversation.messages[index];
        break;
      }
      index--;
    }
  }
  return lastSeenMessage;
};