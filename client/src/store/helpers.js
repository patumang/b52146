import axios from "axios";

export const resetDBUnreads = async (conversationId) => {
  return await axios.post("/api/conversations/reset_unreads", { id: conversationId })
};