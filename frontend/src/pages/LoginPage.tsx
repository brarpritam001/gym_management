import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Dumbbell, ArrowRight, Eye, EyeOff, Shield, Zap, Users } from "lucide-react";
import { authService } from "../services/auth";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

const features = [
  { icon: Users, text: "Member Management" },
  { icon: Zap, text: "Real-time Analytics" },
  { icon: Shield, text: "Secure & Reliable" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("admin@gym.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authService.login(email, password);
      login(data.access_token);
      const me = await authService.me();
      setUser(me.data);
      toast.success("Welcome back!");
      navigate("/");
    } catch {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Branding panel */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-dark-800 items-center justify-center overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-primary-600/15 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[100px] animate-float-slow" style={{ animationDelay: "3s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary-500/10 rounded-full blur-[80px]" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />

        {/* Gradient line accents */}
        <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-primary-500/20 to-transparent" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-500/10 to-transparent" />

        <div className="relative z-10 max-w-md px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, type: "spring", stiffness: 200, damping: 25 }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary-600/30"
            >
              <Dumbbell className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">GymPro</h1>
            <p className="text-gray-400 text-lg leading-relaxed mb-10">
              The modern way to manage your gym. Track members, payments, and everything in between.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-3">
              {features.map((f, i) => (
                <motion.div
                  key={f.text}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, type: "spring", stiffness: 300, damping: 25 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm text-gray-300 backdrop-blur-sm"
                >
                  <f.icon className="w-3.5 h-3.5 text-primary-400" />
                  <span className="text-xs font-medium">{f.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-6 py-8 sm:py-12 bg-white lg:bg-surface-50">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15, type: "spring", stiffness: 260, damping: 25 }}
          className="w-full max-w-[400px]"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary-600/25"
            >
              <Dumbbell className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </motion.div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">GymPro</h1>
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Welcome back</h2>
            <p className="text-gray-500 mt-1.5 sm:mt-2 text-sm font-medium">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl text-sm input-focus outline-none hover:border-gray-300 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700">Password</label>
                <button type="button" className="text-xs text-primary-600 hover:text-primary-700 font-semibold">
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl text-sm input-focus outline-none pr-11 hover:border-gray-300 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-2.5 sm:py-3 px-4 rounded-xl font-bold text-sm shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none btn-shine"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>

            <p className="text-center text-xs text-gray-400 pt-2">
              Demo: <span className="text-gray-500 font-semibold">admin@gym.com</span> / <span className="text-gray-500 font-semibold">admin123</span>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
