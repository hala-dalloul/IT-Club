import logo from "@/assets/ucas-logo.webp";
import { collegeUrl, local, safeUrl, type Content, type Lang } from "./model";
import { hrefOf, pageOf } from "./paths";

/**
 * Absolute origin for share tags; og:url and og:image must be absolute.
 *
 * ponytail: the workers.dev host until the club settles its own domain. Set
 * VITE_SITE_URL in the Cloudflare build settings then; no code change needed.
 */
export const siteUrl = (
  import.meta.env.VITE_SITE_URL || "https://ucas.itclub-143.workers.dev"
).replace(/\/$/, "");

/** The club's official name in each language; every other spelling is an alias. */
export const siteName: Record<Lang, string> = {
  ar: "النادي التكنولوجي",
  en: "UCAS IT Club",
};

type Copy = { title: string; description: string };

/**
 * Title and description for every fixed page, per language.
 *
 * Descriptions stay near 155 characters, the length search results show, and
 * only state what the page itself says.
 */
export const pages = {
  home: {
    ar: {
      title: "النادي التكنولوجي | الكلية الجامعية للعلوم التطبيقية",
      description:
        "مجتمع طلابي في الكلية الجامعية للعلوم التطبيقية يجمع المهتمين بالتقنية: أخبار النادي وفعالياته وفريقه وطريقة الانضمام.",
    },
    en: {
      title: "UCAS IT Club | University College of Applied Sciences",
      description:
        "A student technology community at the University College of Applied Sciences: club news, events, the team, and how to join.",
    },
  },
  about: {
    ar: {
      title: "من نحن",
      description:
        "رؤية النادي التكنولوجي ورسالته وأهدافه ولجانه، ومجالات عمله: تطبيقات الموبايل ومواقع الويب والألعاب والوسائط المتعددة.",
    },
    en: {
      title: "About",
      description:
        "The UCAS IT Club's vision, mission, goals and committees, and the fields it works in: mobile apps, websites, games and multimedia.",
    },
  },
  members: {
    ar: {
      title: "الفريق",
      description:
        "تعرّف على الهيئة الإدارية ولجان الإعلام والعلاقات العامة والأنشطة في النادي التكنولوجي.",
    },
    en: {
      title: "Team",
      description:
        "Meet the UCAS IT Club's administrative board and its media, public relations and activities committees.",
    },
  },
  events: {
    ar: {
      title: "الفعاليات",
      description:
        "فعاليات النادي التكنولوجي القادمة والسابقة في الكلية الجامعية للعلوم التطبيقية.",
    },
    en: {
      title: "Events",
      description:
        "Upcoming and past UCAS IT Club events at the University College of Applied Sciences.",
    },
  },
  news: {
    ar: {
      title: "الأخبار",
      description: "آخر أخبار النادي التكنولوجي وإعلاناته في الكلية الجامعية للعلوم التطبيقية.",
    },
    en: {
      title: "News",
      description:
        "The latest UCAS IT Club news and announcements from the University College of Applied Sciences.",
    },
  },
  partners: {
    ar: {
      title: "الشراكات",
      description: "الجهات التي يتعاون معها النادي التكنولوجي في الكلية الجامعية للعلوم التطبيقية.",
    },
    en: {
      title: "Partners",
      description:
        "The organisations the UCAS IT Club works with at the University College of Applied Sciences.",
    },
  },
  join: {
    ar: {
      title: "انضم إلينا",
      description: "قدّم طلب الانضمام إلى النادي التكنولوجي واختر اللجنة التي تناسبك.",
    },
    en: {
      title: "Join",
      description: "Apply to join the UCAS IT Club and choose the committee that suits you.",
    },
  },
  contact: {
    ar: {
      title: "تواصل معنا",
      description: "راسل النادي التكنولوجي عبر البريد الإلكتروني أو لينكدإن أو إنستغرام أو فيسبوك.",
    },
    en: {
      title: "Contact",
      description: "Reach the UCAS IT Club by email, LinkedIn, Instagram or Facebook.",
    },
  },
  privacy: {
    ar: {
      title: "الخصوصية والكوكيز",
      description:
        "ما الذي يحفظه موقع النادي التكنولوجي، وكيف تُستخدم بيانات النماذج، وكيف تطلب حذفها.",
    },
    en: {
      title: "Privacy and cookies",
      description:
        "What the UCAS IT Club site stores, how form data is used, and how to request deletion.",
    },
  },
  admin: {
    ar: { title: "الإدارة", description: "لوحة إدارة محتوى النادي التكنولوجي." },
    en: { title: "Admin", description: "Content management for the UCAS IT Club." },
  },
  missing: {
    ar: {
      title: "الصفحة غير موجودة",
      description: "الصفحة المطلوبة غير موجودة في موقع النادي التكنولوجي.",
    },
    en: {
      title: "Page not found",
      description: "This page does not exist on the UCAS IT Club site.",
    },
  },
} satisfies Record<string, Record<Lang, Copy>>;

