"""
Subscriber management + session reminder emails.

Emails are sent via SMTP (Gmail / any provider).
Configure with environment variables (or a .env file):
  SMTP_HOST       (default: smtp.gmail.com)
  SMTP_PORT       (default: 587)
  SMTP_USER       your email address
  SMTP_PASS       your Gmail App Password
  SMTP_FROM_NAME  (default: F1 Nexus)
  APP_URL         public URL shown in emails (default: http://localhost:3000)
"""

import smtplib
import ssl
import asyncio
import base64
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError

from database import SessionLocal
from models import Subscriber
from config import settings

router = APIRouter(prefix="/subscribe", tags=["Subscribers"])


# ─── Pydantic models ──────────────────────────────────────────────────────────

class SubscribeRequest(BaseModel):
    name: str
    email: str


# ─── Token helpers ────────────────────────────────────────────────────────────

def _encode_token(email: str) -> str:
    return base64.urlsafe_b64encode(email.encode()).decode()

def _decode_token(token: str) -> str:
    return base64.urlsafe_b64decode(token.encode()).decode()


# ─── Email HTML templates ──────────────────────────────────────────────────────

def _email_wrapper(header_content: str, body_content: str, footer_content: str) -> str:
    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0B0B0B;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B0B0B;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:#e00700;padding:28px 32px;border-radius:12px 12px 0 0;text-align:center;">
          <p style="margin:0 0 4px;color:rgba(255,255,255,0.65);font-size:10px;text-transform:uppercase;letter-spacing:3px;font-weight:700;">Formula 1</p>
          <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:900;font-style:italic;letter-spacing:-1px;">F1 NEXUS</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.6);font-size:10px;text-transform:uppercase;letter-spacing:2px;">{header_content}</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#111111;padding:36px 32px;border:1px solid #222;border-top:none;">
          {body_content}
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#0d0d0d;padding:20px 32px;border:1px solid #1a1a1a;border-top:none;border-radius:0 0 12px 12px;text-align:center;">
          {footer_content}
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""


def _build_welcome_html(name: str, email: str) -> str:
    app_url = settings.APP_URL
    token = _encode_token(email)
    unsub_url = f"{app_url}/unsubscribe?token={token}"

    body = f"""
      <p style="margin:0 0 8px;color:#e00700;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">Welcome to F1 Nexus</p>
      <h2 style="margin:0 0 20px;color:#ffffff;font-size:26px;font-weight:900;font-style:italic;text-transform:uppercase;letter-spacing:-0.5px;">
        You're in, {name}! 🏁
      </h2>
      <p style="margin:0 0 16px;color:#94a3b8;font-size:14px;line-height:1.6;">
        Thanks for subscribing to <strong style="color:#ffffff;">F1 Nexus</strong> race reminders.
        You'll receive an email <strong style="color:#ffffff;">15 minutes before</strong> each of these sessions:
      </p>
      <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
        {''.join(f'<tr><td style="padding:4px 0;color:#e00700;font-size:13px;font-weight:700;">✓</td><td style="padding:4px 0 4px 10px;color:#ffffff;font-size:13px;">{s}</td></tr>' for s in ["Free Practice", "Sprint Qualifying", "Sprint Race", "Qualifying", "Race"])}
      </table>
      <p style="margin:0 0 28px;color:#94a3b8;font-size:13px;line-height:1.6;">
        So you <strong style="color:#ffffff;">never miss a flag</strong> — not even a virtual safety car.
      </p>
      <table cellpadding="0" cellspacing="0"><tr><td style="background:#e00700;border-radius:8px;padding:12px 28px;">
        <a href="{app_url}" style="color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:1.5px;">
          Open F1 Nexus →
        </a>
      </td></tr></table>
    """

    footer = f"""
      <p style="margin:0;color:#374151;font-size:10px;">F1 Nexus · Formula 1 Analytics Platform</p>
      <p style="margin:6px 0 0;color:#374151;font-size:10px;">
        Don't want reminders? <a href="{unsub_url}" style="color:#555;text-decoration:underline;">Unsubscribe</a>
      </p>
    """

    return _email_wrapper("Analytics Platform", body, footer)


