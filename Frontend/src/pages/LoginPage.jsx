import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { LogIn, AlertCircle, ArrowLeft } from "lucide-react";

const LoginPage = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, loading: authLoading, loginUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !authLoading) {
      navigate("/rooms");
    }
  }, [user, authLoading, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginUser(form);
    } catch (err) {
      setError(err.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-[#F6F8F6] text-[#111827] relative overflow-hidden select-none">
      
      <div className="relative z-10 w-full max-w-md rounded-2xl p-6 md:p-8 bg-white border border-[#D5E0D7] shadow-sm flex flex-col gap-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#D5E0D7] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E4EDE6] text-[#1C4A2E] flex items-center justify-center">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#111827]">Welcome Back</h1>
              <p className="text-xs text-[#526056]">Sign in to your account</p>
            </div>
          </div>

          <Link
            to="/"
            className="p-1.5 rounded-lg border border-[#D5E0D7] text-[#526056] hover:text-[#111827] hover:bg-[#F0F4F1] transition-colors"
            title="Back to home"
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#526056] uppercase tracking-wider">
              Username
            </label>
            <input
              type="text"
              name="username"
              placeholder="e.g. Alex"
              className="input-social w-full text-sm"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#526056] uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              className="input-social w-full text-sm font-mono"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-social w-full py-2.5 text-sm mt-2"
          >
            {loading ? "Authenticating..." : "Sign In to Account"}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-[#D5E0D7]">
          <p className="text-xs text-[#526056]">
            Don't have an account yet?{" "}
            <Link to="/signup" className="font-semibold text-[#1C4A2E] hover:underline">
              Register now
            </Link>
          </p>
        </div>

      </div>

      {/* Gentle Mountain Mist Vector Art pinned to bottom */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden h-36 select-none opacity-80">
        <svg viewBox="0 0 1200 120" className="w-full h-full" preserveAspectRatio="none">
          <circle cx="950" cy="50" r="36" fill="#FDE68A" opacity="0.6" />
          <path d="M0,120 L0,70 Q200,30 450,55 Q700,80 950,45 Q1100,25 1200,50 L1200,120 Z" fill="#D5E0D7" opacity="0.4" />
          <path d="M0,120 L0,85 Q300,50 600,75 Q900,95 1100,65 L1200,75 L1200,120 Z" fill="#C5D7C8" opacity="0.55" />
          <path d="M0,120 L0,95 Q400,75 800,90 Q1050,75 1200,85 L1200,120 Z" fill="#E4EDE6" opacity="0.8" />
        </svg>
      </div>

    </div>
  );
};

export default LoginPage;
