export const addMessageToStore = (state, payload) => {
  const { message, currentConversation } = payload;

  return state.map((convo) => {
    if (convo.id === message.conversationId) {
      const convoCopy = { ...convo };
      convoCopy.messages = [...convoCopy.messages, message ];
      convoCopy.latestMessageText = message.text;
      if (currentConversation && 
          (currentConversation === "None" || convoCopy.otherUser.username !== currentConversation)
      ) {
        convoCopy.unreads = convoCopy.unreads + 1;
      }
      return convoCopy;
    } else {
      return convo;
    }
  });
  
};

export const addOnlineUserToStore = (state, id) => {
  return state.map((convo) => {
    if (convo.otherUser.id === id) {
      const convoCopy = { ...convo };
      convoCopy.otherUser = { ...convoCopy.otherUser, online: true };
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const removeOfflineUserFromStore = (state, id) => {
  return state.map((convo) => {
    if (convo.otherUser.id === id) {
      const convoCopy = { ...convo };
      convoCopy.otherUser = { ...convoCopy.otherUser, online: false };
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const addSearchedUsersToStore = (state, users) => {
  const currentUsers = {};

  // make table of current users so we can lookup faster
  state.forEach((convo) => {
    currentUsers[convo.otherUser.id] = true;
  });

  const newState = [...state];
  users.forEach((user) => {
    // only create a fake convo if we don't already have a convo with this user
    if (!currentUsers[user.id]) {
      let fakeConvo = { otherUser: user, messages: [] };
      newState.push(fakeConvo);
    }
  });
  return newState;
};

export const addNewConvoToStore = (state, payload) => {
  const { recipientId, newMessage, sender, currentConversation } = payload;

  if(sender) {
    const isFakeConvoExist = state.some((convo) => { return (convo.otherUser.id === sender.id); });
    if(!isFakeConvoExist) {
      const newConvo = {
        id: newMessage.conversationId,
        otherUser: sender,
        messages: [newMessage],
        unreads: currentConversation ? 1 : 0
      };
      newConvo.latestMessageText = newMessage.text;
      return [newConvo, ...state];
    }
  }

  return state.map((convo) => {
    if (convo.otherUser.id === recipientId) {
      const convoCopy = { ...convo };
      convoCopy.id = newMessage.conversationId;
      convoCopy.messages = [...convoCopy.messages, newMessage];
      convoCopy.latestMessageText = newMessage.text;
      convoCopy.unreads = currentConversation &&
        (currentConversation === "None" || convoCopy.otherUser.username !== currentConversation) ? 1 : 0;
      return convoCopy;
    } else {
      return convo;
    }
  });

};

export const updateUnreadsToStore = (state, conversation) => {
  return state.map((convo) => {
    if (convo.id === conversation.id) {
      const convoCopy = { ...convo };
      convoCopy.unreads = 0;
      return convoCopy;
    } else {
      return convo;
    }
  });
};