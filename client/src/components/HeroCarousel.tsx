import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface HeroAd {
  id: number;
  title: string;
  subtitle?: string | null;
  mediaUrl: string;
  mediaType: "image" | "video";
  linkUrl?: string | null;
  linkLabel?: string | null;
  sortOrder: number;
  isActive: boolean;
}

const FALLBACK_ADS: HeroAd[] = [
  {
    id: 1,
    title: "باقات الحج المميزة 2025",
    subtitle: "أداء فريضة الحج بأعلى مستوى من الراحة والخدمة",
    mediaUrl:
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=900&q=80",
    mediaType: "image",
    linkUrl: "/hajj",
    linkLabel: "اكتشف الباقات",
    sortOrder: 0,
    isActive: true,
  },
  {
    id: 2,
    title: "عمرة رمضان المبارك",
    subtitle: "عروض خاصة لموسم رمضان 1446هـ — احجز مقعدك الآن",
    mediaUrl:
      "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=900&q=80",
    mediaType: "image",
    linkUrl: "/umrah",
    linkLabel: "احجز الآن",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 3,
    title: "فنادق على بُعد خطوات من الحرم",
    subtitle: "إقامة فاخرة قريبة من المسجد الحرام والمسجد النبوي",
    mediaUrl:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&q=80",
    mediaType: "image",
    linkUrl: "/hotels",
    linkLabel: "تصفح الفنادق",
    sortOrder: 2,
    isActive: true,
  },
];

/**
 * HeroAdCarousel — standalone card-style carousel for the middle hero zone.
 * Ads appear as floating image cards (NOT as the page background).
 */
export default function HeroCarousel() {
  const { data: ads = [] } = trpc.heroAds.list.useQuery(undefined, {
    staleTime: 60_000,
  });
  const slides: HeroAd[] = ads.length > 0 ? (ads as HeroAd[]) : FALLBACK_ADS;

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % slides.length),
    [slides.length]
  );
  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + slides.length) % slides.length),
    [slides.length]
  );

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [paused, next, slides.length]);

  const slide = slides[current];

  return (
    <div
      className="relative w-full flex flex-col items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Main card ── */}
      <div
        className="relative overflow-hidden w-full"
        style={{
          maxWidth: "860px",
          height: "clamp(120px, 15vw, 175px)",
          borderRadius: "16px",
          boxShadow:
            "0 24px 64px rgba(0,0,0,0.65), 0 0 0 1px rgba(201,169,110,0.3)",
        }}
      >
        {/* Slides */}
        {slides.map((s, i) => (
          <div
            key={s.id}
            className="absolute inset-0 transition-opacity"
            style={{
              opacity: i === current ? 1 : 0,
              transitionDuration: "900ms",
            }}
          >
            {s.mediaType === "video" ? (
              <video
                src={s.mediaUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={s.mediaUrl}
                alt={s.title}
                className="w-full h-full object-cover"
                style={{
                  animation:
                    i === current ? "adCardZoom 6s ease-out forwards" : "none",
                }}
              />
            )}
            {/* Gradient overlay — right side for RTL text */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to left, rgba(5,20,15,0.88) 0%, rgba(5,20,15,0.55) 45%, rgba(5,20,15,0.1) 75%, transparent 100%)",
              }}
            />
          </div>
        ))}

        {/* Text overlay — right side */}
        <div className="absolute inset-0 z-10 flex flex-col justify-center items-end px-6 md:px-8 text-right">
          <h3
            className="text-white font-bold leading-tight mb-1"
            style={{
              fontFamily: "'Tajawal', sans-serif",
              fontSize: "clamp(1rem, 2.2vw, 1.4rem)",
              textShadow: "0 2px 10px rgba(0,0,0,0.7)",
            }}
          >
            {slide.title}
          </h3>
          {slide.subtitle && (
            <p
              className="text-white/70 mb-3 max-w-xs"
              style={{
                fontFamily: "'Tajawal', sans-serif",
                fontSize: "clamp(0.75rem, 1.3vw, 0.9rem)",
              }}
            >
              {slide.subtitle}
            </p>
          )}
          {slide.linkUrl && (
            <Link href={slide.linkUrl}>
              <span
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold cursor-pointer transition-all hover:scale-105 active:scale-95"
                style={{
                  background: "rgba(201,169,110,0.92)",
                  color: "#0a1e17",
                  fontFamily: "'Tajawal', sans-serif",
                  fontSize: "clamp(0.7rem, 1.2vw, 0.85rem)",
                  boxShadow: "0 2px 14px rgba(201,169,110,0.45)",
                }}
              >
                {slide.linkLabel || "اكتشف المزيد"}
                <ExternalLink className="w-3 h-3" />
              </span>
            </Link>
          )}
        </div>

        {/* Slide counter badge */}
        <div
          className="absolute top-3 left-3 z-10 text-white/60 text-xs font-mono"
          style={{ fontFamily: "monospace" }}
        >
          {current + 1}/{slides.length}
        </div>

        {/* Progress bar at bottom of card */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-20">
          <div
            key={current}
            className="h-full bg-[var(--gold)]"
            style={{
              animation: "progressBar 5s linear forwards",
            }}
          />
        </div>

        {/* Arrow buttons inside card */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/30 hover:bg-black/55 border border-white/15 flex items-center justify-center text-white transition-all backdrop-blur-sm"
              aria-label="السابق"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={next}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/30 hover:bg-black/55 border border-white/15 flex items-center justify-center text-white transition-all backdrop-blur-sm"
              aria-label="التالي"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* ── Dot indicators below card ── */}
      {slides.length > 1 && (
        <div className="flex gap-1.5 mt-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "w-5 h-1.5 bg-[var(--gold)]"
                  : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"
              }`}
              aria-label={`الشريحة ${i + 1}`}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes adCardZoom {
          from { transform: scale(1.05); }
          to   { transform: scale(1.0); }
        }
        @keyframes progressBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
