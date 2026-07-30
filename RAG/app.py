import os
import time
import threading
import asyncio
import smtplib
from email.message import EmailMessage
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import httpx

load_dotenv()

DB_PATH = "faiss_index"

# Track whether models have finished loading
_models_ready = threading.Event()
_load_error = None

def _preload_models():
    """Load models in a background thread so the server can bind the port immediately."""
    global _load_error
    t0 = time.time()
    try:
        print(f"[preload] Starting...", flush=True)
        print(f"[preload] faiss_index exists: {os.path.exists(DB_PATH)}", flush=True)

        from retrieval import get_vector_db, get_llm
        print(f"[preload] Imports done in {time.time()-t0:.1f}s", flush=True)

        print("[preload] Loading vector database (via HF API)...", flush=True)
        get_vector_db(DB_PATH)
        print(f"[preload] Vector DB loaded in {time.time()-t0:.1f}s", flush=True)

        print("[preload] Initializing LLM...", flush=True)
        get_llm()
        print(f"[preload] LLM initialized in {time.time()-t0:.1f}s", flush=True)

        print(f"[preload] ALL DONE in {time.time()-t0:.1f}s", flush=True)
    except Exception as e:
        _load_error = str(e)
        print(f"[preload] FAILED after {time.time()-t0:.1f}s: {e}", flush=True)
        import traceback
        traceback.print_exc()
    finally:
        _models_ready.set()

@asynccontextmanager
async def lifespan(app: FastAPI):
    thread = threading.Thread(target=_preload_models, daemon=True)
    thread.start()
    yield

app = FastAPI(title="Vaishnav Shinde Portfolio RAG API", lifespan=lifespan)

# Enable CORS so the React app can communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage]

class ContactRequest(BaseModel):
    name: str
    email: str
    message: str
class VisitorLog(BaseModel):
    ip: str = "Unknown"
    city: str = "Unknown"
    region: str = "Unknown"
    country: str = "Unknown"
    countryCode: str = ""
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timezone: str = "Unknown"
    isp: str = "Unknown"
    userAgent: str = "Unknown"
    language: str = "Unknown"
    platform: str = "Unknown"
    screenResolution: str = "Unknown"
    referrer: str = "Direct"
    pageUrl: str = ""
    timestamp: str = ""

# ── Telegram notification helper ──
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")

async def _send_telegram(message: str):
    """Fire-and-forget Telegram message via Bot API."""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("[visitor] Telegram credentials not configured, skipping notification.", flush=True)
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "HTML",
        "disable_web_page_preview": True
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code != 200:
                print(f"[visitor] Telegram API error: {resp.status_code} {resp.text}", flush=True)
    except Exception as e:
        print(f"[visitor] Failed to send Telegram notification: {e}", flush=True)

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    # Wait up to 300s for background model loading to finish
    if not _models_ready.wait(timeout=300):
        raise HTTPException(status_code=503, detail="Models are still loading, please try again shortly.")
    if _load_error:
        raise HTTPException(status_code=500, detail=f"Model loading failed: {_load_error}")
    try:
        from langchain_core.messages import HumanMessage, AIMessage
        from retrieval import query_rag
        # Convert history format to LangChain message objects
        chat_history = []
        for msg in request.history:
            if msg.role == "user":
                chat_history.append(HumanMessage(content=msg.content))
            elif msg.role == "assistant":
                chat_history.append(AIMessage(content=msg.content))
                
        # Run query
        response = query_rag(request.message, chat_history, DB_PATH)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/contact")
async def contact_endpoint(data: ContactRequest):
    """Deliver a portfolio contact submission using configured SMTP credentials."""
    host = os.getenv("SMTP_HOST")
    username = os.getenv("SMTP_USERNAME")
    password = os.getenv("SMTP_PASSWORD")
    recipient = os.getenv("CONTACT_RECIPIENT", "vaishnavshinde186@gmail.com")
    port = int(os.getenv("SMTP_PORT", "587"))
    if not host or not username or not password:
        raise HTTPException(status_code=503, detail="Email delivery is not configured.")

    def deliver():
        email = EmailMessage()
        email["Subject"] = f"Portfolio inquiry from {data.name}"
        email["From"] = username
        email["To"] = recipient
        email["Reply-To"] = data.email
        email.set_content(f"Name: {data.name}\nEmail: {data.email}\n\nMessage:\n{data.message}")
        with smtplib.SMTP(host, port, timeout=20) as server:
            server.starttls()
            server.login(username, password)
            server.send_message(email)

    try:
        await asyncio.to_thread(deliver)
        return {"status": "sent"}
    except Exception as exc:
        print(f"[contact] delivery failed: {exc}", flush=True)
        raise HTTPException(status_code=502, detail="Email could not be delivered.")
