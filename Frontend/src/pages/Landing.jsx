import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const Landing = () => {
  const { loginAsGuest } = useAuth();
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
        <div className="border-b border-[var(--border-color)] pb-4 mb-2">
          <p className="text-xs uppercase tracking-widest text-[var(--accent-color)]">
            {'>'} system_status: online
          </p>
        </div>

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
      </div>

      <footer className="fixed bottom-4 text-xs opacity-30 text-center w-full">
        TRACE_LVL: 0% | ENCRYPTION: ACTIVE
      </footer>
    </div>
  );
};

export default Landing;
