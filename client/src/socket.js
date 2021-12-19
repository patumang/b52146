import io from "socket.io-client";
import store from "./store";
import {
  setNewMessage,
  removeOfflineUser,
  addOnlineUser,
  updateMessageSeen,
} from "./store/conversations";
import { compareActiveConversation } from "./store/utils/thunkCreators";

const socket = io(window.location.origin);

socket.on("connect", () => {
  console.log("connected to server");

  socket.on("add-online-user", (id) => {
    store.dispatch(addOnlineUser(id));
  });

  socket.on("remove-offline-user", (id) => {
    store.dispatch(removeOfflineUser(id));
  });
  socket.on("new-message", (data) => {
    const { activeConversation, conversations } = store.getState();
    store.dispatch(setNewMessage(data.message, data.sender, activeConversation || "None"));
    compareActiveConversation({ ...data, activeConversation, conversations });
  });

  socket.on("message-seen", (data) => {
    store.dispatch(updateMessageSeen(data.message));
  });
});

export default socket;
