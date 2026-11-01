import { useRoom } from "../context/RoomContext";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Hash, ArrowLeft, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";

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
      return setError("Please enter a room code");
    }

    try {
      setLoading(true);
      const room = await handleJoinRoom(roomCode.trim().toUpperCase());
      navigate(`/room/${room.code}`);
    } catch (err) {
      setError(err.message || "Invalid or expired room code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto flex items-center justify-center p-4 md:p-8 bg-[#F6F8F6] text-[#111827]">
      <div className="w-full max-w-lg rounded-2xl p-6 md:p-8 bg-white border border-[#D5E0D7] shadow-sm flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D5E0D7] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E4EDE6] text-[#1C4A2E] flex items-center justify-center">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#111827]">Join with Code</h1>
              <p className="text-xs text-[#526056]">Connect to an existing burner room</p>
            </div>
          </div>

          <Link
            to="/rooms"
            className="p-1.5 rounded-lg border border-[#D5E0D7] text-[#526056] hover:text-[#111827] hover:bg-[#F0F4F1] transition-colors"
            title="Cancel"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={joinRoomNow} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#526056] uppercase tracking-wider">
              Room Code / Key:
            </label>
            <input
              type="text"
              placeholder="e.g. X891ABQC"
              className="input-social w-full text-base font-mono uppercase tracking-widest text-center"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              autoFocus
            />
          </div>

          <div className="p-3.5 rounded-xl bg-[#EBF2ED] border border-[#D5E0D7] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#1C4A2E] shrink-0 mt-0.5" />
            <p className="text-xs text-[#526056] leading-relaxed">
              Room codes are case-insensitive. Ensure the host has already created the room and it has not yet expired.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-social w-full py-2.5 text-sm"
          >
            <span>{loading ? "Verifying Code..." : "Enter Room"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};

export default JoinRoomPage;