def _build_unsubscribe_html(name: str) -> str:
    app_url = settings.APP_URL

    body = f"""
      <p style="margin:0 0 8px;color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">Unsubscribed</p>
      <h2 style="margin:0 0 20px;color:#ffffff;font-size:26px;font-weight:900;font-style:italic;text-transform:uppercase;letter-spacing:-0.5px;">
        Goodbye, {name}
      </h2>
      <p style="margin:0 0 24px;color:#94a3b8;font-size:14px;line-height:1.6;">
        You've been successfully removed from F1 Nexus race reminders.
        You won't receive any further emails from us.
      </p>
      <p style="margin:0 0 28px;color:#64748b;font-size:13px;line-height:1.6;">
        Changed your mind? You can always re-subscribe from the app.
      </p>
      <table cellpadding="0" cellspacing="0"><tr><td style="background:#1e293b;border-radius:8px;padding:12px 28px;">
        <a href="{app_url}" style="color:#94a3b8;font-size:13px;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:1.5px;">
          Return to F1 Nexus →
        </a>
      </td></tr></table>
    """

    footer = """<p style="margin:0;color:#374151;font-size:10px;">F1 Nexus · Formula 1 Analytics Platform</p>"""

    return _email_wrapper("Session Reminders", body, footer)


def _build_reminder_html(name: str, session_label: str, race_name: str, minutes: int, email: str) -> str:
    app_url = settings.APP_URL
    token = _encode_token(email)
    unsub_url = f"{app_url}/unsubscribe?token={token}"

    body = f"""
      <p style="margin:0 0 8px;color:#e00700;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">Session Reminder</p>
      <h2 style="margin:0 0 20px;color:#ffffff;font-size:26px;font-weight:900;font-style:italic;text-transform:uppercase;letter-spacing:-0.5px;">
        {session_label} starts in {minutes} minutes!
      </h2>
      <p style="margin:0 0 24px;color:#94a3b8;font-size:14px;line-height:1.6;">
        Hey {name}, it's almost <strong style="color:#ffffff;">{session_label}</strong> time at the
        <strong style="color:#ffffff;">{race_name}</strong>. Get ready for the action!
      </p>
      <table cellpadding="0" cellspacing="0"><tr><td style="background:#e00700;border-radius:8px;padding:12px 28px;">
        <a href="{app_url}" style="color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:1.5px;">
          Open F1 Nexus →
        </a>
      </td></tr></table>
    """

    footer = f"""
      <p style="margin:0;color:#374151;font-size:10px;">F1 Nexus · Formula 1 Analytics Platform</p>
      <p style="margin:4px 0 0;color:#1f2937;font-size:10px;">You're receiving this because you subscribed to session reminders.</p>
      <p style="margin:6px 0 0;color:#374151;font-size:10px;">
        <a href="{unsub_url}" style="color:#555;text-decoration:underline;">Unsubscribe</a>
      </p>
    """

    return _email_wrapper("Analytics Platform", body, footer)


# ─── SMTP sender ──────────────────────────────────────────────────────────────

def _send_email_sync(to_email: str, to_name: str, subject: str, html_body: str) -> bool:
    host = settings.SMTP_HOST
    port = settings.SMTP_PORT
    user = settings.SMTP_USER
    password = settings.SMTP_PASS
    from_name = settings.SMTP_FROM_NAME

    if not user or not password:
        print(f"[Email] SMTP not configured – skipping email to {to_email}")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{from_name} <{user}>"
    msg["To"] = f"{to_name} <{to_email}>"
    msg.attach(MIMEText(html_body, "html"))

    try:
        ctx = ssl.create_default_context()
        with smtplib.SMTP(host, port) as server:
            server.ehlo()
            server.starttls(context=ctx)
            server.login(user, password)
            server.sendmail(user, to_email, msg.as_string())
        print(f"[Email] Sent '{subject}' to {to_email}")
        return True
    except Exception as e:
        print(f"[Email] Failed to send to {to_email}: {e}")
        return False


