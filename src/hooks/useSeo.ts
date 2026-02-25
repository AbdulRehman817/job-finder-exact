import { useEffect } from "react";

const SITE_NAME = "Hirely";
const DEFAULT_TITLE = "Hirely - Connecting Talent to Real Job Openings";
const DEFAULT_DESCRIPTION =
  "Hirely connects job seekers with verified job opportunities. Find roles fast, posted with confidence.";

export interface SeoConfig {
  title?: string;
  description?: string;
  keywords?: string[] | string;
  image?: string;
  canonical?: string;
  type?: string;
  noIndex?: boolean;
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const upsertMeta = (attr: "name" | "property", key: string, content?: string) => {
  if (!content || typeof document === "undefined") return;
  let meta = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(attr, key);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
};

const upsertLink = (rel: string, href?: string) => {
  if (!href || typeof document === "undefined") return;
  let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", rel);
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
};

const upsertJsonLd = (id: string, data?: SeoConfig["structuredData"]) => {
  if (typeof document === "undefined") return;
  const existing = document.getElementById(id) as HTMLScriptElement | null;
  if (!data) {
    if (existing) existing.remove();
    return;
  }

  const script = existing ?? document.createElement("script");
  script.id = id;
  script.type = "application/ld+json";
  script.text = JSON.stringify(data);

  if (!existing) {
    document.head.appendChild(script);
  }
};

export const useSeo = ({
  title,
  description,
  keywords,
  image,
  canonical,
  type = "website",
  noIndex = false,
  structuredData,
}: SeoConfig) => {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const resolvedTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
    const resolvedDescription = description || DEFAULT_DESCRIPTION;
    const resolvedKeywords = Array.isArray(keywords) ? keywords.join(", ") : keywords;
    const resolvedUrl = canonical || window.location.href;
    const resolvedImage = image || `${window.location.origin}/logo.png`;

    document.title = resolvedTitle;
    upsertMeta("name", "description", resolvedDescription);
    upsertMeta("name", "keywords", resolvedKeywords);
    upsertMeta("name", "robots", noIndex ? "noindex, nofollow" : "index, follow");
    upsertMeta("name", "author", SITE_NAME);

    upsertLink("canonical", resolvedUrl);

    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:locale", "en_US");
    upsertMeta("property", "og:title", resolvedTitle);
    upsertMeta("property", "og:description", resolvedDescription);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:url", resolvedUrl);
    upsertMeta("property", "og:image", resolvedImage);

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", resolvedTitle);
    upsertMeta("name", "twitter:description", resolvedDescription);
    upsertMeta("name", "twitter:image", resolvedImage);

    upsertJsonLd("seo-structured-data", structuredData);
  }, [title, description, keywords, image, canonical, type, noIndex, structuredData]);
};