@app.post("/api/visitor-log")
async def visitor_log(data: VisitorLog, request: Request):
    """Receive visitor info from the frontend and send a Telegram notification."""
    # ── Get the real client IP from proxy headers (Vercel/Cloudflare/Render) ──
    real_ip = (
        request.headers.get("x-forwarded-for", "").split(",")[0].strip()
        or request.headers.get("x-real-ip", "")
        or request.client.host if request.client else "Unknown"
    )

    # ── Server-side geolocation using ip-api.com (more accurate) ──
    geo_city = data.city
    geo_region = data.region
    geo_country = data.country
    geo_country_code = data.countryCode
    geo_isp = data.isp
    geo_timezone = data.timezone
    geo_lat = data.latitude
    geo_lon = data.longitude

    try:
        async with httpx.AsyncClient(timeout=6) as client:
            geo_resp = await client.get(f"http://ip-api.com/json/{real_ip}?fields=status,city,regionName,country,countryCode,lat,lon,timezone,isp,org")
            if geo_resp.status_code == 200:
                geo = geo_resp.json()
                if geo.get("status") == "success":
                    geo_city = geo.get("city", geo_city)
                    geo_region = geo.get("regionName", geo_region)
                    geo_country = geo.get("country", geo_country)
                    geo_country_code = geo.get("countryCode", geo_country_code)
                    geo_isp = geo.get("isp") or geo.get("org", geo_isp)
                    geo_timezone = geo.get("timezone", geo_timezone)
                    geo_lat = geo.get("lat", geo_lat)
                    geo_lon = geo.get("lon", geo_lon)
    except Exception as e:
        print(f"[visitor] Server-side geo lookup failed: {e}", flush=True)

    # Detect browser from user-agent (simplified)
    ua = data.userAgent
    browser = "Unknown"
    if "Edg/" in ua:
        browser = "Edge"
    elif "Chrome/" in ua:
        browser = "Chrome"
    elif "Firefox/" in ua:
        browser = "Firefox"
    elif "Safari/" in ua:
        browser = "Safari"
    elif "Opera" in ua or "OPR/" in ua:
        browser = "Opera"

    # Detect OS
    os_name = "Unknown"
    if "Windows" in ua:
        os_name = "Windows"
    elif "Mac OS" in ua:
        os_name = "macOS"
    elif "Android" in ua:
        os_name = "Android"
    elif "iPhone" in ua or "iPad" in ua:
        os_name = "iOS"
    elif "Linux" in ua:
        os_name = "Linux"

    # Google Maps link if coordinates available
    maps_link = ""
    if geo_lat and geo_lon:
        maps_link = f"\n🗺️ <a href='https://www.google.com/maps?q={geo_lat},{geo_lon}'>View on Google Maps</a>"

    message = (
        f"🚨 <b>New Portfolio Visitor</b>\n"
        f"{'━' * 28}\n"
        f"\n"
        f"🌐 <b>IP:</b>  <code>{real_ip}</code>\n"
        f"📍 <b>Location:</b>  {geo_city}, {geo_region}, {geo_country} {geo_country_code}\n"
        f"🏢 <b>ISP:</b>  {geo_isp}\n"
        f"🕐 <b>Timezone:</b>  {geo_timezone}\n"
        f"{maps_link}\n"
        f"\n"
        f"🖥️ <b>Browser:</b>  {browser} on {os_name}\n"
        f"📐 <b>Screen:</b>  {data.screenResolution}\n"
        f"🌍 <b>Language:</b>  {data.language}\n"
        f"🔗 <b>Referrer:</b>  {data.referrer}\n"
        f"\n"
        f"🕑 <b>Time:</b>  {data.timestamp}\n"
    )

    # Send notification
    await _send_telegram(message)
    return {"status": "ok"}

@app.get("/")
async def root():
    ready = _models_ready.is_set()
    return {"status": "ok", "models_ready": ready, "error": _load_error}

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "db_loaded": os.path.exists(DB_PATH), "models_ready": _models_ready.is_set()}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("app:app", host="0.0.0.0", port=port)
