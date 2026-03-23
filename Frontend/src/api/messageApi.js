import api from './axios';
export const getMessage = (roomCode, cursor = null) => {
  const url = cursor ? `/message/${roomCode}?cursor=${cursor}` : `/message/${roomCode}`;
  return api.get(url);
};
export const sendMessage = (data)=>api.post("/message/sendMessage" , data);
export const deleteMessage = (messageId)=>api.delete(`/message/deleteMessage/${messageId}`);