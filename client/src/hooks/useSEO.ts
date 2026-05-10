import { useEffect } from "react";

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  lang?: string;
  structuredData?: object;
}

const DEFAULT_OG_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU/kaaba-hero_cc30eaae.jpg";
const SITE_NAME = "جو عمرة — Go Umrah";
const BASE_URL = "https://go-umrah.com";

export function useSEO(config: SEOConfig) {
  useEffect(() => {
    // Title
    document.title = `${config.title} | ${SITE_NAME}`;

    // Meta description
    setMeta("description", config.description);

    // Keywords
    if (config.keywords) {
      setMeta("keywords", config.keywords);
    }

    // Open Graph
    setMetaProperty("og:title", config.title);
    setMetaProperty("og:description", config.description);
    setMetaProperty("og:image", config.ogImage || DEFAULT_OG_IMAGE);
    setMetaProperty("og:type", config.ogType || "website");
    setMetaProperty("og:site_name", SITE_NAME);
    setMetaProperty("og:locale", config.lang === "ar" ? "ar_SA" : "en_US");

    // Twitter Card
    setMetaName("twitter:card", "summary_large_image");
    setMetaName("twitter:title", config.title);
    setMetaName("twitter:description", config.description);
    setMetaName("twitter:image", config.ogImage || DEFAULT_OG_IMAGE);

    // Canonical
    if (config.canonicalUrl) {
      let canonical = document.querySelector<HTMLLinkElement>("link[rel='canonical']");
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = `${BASE_URL}${config.canonicalUrl}`;
    }

    // Structured Data (JSON-LD)
    if (config.structuredData) {
      let script = document.querySelector<HTMLScriptElement>("script[data-seo='structured']");
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-seo", "structured");
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(config.structuredData);
    }

    // Cleanup
    return () => {
      // Reset to default on unmount
      document.title = SITE_NAME;
    };
  }, [config.title, config.description, config.keywords, config.ogImage, config.canonicalUrl]);
}

function setMeta(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}

function setMetaProperty(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setMetaName(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}

// Pre-defined SEO configs for each page
export const SEO_CONFIGS = {
  home: {
    title: "جو عمرة — وكالة السفر الإسلامية الفاخرة",
    description: "احجز رحلة العمرة والحج مع جو عمرة — باقات فاخرة، فنادق 5 نجوم، تأشيرات سريعة، وخدمة 24/7 لأكثر من 50 دولة.",
    keywords: "عمرة, حج, باقات عمرة, رحلات دينية, تأشيرة عمرة, فنادق مكة, فنادق المدينة, Go Umrah",
    canonicalUrl: "/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "TravelAgency",
      "name": "Go Umrah",
      "url": "https://go-umrah.com",
      "description": "Premium Islamic travel agency for Hajj and Umrah packages",
      "telephone": "+966-12-345-6789",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "SA",
        "addressLocality": "Riyadh",
      },
      "priceRange": "$$$",
      "currenciesAccepted": "SAR, USD, EUR, GBP, EGP, PKR, INR",
    },
  },
  hajj: {
    title: "باقات الحج 2025 — جو عمرة",
    description: "اكتشف أفضل باقات الحج لعام 2025. باقات داخلية وخارجية بأسعار تنافسية، فنادق 5 نجوم في المشاعر المقدسة.",
    keywords: "باقات حج, حج 2025, حج خارجي, حج داخلي, نسك, وزارة الحج",
    canonicalUrl: "/hajj",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Hajj Packages 2025",
      "description": "Premium Hajj packages for 2025 season",
      "brand": { "@type": "Brand", "name": "Go Umrah" },
    },
  },
  hajjLocal: {
    title: "الحج الداخلي 1447هـ — بوابة نسك",
    description: "باقات الحج الداخلي للمقيمين في المملكة العربية السعودية. معلومات وباقات مزامنة مع منصة نسك الرسمية.",
    keywords: "حج داخلي, نسك, باقات حج سعودية, حج 1447, وزارة الحج",
    canonicalUrl: "/hajj/local",
  },
  umrah: {
    title: "باقات العمرة 2025 — جو عمرة",
    description: "أفضل باقات العمرة بأسعار مناسبة. عمرة رمضان، عمرة شعبان، عمرة مجموعات. فنادق قريبة من الحرم المكي.",
    keywords: "باقات عمرة, عمرة 2025, عمرة رمضان, تأشيرة عمرة, فنادق مكة",
    canonicalUrl: "/umrah",
  },
  hotels: {
    title: "فنادق مكة والمدينة — جو عمرة",
    description: "احجز أفضل فنادق مكة المكرمة والمدينة المنورة. فنادق 5 نجوم قريبة من الحرم. أسعار تنافسية وحجز فوري.",
    keywords: "فنادق مكة, فنادق المدينة, فنادق الحرم, فنادق 5 نجوم مكة",
    canonicalUrl: "/hotels",
  },
  flights: {
    title: "حجز تذاكر الطيران — جو عمرة",
    description: "احجز تذاكر طيران إلى مكة المكرمة والمدينة المنورة. رحلات مباشرة من أكثر من 50 دولة. أسعار تنافسية.",
    keywords: "تذاكر طيران مكة, رحلات عمرة, طيران المدينة, حجز طيران",
    canonicalUrl: "/flights",
  },
  visa: {
    title: "تأشيرة العمرة والحج — جو عمرة",
    description: "احصل على تأشيرة العمرة والحج بسهولة. خدمة سريعة، متابعة فورية، ومعالجة في 24-48 ساعة.",
    keywords: "تأشيرة عمرة, تأشيرة حج, فيزا سعودية, تأشيرة سياحية",
    canonicalUrl: "/visa",
  },
  transport: {
    title: "نقل VIP في مكة والمدينة — جو عمرة",
    description: "خدمات نقل VIP خاصة في مكة المكرمة والمدينة المنورة. سيارات فاخرة، حافلات، وخدمة 24/7.",
    keywords: "نقل مكة, نقل VIP, سيارات مكة, حافلات الحرم",
    canonicalUrl: "/transport",
  },
  tours: {
    title: "جولات زيارة المواقع الدينية — جو عمرة",
    description: "اكتشف المواقع الدينية والتاريخية في مكة المكرمة والمدينة المنورة. جولات مع مرشدين متخصصين.",
    keywords: "زيارة مواقع دينية, جولات مكة, جولات المدينة, مواقع إسلامية",
    canonicalUrl: "/tours",
  },
  store: {
    title: "متجر لوازم الحج والعمرة — جو عمرة",
    description: "اشتر لوازم الحج والعمرة عبر الإنترنت. إحرام، سجاجيد صلاة، هدايا إسلامية، وتذكارات فاخرة.",
    keywords: "متجر حج, لوازم عمرة, إحرام, سجاجيد صلاة, هدايا إسلامية",
    canonicalUrl: "/store",
  },
};
