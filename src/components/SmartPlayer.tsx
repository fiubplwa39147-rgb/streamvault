import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Loader2,
  WifiOff,
  RefreshCw,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Signal,
  Crown,
  ChevronDown,
  Zap,
} from "lucide-react";
import { Video } from "../types";
import { useAuth } from "../context/AuthContext";

interface SmartPlayerProps {
  video: Video;
  onClose?: () => void;
}

// ─── URL helpers ────────────────────────────────────────────────────────────

/**
 * Normalise any video URL into a proper embed URL.
 *
 * Supported patterns
 *  • youtube.com/watch?v=ID   → youtube.com/embed/ID?autoplay=1&rel=0
 *  • youtu.be/ID              → youtube.com/embed/ID?autoplay=1&rel=0
 *  • youtube.com/embed/ID     → kept, autoplay injected
 *  • filemoon.sx/ID/… or /e/ID → filemoon.sx/e/ID?autoplay=1
 *  • streamtape / doodstream / mixdrop etc. → URL kept, autoplay attempted
 *  • full <iframe …> HTML string → returned as-is (rendered via innerHTML)
 */
function buildEmbedUrl(raw: string): string {
  if (!raw) return "";
  if (raw.trimStart().startsWith("<")) return raw; // raw HTML embed code

  try {
    // ── YouTube ──
    const ytWatch = raw.match(
      /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytWatch) {
      return `https://www.youtube.com/embed/${ytWatch[1]}?autoplay=1&rel=0&modestbranding=1`;
    }

    const ytEmbed = raw.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
    if (ytEmbed) {
      const u = new URL(raw);
      u.searchParams.set("autoplay", "1");
      u.searchParams.set("rel", "0");
      u.searchParams.set("modestbranding", "1");
      return u.toString();
    }

    // ── FileMoon ──
    if (raw.includes("filemoon")) {
      const idMatch = raw.match(/\/(?:e\/)?([a-zA-Z0-9]+)(?:\/[^?]*)?(?:\?|$)/);
      if (idMatch?.[1]) {
        const u = new URL(raw);
        return `${u.protocol}//${u.host}/e/${idMatch[1]}?autoplay=1`;
      }
    }

    // ── Generic: just append autoplay if the host allows query params ──
    const u = new URL(raw);
    u.searchParams.set("autoplay", "1");
    return u.toString();
  } catch {
    return raw;
  }
}

