export const addMessageToStore = (state, payload) => {
  const { message, sender, recipient } = payload;
  // if sender isn't null, that means the message needs to be put in a brand new convo
  if (sender !== null) {
    //remove fakeconversation if already exist for the current sender
    const newState = state.filter((convo) => convo.otherUser.id !== sender.id);
    const newConvo = {
      id: message.conversationId,
      otherUser: sender,
      messages: [message],
      unreads: recipient ? 1 : 0
    };
    newConvo.latestMessageText = message.text;
    return [newConvo, ...newState];
  }

  return state.map((convo) => {
    if (convo.id === message.conversationId) {
      const convoCopy = { ...convo };
      convoCopy.messages = [...convoCopy.messages, message ];
      convoCopy.latestMessageText = message.text;
      if (recipient) {
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

export const addNewConvoToStore = (state, recipientId, message) => {
  return state.map((convo) => {
    if (convo.otherUser.id === recipientId) {
      const convoCopy = { ...convo };
      convoCopy.id = message.conversationId;
      convoCopy.messages = [...convoCopy.messages, message];
      convoCopy.latestMessageText = message.text;
      convoCopy.unreads = 0;
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