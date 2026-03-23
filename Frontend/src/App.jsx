import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";

import HomePage from "./pages/HomePage.jsx";
import CreateRoomPage from "./pages/CreateRoomPage.jsx";
import JoinRoomPage from "./pages/JoinRoomPage.jsx";

import ChatRoom from "./pages/ChatRoom.jsx";

import { AppProvider } from "./context/index.jsx";
import ProtectedRoute from "./component/Auth/ProtectedRoute.jsx";

function App() {
  return (
    <Router>
      <AppProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Auth Required Pages (Dashboard + Chat) */}
          <Route path="/rooms" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/create-room" element={<ProtectedRoute><CreateRoomPage /></ProtectedRoute>} />
          <Route path="/join-room" element={<ProtectedRoute><JoinRoomPage /></ProtectedRoute>} />

          {/* Chat Room Page */}
          <Route path="/room/:roomCode" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
        </Routes>
      </AppProvider>
    </Router>
  );
}

export default App;
