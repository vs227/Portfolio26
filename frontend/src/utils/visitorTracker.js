/**
 * Visitor Tracker — silently collects visitor info on first page load
 * and sends it to the backend for Telegram notification.
 * 
 * Uses sessionStorage to fire only once per browser session (no spam on refresh).
 * Completely invisible to visitors — no UI, errors are swallowed silently.
 */

const SESSION_KEY = '__vt_tracked';

export async function trackVisitor() {
  // Only fire once per session
  if (sessionStorage.getItem(SESSION_KEY)) return;
  sessionStorage.setItem(SESSION_KEY, '1');

  try {
    // 1. Fetch IP + geolocation from free API
    const geoRes = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(6000) // 6s timeout
    });

    if (!geoRes.ok) return;
    const geo = await geoRes.json();

    // 2. Collect browser metadata
    const visitorData = {
      ip: geo.ip || 'Unknown',
      city: geo.city || 'Unknown',
      region: geo.region || 'Unknown',
      country: geo.country_name || 'Unknown',
      countryCode: geo.country_code || '',
      latitude: geo.latitude || null,
      longitude: geo.longitude || null,
      timezone: geo.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
      isp: geo.org || 'Unknown',
      userAgent: navigator.userAgent || 'Unknown',
      language: navigator.language || 'Unknown',
      platform: navigator.platform || 'Unknown',
      screenResolution: `${screen.width}x${screen.height}`,
      referrer: document.referrer || 'Direct',
      pageUrl: window.location.href,
      timestamp: new Date().toISOString()
    };

    // 3. Send to backend (fire-and-forget)
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    await fetch(`${apiBase}/api/visitor-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitorData),
      signal: AbortSignal.timeout(8000)
    });
  } catch {
    // Silently fail — visitor tracking should never break the site
  }
}
