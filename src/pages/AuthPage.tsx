import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Eye, EyeOff, Play, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function AuthPage() {
  const [params] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"login" | "register">(
    params.get("tab") === "register" ? "register" : "login"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  const { login, register, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) navigate("/");
  }, [currentUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsSubmitting(true);
    const result = await login(loginEmail, loginPassword);
    setIsSubmitting(false);
    if (result.success) {
      toast.success("Welcome back! 🎬");
      navigate("/");
    } else {
      toast.error(result.error || "Login failed");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (regPassword !== regConfirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (regPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setIsSubmitting(true);
    const result = await register(regEmail, regPassword, regName);
    setIsSubmitting(false);
    if (result.success) {
      toast.success("Account created! Welcome to StreamVault 🎬");
      navigate("/");
    } else {
      toast.error(result.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] flex flex-col">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&q=60)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#141414]/80 to-[#141414]" />

      {/* Header */}
      <div className="relative z-10 px-6 pt-6">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
            <Play className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-red-500 font-black text-xl">
            Stream<span className="text-white">Vault</span>
          </span>
        </Link>
      </div>

      {/* Auth Card */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            {/* Tabs */}
            <div className="flex bg-white/5 rounded-xl p-1 mb-8">
              <button
                onClick={() => setActiveTab("login")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === "login"
                    ? "bg-red-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab("register")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === "register"
                    ? "bg-red-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Demo Credentials Banner */}
            {activeTab === "login" && (
              <div className="mb-6 p-3 bg-blue-900/30 border border-blue-700/40 rounded-lg">
                <p className="text-blue-300 text-xs font-semibold mb-1.5 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Demo Credentials
                </p>
                <div className="space-y-1 text-xs text-blue-200">
                  <p>
                    <span className="text-gray-400">Admin: </span>
                    admin@streamvault.com / admin123
                  </p>
                  <p>
                    <span className="text-gray-400">User: </span>
                    user@streamvault.com / user123
                  </p>
                </div>
              </div>
            )}

            {/* Login Form */}
            {activeTab === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500 focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500 focus:bg-white/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-red-600 w-3.5 h-3.5" />
                    <span className="text-gray-400">Remember me</span>
                  </label>
                  <a href="#" className="text-red-400 hover:text-red-300 transition-colors">
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Signing In…
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail("user@streamvault.com");
                    setLoginPassword("user123");
                  }}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm rounded-lg transition-colors"
                >
                  Quick Demo Login
                </button>
              </form>
            )}

            {/* Register Form */}
            {activeTab === "register" && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500 focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500 focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500 focus:bg-white/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {regPassword && (
                    <div className="mt-1.5 flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            regPassword.length >= i * 3
                              ? regPassword.length >= 10
                                ? "bg-green-500"
                                : "bg-yellow-500"
                              : "bg-gray-700"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={regConfirm}
                      onChange={(e) => setRegConfirm(e.target.value)}
                      placeholder="Repeat password"
                      className={`w-full bg-white/5 border rounded-lg pl-10 pr-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:bg-white/10 transition-all ${
                        regConfirm && regConfirm !== regPassword
                          ? "border-red-500"
                          : "border-white/10 focus:border-red-500"
                      }`}
                    />
                    {regConfirm && regConfirm !== regPassword && (
                      <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  By signing up, you agree to our{" "}
                  <a href="#" className="text-red-400 hover:underline">Terms of Service</a> and{" "}
                  <a href="#" className="text-red-400 hover:underline">Privacy Policy</a>
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Creating Account…
                    </>
                  ) : (
                    "Create Free Account"
                  )}
                </button>
              </form>
            )}

            {/* Switch Tab */}
            <p className="text-center text-sm text-gray-500 mt-6">
              {activeTab === "login" ? (
                <>
                  New to StreamVault?{" "}
                  <button
                    onClick={() => setActiveTab("register")}
                    className="text-red-400 hover:text-red-300 font-semibold"
                  >
                    Sign up free
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setActiveTab("login")}
                    className="text-red-400 hover:text-red-300 font-semibold"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-600">
            <span className="flex items-center gap-1">🔒 Secure & Private</span>
            <span className="flex items-center gap-1">✓ No Spam</span>
            <span className="flex items-center gap-1">🎬 Free Access</span>
          </div>
        </div>
      </div>
    </div>
  );
}
