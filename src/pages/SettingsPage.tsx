import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Star,
  Check,
  Crown,
  Bell,
  Shield,
  LogOut,
  CreditCard,
  Eye,
  Zap,
  Download,
  Wifi,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { currentUser, logout, updateUserPlan, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [upgrading, setUpgrading] = useState(false);

  if (!currentUser) {
    navigate("/auth");
    return null;
  }

  const isPro = currentUser.plan === "pro";

  const handleUpgrade = async () => {
    setUpgrading(true);
    await new Promise((r) => setTimeout(r, 1500));
    updateUserPlan("pro");
    setUpgrading(false);
    toast.success("🎉 Welcome to StreamVault Pro! Ads removed.");
  };

  const handleDowngrade = () => {
    updateUserPlan("free");
    toast("Downgraded to Free plan", { icon: "ℹ️" });
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Signed out successfully");
  };

  const proFeatures = [
    { icon: Eye, label: "Ad-free streaming", desc: "No pre-roll, banner, or pause ads" },
    { icon: Zap, label: "HD & 4K Quality", desc: "Maximum resolution on all devices" },
    { icon: Download, label: "Download & Offline", desc: "Save content for offline viewing" },
    { icon: Wifi, label: "Simultaneous streams", desc: "Watch on up to 4 devices at once" },
    { icon: Star, label: "Exclusive content", desc: "Access Pro-only titles & series" },
    { icon: Crown, label: "Early access", desc: "Watch new releases before anyone else" },
  ];

  return (
    <div className="min-h-screen bg-[#141414] pt-20 pb-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center text-white text-2xl font-black">
              {currentUser.displayName?.[0]?.toUpperCase() || currentUser.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white font-black text-xl truncate">
                {currentUser.displayName || "Anonymous User"}
              </h1>
              <p className="text-gray-400 text-sm truncate">{currentUser.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    isPro
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                  }`}
                >
                  {isPro ? <Crown className="w-3 h-3" /> : <User className="w-3 h-3" />}
                  {isPro ? "Pro Member" : "Free Plan"}
                </span>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                    <Shield className="w-3 h-3" />
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Plan Section */}
        <div className="space-y-4">
          <h2 className="text-white font-bold text-lg px-1 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-red-400" />
            Subscription Plan
          </h2>

          {/* Free vs Pro Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Free Card */}
            <div
              className={`relative rounded-2xl border-2 p-5 transition-all ${
                !isPro
                  ? "border-gray-500 bg-white/5"
                  : "border-white/10 bg-white/3 opacity-60"
              }`}
            >
              {!isPro && (
                <div className="absolute -top-3 left-4 bg-gray-700 text-gray-300 text-xs font-bold px-3 py-1 rounded-full">
                  Current Plan
                </div>
              )}
              <div className="text-white font-black text-xl mb-1">Free</div>
              <div className="text-3xl font-black text-white mb-4">
                $0<span className="text-lg font-normal text-gray-500">/mo</span>
              </div>
              <ul className="space-y-2 mb-5">
                {["Limited content access", "Standard quality", "Ad-supported", "1 stream at a time"].map(
                  (f) => (
                    <li key={f} className="text-gray-400 text-sm flex items-center gap-2">
                      <Check className="w-4 h-4 text-gray-600" />
                      {f}
                    </li>
                  )
                )}
              </ul>
              {isPro && (
                <button
                  onClick={handleDowngrade}
                  className="w-full py-2 bg-white/10 hover:bg-white/20 text-gray-300 text-sm rounded-xl transition-colors"
                >
                  Downgrade to Free
                </button>
              )}
            </div>

            {/* Pro Card */}
            <div
              className={`relative rounded-2xl border-2 p-5 transition-all ${
                isPro
                  ? "border-yellow-500 bg-yellow-500/5"
                  : "border-red-600 bg-red-600/5"
              }`}
            >
              {isPro ? (
                <div className="absolute -top-3 left-4 bg-yellow-500 text-black text-xs font-black px-3 py-1 rounded-full">
                  ✓ Active
                </div>
              ) : (
                <div className="absolute -top-3 left-4 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full">
                  🔥 Best Value
                </div>
              )}
              <div className="text-white font-black text-xl mb-1 flex items-center gap-2">
                Pro <Crown className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="text-3xl font-black text-white mb-4">
                $9<span className="text-xl">.99</span>
                <span className="text-lg font-normal text-gray-500">/mo</span>
              </div>
              <ul className="space-y-2 mb-5">
                {[
                  "All content unlocked",
                  "4K Ultra HD quality",
                  "Zero ads ever",
                  "4 simultaneous streams",
                  "Download & offline",
                  "Early access releases",
                ].map((f) => (
                  <li key={f} className="text-gray-200 text-sm flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {!isPro ? (
                <button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {upgrading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4" />
                      Upgrade to Pro
                    </>
                  )}
                </button>
              ) : (
                <div className="w-full py-3 bg-yellow-500/20 text-yellow-400 font-bold text-sm rounded-xl text-center">
                  ✓ You're on Pro!
                </div>
              )}
            </div>
          </div>

          {/* Pro Features Grid */}
          {!isPro && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-4 text-sm">
                What you get with Pro:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {proFeatures.map((feature) => (
                  <div key={feature.label} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-600/20 rounded-lg flex items-center justify-center shrink-0">
                      <feature.icon className="w-4 h-4 text-red-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{feature.label}</p>
                      <p className="text-gray-500 text-xs">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preferences */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <h2 className="text-white font-bold text-sm uppercase tracking-wide flex items-center gap-2">
            <Bell className="w-4 h-4 text-gray-400" />
            Preferences
          </h2>
          {[
            { label: "Email notifications", desc: "New content alerts and updates", defaultOn: true },
            { label: "Autoplay next episode", desc: "Automatically start next video", defaultOn: true },
            { label: "Show mature content", desc: "Enable R-rated and TV-MA content", defaultOn: false },
          ].map((pref) => (
            <ToggleRow key={pref.label} {...pref} />
          ))}
        </div>

        {/* Account Actions */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
          <h2 className="text-white font-bold text-sm uppercase tracking-wide">Account</h2>
          {isAdmin && (
            <button
              onClick={() => navigate("/admin")}
              className="w-full flex items-center gap-3 px-4 py-3 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 rounded-xl text-yellow-400 text-sm font-medium transition-colors text-left"
            >
              <Shield className="w-4 h-4" />
              Go to Admin Panel
            </button>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 rounded-xl text-red-400 text-sm font-medium transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* App Info */}
        <div className="text-center text-gray-600 text-xs space-y-1 pb-4">
          <p>StreamVault v1.0.0 • Powered by React + Firebase + FileMoon</p>
          <p>
            <a href="#" className="hover:text-gray-400">Privacy Policy</a>
            {" · "}
            <a href="#" className="hover:text-gray-400">Terms of Service</a>
            {" · "}
            <a href="#" className="hover:text-gray-400">Help Center</a>
          </p>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  defaultOn,
}: {
  label: string;
  desc: string;
  defaultOn: boolean;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-white text-sm font-medium">{label}</p>
        <p className="text-gray-500 text-xs">{desc}</p>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${on ? "bg-red-600" : "bg-gray-700"}`}
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${on ? "translate-x-6" : "translate-x-1"}`}
        />
      </button>
    </div>
  );
}
