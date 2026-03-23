import api from'./axios';
export const createRoom =(timerMinutes)=> api.post("/room/createRoom", { timerMinutes });
export const joinRoom =(code)=> api.post("/room/joinRoom" ,{code});
export const getRooms =()=> api.get("/room/getRoom");
export const deleteRoom =(roomCode)=> api.delete(`/room/deleteRoom/${roomCode}`);
export const removeMember =(roomCode , memberId)=> api.delete(`/room/${roomCode}/deleteMember/${memberId}`);
