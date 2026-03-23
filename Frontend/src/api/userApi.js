import api from './axios';
export const registerUser = (data)=>api.post("/users/register" , data);
export const loginUser = (data)=>api.post("/users/login" , data);
export const loginGuest = ()=>api.post("/users/login-guest");
export const logoutUser = ()=>api.post("/users/logout");
export const getProfile = ()=>api.get("/users/profile");