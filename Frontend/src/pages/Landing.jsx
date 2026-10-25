import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const Landing = () => {
  const { user, loading, loginAsGuest, logout } = useAuth();
  const [isGlitching, setIsGlitching] = useState(false);

  const handleGuestLogin = async () => {
    setIsGlitching(true);
    try {
      await loginAsGuest();
      // AuthContext handles navigation
    } catch (e) {
      console.error(e);
      setIsGlitching(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* Brutalist ASCII style header */}
      <div className={`text-center mb-16 ${isGlitching ? 'glitch-anim' : ''}`}>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tighter">
          [ GHOST_PROTOCOL ]
        </h1>
        <p className="text-sm md:text-base opacity-70">
          // SECURE. ANONYMOUS. EPHEMERAL.
        </p>
      </div>

      <div className="w-full max-w-md terminal-box flex flex-col gap-6">
        <div className="border-b border-[var(--border-color)] pb-4 mb-2 flex justify-between items-center">
          <p className="text-xs uppercase tracking-widest text-[var(--accent-color)]">
            {'>'} system_status: online
          </p>
          {user && (
            <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">
              ● SESSION_ACTIVE
            </span>
          )}
        </div>

        {user && !loading ? (
          <div className="flex flex-col gap-4">
            <div className="border border-[var(--border-color)] p-4 text-center bg-[var(--border-color)]/5">
              <p className="text-[10px] opacity-60 uppercase mb-1">AUTHENTICATED_AS:</p>
              <p className="text-base font-bold text-[var(--accent-color)] tracking-wider uppercase">
                &gt; {user.username}
              </p>
            </div>

            <Link
              to="/rooms"
              className="btn-terminal w-full py-4 text-center text-lg bg-[var(--text-color)] text-[var(--bg-color)] hover:bg-transparent hover:text-[var(--text-color)]"
            >
              [ RESUME_SESSION ]
            </Link>

            <button
              onClick={logout}
              className="btn-terminal w-full py-2 text-xs border border-dashed border-[var(--accent-color)] text-[var(--accent-color)]"
            >
              [ SWITCH_OR_LOGOUT ]
            </button>
          </div>
        ) : (
          <>
            <button 
              onClick={handleGuestLogin}
              className="btn-terminal w-full py-4 text-lg bg-[var(--text-color)] text-[var(--bg-color)] hover:bg-transparent hover:text-[var(--text-color)]"
            >
              {isGlitching ? "ESTABLISHING_CONNECTION..." : "ENTER_INCOGNITO (OMEGLE MODE)"}
            </button>

            <div className="flex items-center gap-4 text-xs opacity-50">
              <div className="h-px bg-[var(--border-color)] flex-grow"></div>
              <span>OR</span>
              <div className="h-px bg-[var(--border-color)] flex-grow"></div>
            </div>

            <div className="flex gap-4">
              <Link to="/login" className="btn-terminal flex-1 text-center">
                {'>'} LOGIN
              </Link>
              <Link to="/signup" className="btn-terminal flex-1 text-center">
                {'>'} REGISTER
              </Link>
            </div>
          </>
        )}
      </div>

      <footer className="fixed bottom-4 text-xs opacity-30 text-center w-full">
        TRACE_LVL: 0% | ENCRYPTION: ACTIVE
      </footer>
    </div>
  );
};

export default Landing;