async def _send_email(to_email: str, to_name: str, subject: str, html_body: str) -> bool:
    return await asyncio.get_event_loop().run_in_executor(
        None, _send_email_sync, to_email, to_name, subject, html_body
    )


# ─── Session reminder checker ──────────────────────────────────────────────────

REMINDER_SESSIONS = {"Qualifying", "Sprint Qualifying", "Sprint", "RACE"}
_sent_reminders: set[str] = set()


def _get_all_subscribers() -> list[dict]:
    db = SessionLocal()
    try:
        rows = db.query(Subscriber).all()
        return [{"name": r.name, "email": r.email} for r in rows]
    finally:
        db.close()


async def check_and_send_reminders():
    """Called periodically — checks if any session starts in ~15 min."""
    subscribers = _get_all_subscribers()
    if not subscribers:
        return
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get("http://localhost:8000/api/v1/races/next")
            if resp.status_code != 200:
                return
            data = resp.json()
            race = data.get("race")
            if not race:
                return
    except Exception:
        return

    race_name: str = race.get("raceName", "Grand Prix")
    sessions: list = race.get("sessions", [])
    sessions = sessions + [{"label": "RACE", "date": race.get("date", "")}]
    now_ts = datetime.now(timezone.utc).timestamp()

    for s in sessions:
        label: str = s.get("label", "")
        if label not in REMINDER_SESSIONS:
            continue
        date_str: str = s.get("date", "")
        if not date_str:
            continue
        try:
            session_ts = datetime.fromisoformat(date_str.replace("Z", "+00:00")).timestamp()
        except Exception:
            continue

        diff_mins = (session_ts - now_ts) / 60
        if 14 <= diff_mins <= 16:
            for sub in subscribers:
                key = f"{sub['email']}:{race_name}:{label}"
                if key in _sent_reminders:
                    continue
                _sent_reminders.add(key)
                subject = f"⏱ {label} starts in 15 min — {race_name}"
                html = _build_reminder_html(sub["name"], label, race_name, 15, sub["email"])
                await _send_email(sub["email"], sub["name"], subject, html)


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.post("")
async def subscribe(req: SubscribeRequest, bg: BackgroundTasks):
    """Add a new subscriber and send a welcome email."""
    name = req.name.strip()
    email = req.email.strip().lower()

    if not name or not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Invalid name or email")

    db = SessionLocal()
    try:
        existing = db.query(Subscriber).filter(Subscriber.email == email).first()
        if existing:
            return {"status": "already", "message": f"{email} is already subscribed. You'll receive reminders before every session."}
        db.add(Subscriber(name=name, email=email))
        db.commit()
        print(f"[Subscribers] New: {name} <{email}>")

        bg.add_task(
            _send_email_sync, email, name,
            "Welcome to F1 Nexus — Race Reminders Active",
            _build_welcome_html(name, email)
        )

        return {"status": "ok", "message": f"Subscribed! A welcome email is on its way to {email}."}
    except IntegrityError:
        db.rollback()
        return {"status": "already", "message": f"{email} is already subscribed."}
    finally:
        db.close()


@router.get("/unsubscribe")
async def unsubscribe(token: str, bg: BackgroundTasks):
    """Remove a subscriber by token (base64-encoded email) and send confirmation."""
    try:
        email = _decode_token(token)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid unsubscribe token")

    db = SessionLocal()
    try:
        sub = db.query(Subscriber).filter(Subscriber.email == email).first()
        if not sub:
            raise HTTPException(status_code=404, detail="Subscriber not found")
        name = sub.name
        db.delete(sub)
        db.commit()
        print(f"[Subscribers] Unsubscribed: {name} <{email}>")

        bg.add_task(
            _send_email_sync, email, name,
            "You've been unsubscribed from F1 Nexus",
            _build_unsubscribe_html(name)
        )

        return {"status": "ok", "message": f"{email} has been unsubscribed."}
    finally:
        db.close()


@router.get("/count")
async def subscriber_count():
    db = SessionLocal()
    try:
        count = db.query(Subscriber).count()
        return {"count": count}
    finally:
        db.close()