function isRawHtml(src: string) {
  return src.trimStart().startsWith("<");
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function AdOverlay({
  countdown,
  onSkip,
}: {
  countdown: number;
  onSkip: () => void;
}) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm">
      {/* Animated gradient ring */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.5)]">
          <span className="text-4xl">🎬</span>
        </div>
        <svg
          className="absolute inset-0 -rotate-90"
          width="96"
          height="96"
          viewBox="0 0 96 96"
        >
          <circle
            cx="48"
            cy="48"
            r="44"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="4"
          />
          <circle
            cx="48"
            cy="48"
            r="44"
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 44}`}
            strokeDashoffset={`${2 * Math.PI * 44 * (countdown / 5)}`}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
      </div>

      <div className="text-center mb-6 px-6">
        <p className="text-white font-bold text-xl mb-1">StreamVault Pro</p>
        <p className="text-gray-400 text-sm">বিজ্ঞাপন ছাড়া দেখুন, যেকোনো সময়</p>
        <div className="flex items-center justify-center gap-4 mt-3">
          {["No Ads", "HD Quality", "All Content"].map((f) => (
            <span key={f} className="text-green-400 text-xs flex items-center gap-1">
              <span className="text-green-500">✓</span> {f}
            </span>
          ))}
        </div>
        <p className="text-yellow-400 font-bold text-lg mt-2">Only $9.99/month</p>
      </div>

      <div className="flex items-center gap-3">
        {countdown > 0 ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
            <Loader2 className="w-4 h-4 text-gray-300 animate-spin" />
            <span className="text-gray-300 text-sm">
              Skip in <span className="text-white font-bold">{countdown}s</span>
            </span>
          </div>
        ) : (
          <button
            onClick={onSkip}
            className="px-6 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-100 active:scale-95 transition-all"
          >
            Watch Now →
          </button>
        )}
        <a
          href="/settings"
          className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-full transition-colors flex items-center gap-1.5"
        >
          <Crown className="w-3.5 h-3.5" />
          Upgrade
        </a>
      </div>
    </div>
  );
}

function ErrorOverlay({
  sourceIndex,
  totalSources,
  onRetry,
}: {
  sourceIndex: number;
  totalSources: number;
  onRetry: () => void;
}) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0a0a0a] text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-800/40 flex items-center justify-center mb-4">
        <WifiOff className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-white font-bold text-lg mb-1">Video Unavailable</h3>
      <p className="text-gray-500 text-sm mb-1">
        {sourceIndex >= totalSources
          ? "All streaming sources failed."
          : `Source ${sourceIndex} failed. Switching…`}
      </p>
      <p className="text-gray-600 text-xs mb-5">
        Please check your connection or try again later.
      </p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all"
      >
        <RefreshCw className="w-4 h-4" />
        Retry
      </button>
    </div>
  );
}

function LoadingOverlay({
  sourceIndex,
  total,
}: {
  sourceIndex: number;
  total: number;
}) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/85">
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-full border-2 border-red-600/30 border-t-red-500 animate-spin" />
        <Zap className="absolute inset-0 m-auto w-5 h-5 text-red-400" />
      </div>
      <p className="text-gray-400 text-sm">
        Loading source{" "}
        <span className="text-white font-semibold">{sourceIndex + 1}</span>
        {total > 1 && (
          <>
            {" "}
            of <span className="text-white font-semibold">{total}</span>
          </>
        )}
        …
      </p>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SmartPlayer({ video, onClose }: SmartPlayerProps) {
  const { currentUser } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const isPro = currentUser?.plan === "pro";

  // Collect non-empty sources
  const sources = [
    video.sources.primary,
    video.sources.backup1,
    video.sources.backup2,
  ].filter((s): s is string => Boolean(s));

  const [sourceIndex, setSourceIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [allFailed, setAllFailed] = useState(false);

  // Ad state
  const [adCountdown, setAdCountdown] = useState(5);
  const [adDismissed, setAdDismissed] = useState(false);
  const showAd = !isPro && !adDismissed;

  // Controls UI
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const [backupNotice, setBackupNotice] = useState(false);

  // ── Pre-roll countdown ──
  useEffect(() => {
    if (isPro) {
      setAdDismissed(true);
      return;
    }
    setAdDismissed(false);
    setAdCountdown(5);
    const id = setInterval(() => {
      setAdCountdown((c) => {
        if (c <= 1) {
          clearInterval(id);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isPro, video.id]);

  // ── Reset player when video changes ──
  useEffect(() => {
    setSourceIndex(0);
    setIsLoading(true);
    setAllFailed(false);
    setBackupNotice(false);
  }, [video.id]);

  // ── Fullscreen listener ──
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const handleLoad = useCallback(() => setIsLoading(false), []);

  const handleError = useCallback(() => {
    const next = sourceIndex + 1;
    if (next < sources.length) {
      setBackupNotice(true);
      setSourceIndex(next);
      setIsLoading(true);
      setTimeout(() => setBackupNotice(false), 4000);
    } else {
      setAllFailed(true);
      setIsLoading(false);
    }
  }, [sourceIndex, sources.length]);

  const handleRetry = useCallback(() => {
    setAllFailed(false);
    setSourceIndex(0);
    setIsLoading(true);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const switchSource = useCallback((i: number) => {
    setSourceIndex(i);
    setIsLoading(true);
    setAllFailed(false);
    setShowSourceMenu(false);
  }, []);

  const currentSrc = sources[sourceIndex] ?? "";
  const embedUrl = buildEmbedUrl(currentSrc);
  const isHtmlEmbed = isRawHtml(currentSrc);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#0a0a0a] rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
      style={{ aspectRatio: "16/9" }}
    >
      {/* ── Pre-roll Ad ── */}
      {showAd && (
        <AdOverlay
          countdown={adCountdown}
          onSkip={() => setAdDismissed(true)}
        />
      )}

      {/* ── All Sources Failed ── */}
      {allFailed && (
        <ErrorOverlay
          sourceIndex={sourceIndex}
          totalSources={sources.length}
          onRetry={handleRetry}
        />
      )}

      {/* ── Loading Spinner ── */}
      {isLoading && !allFailed && !showAd && (
        <LoadingOverlay sourceIndex={sourceIndex} total={sources.length} />
      )}

      {/* ── Backup Source Notice ── */}
      {backupNotice && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-yellow-500/90 text-black text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5" />
          Switching to backup source {sourceIndex + 1}…
        </div>
      )}

      {/* ── Player ── */}
      {!showAd && !allFailed && currentSrc && (
        isHtmlEmbed ? (
          // Raw HTML embed (e.g. copy-pasted <iframe> code from a host)
          <div
            className="w-full h-full [&>*]:w-full [&>*]:h-full [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:border-0"
            dangerouslySetInnerHTML={{ __html: currentSrc }}
          />
        ) : (
          // Standard URL embed — NO sandbox attribute (fixes YouTube + most hosts)
          <iframe
            ref={iframeRef}
            key={`${video.id}-${sourceIndex}`}
            src={embedUrl}
            className="w-full h-full border-0 block"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            onLoad={handleLoad}
            onError={handleError}
            title={video.title}
            referrerPolicy="no-referrer-when-downgrade"
          />
        )
      )}

      {/* ── Controls Overlay (bottom bar) ── */}
      {!showAd && !allFailed && (
        <div className="absolute bottom-0 left-0 right-0 z-10 px-3 pb-3 pt-8 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
          <div className="flex items-center justify-between gap-2">
            {/* Left: Source switcher */}
            <div className="flex items-center gap-2">
              {sources.length > 1 && (
                <div className="relative">
                  <button
                    onClick={() => setShowSourceMenu((v) => !v)}
                    className="flex items-center gap-1.5 text-xs text-white bg-white/15 hover:bg-white/25 backdrop-blur-sm px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Signal className="w-3.5 h-3.5" />
                    Source {sourceIndex + 1}
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${showSourceMenu ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showSourceMenu && (
                    <div className="absolute bottom-full mb-2 left-0 bg-black/90 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-36">
                      {sources.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => switchSource(i)}
                          className={`flex items-center gap-2 w-full text-left px-3 py-2 text-xs transition-colors ${
                            i === sourceIndex
                              ? "text-red-400 bg-red-500/10"
                              : "text-gray-300 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <Signal
                            className={`w-3 h-3 ${i === sourceIndex ? "text-red-400" : "text-gray-500"}`}
                          />
                          {i === 0 ? "Primary" : `Backup ${i}`}
                          {i === sourceIndex && (
                            <span className="ml-auto text-red-400">●</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Quality badge */}
              <span
                className={`text-xs px-2.5 py-1 rounded-lg backdrop-blur-sm font-medium flex items-center gap-1 ${
                  isPro
                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    : "bg-white/10 text-gray-400"
                }`}
              >
                {isPro && <Crown className="w-3 h-3" />}
                {isPro ? "Pro HD" : "Standard"}
              </span>
            </div>

            {/* Right: Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="text-white bg-white/15 hover:bg-white/25 backdrop-blur-sm p-2 rounded-lg transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Close Button ── */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-50 w-8 h-8 bg-black/60 hover:bg-black/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors border border-white/10"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
