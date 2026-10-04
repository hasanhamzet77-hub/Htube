#!/usr/bin/env python3
"""HTube — aduce clipurile noi pentru persoanele din channels.json și scrie feed.json.
1) canalele oficiale, prin fluxurile RSS publice YouTube (video + Shorts separat);
2) căutări pe tot YouTube-ul (Shorts și podcasturi de pe alte conturi), filtrate după nume.
Rulează automat pe GitHub Actions. Fără chei API."""
import json, re, sys, time, unicodedata, urllib.parse, urllib.request, xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CFG = json.loads((ROOT / "channels.json").read_text(encoding="utf-8"))
FEED = ROOT / "feed.json"
IDS = ROOT / "channel_ids.json"
MAX_ITEMS = 2500
NOW = datetime.now(timezone.utc)
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.8", "Cookie": "CONSENT=YES+1; SOCS=CAI; PREF=hl=en&gl=US"}
NS = {"a": "http://www.w3.org/2005/Atom", "yt": "http://www.youtube.com/xml/schemas/2015",
      "media": "http://search.yahoo.com/mrss/"}


def get(url, tries=2):
    err = None
    for _ in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=25) as r:
                return r.read().decode("utf-8", "replace")
        except Exception as e:
            err = e
            time.sleep(1.5)
    raise err


def resolve(ref, cache):
    if ref.startswith("UC"):
        return ref
    if ref in cache:
        return cache[ref]
    html = get("https://www.youtube.com/" + ref)
    for pat in (r'"externalId":"(UC[\w-]{22})"', r'<meta itemprop="identifier" content="(UC[\w-]{22})"',
                r'"channelId":"(UC[\w-]{22})"'):
        m = re.search(pat, html)
        if m:
            cache[ref] = m.group(1)
            return m.group(1)
    raise RuntimeError("nu am găsit ID pentru " + ref)


def rss(xml, person, short, origin=1):
    """origin 1 = canal oficial; 2 = canal de fani dedicat (se aplică filtrele, numele poate fi și în descriere)."""
    out = []
    for e in ET.fromstring(xml).findall("a:entry", NS):
        vid = e.findtext("yt:videoId", namespaces=NS)
        if not vid:
            continue
        title = e.findtext("a:title", namespaces=NS) or ""
        ch = e.findtext("a:author/a:name", namespaces=NS) or person["name"]
        it = {"id": vid, "t": title, "who": person["name"], "ch": ch, "c": person["c"],
              "p": e.findtext("a:published", namespaces=NS) or NOW.isoformat(),
              "s": short if short is not None else "#shorts" in title.lower(), "o": origin}
        if origin == 2:
            it["_d"] = (e.findtext("media:group/media:description", namespaces=NS) or "")[:600]
        out.append(it)
    return out


def channel_items(ref, person, cache, origin):
    cid = resolve(ref, cache)
    part = []
    for prefix, short in (("UULF", False), ("UUSH", True)):
        try:
            part += rss(get(f"https://www.youtube.com/feeds/videos.xml?playlist_id={prefix}{cid[2:]}"), person, short, origin)
        except Exception:
            pass
    if not part:
        part = rss(get(f"https://www.youtube.com/feeds/videos.xml?channel_id={cid}"), person, None, origin)
    return part


def norm(s):
    return unicodedata.normalize("NFKC", s or "").lower()


def walk(node, found):
    if isinstance(node, dict):
        for k, v in node.items():
            if k in ("videoRenderer", "reelItemRenderer", "shortsLockupViewModel"):
                found.append((k, v))
            else:
                walk(v, found)
    elif isinstance(node, list):
        for v in node:
            walk(v, found)


def text(x):
    if not x:
        return ""
    if "simpleText" in x:
        return x["simpleText"]
    if "runs" in x:
        return "".join(r.get("text", "") for r in x["runs"])
    return x.get("content", "")


def rel_date(s):
    m = re.search(r"(\d+)\s+(second|minute|hour|day|week|month|year)", s or "")
    if not m:
        return NOW
    n, u = int(m.group(1)), m.group(2)
    days = {"second": 1 / 86400, "minute": 1 / 1440, "hour": 1 / 24, "day": 1, "week": 7, "month": 30, "year": 365}[u]
    return NOW - timedelta(days=n * days)


