import { useRoom } from "../context/RoomContext";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

const JoinRoomPage = () => {
  const { handleJoinRoom } = useRoom();
  const navigate = useNavigate();

  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const joinRoomNow = async (e) => {
    e.preventDefault();
    setError("");

    if (!roomCode.trim()) {
      return setError("ERROR: ROOM_ID_REQUIRED");
    }

    try {
      setLoading(true);
      const room = await handleJoinRoom(roomCode.trim());
      navigate(`/room/${room.code}`);
    } catch (err) {
      setError(err.message || "ERROR: INVALID_ROOM_HASH");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md terminal-box flex flex-col gap-6">
        <div className="border-b border-[var(--border-color)] pb-4 mb-2">
          <h1 className="text-xl font-bold uppercase">
           {'>'} CONNECT_TO_BURNER
          </h1>
        </div>

        <p className="text-sm opacity-70">
          // Enter the secure room hash provided by the host.
        </p>

        {error && (
          <div className="border border-[var(--accent-color)] text-[var(--accent-color)] p-2 text-xs font-bold uppercase glitch-anim">
            {error}
          </div>
        )}

        <form onSubmit={joinRoomNow} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs opacity-70">ROOM_HASH_ID:</label>
            <input
              type="text"
              placeholder="e.g. X891ABQC"
              className="input-terminal"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className={`btn-terminal w-full py-4 text-lg ${loading ? "opacity-50 cursor-not-allowed" : "bg-[var(--text-color)] text-[var(--bg-color)] hover:bg-transparent hover:text-[var(--text-color)]"}`}
            disabled={loading}
          >
            {loading ? "SYNCHRONIZING..." : "CONNECT"}
          </button>
        </form>

        <div className="text-center mt-4">
          <Link to="/rooms" className="text-xs hover:text-[var(--accent-color)] underline underline-offset-4">
            [ ABORT_AND_RETURN ]
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JoinRoomPage;
