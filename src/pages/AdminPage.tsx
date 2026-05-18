import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Shield,
  Film,
  BarChart2,
  Save,
  X,
  AlertTriangle,
  Search,
  TrendingUp,
  Users,
  Star,
  Database,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useVideos } from "../context/VideoContext";
import { Video } from "../types";
import { DEMO_CATEGORIES, formatViews } from "../data/demoData";
import toast from "react-hot-toast";

const EMPTY_VIDEO: Omit<Video, "id" | "views" | "createdAt"> = {
  title: "",
  description: "",
  thumbnail: "",
  category: "Action",
  genre: ["Action"],
  year: new Date().getFullYear(),
  rating: "PG-13",
  imdbRating: 7.0,
  duration: "",
  sources: { primary: "", backup1: "", backup2: "" },
  isFeatured: false,
  isTrending: false,
  cast: [],
  director: "",
  type: "movie",
};

type AdminTab = "dashboard" | "videos" | "add" | "analytics";

export default function AdminPage() {
  const { currentUser, isAdmin } = useAuth();
  const { videos, addVideo, updateVideo, deleteVideo } = useVideos();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Video, "id" | "views" | "createdAt">>(EMPTY_VIDEO);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [genreInput, setGenreInput] = useState("");
  const [castInput, setCastInput] = useState("");
  const [rawLink, setRawLink] = useState("");

  if (!currentUser || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#141414] pt-20 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Shield className="w-16 h-16 text-red-500/50 mx-auto mb-4" />
          <h2 className="text-white text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-6">
            Admin privileges required. Please log in with an admin account.
          </p>
          <button
            onClick={() => navigate("/auth")}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const filteredVideos = videos.filter(
    (v) =>
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalViews = videos.reduce((s, v) => s + v.views, 0);
  const avgRating = videos.reduce((s, v) => s + v.imdbRating, 0) / Math.max(videos.length, 1);

  const startEdit = (video: Video) => {
    setEditingId(video.id);
    setFormData({
      title: video.title,
      description: video.description,
      thumbnail: video.thumbnail,
      category: video.category,
      genre: video.genre,
      year: video.year,
      rating: video.rating,
      imdbRating: video.imdbRating,
      duration: video.duration,
      sources: { ...video.sources },
      isFeatured: video.isFeatured ?? false,
      isTrending: video.isTrending ?? false,
      cast: video.cast ?? [],
      director: video.director ?? "",
      type: video.type,
    });
    setGenreInput(video.genre.join(", "));
    setCastInput((video.cast ?? []).join(", "));
    setActiveTab("add");
  };

  const resetForm = () => {
    setFormData(EMPTY_VIDEO);
    setEditingId(null);
    setGenreInput("");
    setCastInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.sources.primary) {
      toast.error("Title and primary source URL are required");
      return;
    }
    setIsSubmitting(true);
    const parsed = {
      ...formData,
      genre: genreInput.split(",").map((s) => s.trim()).filter(Boolean),
      cast: castInput.split(",").map((s) => s.trim()).filter(Boolean),
    };
    await new Promise((r) => setTimeout(r, 600));

    if (editingId) {
      updateVideo(editingId, parsed);
      toast.success("Video updated successfully!");
    } else {
      addVideo(parsed);
      toast.success("Video added successfully! 🎬");
    }
    resetForm();
    setActiveTab("videos");
    setIsSubmitting(false);
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      deleteVideo(id);
      setDeleteConfirm(null);
      toast.success("Video deleted");
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const generateEmbedLink = () => {
    if (!rawLink) {
      toast.error("Please paste a link first");
      return;
    }
    let embedUrl = rawLink;
    
    // Handle FileMoon
    if (rawLink.includes("filemoon")) {
      const match = rawLink.match(/\/([a-zA-Z0-9]+)(\/file|\/?$)/);
      if (match && match[1]) {
        const id = match[1];
        embedUrl = `https://filemoon.sx/e/${id}`;
      }
    }
    // Handle DoodStream
    else if (rawLink.includes("dood")) {
      const match = rawLink.match(/\/([a-zA-Z0-9]+)(\/|$)/);
      if (match && match[1]) {
        const id = match[1];
        // DoodStream embed format
        embedUrl = `https://doodstream.com/e/${id}`;
      }
    }
    
    // Generate full HTML embed code
    const fullEmbedCode = `<div style="position:relative;padding-top:56.25%;">\n  <iframe src="${embedUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen allow="autoplay; fullscreen; encrypted-media"></iframe>\n</div>`;
    
    setFormData({ ...formData, sources: { ...formData.sources, primary: fullEmbedCode } });
    setRawLink("");
    toast.success("Embed Code generated successfully!");
  };

  const tabs: { id: AdminTab; label: string; icon: typeof Film }[] = [
    { id: "dashboard", label: "Dashboard", icon: BarChart2 },
    { id: "videos", label: "Videos", icon: Film },
    { id: "add", label: editingId ? "Edit Video" : "Add Video", icon: Plus },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-yellow-400" />
              <h1 className="text-white font-black text-2xl">Admin Panel</h1>
            </div>
            <p className="text-gray-400 text-sm">
              Welcome back, <span className="text-yellow-400 font-medium">{currentUser.displayName || currentUser.email}</span>
            </p>
          </div>
          <div className="text-right text-xs text-gray-600">
            <div className="text-gray-400 font-medium">StreamVault CMS</div>
            <div>v1.0.0</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); if (tab.id !== "add") resetForm(); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-red-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Videos", value: videos.length, icon: Film, color: "from-red-600 to-red-800", suffix: "" },
                { label: "Total Views", value: formatViews(totalViews), icon: Eye, color: "from-blue-600 to-blue-800", suffix: "" },
                { label: "Trending", value: videos.filter((v) => v.isTrending).length, icon: TrendingUp, color: "from-orange-500 to-red-600", suffix: "" },
                { label: "Avg Rating", value: avgRating.toFixed(1), icon: Star, color: "from-yellow-500 to-orange-600", suffix: "/10" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-2xl font-black text-white">
                    {stat.value}{stat.suffix}
                  </div>
                  <div className="text-gray-500 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => { resetForm(); setActiveTab("add"); }}
                className="bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 rounded-xl p-5 text-left transition-colors group"
              >
                <Plus className="w-8 h-8 text-red-400 mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-white font-bold mb-1">Add New Video</div>
                <div className="text-gray-500 text-sm">Upload video metadata & links</div>
              </button>
              <button
                onClick={() => setActiveTab("videos")}
                className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 rounded-xl p-5 text-left transition-colors group"
              >
                <Database className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-white font-bold mb-1">Manage Videos</div>
                <div className="text-gray-500 text-sm">{videos.length} videos in library</div>
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className="bg-green-600/20 hover:bg-green-600/30 border border-green-600/30 rounded-xl p-5 text-left transition-colors group"
              >
                <BarChart2 className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-white font-bold mb-1">View Analytics</div>
                <div className="text-gray-500 text-sm">Performance insights</div>
              </button>
            </div>

            {/* Recent Videos */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Film className="w-4 h-4 text-red-400" />
                Recent Uploads
              </h3>
              <div className="space-y-3">
                {videos.slice(0, 5).map((v) => (
                  <div key={v.id} className="flex items-center gap-3">
                    <img src={v.thumbnail} alt={v.title} className="w-12 h-8 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{v.title}</p>
                      <p className="text-gray-500 text-xs">{v.category} • {v.year}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-300 text-sm font-medium">{formatViews(v.views)}</p>
                      <p className="text-gray-600 text-xs">views</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === "videos" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search videos…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500"
                />
              </div>
              <button
                onClick={() => { resetForm(); setActiveTab("add"); }}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Video
              </button>
            </div>

            <div className="grid gap-3">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:border-white/20 transition-colors"
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-20 h-12 object-cover rounded-lg shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-white font-semibold text-sm truncate">{video.title}</h3>
                      {video.isFeatured && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">
                          Featured
                        </span>
                      )}
                      {video.isTrending && (
                        <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
                          Trending
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
                      <span>{video.category}</span>
                      <span>{video.year}</span>
                      <span className="flex items-center gap-0.5">
                        <Eye className="w-3 h-3" />
                        {formatViews(video.views)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {video.imdbRating}
                      </span>
                      <span className="text-gray-600">
                        {video.sources.backup1 ? "3 sources" : video.sources.backup2 ? "2 sources" : "1 source"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigate(`/watch/${video.id}`)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => startEdit(video)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        deleteConfirm === video.id
                          ? "bg-red-600 text-white"
                          : "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      }`}
                      title={deleteConfirm === video.id ? "Confirm delete" : "Delete"}
                    >
                      {deleteConfirm === video.id ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add/Edit Video Tab */}
        {activeTab === "add" && (
          <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                {editingId ? <Edit2 className="w-5 h-5 text-blue-400" /> : <Plus className="w-5 h-5 text-red-400" />}
                {editingId ? "Edit Video" : "Add New Video"}
              </h2>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-white text-sm flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Basic Info */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                <h3 className="text-gray-300 font-semibold text-sm uppercase tracking-wide border-b border-white/10 pb-2">
                  📋 Basic Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-gray-400 mb-1.5">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Movie or series title"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs text-gray-400 mb-1.5">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief synopsis..."
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-red-500"
                    >
                      {DEMO_CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                      <option value="Crime">Crime</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as "movie" | "series" })}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-red-500"
                    >
                      <option value="movie">Movie</option>
                      <option value="series">Series</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Year</label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      min={1900}
                      max={2030}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Duration</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g. 2h 15m or 12 Episodes"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Rating</label>
                    <select
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-red-500"
                    >
                      {["G", "PG", "PG-13", "R", "NC-17", "TV-G", "TV-PG", "TV-14", "TV-MA"].map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">IMDb Rating</label>
                    <input
                      type="number"
                      value={formData.imdbRating}
                      onChange={(e) => setFormData({ ...formData, imdbRating: parseFloat(e.target.value) })}
                      min={0}
                      max={10}
                      step={0.1}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Genres (comma separated)</label>
                    <input
                      type="text"
                      value={genreInput}
                      onChange={(e) => setGenreInput(e.target.value)}
                      placeholder="Action, Thriller, Sci-Fi"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Thumbnail & Media */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                <h3 className="text-gray-300 font-semibold text-sm uppercase tracking-wide border-b border-white/10 pb-2">
                  🖼️ Thumbnail
                </h3>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Thumbnail URL</label>
                  <input
                    type="url"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    placeholder="https://example.com/thumbnail.jpg"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500"
                  />
                </div>
                {formData.thumbnail && (
                  <div className="rounded-lg overflow-hidden w-48 aspect-video">
                    <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Video Sources */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                <h3 className="text-gray-300 font-semibold text-sm uppercase tracking-wide border-b border-white/10 pb-2">
                  🎬 Video Sources (Smart Fallback)
                </h3>
                
                {/* Quick Link Generator */}
                <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-4 space-y-3">
                  <label className="block text-xs text-blue-300 font-medium flex items-center gap-1.5">
                    ⚡ Quick Link Generator
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={rawLink}
                      onChange={(e) => setRawLink(e.target.value)}
                      placeholder="Paste FileMoon link here (e.g. filemoon.org/ID/file)"
                      className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={generateEmbedLink}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-colors shrink-0 flex items-center gap-1"
                    >
                      Generate
                    </button>
                  </div>
                  
                  {/* Important Notice */}
                  <div className="bg-yellow-900/20 border border-yellow-600/30 rounded p-3 mt-2">
                    <p className="text-yellow-400 text-xs font-bold mb-1">⚠️ গুরুত্বপূর্ণ নির্দেশনা:</p>
                    <p className="text-gray-400 text-[11px] leading-relaxed">
                      FileMoon ভিডিও সঠিকভাবে প্লে করতে হলে:
                      <br />
                      ১. FileMoon-এ গিয়ে ভিডিও পেজ খুলুন
                      <br />
                      ২. <strong className="text-white">"Embed"</strong> বাটনে ক্লিক করুন
                      <br />
                      ৩. সেখান থেকে পুরো iframe কোডটি কপি করুন
                      <br />
                      ৪. সেই কোডটি সরাসরি নিচের Primary Source বক্সে পেস্ট করুন
                      <br />
                      <span className="text-gray-500">অথবা উপরের বক্সে লিঙ্ক পেস্ট করে Generate বাটনে চাপ দিন।</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 flex items-center gap-1">
                      <span className="text-green-400 font-bold">●</span> Primary Source (Full Embed Code) *
                    </label>
                    <textarea
                      value={formData.sources.primary}
                      onChange={(e) => setFormData({ ...formData, sources: { ...formData.sources, primary: e.target.value } })}
                      placeholder="Full embed code will appear here after generating..."
                      rows={4}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-xs font-mono placeholder:text-gray-600 focus:outline-none focus:border-green-500 resize-y"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 flex items-center gap-1">
                      <span className="text-yellow-400 font-bold">●</span> Backup 1 (Streamtape)
                    </label>
                    <input
                      type="url"
                      value={formData.sources.backup1 || ""}
                      onChange={(e) => setFormData({ ...formData, sources: { ...formData.sources, backup1: e.target.value } })}
                      placeholder="https://streamtape.com/e/XXXXXXXXX"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 flex items-center gap-1">
                      <span className="text-orange-400 font-bold">●</span> Backup 2 (DoodStream)
                    </label>
                    <input
                      type="url"
                      value={formData.sources.backup2 || ""}
                      onChange={(e) => setFormData({ ...formData, sources: { ...formData.sources, backup2: e.target.value } })}
                      placeholder="https://dood.la/e/XXXXXXXXX"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-600 bg-black/30 rounded-lg p-3">
                  💡 If the primary source fails, the player automatically switches to backup sources.
                  Add FileMoon, Streamtape, or DoodStream embed URLs.
                </p>
              </div>

              {/* Cast & Crew */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                <h3 className="text-gray-300 font-semibold text-sm uppercase tracking-wide border-b border-white/10 pb-2">
                  🎭 Cast & Crew
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Director</label>
                    <input
                      type="text"
                      value={formData.director || ""}
                      onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                      placeholder="Director name"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Cast (comma separated)</label>
                    <input
                      type="text"
                      value={castInput}
                      onChange={(e) => setCastInput(e.target.value)}
                      placeholder="Actor 1, Actor 2, Actor 3"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Flags */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="text-gray-300 font-semibold text-sm uppercase tracking-wide border-b border-white/10 pb-2 mb-4">
                  🏷️ Display Flags
                </h3>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div
                      onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
                      className={`w-10 h-6 rounded-full transition-colors relative ${formData.isFeatured ? "bg-yellow-500" : "bg-gray-700"}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isFeatured ? "translate-x-5" : "translate-x-1"}`} />
                    </div>
                    <span className="text-sm text-gray-300 group-hover:text-white">⭐ Featured (Hero Banner)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div
                      onClick={() => setFormData({ ...formData, isTrending: !formData.isTrending })}
                      className={`w-10 h-6 rounded-full transition-colors relative ${formData.isTrending ? "bg-red-500" : "bg-gray-700"}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isTrending ? "translate-x-5" : "translate-x-1"}`} />
                    </div>
                    <span className="text-sm text-gray-300 group-hover:text-white">🔥 Trending</span>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 sticky bottom-4 bg-[#0f0f0f]/90 backdrop-blur-sm p-4 -mx-4 sm:-mx-6 rounded-xl border-t border-white/10">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white font-bold text-sm rounded-xl transition-colors"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSubmitting ? "Saving…" : editingId ? "Update Video" : "Add Video"}
                </button>
                <button
                  type="button"
                  onClick={() => { resetForm(); setActiveTab("videos"); }}
                  className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white text-sm rounded-xl transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* Top Videos by Views */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-400" />
                Top Videos by Views
              </h3>
              <div className="space-y-3">
                {[...videos]
                  .sort((a, b) => b.views - a.views)
                  .slice(0, 8)
                  .map((video, index) => {
                    const pct = Math.round((video.views / Math.max(...videos.map((v) => v.views), 1)) * 100);
                    return (
                      <div key={video.id} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-5 text-xs font-bold shrink-0 ${index === 0 ? "text-yellow-400" : index < 3 ? "text-gray-300" : "text-gray-600"}`}>
                              #{index + 1}
                            </span>
                            <span className="text-white truncate">{video.title}</span>
                          </div>
                          <span className="text-gray-400 shrink-0 ml-2">{formatViews(video.views)}</span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden ml-7">
                          <div
                            className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-400" />
                Content by Category
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {DEMO_CATEGORIES.filter((c) => c.id !== "all").map((cat) => {
                  const count = videos.filter((v) => v.category === cat.name).length;
                  return (
                    <div key={cat.id} className="bg-white/5 rounded-lg p-3 text-center">
                      <div className="text-2xl mb-1">{cat.icon}</div>
                      <div className="text-white font-bold text-lg">{count}</div>
                      <div className="text-gray-500 text-xs">{cat.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Revenue Simulation */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-green-400" />
                Revenue Estimate (Simulation)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Ad Revenue (est.)", value: `$${(totalViews * 0.002).toFixed(2)}`, color: "text-green-400", note: "$2 CPM" },
                  { label: "Pro Subscriptions", value: "$0.00", color: "text-yellow-400", note: "0 Pro users" },
                  { label: "Total Estimate", value: `$${(totalViews * 0.002).toFixed(2)}`, color: "text-white", note: "This month" },
                ].map((item) => (
                  <div key={item.label} className="bg-black/30 rounded-lg p-4 text-center">
                    <div className={`text-2xl font-black ${item.color}`}>{item.value}</div>
                    <div className="text-gray-400 text-sm mt-1">{item.label}</div>
                    <div className="text-gray-600 text-xs mt-0.5">{item.note}</div>
                  </div>
                ))}
              </div>
              <p className="text-gray-600 text-xs mt-3 text-center">
                💡 Estimates based on {formatViews(totalViews)} total views at standard CPM rates.
              </p>
            </div>

            {/* Firebase Integration Note */}
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-5">
              <h3 className="text-blue-300 font-bold mb-3 flex items-center gap-2">
                <Database className="w-4 h-4" />
                🔥 Firebase Integration
              </h3>
              <p className="text-gray-400 text-sm mb-3">
                Currently running in <strong className="text-white">Demo Mode</strong> with localStorage. 
                To connect Firebase Firestore for real-time data:
              </p>
              <ol className="text-gray-500 text-xs space-y-1.5 list-decimal list-inside">
                <li>Create a Firebase project at console.firebase.google.com</li>
                <li>Enable Authentication (Email/Password)</li>
                <li>Create a Firestore database</li>
                <li>Copy your config to <code className="text-gray-300 bg-black/30 px-1 rounded">src/firebase/config.ts</code></li>
                <li>Set <code className="text-gray-300 bg-black/30 px-1 rounded">isFirebaseAvailable = true</code></li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
