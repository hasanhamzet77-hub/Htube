#!/usr/bin/env python3
"""HTube — aduce clipurile noi (video + Shorts) de pe canalele din channels.json și scrie feed.json.
Rulează automat pe GitHub Actions. Fără chei API: folosește fluxurile RSS publice YouTube."""
import json, re, sys, time, urllib.request, xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CFG = json.loads((ROOT / "channels.json").read_text(encoding="utf-8"))
FEED = ROOT / "feed.json"
IDS = ROOT / "channel_ids.json"
MAX_ITEMS = 1500
UA = {"User-Agent": "Mozilla/5.0 (HTube feed bot)", "Accept-Language": "en-US,en;q=0.8",
      "Cookie": "CONSENT=YES+1; SOCS=CAI"}
NS = {"a": "http://www.w3.org/2005/Atom", "yt": "http://www.youtube.com/xml/schemas/2015",
      "media": "http://search.yahoo.com/mrss/"}


def get(url, tries=2):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=20) as r:
                return r.read().decode("utf-8", "replace")
        except Exception as e:
            err = e
            time.sleep(1.5)
    raise err


def resolve(ch, cache):
    if ch.get("id"):
        return ch["id"]
    h = ch["handle"]
    if h in cache:
        return cache[h]
    html = get("https://www.youtube.com/" + h)
    for pat in (r'"externalId":"(UC[\w-]{22})"', r'<meta itemprop="identifier" content="(UC[\w-]{22})"',
                r'channel/(UC[\w-]{22})"', r'"channelId":"(UC[\w-]{22})"'):
        m = re.search(pat, html)
        if m:
            cache[h] = m.group(1)
            return m.group(1)
    raise RuntimeError("nu am găsit ID pentru " + h)


def parse(xml, ch, short):
    out = []
    root = ET.fromstring(xml)
    for e in root.findall("a:entry", NS):
        vid = e.findtext("yt:videoId", namespaces=NS)
        title = e.findtext("a:title", namespaces=NS) or ""
        pub = e.findtext("a:published", namespaces=NS) or ""
        views = 0
        st = e.find("media:group/media:community/media:statistics", NS)
        if st is not None:
            views = int(st.get("views") or 0)
        if not vid:
            continue
        if short is None:
            short = "#shorts" in title.lower()
        out.append({"id": vid, "t": title, "ch": ch["name"], "c": ch["c"], "p": pub, "s": bool(short), "v": views})
    return out


def main():
    cache = json.loads(IDS.read_text()) if IDS.exists() else {}
    old = json.loads(FEED.read_text()).get("items", []) if FEED.exists() else []
    found, ok, failed = [], [], []
    for ch in CFG["channels"]:
        try:
            cid = resolve(ch, cache)
            got = []
            for prefix, short in (("UULF", False), ("UUSH", True)):
                try:
                    got += parse(get(f"https://www.youtube.com/feeds/videos.xml?playlist_id={prefix}{cid[2:]}"), ch, short)
                except Exception:
                    pass
            if not got:
                got = parse(get(f"https://www.youtube.com/feeds/videos.xml?channel_id={cid}"), ch, None)
            found += got
            ok.append(f"{ch['name']}: {len(got)}")
        except Exception as e:
            failed.append(f"{ch['name']}: {e}")
    block = [w.lower() for w in CFG.get("block_words", [])]
    merged = {i["id"]: i for i in old}
    for i in found:
        if any(w in i["t"].lower() for w in block):
            continue
        merged[i["id"]] = i
    items = sorted(merged.values(), key=lambda x: x["p"], reverse=True)[:MAX_ITEMS]
    FEED.write_text(json.dumps({"updated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                                "items": items}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    IDS.write_text(json.dumps(cache, indent=1))
    print("OK:", *ok, sep="\n  ")
    if failed:
        print("EȘUAT:", *failed, sep="\n  ")
    print(f"Total în feed: {len(items)}")
    if not found and not old:
        sys.exit(1)


if __name__ == "__main__":
    main()
