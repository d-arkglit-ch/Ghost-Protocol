import { useRoom } from "../context/RoomContext";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { PlusCircle, Clock, ArrowLeft, AlertCircle, ShieldCheck } from "lucide-react";

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
      setError(err.message || "Failed to create room. Please try again.");
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
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#111827]">Create a Burner Room</h1>
              <p className="text-xs text-[#526056]">Private, encrypted, and ephemeral</p>
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

        {/* Self Destruct Presets */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#526056] flex items-center gap-1.5 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-[#1C4A2E]" />
            <span>Self-Destruct Presets</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "15 Minutes", val: 15 },
              { label: "1 Hour", val: 60 },
              { label: "24 Hours", val: 1440 },
            ].map((preset) => {
              const isSelected = timerMinutes === String(preset.val);
              return (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => setTimerMinutes(isSelected ? "" : String(preset.val))}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-[#1C4A2E] text-white border border-[#1C4A2E] shadow-2xs"
                      : "bg-[#F6F8F6] text-[#526056] border border-[#D5E0D7] hover:border-[#1C4A2E] hover:text-[#111827]"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Timer Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#526056] uppercase tracking-wider">
            Custom Lifespan (Minutes, Optional):
          </label>
          <input
            type="number"
            min="1"
            max="10080"
            placeholder="e.g. 45 (leave blank for unlimited)"
            value={timerMinutes}
            onChange={(e) => setTimerMinutes(e.target.value)}
            className="input-social w-full text-sm"
          />
        </div>

        {/* Info Callout */}
        <div className="p-3.5 rounded-xl bg-[#EBF2ED] border border-[#D5E0D7] flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#1C4A2E] shrink-0 mt-0.5" />
          <p className="text-xs text-[#526056] leading-relaxed">
            Burner rooms are completely ephemeral. When the timer expires or participants leave, messages and logs are permanently purged from the server.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={createRoomNow}
          disabled={loading}
          className="btn-primary-social w-full py-2.5 text-sm"
        >
          {loading ? "Generating Room..." : "Create Burner Room Now"}
        </button>

      </div>
    </div>
  );
};

export default CreateRoomPage;
