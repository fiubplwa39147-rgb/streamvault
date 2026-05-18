import { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, Grid, List, Star, Clock, Eye, SlidersHorizontal } from "lucide-react";
import { useVideos } from "../context/VideoContext";
import { DEMO_CATEGORIES, formatViews } from "../data/demoData";
import { Video } from "../types";

type SortOption = "newest" | "oldest" | "views" | "rating" | "az";
type ViewMode = "grid" | "list";

export default function BrowsePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { videos } = useVideos();

  const initCategory = params.get("category") || "All";
  const initTrending = params.get("trending") === "true";
  const initType = params.get("type") || "all";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initCategory);
  const [selectedType, setSelectedType] = useState<"all" | "movie" | "series">(
    initType === "series" ? "series" : "all"
  );
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState(0);

  const filtered = useMemo(() => {
    let result = [...videos];

    if (initTrending) result = result.filter((v) => v.isTrending);
    if (selectedType !== "all") result = result.filter((v) => v.type === selectedType);
    if (selectedCategory !== "All") {
      result = result.filter(
        (v) =>
          v.category === selectedCategory ||
          v.genre.some((g) => g.toLowerCase() === selectedCategory.toLowerCase())
      );
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          v.genre.some((g) => g.toLowerCase().includes(q))
      );
    }
    if (minRating > 0) result = result.filter((v) => v.imdbRating >= minRating);

    switch (sortBy) {
      case "newest": result.sort((a, b) => b.createdAt - a.createdAt); break;
      case "oldest": result.sort((a, b) => a.createdAt - b.createdAt); break;
      case "views": result.sort((a, b) => b.views - a.views); break;
      case "rating": result.sort((a, b) => b.imdbRating - a.imdbRating); break;
      case "az": result.sort((a, b) => a.title.localeCompare(b.title)); break;
    }

    return result;
  }, [videos, selectedCategory, selectedType, searchQuery, sortBy, initTrending, minRating]);

  const pageTitle = initTrending
    ? "🔥 Trending Now"
    : selectedType === "series"
    ? "📺 TV Series"
    : selectedCategory !== "All"
    ? `${selectedCategory} Movies`
    : "🎬 All Content";

  return (
    <div className="min-h-screen bg-[#141414] pt-20 pb-12">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{pageTitle}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{filtered.length} titles found</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-gray-300 transition-colors"
            >
              {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showFilters
                  ? "bg-red-600 text-white"
                  : "bg-white/10 hover:bg-white/20 text-gray-300"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="space-y-4 mb-8">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search movies, series, genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {DEMO_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.name
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                    : "bg-white/10 hover:bg-white/20 text-gray-300"
                }`}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as typeof selectedType)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="movie">Movies</option>
                  <option value="series">Series</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="views">Most Viewed</option>
                  <option value="rating">Top Rated</option>
                  <option value="az">A - Z</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Min Rating: {minRating}+</label>
                <input
                  type="range"
                  min={0}
                  max={9}
                  step={0.5}
                  value={minRating}
                  onChange={(e) => setMinRating(parseFloat(e.target.value))}
                  className="w-full accent-red-600"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                    setSelectedType("all");
                    setSortBy("newest");
                    setMinRating(0);
                  }}
                  className="w-full py-2 bg-white/10 hover:bg-white/20 text-gray-300 text-sm rounded-lg transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🎬</div>
            <h3 className="text-white font-bold text-xl mb-2">No results found</h3>
            <p className="text-gray-400">Try adjusting your filters or search terms</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map((video) => (
              <GridCard key={video.id} video={video} onClick={() => navigate(`/watch/${video.id}`)} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((video) => (
              <ListCard key={video.id} video={video} onClick={() => navigate(`/watch/${video.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GridCard({ video, onClick }: { video: Video; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-800 mb-2">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-110 group-hover:brightness-75 transition-all duration-300"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl">
            <span className="text-black text-lg ml-0.5">▶</span>
          </div>
        </div>
        <div className="absolute top-1.5 right-1.5 bg-red-600/90 text-white text-xs px-1.5 py-0.5 rounded capitalize">
          {video.type}
        </div>
        <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded text-xs">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-white">{video.imdbRating}</span>
        </div>
      </div>
      <h3 className="text-white text-sm font-medium truncate group-hover:text-red-400 transition-colors">
        {video.title}
      </h3>
      <p className="text-gray-500 text-xs">{video.year} • {video.category}</p>
    </div>
  );
}

function ListCard({ video, onClick }: { video: Video; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 cursor-pointer transition-all"
    >
      <div className="relative w-28 shrink-0 aspect-video rounded-lg overflow-hidden bg-gray-800">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-semibold truncate group-hover:text-red-400 transition-colors">
          {video.title}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-1 mt-0.5">{video.description}</p>
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {video.imdbRating}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {video.duration}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {formatViews(video.views)}
          </span>
          <span className="border border-gray-700 px-1.5 py-0.5 rounded">{video.rating}</span>
          {video.isTrending && (
            <span className="text-red-400 font-medium">🔥 Trending</span>
          )}
        </div>
      </div>
      <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-10 h-10 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm ml-0.5">▶</span>
        </div>
      </div>
    </div>
  );
}
