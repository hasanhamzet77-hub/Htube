#!/usr/bin/env python3
"""Adună titlurile de știri din fluxurile RSS/Atom din news_sources.json și scrie news.json.

Păstrăm doar titlul, sursa, ora, linkul și un rezumat scurt (max. 160 de caractere):
articolul se citește la sursă. Rulează din GitHub Actions; o sursă care nu răspunde e sărită.
"""
import hashlib, html, json, re, sys, urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CFG = json.loads((ROOT / "news_sources.json").read_text(encoding="utf-8"))
UA = "Mozilla/5.0 (compatible; ImperiumNews/1.0; personal RSS reader)"
NOW = datetime.now(timezone.utc)


def fetch(url, timeout=20):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, */*"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def local(tag):
    return tag.rsplit("}", 1)[-1].lower() if isinstance(tag, str) else ""


def text_of(el):
    return "".join(el.itertext()).strip() if el is not None else ""


def clean(s, limit=None):
    s = html.unescape(re.sub(r"<[^>]+>", " ", html.unescape(s or "")))
    s = re.sub(r"\s+", " ", s).strip()
    if limit and len(s) > limit:
        s = s[:limit].rsplit(" ", 1)[0].rstrip(",.;:–- ") + "…"
    return s


def parse_date(s):
    s = (s or "").strip()
    if not s:
        return None
    try:
        d = parsedate_to_datetime(s)
    except Exception:
        try:
            d = datetime.fromisoformat(s.replace("Z", "+00:00"))
        except Exception:
            return None
    if d.tzinfo is None:
        d = d.replace(tzinfo=timezone.utc)
    return d.astimezone(timezone.utc)


def parse_feed(raw):
    """Întoarce [(titlu, link, data, rezumat)] din RSS 2.0, RDF sau Atom."""
    root = ET.fromstring(raw)
    out = []
    for it in root.iter():
        if local(it.tag) not in ("item", "entry"):
            continue
        title = link = date = desc = ""
        for ch in it:
            t = local(ch.tag)
            if t == "title" and not title:
                title = text_of(ch)
            elif t == "link":
                href = ch.attrib.get("href")
                if href and ch.attrib.get("rel", "alternate") == "alternate":
                    link = link or href
                elif not href and not link:
                    link = text_of(ch)
            elif t in ("pubdate", "date", "published", "updated") and not date:
                date = text_of(ch)
            elif t in ("description", "summary") and not desc:
                desc = text_of(ch)
        if title and link.startswith("http"):
            out.append((clean(title), link.strip(), parse_date(date), clean(desc, 160)))
    return out


def norm(title):
    return re.sub(r"[^a-z0-9ăâîșțäöüß]+", " ", title.lower()).strip()


def score(title, desc):
    t = " " + title.lower() + " "
    s = 0
    if any(t.strip().startswith(b) or (" " + b) in t[:40] for b in CFG.get("breaking", [])):
        s += 2
    hay = t + " " + (desc or "").lower() + " "
    s += min(3, sum(1 for k in CFG.get("important", []) if k in hay))
    return s


def main():
    max_age = timedelta(hours=CFG.get("max_age_hours", 60))
    per = CFG.get("per_source", 30)
    log, items, seen = [], [], set()

    def job(src):
        try:
            return src, parse_feed(fetch(src["url"])), None
        except Exception as e:  # o sursă căzută nu oprește restul
            return src, [], f"{type(e).__name__}: {e}"[:140]

    with ThreadPoolExecutor(8) as ex:
        results = list(ex.map(job, CFG["sources"]))

    for src, rows, err in results:
        n = 0
        for title, link, d, desc in rows[: per * 2]:
            if d is None or d > NOW + timedelta(minutes=20) or NOW - d > max_age:
                continue
            key = norm(title)
            if len(key) < 12 or key in seen:
                continue
            seen.add(key)
            if desc and (norm(desc).startswith(key[:60]) or len(desc) < 25):
                desc = ""
            items.append({
                "id": hashlib.sha1(link.encode()).hexdigest()[:12],
                "t": title, "s": src["name"], "c": src["c"], "l": src.get("l", "en"),
                "u": link, "d": d.strftime("%Y-%m-%dT%H:%M:%SZ"), "x": desc, "i": score(title, desc),
            })
            n += 1
            if n >= per:
                break
        dates = [d for _, _, d, _ in rows if d]
        newest = max(dates).strftime("%d.%m %H:%M") if dates else "fără dată"
        log.append(f"{src['name']}: {n} din {len(rows)} (cel mai nou {newest})" + (f" · EROARE {err}" if err else "" if rows else " · flux gol"))

    items.sort(key=lambda x: x["d"], reverse=True)
    items = items[: CFG.get("max_items", 420)]
    out = {"updated": NOW.strftime("%Y-%m-%dT%H:%M:%SZ"), "items": items, "log": log}
    (ROOT / "news.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("\n".join(log))
    print(f"Total: {len(items)} știri")
    if not items:
        sys.exit("Nicio știre adunată.")


if __name__ == "__main__":
    main()
