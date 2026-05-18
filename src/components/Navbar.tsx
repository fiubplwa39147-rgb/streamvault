import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
  Play,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useVideos } from "../context/VideoContext";

export default function Navbar() {
  const { currentUser, logout, isAdmin } = useAuth();
  const { searchVideos } = useVideos();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ReturnType<typeof searchVideos>>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
        setSearchQuery("");
        setSearchResults([]);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q.length > 1) {
      setSearchResults(searchVideos(q).slice(0, 5));
    } else {
      setSearchResults([]);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setShowUserMenu(false);
  };

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Movies", path: "/browse?category=Action" },
    { label: "Series", path: "/browse?type=series" },
    { label: "Trending", path: "/browse?trending=true" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#141414] shadow-2xl shadow-black/50"
          : "bg-gradient-to-b from-black/90 via-black/40 to-transparent"
      }`}
    >
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="text-red-500 font-black text-xl tracking-tight hidden sm:block">
                Stream<span className="text-white">Vault</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? "text-white"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-3 py-1.5 rounded text-sm font-medium text-yellow-400 hover:text-yellow-300 flex items-center gap-1"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div ref={searchRef} className="relative">
              {showSearch ? (
                <div className="flex items-center bg-black/80 border border-gray-600 rounded px-3 py-1.5 gap-2">
                  <Search className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Titles, genres..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="bg-transparent text-white text-sm outline-none w-48 placeholder:text-gray-500"
                  />
                  <button onClick={() => { setShowSearch(false); setSearchQuery(""); setSearchResults([]); }}>
                    <X className="w-4 h-4 text-gray-400 hover:text-white" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="p-2 text-gray-300 hover:text-white transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}

              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full right-0 mt-1 w-80 bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-2xl overflow-hidden z-50">
                  {searchResults.map((video) => (
                    <button
                      key={video.id}
                      onClick={() => {
                        navigate(`/watch/${video.id}`);
                        setShowSearch(false);
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-colors text-left"
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-12 h-8 object-cover rounded"
                      />
                      <div>
                        <p className="text-white text-sm font-medium">{video.title}</p>
                        <p className="text-gray-400 text-xs">{video.category} • {video.year}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            {currentUser && (
              <button className="p-2 text-gray-300 hover:text-white transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            )}

            {/* User Menu */}
            {currentUser ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded flex items-center justify-center text-white text-sm font-bold">
                    {currentUser.displayName?.[0]?.toUpperCase() || currentUser.email[0].toUpperCase()}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-300 transition-transform hidden sm:block ${
                      showUserMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-2xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-700">
                      <p className="text-white font-medium text-sm truncate">
                        {currentUser.displayName || currentUser.email}
                      </p>
                      <p className="text-gray-400 text-xs truncate">{currentUser.email}</p>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          currentUser.plan === "pro"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {currentUser.plan === "pro" ? "⭐ Pro" : "Free Plan"}
                      </span>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => { navigate("/profile"); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors text-sm"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => { navigate("/admin"); setShowUserMenu(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-yellow-400 hover:text-yellow-300 hover:bg-white/10 transition-colors text-sm"
                        >
                          <Shield className="w-4 h-4" />
                          Admin Panel
                        </button>
                      )}
                      <button
                        onClick={() => { navigate("/settings"); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors text-sm"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                    </div>
                    <div className="border-t border-gray-700 py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-white/10 transition-colors text-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth"
                  className="px-4 py-1.5 text-sm font-medium text-white hover:text-gray-200 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?tab=register"
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-300 hover:text-white"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-[#141414] border-t border-gray-800 py-3 px-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setShowMobileMenu(false)}
                className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded text-sm"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setShowMobileMenu(false)}
                className="block px-4 py-2 text-yellow-400 hover:text-yellow-300 hover:bg-white/10 rounded text-sm flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Admin Panel
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
