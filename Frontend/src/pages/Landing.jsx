import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  MessageSquare, 
  Radio, 
  LogIn, 
  UserPlus, 
  X,
  Lock,
  Sparkles
} from "lucide-react";

const Landing = () => {
  const { user, loading, loginAsGuest, logout } = useAuth();
  const navigate = useNavigate();

  const [showStartModal, setShowStartModal] = useState(false);
  const [showLearnMoreModal, setShowLearnMoreModal] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  const handleGuestJoin = async () => {
    setIsGuestLoading(true);
    try {
      await loginAsGuest();
      navigate("/rooms");
    } catch (err) {
      console.error("Guest login failed:", err);
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-between bg-[#F8FAF8] text-[#111827] relative overflow-hidden font-sans selection:bg-[#E4EDE6] selection:text-[#1C4A2E]">
      
      {/* Dynamic Background Organic Wave Canvas */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <svg 
          viewBox="0 0 1440 800" 
          className="w-full h-full object-cover opacity-85" 
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EDF4EE" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#E2EBE4" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#EDF4EE" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="waveGradAccent" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#DFEBE1" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#D5E5D8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#DFEBE1" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Gentle Mid-Tone Underlying Wave */}
          <path 
            d="M0,540 C320,480 620,620 980,560 C1200,520 1350,560 1440,580 L1440,800 L0,800 Z" 
            fill="url(#waveGradAccent)" 
          />
          {/* Main Foreground Soft Wave following reference curvature */}
          <path 
            d="M0,580 C280,510 580,660 920,590 C1220,530 1360,600 1440,610 L1440,800 L0,800 Z" 
            fill="url(#waveGrad)" 
          />
        </svg>
      </div>

      {/* TOP NAVIGATION BAR */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#1C4A2E] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <svg 
              className="w-4 h-4" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-[#111827]">
            Connect
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-9">
          <Link 
            to="/" 
            className="relative text-sm font-semibold text-[#111827] pb-1"
          >
            Home
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1C4A2E] rounded-full"></span>
          </Link>

          <button 
            type="button"
            onClick={() => setShowLearnMoreModal(true)}
            className="text-sm font-medium text-[#526056] hover:text-[#111827] transition-colors"
          >
            Features
          </button>

          <button 
            type="button"
            onClick={() => setShowLearnMoreModal(true)}
            className="text-sm font-medium text-[#526056] hover:text-[#111827] transition-colors"
          >
            About
          </button>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          {user && !loading ? (
            <div className="flex items-center gap-2.5">
              <Link
                to="/rooms"
                className="px-4 py-2 rounded-lg bg-[#1C4A2E] hover:bg-[#163B25] text-white text-xs md:text-sm font-semibold transition-all shadow-xs flex items-center gap-1.5"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={logout}
                className="px-3 py-2 rounded-lg border border-[#D5E0D7] bg-white hover:bg-[#F0F4F1] text-xs font-semibold text-[#526056] transition-all"
                title="Sign out"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg border border-[#D5E0D7] bg-white hover:bg-[#F0F4F1] text-xs md:text-sm font-medium text-[#111827] transition-all shadow-2xs"
              >
                Login
              </Link>

              <button
                onClick={() => setShowStartModal(true)}
                className="px-4 md:px-5 py-2 rounded-lg bg-[#1C4A2E] hover:bg-[#163B25] text-white text-xs md:text-sm font-semibold transition-all shadow-xs active:translate-y-px"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex-1 flex flex-col justify-center py-8 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Heading, Subtitle, CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start">
            
            {/* Pill: Social Chat */}
            <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#E5EFE7] text-[#1C4A2E] text-xs font-semibold mb-6 border border-[#D0E2D4]">
              Social Chat
            </div>

            {/* Headline with Vertical Green Accent Bar */}
            <div className="border-l-4 border-[#1C4A2E] pl-4 md:pl-6 py-0.5 mb-5">
              <h1 className="text-3xl sm:text-5xl md:text-[54px] font-extrabold tracking-tight text-[#111827] leading-[1.12]">
                Chat, Connect &<br />
                <span className="text-[#1C4A2E]">Create Rooms</span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-sm md:text-base text-[#526056] max-w-md leading-relaxed mb-8">
              Meet new people, start 1-on-1 conversations, or create private rooms for your crew.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5">
              <button
                onClick={() => {
                  if (user) navigate("/rooms");
                  else setShowStartModal(true);
                }}
                className="px-6 py-3 rounded-lg bg-[#1C4A2E] hover:bg-[#163B25] text-white text-sm font-bold flex items-center gap-2 shadow-xs transition-all active:translate-y-px group"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => setShowLearnMoreModal(true)}
                className="px-6 py-3 rounded-lg bg-white hover:bg-[#F0F4F1] border border-[#D5E0D7] text-sm font-semibold text-[#111827] shadow-2xs transition-all active:translate-y-px"
              >
                Learn More
              </button>
            </div>

          </div>

          {/* Right Column: Hero Art Illustration matching screenshot */}
          <div className="lg:col-span-5 flex items-center justify-center lg:justify-end relative">
            <div className="relative w-72 h-72 sm:w-84 sm:h-84 md:w-96 md:h-96 flex items-center justify-center">

              {/* Tilted Frosted Soft Mint Squircle Backdrop */}
              <div 
                className="absolute inset-4 rounded-[2.5rem] bg-[#E2ECE4]/75 backdrop-blur-xs transform -rotate-6 border border-[#D2E2D5] shadow-xs"
              />

              {/* Back Chat Bubble: Crisp Cream / Off-White with shadow */}
              <Motion.div 
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-10 left-4 sm:bottom-12 sm:left-6 w-44 sm:w-52 h-32 sm:h-38 rounded-2xl bg-[#F5F7F4] border border-[#E1EAE3] shadow-xl p-4 flex flex-col justify-between z-10"
              >
                {/* Speech Bubble Tail bottom-left */}
                <div 
                  className="absolute -bottom-3 left-7 w-4 h-4 bg-[#F5F7F4] border-b border-l border-[#E1EAE3] transform -rotate-45"
                />
              </Motion.div>

              {/* Foreground Chat Bubble: Deep Forest Pine with 3 White Dots */}
              <Motion.div 
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-8 right-3 sm:top-10 sm:right-5 w-48 sm:w-56 h-32 sm:h-38 rounded-2xl bg-[#376D4B] shadow-2xl flex items-center justify-center z-20"
              >
                {/* 3 Crisp White Ellipsis Dots */}
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-white shadow-xs"></span>
                  <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-white shadow-xs"></span>
                  <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-white shadow-xs"></span>
                </div>

                {/* Speech Bubble Tail bottom-right */}
                <div 
                  className="absolute -bottom-3 right-8 w-4 h-4 bg-[#376D4B] transform -rotate-45"
                />

                {/* Playful Accent Radiating Sparks on Top Right */}
                <div className="absolute -top-7 -right-5 pointer-events-none text-[#1C4A2E]">
                  <svg width="42" height="42" viewBox="0 0 42 42" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="8" y1="34" x2="16" y2="24" />
                    <line x1="21" y1="36" x2="21" y2="20" />
                    <line x1="34" y1="32" x2="26" y2="24" />
                  </svg>
                </div>
              </Motion.div>

            </div>
          </div>

        </div>
      </main>

      {/* BOTTOM FEATURE CARDS BAR */}
      <footer className="relative z-20 w-full border-t border-[#D5E0D7] bg-white/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            
            {/* Feature 1: Instant Chat */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#E8F1EB] text-[#1C4A2E] flex items-center justify-center shrink-0 border border-[#D5E0D7]">
                <Zap className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111827]">Instant Chat</h3>
                <p className="text-xs text-[#526056] mt-0.5">Start 1-on-1 conversations in seconds.</p>
              </div>
            </div>

            {/* Feature 2: Private Rooms */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#E8F1EB] text-[#1C4A2E] flex items-center justify-center shrink-0 border border-[#D5E0D7]">
                <Users className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111827]">Private Rooms</h3>
                <p className="text-xs text-[#526056] mt-0.5">Create time-limited rooms for your team.</p>
              </div>
            </div>

            {/* Feature 3: Safe & Anonymous */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#E8F1EB] text-[#1C4A2E] flex items-center justify-center shrink-0 border border-[#D5E0D7]">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111827]">Safe & Anonymous</h3>
                <p className="text-xs text-[#526056] mt-0.5">Chat without sharing personal details.</p>
              </div>
            </div>

          </div>
        </div>
      </footer>

      {/* QUICK ENTRY MODAL (Get Started) */}
      <AnimatePresence>
        {showStartModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
            <Motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-sm rounded-2xl p-6 bg-white border border-[#D5E0D7] shadow-xl relative"
            >
              <button
                type="button"
                onClick={() => setShowStartModal(false)}
                className="absolute top-4 right-4 p-1 rounded-lg text-[#869684] hover:text-[#111827] hover:bg-[#F0F4F1] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-10 h-10 rounded-xl bg-[#E8F1EB] text-[#1C4A2E] flex items-center justify-center mb-3">
                <MessageSquare className="w-5 h-5" />
              </div>

              <h2 className="text-lg font-bold text-[#111827]">Jump Into Connect</h2>
              <p className="text-xs text-[#526056] mt-1 mb-5 leading-relaxed">
                Connect instantly as an anonymous guest or sign in to retain your account.
              </p>

              <div className="space-y-3">
                {/* Instant Guest Button */}
                <button
                  type="button"
                  onClick={handleGuestJoin}
                  disabled={isGuestLoading}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#1C4A2E] hover:bg-[#163B25] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all active:translate-y-px"
                >
                  <Radio className="w-4 h-4" />
                  <span>{isGuestLoading ? "Connecting Guest Handshake..." : "Instant Match as Guest"}</span>
                </button>

                <div className="relative flex items-center justify-center my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#D5E0D7]"></div>
                  </div>
                  <span className="relative px-3 bg-white text-[10px] uppercase tracking-wider text-[#869684] font-medium">
                    or
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/signup"
                    className="py-2 px-3 rounded-lg border border-[#D5E0D7] hover:border-[#1C4A2E] hover:bg-[#F0F4F1] text-xs font-semibold text-[#111827] flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-[#1C4A2E]" />
                    <span>Create Account</span>
                  </Link>
                  <Link
                    to="/login"
                    className="py-2 px-3 rounded-lg border border-[#D5E0D7] hover:border-[#1C4A2E] hover:bg-[#F0F4F1] text-xs font-semibold text-[#111827] flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    <LogIn className="w-3.5 h-3.5 text-[#1C4A2E]" />
                    <span>Sign In</span>
                  </Link>
                </div>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LEARN MORE / FEATURES MODAL */}
      <AnimatePresence>
        {showLearnMoreModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
            <Motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-lg rounded-2xl p-6 md:p-8 bg-white border border-[#D5E0D7] shadow-xl relative max-h-[85vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setShowLearnMoreModal(false)}
                className="absolute top-5 right-5 p-1.5 rounded-lg text-[#869684] hover:text-[#111827] hover:bg-[#F0F4F1] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-[#E8F1EB] text-[#1C4A2E] flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#111827]">About Connect Social</h2>
                  <p className="text-xs text-[#526056]">Privacy-first ephemeral chat platform</p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-[#526056] leading-relaxed my-5">
                <div className="p-3.5 rounded-xl bg-[#EBF2ED] border border-[#D5E0D7]">
                  <h4 className="font-bold text-[#111827] text-sm mb-1 flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-[#1C4A2E]" />
                    Random Stranger Radar (Omegle Mode)
                  </h4>
                  <p>
                    Connect 1-on-1 with another active stranger in an instant. No personal data or email required. When either party leaves, the entire conversation and room are purged forever.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#EBF2ED] border border-[#D5E0D7]">
                  <h4 className="font-bold text-[#111827] text-sm mb-1 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-[#1C4A2E]" />
                    Self-Destructing Burner Rooms
                  </h4>
                  <p>
                    Create private rooms with custom expiration timers (e.g. 15m, 1h, 24h). Share the room code with your friends or crew. As soon as the countdown finishes, all messages self-destruct.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#EBF2ED] border border-[#D5E0D7]">
                  <h4 className="font-bold text-[#111827] text-sm mb-1 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-[#1C4A2E]" />
                    0ms Latency Realtime Typing & Reactions
                  </h4>
                  <p>
                    Experience real-time live typing indicators and instant emoji reactions powered by low-latency Socket.io WebSockets.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-[#D5E0D7]">
                <button
                  type="button"
                  onClick={() => {
                    setShowLearnMoreModal(false);
                    setShowStartModal(true);
                  }}
                  className="px-5 py-2 rounded-lg bg-[#1C4A2E] hover:bg-[#163B25] text-white text-xs font-semibold shadow-xs"
                >
                  Start Chatting Now
                </button>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Landing;