export type PageKey = keyof typeof pages;

/** "Page | Club", except the home title, which already carries the name. */
export function titleFor(page: PageKey, lang: Lang) {
  const { title } = pages[page][lang];

  return page === "home" ? title : `${title} | ${siteName[lang]}`;
}

/** Plain text trimmed at a word boundary, for a meta description. */
export function excerpt(text: string, max = 155) {
  const flat = text.replace(/\s+/g, " ").trim();

  if (flat.length <= max) return flat;

  const cut = flat.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");

  // A long unbroken run (a URL) would cut to almost nothing; cut mid-word instead.
  return `${space > max / 2 ? cut.slice(0, space) : cut}…`;
}

type Meta = { title?: string; name?: string; property?: string; content?: string };

/**
 * Every tag a page needs to describe itself to search engines and link previews.
 *
 * Page routes spread this into their head; the router keeps the deepest route's
 * copy of each tag, so nothing from the root's defaults leaks through.
 */
export function seo({
  lang,
  title,
  description,
  path,
  image,
  published,
  noindex = false,
}: {
  lang: Lang;
  title: string;
  description: string;
  path: string;
  image?: string | undefined;
  published?: string | undefined;
  noindex?: boolean;
}): Meta[] {
  const other: Lang = lang === "ar" ? "en" : "ar";
  const locale = (l: Lang) => (l === "ar" ? "ar_AR" : "en_US");

  return [
    { title },
    { name: "description", content: description },
    { name: "robots", content: noindex ? "noindex,nofollow" : "index,follow" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: `${siteUrl}${path}` },
    { property: "og:type", content: published ? "article" : "website" },
    { property: "og:image", content: image ?? `${siteUrl}/og/default-${lang}.jpg` },
    { property: "og:site_name", content: siteName[lang] },
    { property: "og:locale", content: locale(lang) },
    { property: "og:locale:alternate", content: locale(other) },
    { name: "twitter:card", content: "summary_large_image" },
    ...(published ? [{ property: "article:published_time", content: published }] : []),
  ];
}

/**
 * The page's own address plus its Arabic, English and default versions.
 *
 * Tells search engines the two languages are one page in two translations,
 * not duplicates, and which URL to index for each. x-default is Arabic, the
 * site's main language.
 */
export function alternates(lang: Lang, page: string) {
  const url = (l: Lang) => `${siteUrl}${hrefOf(l, page)}`;

  return [
    { rel: "canonical", href: url(lang) },
    { rel: "alternate", hrefLang: "ar", href: url("ar") },
    { rel: "alternate", hrefLang: "en", href: url("en") },
    { rel: "alternate", hrefLang: "x-default", href: url("ar") },
  ];
}

/** Tags for one news, event or member page, from the item itself. */
export function itemSeo(item: Content, lang: Lang, path: string, noindex: boolean) {
  const summary = lang === "en" ? item.summary_en || item.summary : item.summary;

  return seo({
    lang,
    title: `${local(item, "title", lang)} | ${siteName[lang]}`,
    description: summary?.trim() || excerpt(local(item, "description", lang)),
    path,
    image: item.images?.map(safeUrl).find(Boolean),
    published: item.date,
    noindex,
  });
}

