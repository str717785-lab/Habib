/**
 * Vercel Serverless Function — Dynamic Sitemap Generator
 * Route: GET /sitemap.xml  (rewritten via vercel.json)
 *
 * Fetches all video documents from Firestore using the public REST API
 * (no server-side credentials needed — uses the same public apiKey as the frontend).
 * Generates a sitemap with <video:video> extensions for Google Video indexing.
 */

const PROJECT_ID  = "video-cms-b7c1e";
const SITE_URL    = "https://www.4kpornvideo.com";
const PAGE_SIZE   = 300; // Firestore REST API max per request

/** Extract the doc ID from a Firestore document name string */
function docId(name) {
  return name.split("/").pop();
}

/** Safely read a Firestore typed value field */
function field(fields, key) {
  const f = fields[key];
  if (!f) return "";
  return (
    f.stringValue  ??
    f.integerValue ??
    f.doubleValue  ??
    (f.timestampValue ? f.timestampValue : "") ??
    ""
  );
}

/** Escape XML special characters */
function esc(str) {
  return String(str || "")
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&apos;");
}

/** Convert Firestore timestamp string → ISO 8601 date */
function toISO(ts) {
  if (!ts) return new Date().toISOString();
  try { return new Date(ts).toISOString(); } catch { return new Date().toISOString(); }
}

/** Convert "MM:SS" or "H:MM:SS" → ISO 8601 duration (PT...) */
function toDuration(str) {
  if (!str) return "";
  const parts = String(str).trim().split(":").map(p => parseInt(p, 10) || 0);
  if (parts.length === 2) return `PT${parts[0]}M${parts[1]}S`;
  if (parts.length === 3) return `PT${parts[0]}H${parts[1]}M${parts[2]}S`;
  return "";
}

/** Fetch one page of Firestore documents via REST API */
async function fetchPage(pageToken) {
  const base = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/videos`;
  const params = new URLSearchParams({ pageSize: PAGE_SIZE });
  if (pageToken) params.set("pageToken", pageToken);
  const url = `${base}?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Firestore REST error: ${res.status} ${res.statusText}`);
  return res.json();
}

/** Fetch ALL video documents across pages */
async function fetchAllVideos() {
  const videos = [];
  let nextPageToken = null;
  do {
    const data = await fetchPage(nextPageToken);
    if (Array.isArray(data.documents)) {
      for (const doc of data.documents) {
        const f = doc.fields || {};
        videos.push({
          id:          docId(doc.name),
          title:       field(f, "title"),
          description: field(f, "description"),
          thumb:       field(f, "thumb"),
          src:         field(f, "src"),
          duration:    field(f, "duration"),
          keywords:    field(f, "keywords"),
          views:       parseInt(field(f, "views") || "0", 10) || 0,
          createdAt:   field(f, "createdAt"),
        });
      }
    }
    nextPageToken = data.nextPageToken || null;
  } while (nextPageToken);
  return videos;
}

/** Build the full sitemap XML string */
function buildSitemap(videos) {
  const videoEntries = videos.map(v => {
    const pageUrl  = `${SITE_URL}/video?id=${encodeURIComponent(v.id)}`;
    const duration = toDuration(v.duration);
    const pubDate  = toISO(v.createdAt);

    return `
  <url>
    <loc>${esc(pageUrl)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <lastmod>${pubDate.split("T")[0]}</lastmod>
    <video:video>
      <video:thumbnail_loc>${esc(v.thumb)}</video:thumbnail_loc>
      <video:title>${esc(v.title)}</video:title>
      <video:description>${esc(v.description || v.title)}</video:description>
      <video:content_loc>${esc(v.src)}</video:content_loc>
      <video:player_loc>${esc(pageUrl)}</video:player_loc>
      <video:publication_date>${pubDate}</video:publication_date>${duration ? `
      <video:duration>${duration}</video:duration>` : ""}${v.keywords ? `
      <video:tag>${esc(v.keywords.split(",")[0].trim())}</video:tag>` : ""}
      <video:view_count>${v.views}</video:view_count>
      <video:family_friendly>no</video:family_friendly>
    </video:video>
  </url>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">

  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${videoEntries}
</urlset>`;
}

/** Vercel handler */
export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.status(405).end("Method Not Allowed");
    return;
  }

  try {
    const videos = await fetchAllVideos();
    const xml    = buildSitemap(videos);

    res.setHeader("Content-Type", "application/xml; charset=UTF-8");
    // Cache for 1 hour on CDN, revalidate in background
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    res.setHeader("X-Video-Count", String(videos.length));
    res.status(200).send(xml);
  } catch (err) {
    console.error("[sitemap]", err);
    // Fallback: return a minimal valid sitemap so Google doesn't 500-error
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE_URL}/</loc><priority>1.0</priority></url>
</urlset>`;
    res.setHeader("Content-Type", "application/xml; charset=UTF-8");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(fallback);
  }
}
