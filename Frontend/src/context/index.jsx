import { AuthProvider } from "./AuthContext";
import { SocketProvider } from "./SocketContext";
import  {MessageProvider} from "./MessagContext"
import { RoomProvider } from "./RoomContext";

export const AppProvider = ({ children }) => {
  return (
    <AuthProvider>
      <SocketProvider>
        <RoomProvider>
          <MessageProvider>{children}</MessageProvider>
        </RoomProvider>
      </SocketProvider>
    </AuthProvider>
  );
};