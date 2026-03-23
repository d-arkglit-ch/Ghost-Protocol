import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { loginUser } = useAuth();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginUser(form);
      // AuthContext handles navigation
    } catch (err) {
      setError(err.message || "ERROR: ACCESS_DENIED. INVALID_CREDENTIALS.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md terminal-box flex flex-col gap-6">
        
        <div className="border-b border-[var(--border-color)] pb-4 mb-2">
          <h1 className="text-xl font-bold uppercase">
           {'>'} USER_AUTHENTICATION
          </h1>
        </div>

        <p className="text-sm opacity-70">
          // ENTER_CREDENTIALS_TO_ACCESS_SYSTEM
        </p>

        {error && (
          <div className="border border-[var(--accent-color)] text-[var(--accent-color)] p-2 text-xs font-bold uppercase glitch-anim">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs opacity-70">USERNAME:</label>
            <input
              type="text"
              name="username"
              placeholder="e.g. Neo"
              className="input-terminal"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs opacity-70">PASSWORD:</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              className="input-terminal"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className={`btn-terminal w-full py-4 text-lg mt-2 ${loading ? "opacity-50 cursor-not-allowed" : "bg-[var(--text-color)] text-[var(--bg-color)] hover:bg-transparent hover:text-[var(--text-color)]"}`}
            disabled={loading}
          >
            {loading ? "VERIFYING..." : "ENTER"}
          </button>
        </form>

        <div className="text-center mt-4">
          <Link to="/signup" className="text-xs hover:text-[var(--accent-color)] underline underline-offset-4">
            [ NO_ACCOUNT? _REGISTER_HERE ]
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