def secs(s):
    p = [int(x) for x in re.findall(r"\d+", s or "")]
    t = 0
    for x in p:
        t = t * 60 + x
    return t


def search(q, person):
    html = get("https://www.youtube.com/results?" + urllib.parse.urlencode({"search_query": q, "hl": "en", "gl": "US"}))
    m = re.search(r"var ytInitialData\s*=\s*(\{.*?\});\s*</script>", html, re.S)
    if not m:
        return []
    found = []
    walk(json.loads(m.group(1)), found)
    out = []
    for kind, v in found:
        if kind == "videoRenderer":
            vid, title = v.get("videoId"), text(v.get("title"))
            ch = text(v.get("ownerText")) or text(v.get("longBylineText"))
            dur = secs(text(v.get("lengthText")))
            if not dur:  # live sau fără durată
                continue
            short = dur <= 75 or "#short" in title.lower()
            pub = rel_date(text(v.get("publishedTimeText")))
        elif kind == "reelItemRenderer":
            vid, title, ch, short, pub = v.get("videoId"), text(v.get("headline")), "", True, NOW
        else:
            try:
                vid = v["onTap"]["innertubeCommand"]["reelWatchEndpoint"]["videoId"]
            except Exception:
                continue
            title = (v.get("overlayMetadata", {}).get("primaryText", {}) or {}).get("content", "")
            ch, short, pub = "", True, NOW
        if vid and title:
            out.append({"id": vid, "t": title, "who": person["name"], "ch": ch or "YouTube", "c": person["c"],
                        "p": pub.isoformat(timespec="seconds"), "s": short, "o": 0})
    return out


def keep(item, person, block):
    t = norm(item["t"])
    if any(w in t for w in block):
        return False
    if item["o"] == 1:  # canal oficial
        return not any(w in t for w in person.get("block", []))
    hay = t + " " + norm(item.get("_d", "")) if item["o"] == 2 else t
    if not any(w in hay for w in person.get("must", [person["name"].lower()])):
        return False
    if any(w in t for w in person.get("block", [])):
        return False
    # Shorts au titluri foarte scurte: pentru ele ajunge lista de excluderi; clipurile lungi trebuie să fie clar motivaționale
    if person.get("allow") and not item["s"] and not any(w in t for w in person["allow"]):
        return False
    return True


def main():
    cache = json.loads(IDS.read_text()) if IDS.exists() else {}
    old = json.loads(FEED.read_text()).get("items", []) if FEED.exists() else []
    names = {p["name"] for p in CFG["persons"]}
    block = [w.lower() for w in CFG.get("block_words", [])]
    merged = {i["id"]: i for i in old if i.get("who") in names}
    log = []
    for person in CFG["persons"]:
        got = []
        for origin, key in ((1, "channels"), (2, "fan_channels")):
            for ref in person.get(key, []):
                try:
                    got += channel_items(ref, person, cache, origin)
                except Exception as e:
                    log.append(f"  ! {person['name']} {ref}: {e}")
        for q in person.get("search", []):
            try:
                got += search(q, person)
                time.sleep(1)
            except Exception as e:
                log.append(f"  ! {person['name']} căutare '{q}': {e}")
        n = 0
        for it in got:
            if not keep(it, person, block):
                continue
            it.pop("_d", None)
            prev = merged.get(it["id"])
            if prev and not it["o"]:
                it["p"] = prev["p"]  # păstrăm data primei apariții pentru clipurile găsite prin căutare
            merged[it["id"]] = it
            n += 1
        sh = [i for i in got if i["s"]]
        log.append(f"{person['name']}: {n} păstrate din {len(got)} găsite; shorts găsite {len(sh)}, păstrate {sum(1 for i in sh if keep(i, person, block))}"
                   + (f"; ex. respins: {[i['t'][:50] for i in sh if not keep(i, person, block)][:3]}" if sh else ""))
    items = sorted(merged.values(), key=lambda x: x["p"], reverse=True)[:MAX_ITEMS]
    FEED.write_text(json.dumps({"updated": NOW.isoformat(timespec="seconds"), "log": log, "items": items},
                               ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    IDS.write_text(json.dumps(cache, indent=1))
    print("\n".join(log))
    print(f"Total în feed: {len(items)} (shorts: {sum(1 for i in items if i['s'])})")
    if not items:
        sys.exit(1)


if __name__ == "__main__":
    main()
