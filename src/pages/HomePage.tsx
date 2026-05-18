import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Film, Star, ArrowRight } from "lucide-react";
import HeroBanner from "../components/HeroBanner";
import VideoRow from "../components/VideoRow";
import { useVideos } from "../context/VideoContext";
import { useAuth } from "../context/AuthContext";
import { DEMO_CATEGORIES } from "../data/demoData";

// Banner Ad Component
function BannerAd({ className = "" }: { className?: string }) {
  return (
    <div className={`mx-4 sm:mx-8 rounded-xl overflow-hidden border border-gray-700 ${className}`}>
      <div className="relative bg-gradient-to-r from-purple-900/60 via-blue-900/60 to-indigo-900/60 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
            🎮
          </div>
          <div>
            <p className="text-white font-bold text-sm sm:text-base">
              Play The Hottest Games Online — Free!
            </p>
            <p className="text-gray-400 text-xs sm:text-sm">
              No download required. 500+ games available.
            </p>
          </div>
        </div>
        <a
          href="#"
          className="shrink-0 px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-lg transition-colors"
        >
          Play Free →
        </a>
        <span className="absolute top-2 right-2 text-xs text-gray-500 bg-black/40 px-1.5 py-0.5 rounded">
          Ad
        </span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { videos, isLoading, getFeaturedVideo, getTrendingVideos, getVideosByCategory } =
    useVideos();
  const { currentUser } = useAuth();
  const isPro = currentUser?.plan === "pro";

  const featured = useMemo(() => getFeaturedVideo(), [videos]);
  const trending = useMemo(() => getTrendingVideos(), [videos]);
  const latest = useMemo(
    () => [...videos].sort((a, b) => b.createdAt - a.createdAt).slice(0, 10),
    [videos]
  );
  const actionMovies = useMemo(() => getVideosByCategory("Action"), [videos]);
  const sciFiMovies = useMemo(() => getVideosByCategory("Sci-Fi"), [videos]);
  const dramaMovies = useMemo(() => getVideosByCategory("Drama"), [videos]);
  const series = useMemo(() => videos.filter((v) => v.type === "series"), [videos]);
  const topRated = useMemo(
    () => [...videos].sort((a, b) => b.imdbRating - a.imdbRating).slice(0, 10),
    [videos]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading StreamVault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Hero Section */}
      {featured && <HeroBanner video={featured} />}

      {/* Category Pills */}
      <div className="px-4 sm:px-8 py-6 flex gap-2 overflow-x-auto scrollbar-hide">
        {DEMO_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            to={`/browse?category=${cat.name}`}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white text-sm font-medium rounded-full transition-colors"
          >
            <span>{cat.icon}</span>
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Trending Now */}
      {trending.length > 0 && (
        <VideoRow
          title="Trending Now"
          videos={trending}
          size="lg"
          emoji="🔥"
        />
      )}

      {/* Banner Ad (Free users only) */}
      {!isPro && <BannerAd className="my-4" />}

      {/* Latest Releases */}
      <VideoRow title="Latest Releases" videos={latest} size="md" emoji="🆕" />

      {/* Top Rated */}
      <VideoRow title="Top Rated" videos={topRated} size="md" emoji="⭐" />

      {/* Pro Upgrade Banner */}
      {!isPro && (
        <div className="mx-4 sm:mx-8 my-6 rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-900 via-red-800 to-red-900" />
          <div className="relative px-6 sm:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="text-yellow-400 font-bold text-sm uppercase tracking-wide">
                  StreamVault Pro
                </span>
              </div>
              <h3 className="text-white font-black text-2xl sm:text-3xl mb-2">
                Unlimited Streaming, No Ads
              </h3>
              <div className="flex flex-wrap gap-3 text-sm text-gray-300">
                <span className="flex items-center gap-1">✓ Ad-free experience</span>
                <span className="flex items-center gap-1">✓ HD & 4K quality</span>
                <span className="flex items-center gap-1">✓ Exclusive content</span>
                <span className="flex items-center gap-1">✓ Download & offline</span>
              </div>
            </div>
            <div className="text-center sm:text-right shrink-0">
              <div className="text-white font-black text-4xl mb-1">
                $9<span className="text-2xl">.99</span>
              </div>
              <div className="text-gray-400 text-sm mb-3">/month</div>
              <Link
                to="/settings"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-red-700 font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors"
              >
                Upgrade Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Action Movies */}
      {actionMovies.length > 0 && (
        <VideoRow title="Action & Adventure" videos={actionMovies} size="md" emoji="💥" />
      )}

      {/* Sci-Fi */}
      {sciFiMovies.length > 0 && (
        <VideoRow title="Sci-Fi & Fantasy" videos={sciFiMovies} size="md" emoji="🚀" />
      )}

      {/* Banner Ad 2 */}
      {!isPro && (
        <div className="mx-4 sm:mx-8 my-4 rounded-xl overflow-hidden border border-gray-700">
          <div className="relative bg-gradient-to-r from-green-900/50 to-emerald-900/50 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-xl shrink-0">
                💰
              </div>
              <div>
                <p className="text-white font-bold text-sm">Earn Cash Rewards — Join Now!</p>
                <p className="text-gray-400 text-xs">Complete tasks and get paid instantly.</p>
              </div>
            </div>
            <a
              href="#"
              className="shrink-0 px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-lg transition-colors"
            >
              Earn Now
            </a>
            <span className="absolute top-2 right-2 text-xs text-gray-500 bg-black/40 px-1.5 py-0.5 rounded">
              Ad
            </span>
          </div>
        </div>
      )}

      {/* Drama */}
      {dramaMovies.length > 0 && (
        <VideoRow title="Drama & Stories" videos={dramaMovies} size="md" emoji="🎭" />
      )}

      {/* Series */}
      {series.length > 0 && (
        <VideoRow title="TV Series" videos={series} size="md" emoji="📺" />
      )}

      {/* Stats Bar */}
      <div className="mx-4 sm:mx-8 my-8 py-6 border-t border-b border-gray-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-3xl font-black text-white">{videos.length}+</div>
          <div className="text-gray-500 text-sm">Titles Available</div>
        </div>
        <div>
          <div className="text-3xl font-black text-white">4K</div>
          <div className="text-gray-500 text-sm">Ultra HD Quality</div>
        </div>
        <div>
          <div className="text-3xl font-black text-white">24/7</div>
          <div className="text-gray-500 text-sm">Always Streaming</div>
        </div>
        <div>
          <div className="text-3xl font-black text-white">Free</div>
          <div className="text-gray-500 text-sm">Basic Access</div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-4 sm:px-8 py-10 mt-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-red-600 rounded flex items-center justify-center">
                  <Film className="w-4 h-4 text-white" />
                </div>
                <span className="text-red-500 font-black text-lg">
                  Stream<span className="text-white">Vault</span>
                </span>
              </div>
              <p className="text-gray-500 text-sm max-w-xs">
                Your premium OTT streaming platform. Watch anywhere, anytime.
              </p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">FAQ</a>
              <a href="#" className="hover:text-white transition-colors">Help Center</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-gray-600 text-xs">
              © 2024 StreamVault. All rights reserved.
            </p>
            <p className="text-gray-600 text-xs flex items-center gap-1">
              Powered by FileMoon • Firebase • React
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
