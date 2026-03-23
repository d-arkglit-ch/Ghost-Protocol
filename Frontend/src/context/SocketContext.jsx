/* eslint-disable react-refresh/only-export-components */
import { createContext , useContext , useState , useEffect } from "react";
import io from "socket.io-client";
import { useAuth } from "./AuthContext";

 const SocketContext = createContext();
 export const SocketProvider =({children})=>{
    const {user}=  useAuth();
    const [socket , setSocket]= useState(null);
      useEffect(()=>{
        if(!user) return;

        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
        const newSocket = io(backendUrl, {
            withCredentials:true,
            query:{userId:user._id}
        });

        setSocket(newSocket);
        newSocket.on("connect",()=>{
            console.log("socket connected:" , newSocket.id);
        });

        newSocket.on("disconnect" , ()=>{
            console.log("socket disconnected");
        });

//clean up function

        return()=>{
            newSocket.disconnect();
        }
      },[user]);

      return (
        <SocketContext.Provider value={{socket}}>
            {children}
        </SocketContext.Provider>
      )
 };
 export const useSocket =()=> useContext(SocketContext);