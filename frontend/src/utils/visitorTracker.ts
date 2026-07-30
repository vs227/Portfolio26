/**
 * Visitor Tracker — silently collects visitor info on first page load
 * and sends it to the backend for Telegram notification.
 *
 * Uses sessionStorage to fire only once per browser session (no spam on refresh).
 * Completely invisible to visitors — no UI, errors are swallowed silently.
 */

const SESSION_KEY = "__vt_tracked";

export async function trackVisitor() {
  if (typeof window === "undefined") return;
  if (sessionStorage.getItem(SESSION_KEY)) return;

  // ── Filter out bots, crawlers, and Vercel build/preview renders ──
  const ua = navigator.userAgent.toLowerCase();
  const botPatterns = [
    "bot", "crawl", "spider", "slurp", "lighthouse",
    "headlesschrome", "phantomjs", "prerender", "snap",
    "google", "bing", "yahoo", "baidu", "yandex",
    "facebookexternalhit", "twitterbot", "linkedinbot",
    "vercel", "netlify", "render",
  ];
  if (botPatterns.some((p) => ua.includes(p))) return;

  // Headless browsers typically have 800x600 screen
  if (screen.width <= 800 && screen.height <= 600) return;

  // navigator.webdriver is true in automated browsers
  if (navigator.webdriver) return;

  sessionStorage.setItem(SESSION_KEY, "1");

  try {
    const geoRes = await fetch("https://ipapi.co/json/", {
      signal: AbortSignal.timeout(6000),
    });

    if (!geoRes.ok) return;
    const geo = await geoRes.json();

    const visitorData = {
      ip: geo.ip || "Unknown",
      city: geo.city || "Unknown",
      region: geo.region || "Unknown",
      country: geo.country_name || "Unknown",
      countryCode: geo.country_code || "",
      latitude: geo.latitude || null,
      longitude: geo.longitude || null,
      timezone:
        geo.timezone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone ||
        "Unknown",
      isp: geo.org || "Unknown",
      userAgent: navigator.userAgent || "Unknown",
      language: navigator.language || "Unknown",
      platform: navigator.platform || "Unknown",
      screenResolution: `${screen.width}x${screen.height}`,
      referrer: document.referrer || "Direct",
      pageUrl: window.location.href,
      timestamp: new Date().toISOString(),
    };

    const apiBase =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    await fetch(`${apiBase}/api/visitor-log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(visitorData),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    // Silently fail — visitor tracking should never break the site
  }
}
