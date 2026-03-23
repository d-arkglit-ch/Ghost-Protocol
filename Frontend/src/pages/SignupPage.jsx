import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const SignupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // support either register OR registerUser from your context
  const { register, registerUser } = useAuth();
  const doRegister = register || registerUser;

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.username.trim() || !form.password) {
      setError("ERROR: CREDENTIALS_REQUIRED");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("ERROR: PASSWORD_MISMATCH");
      return;
    }

    if (!doRegister) {
      setError("SYSTEM_FAULT: REGISTER_FUNCTION_UNAVAILABLE");
      return;
    }

    try {
      setLoading(true);
      await doRegister({ username: form.username.trim(), password: form.password });
      navigate("/rooms");
    } catch (err) {
      setError(err.message || "ERROR: REGISTRATION_FAILED");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md terminal-box flex flex-col gap-6">
        
        <div className="border-b border-[var(--border-color)] pb-4 mb-2">
          <h1 className="text-xl font-bold uppercase">
           {'>'} CREATE_NEW_IDENTITY
          </h1>
        </div>

        <p className="text-sm opacity-70">
          // REGISTER_TO_ACCESS_SECURE_NETWORK
        </p>

        {error && (
          <div className="border border-[var(--accent-color)] text-[var(--accent-color)] p-2 text-xs font-bold uppercase glitch-anim">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs opacity-70">NEW_USERNAME:</label>
            <input
              name="username"
              type="text"
              placeholder="e.g. Trinity"
              value={form.username}
              onChange={handleChange}
              className="input-terminal"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs opacity-70">NEW_PASSWORD:</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="input-terminal"
              required
              minLength={6}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs opacity-70">CONFIRM_PASSWORD:</label>
            <input
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange}
              className="input-terminal"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className={`btn-terminal w-full py-4 text-lg mt-4 ${loading ? "opacity-50 cursor-not-allowed" : "bg-[var(--text-color)] text-[var(--bg-color)] hover:bg-transparent hover:text-[var(--text-color)]"}`}
            disabled={loading}
          >
            {loading ? "INITIALIZING_IDENTITY..." : "REGISTER_IDENTITY"}
          </button>
        </form>

        <div className="text-center mt-4">
          <Link to="/login" className="text-xs hover:text-[var(--accent-color)] underline underline-offset-4">
            [ ALREADY_REGISTERED? _LOGIN ]
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
