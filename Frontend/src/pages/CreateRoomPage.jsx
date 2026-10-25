import { useRoom } from "../context/RoomContext";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

const CreateRoomPage = () => {
  const { handleCreateRoom } = useRoom();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState("");
  const [error, setError] = useState("");

  const createRoomNow = async () => {
    try {
      setLoading(true);
      setError("");
      const room = await handleCreateRoom(timerMinutes ? parseInt(timerMinutes) : null); 
      navigate(`/room/${room.code}`);
    } catch (err) {
      setError(err.message || "ERROR: ROOM_CREATION_FAILED");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md terminal-box flex flex-col gap-6">
        <div className="border-b border-[var(--border-color)] pb-4 mb-2">
          <h1 className="text-xl font-bold uppercase">
           {'>'} INITIALIZE_BURNER_PROTOCOL
          </h1>
        </div>

        <p className="text-sm opacity-70">
          // A secure, ephemeral room code will be generated.
          <br/>// Share the code. Once destroyed, all data is purged.
        </p>

        {error && (
          <div className="border border-[var(--accent-color)] text-[var(--accent-color)] p-2 text-xs font-bold uppercase glitch-anim">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-xs opacity-70">SELF_DESTRUCT_PRESETS:</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "15 MIN", val: 15 },
              { label: "1 HOUR", val: 60 },
              { label: "24 HOURS", val: 1440 },
            ].map((preset) => (
              <button
                key={preset.val}
                type="button"
                onClick={() => setTimerMinutes(timerMinutes === String(preset.val) ? "" : String(preset.val))}
                className={`py-2 text-xs border font-mono tracking-wider transition-colors ${
                  timerMinutes === String(preset.val)
                    ? "bg-[var(--text-color)] text-[var(--bg-color)] border-[var(--text-color)]"
                    : "border-[var(--border-color)] hover:border-[var(--text-color)]"
                }`}
              >
                [{preset.label}]
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs opacity-70">CUSTOM_TIMER (MINUTES) [OPTIONAL]:</label>
          <input 
            type="number" 
            className="input-terminal" 
            placeholder="e.g. 45 (or select a preset above)"
            value={timerMinutes}
            onChange={(e) => setTimerMinutes(e.target.value)}
            min="1"
          />
          <p className="text-[10px] opacity-50 uppercase mt-1">
            // IDLE POLICY: ROOMS WITH ZERO ACTIVITY FOR &gt;2 HOURS ARE AUTOMATICALLY PURGED.
          </p>
        </div>

        <button
          className={`btn-terminal w-full py-4 text-lg ${loading ? "opacity-50 cursor-not-allowed" : "bg-[var(--text-color)] text-[var(--bg-color)] hover:bg-transparent hover:text-[var(--text-color)]"}`}
          onClick={createRoomNow}
          disabled={loading}
        >
          {loading ? "GENERATING_ROOM_HASH..." : "EXECUTE"}
        </button>

        <div className="text-center mt-4">
          <Link to="/rooms" className="text-xs hover:text-[var(--accent-color)] underline underline-offset-4">
            [ ABORT_AND_RETURN ]
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomPage;
