import axios from "axios";
import socket from "../../socket";
import {
  gotConversations,
  addConversation,
  setNewMessage,
  setSearchedUsers,
  updateUnreads
} from "../conversations";
import { gotUser, setFetchingStatus } from "../user";
import { setActiveChat } from "../activeConversation";
import { getLastSeenMessage } from "../helpers";

axios.interceptors.request.use(async function (config) {
  const token = await localStorage.getItem("messenger-token");
  config.headers["x-access-token"] = token;

  return config;
});

// USER THUNK CREATORS

export const fetchUser = () => async (dispatch) => {
  dispatch(setFetchingStatus(true));
  try {
    const { data } = await axios.get("/auth/user");
    dispatch(gotUser(data));
    if (data.id) {
      socket.emit("go-online", data.id);
    }
  } catch (error) {
    console.error(error);
  } finally {
    dispatch(setFetchingStatus(false));
  }
};

export const register = (credentials) => async (dispatch) => {
  try {
    const { data } = await axios.post("/auth/register", credentials);
    await localStorage.setItem("messenger-token", data.token);
    dispatch(gotUser(data));
    socket.emit("go-online", data.id);
  } catch (error) {
    console.error(error);
    dispatch(gotUser({ error: error.response.data.error || "Server Error" }));
  }
};

export const login = (credentials) => async (dispatch) => {
  try {
    const { data } = await axios.post("/auth/login", credentials);
    await localStorage.setItem("messenger-token", data.token);
    dispatch(gotUser(data));
    socket.emit("go-online", data.id);
  } catch (error) {
    console.error(error);
    dispatch(gotUser({ error: error.response.data.error || "Server Error" }));
  }
};

export const logout = (id) => async (dispatch) => {
  try {
    await axios.delete("/auth/logout");
    await localStorage.removeItem("messenger-token");
    dispatch(gotUser({}));
    socket.emit("logout", id);
  } catch (error) {
    console.error(error);
  }
};

// CONVERSATIONS THUNK CREATORS

export const fetchConversations = () => async (dispatch) => {
  try {
    const { data } = await axios.get("/api/conversations");
    dispatch(gotConversations(data));
  } catch (error) {
    console.error(error);
  }
};

const saveMessage = async (body) => {
  const { data } = await axios.post("/api/messages", body);
  return data;
};

const sendMessage = (data, body) => {
  socket.emit("new-message", {
    message: data.message,
    recipientId: body.recipientId,
    sender: data.sender,
  });
};

// message format to send: {recipientId, text, conversationId}
// conversationId will be set to null if its a brand new conversation
export const postMessage = (body) => async (dispatch) => {
  try {
    const data = await saveMessage(body);
    if (!body.conversationId) {
      dispatch(addConversation(body.recipientId, data.message));
    } else {
      dispatch(setNewMessage(data.message));
    }
    sendMessage(data, body);
  } catch (error) {
    console.error(error);
  }
};

export const searchUsers = (searchTerm) => async (dispatch) => {
  try {
    const { data } = await axios.get(`/api/users/${searchTerm}`);
    dispatch(setSearchedUsers(data));
  } catch (error) {
    console.error(error);
  }
};

const updateReadStatus = async (inputData) => {
  await axios.put("/api/conversations/read_status", inputData);
};

const sendReadStatus = (message) => {
  socket.emit("message-seen", { message });
};

export const loadActiveChat = (conversation) => async (dispatch) => {
  try {
    if (conversation.totalUnreads > 0) {
      dispatch(updateUnreads(conversation));
    }
    dispatch(setActiveChat(conversation.otherUser.username));

    const lastSeenMessage = getLastSeenMessage(conversation);
    if (lastSeenMessage) {
      await updateReadStatus({ conversationId: conversation.id, messageId: lastSeenMessage.id });
      sendReadStatus(lastSeenMessage);
    }
  } catch (error) {
    console.error(error);
  }
};

export const checkActiveConversation = async (data) => {
  const { message, sender, activeConversation, conversations } = data;
  if (activeConversation) {
    if (sender && sender.username === activeConversation) {
      await updateReadStatus({ conversationId: message.conversationId, messageId: message.id });
      sendReadStatus(message);
    } else {
      const isMessageSeen = conversations.some((convo) =>
        convo.id === message.conversationId && convo.otherUser.username === activeConversation
      );
      if (isMessageSeen) {
        await updateReadStatus({ conversationId: message.conversationId, messageId: message.id });
        sendReadStatus(message);
      }
    }
  }
};