/**
 * A JSON-LD block for a route's head meta.
 *
 * The router renders a `script:ld+json` entry as a JSON-LD script tag and
 * escapes it for HTML (router-core headContentUtils), so titles typed by
 * editors cannot close the tag. Its React typings only list <meta> attributes.
 */
export function ldJson(data: object): Meta {
  // SAFETY: a shape the router renders at runtime, per the comment above.
  return { "script:ld+json": data } as unknown as Meta;
}

/** What the organisation markup may state, straight from the admin settings. */
export type Contact = { email?: string | undefined; profiles: string[] };

const orgId = () => `${siteUrl}/#org`;

/**
 * The club as schema.org data, on every page: who it is, its parent college,
 * how to reach it and where else it lives. Search engines and AI assistants
 * read this instead of guessing from prose. Only facts the site itself shows.
 */
export function organizationLd(lang: Lang, contact: Contact) {
  const other: Lang = lang === "ar" ? "en" : "ar";

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId(),
        name: siteName[lang],
        alternateName: [siteName[other], "Technology Club", "نادي تكنولوجيا المعلومات"],
        url: `${siteUrl}${hrefOf(lang, "")}`,
        logo: `${siteUrl}${logo}`,
        ...(contact.email ? { email: contact.email } : {}),
        ...(contact.profiles.length ? { sameAs: contact.profiles } : {}),
        parentOrganization: {
          "@type": "CollegeOrUniversity",
          name:
            lang === "ar"
              ? "الكلية الجامعية للعلوم التطبيقية"
              : "University College of Applied Sciences",
          alternateName: "UCAS",
          url: collegeUrl[lang],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: `${siteUrl}${hrefOf(lang, "")}`,
        name: siteName[lang],
        alternateName: siteName[other],
        inLanguage: lang,
        publisher: { "@id": orgId() },
      },
    ],
  };
}

/**
 * A news, event or partner page as schema.org data: always its breadcrumb
 * trail, and for news the article itself. Events wait for a location field,
 * which Google requires of every Event.
 */
export function itemLd(item: Content, lang: Lang, path: string) {
  const page = pageOf(path);
  const [section = ""] = page.split("/");
  const url = `${siteUrl}${path}`;
  const title = local(item, "title", lang);
  // SAFETY: section comes from a validated page path, one of pages' keys.
  const sectionName = pages[section as PageKey]?.[lang].title ?? section;

  const graph: Record<string, unknown>[] = [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: siteName[lang],
          item: `${siteUrl}${hrefOf(lang, "")}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: sectionName,
          item: `${siteUrl}${hrefOf(lang, section)}`,
        },
        { "@type": "ListItem", position: 3, name: title, item: url },
      ],
    },
  ];

  if (section === "news")
    graph.push({
      "@type": "NewsArticle",
      headline: title.slice(0, 110),
      ...(item.date ? { datePublished: item.date } : {}),
      ...(item.updatedAt ? { dateModified: item.updatedAt } : {}),
      image: [item.images?.map(safeUrl).find(Boolean) ?? `${siteUrl}/og/default-${lang}.jpg`],
      inLanguage: lang,
      mainEntityOfPage: url,
      author: { "@id": orgId() },
      publisher: { "@id": orgId() },
    });

  return { "@context": "https://schema.org", "@graph": graph };
}

/**
 * robots.txt, generated so its Sitemap line follows VITE_SITE_URL.
 *
 * One group on purpose: a crawler obeys only the most specific group naming
 * it, so a Googlebot-only group would silently skip every rule written under *.
 */
export const robotsTxt = () =>
  [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /en/admin",
    "Disallow: /club/admin",
    "",
    `Sitemap: ${siteUrl}/sitemap.xml`,
    "",
  ].join("\n");
