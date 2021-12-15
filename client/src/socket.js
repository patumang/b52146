import io from "socket.io-client";
import store from "./store";
import {
  setNewMessage,
  removeOfflineUser,
  addOnlineUser,
  addConversation
} from "./store/conversations";

import { resetDBUnreads } from "./store/helpers";

const socket = io(window.location.origin);

socket.on("connect", () => {
  console.log("connected to server");

  socket.on("add-online-user", (id) => {
    store.dispatch(addOnlineUser(id));
  });

  socket.on("remove-offline-user", (id) => {
    store.dispatch(removeOfflineUser(id));
  });
  socket.on("new-message", async (data) => {
    const {activeConversation} = store.getState();
    const conversationId = data.message.conversationId;
    if (activeConversation && conversationId) {
      await resetDBUnreads(conversationId)
    }
    if (data.isNewConversation) {
      store.dispatch(addConversation(data.sender.id, data.message, data.sender, activeConversation || "None"));
    } else {
      store.dispatch(setNewMessage(data.message, activeConversation || "None"));
    }
  });
});

export default socket;
