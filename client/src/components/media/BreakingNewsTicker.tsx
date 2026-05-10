import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Zap, Bell, Newspaper, Megaphone, X } from "lucide-react";
import { Link } from "wouter";

const TYPE_ICON = {
  news: Newspaper,
  alert: Bell,
  article: Newspaper,
  announcement: Megaphone,
} as const;

export function BreakingNewsTicker() {
  const { data: posts = [] } = trpc.media.getBreaking.useQuery();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || posts.length === 0) return null;

  // Build a single long string of all headlines separated by bullets
  const allItems = [...posts, ...posts]; // duplicate for seamless loop

  return (
    <div
      dir="rtl"
      style={{
        background: "#0d3b2e",
        height: "38px",
        display: "flex",
        alignItems: "stretch",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      }}
    >
      {/* عاجل badge — fixed on the right */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "#dc2626",
          color: "white",
          fontWeight: "bold",
          fontSize: "13px",
          padding: "0 14px",
          zIndex: 2,
          whiteSpace: "nowrap",
        }}
      >
        <Zap style={{ width: 14, height: 14, animation: "pulse 1s infinite" }} />
        عاجل
      </div>

      {/* Separator line */}
      <div style={{ width: "1px", background: "rgba(255,255,255,0.2)", flexShrink: 0 }} />

      {/* Scrolling area */}
      <div
        dir="ltr"
        style={{
          flex: 1,
          overflow: "hidden",
          position: "relative",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* The moving strip — starts at 0 and moves to -50% for seamless loop */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            whiteSpace: "nowrap",
            animation: `marqueeRTL ${Math.max(25, allItems.length * 5)}s linear infinite`,
            gap: 0,
          }}
        >
          {allItems.map((post, idx) => {
            const Icon = TYPE_ICON[post.type as keyof typeof TYPE_ICON] ?? Newspaper;
            return (
              <span
                key={`${post.id}-${idx}`}
                onClick={() => { window.location.href = "/media"; }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#ffffff",
                  fontSize: "13px",
                  cursor: "pointer",
                  padding: "0 24px",
                  transition: "color 0.2s",
                  fontFamily: "'Tajawal', sans-serif",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#f0c040")}
                onMouseLeave={e => (e.currentTarget.style.color = "#ffffff")}
              >
                <Icon style={{ width: 13, height: 13, opacity: 0.6, flexShrink: 0 }} />
                {post.title}
                <span style={{ color: "rgba(255,255,255,0.3)", margin: "0 4px", fontSize: "16px" }}>•</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        aria-label="إغلاق شريط الأخبار"
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "36px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "rgba(255,255,255,0.5)",
          zIndex: 2,
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        <X style={{ width: 14, height: 14 }} />
      </button>

      <style>{`
        @keyframes marqueeRTL {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

// ─── Latest News Section for Homepage ────────────────────────────────────────
export function LatestNewsSection() {
  const { data: posts = [], isLoading } = trpc.media.list.useQuery({
    limit: 4,
    offset: 0,
    publishedOnly: true,
  });

  if (isLoading || posts.length === 0) return null;

  const TYPE_LABEL = {
    news: "خبر",
    alert: "تنبيه",
    article: "مقال",
    announcement: "إعلان",
  };

  const TYPE_BG = {
    news: "bg-blue-100 text-blue-700",
    alert: "bg-red-100 text-red-700",
    article: "bg-emerald-100 text-emerald-700",
    announcement: "bg-amber-100 text-amber-700",
  };

  return (
    <section className="py-12 bg-[var(--background)]" dir="rtl">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-[var(--primary)] rounded-full" />
            <div>
              <h2 className="text-2xl font-bold text-[var(--teal-800)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                المركز الإعلامي
              </h2>
              <p className="text-sm text-[var(--muted-foreground)]">آخر الأخبار والتنبيهات والمقالات</p>
            </div>
          </div>
          <Link href="/media" className="text-sm text-[var(--primary)] hover:underline font-medium flex items-center gap-1">
            عرض الكل
            <span className="text-lg">←</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {posts.map((post, idx) => {
            const Icon = TYPE_ICON[post.type as keyof typeof TYPE_ICON] ?? Newspaper;
            const typeLabel = TYPE_LABEL[post.type as keyof typeof TYPE_LABEL] ?? "خبر";
            const typeBg = TYPE_BG[post.type as keyof typeof TYPE_BG] ?? "bg-blue-100 text-blue-700";

            return (
              <Link
                key={post.id}
                href="/media"
                className={`group block bg-white rounded-2xl border border-[var(--border)] overflow-hidden hover:shadow-md hover:border-[var(--primary)]/30 transition-all duration-300 ${idx === 0 ? "md:col-span-2" : ""}`}
              >
                {post.imageUrl ? (
                  <div className={`overflow-hidden ${idx === 0 ? "h-48" : "h-36"}`}>
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ) : (
                  <div className={`bg-gradient-to-br from-[var(--teal-800)] to-[var(--teal-600)] flex items-center justify-center ${idx === 0 ? "h-48" : "h-36"}`}>
                    <Icon className="w-10 h-10 text-white/20" />
                  </div>
                )}
                <div className="p-4 space-y-2">
                  <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${typeBg}`}>
                    {typeLabel}
                  </span>
                  <h3
                    className="font-bold text-[var(--teal-800)] leading-snug line-clamp-2 group-hover:text-[var(--primary)] transition-colors text-sm"
                    style={{ fontFamily: "'Tajawal', sans-serif" }}
                  >
                    {post.title}
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {new Date(post.createdAt).toLocaleDateString("ar-SA", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
