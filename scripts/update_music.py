#!/usr/bin/env python3
"""IMPERIUM — adună muzică de fundal de pe YouTube pentru fiecare zonă a aplicației și scrie music.json.
feed  = cinematic, epic, de focus și motivație
sport = muzică de sală (phonk, epic, hardstyle) pentru antrenament
azi   = meditație și concentrare: frecvențe 432/528 Hz, unde alfa/theta, boluri tibetane
raft  = muzică liniștită pentru citit: pian, violoncel, clasic, ambient
Rulează pe GitHub Actions o dată pe zi (din workflow-ul feed-ului). Fără chei API."""
import json, random, sys, time
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import update_feed as uf  # noqa: E402  (refolosim cererile și parsarea căutării YouTube)

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "music.json"
KEEP = 45          # câte piese păstrăm pe fiecare zonă
REFRESH_H = 20     # nu căutăm din nou mai des de atât

MOODS = {
    "feed": {
        "min": 12 * 60,
        "q": ["epic cinematic motivational music mix", "cinematic music for focus and deep work",
              "hans zimmer style epic ambient focus music", "powerful epic orchestral music 1 hour",
              "dark cinematic ambient music concentration", "stoic epic music motivation mix",
              "interstellar style ambient music for work", "epic heroic music mix no copyright",
              "gladiator style epic music mix", "inspiring cinematic piano and strings mix"],
        "block": ["sleep", "lyrics", "asmr", "karaoke", "reaction", "8d", "slowed", "trailer"],
    },
    "sport": {
        "min": 10 * 60,
        "q": ["gym workout motivation music mix", "phonk gym workout mix", "aggressive workout music 1 hour",
              "epic orchestral workout music", "hardstyle gym motivation mix", "best gym music mix 2026",
              "dark phonk mix for gym", "rock workout music mix", "hip hop gym workout mix", "bodybuilding motivation music mix"],
        "block": ["sleep", "lyrics", "asmr", "karaoke", "reaction", "slowed", "relax", "meditation"],
    },
    "azi": {
        "min": 15 * 60,
        "q": ["432 hz meditation music", "528 hz healing frequency meditation music", "theta waves meditation music",
              "alpha waves deep focus music", "tibetan singing bowls meditation", "morning meditation music positive energy",
              "solfeggio frequencies meditation music", "binaural beats focus concentration", "zen meditation music flute",
              "396 hz meditation music"],
        "block": ["lyrics", "karaoke", "reaction", "asmr talking", "guided meditation", "voice"],
    },
    "raft": {
        "min": 15 * 60,
        "q": ["music for reading and concentration", "calm piano music for reading", "dark academia classical music for reading",
              "ambient study music concentration", "relaxing cello and piano music", "library ambience soft classical music",
              "classical music for reading and studying", "soft instrumental music for reading books", "chopin nocturnes for reading",
              "lofi piano for reading"],
        "block": ["lyrics", "karaoke", "reaction", "sleep music for", "rain only", "asmr"],
    },
}


def search_long(q):
    html = uf.get("https://www.youtube.com/results?" + uf.urllib.parse.urlencode({"search_query": q, "hl": "en", "gl": "US"}))
    m = uf.re.search(r"var ytInitialData\s*=\s*(\{.*?\});\s*</script>", html, uf.re.S)
    if not m:
        return []
    found = []
    uf.walk(json.loads(m.group(1)), found)
    out = []
    for kind, v in found:
        if kind != "videoRenderer":
            continue
        vid, title = v.get("videoId"), uf.text(v.get("title"))
        dur = uf.secs(uf.text(v.get("lengthText")))
        if vid and title and dur:   # fără live-uri (n-au durată)
            out.append({"id": vid, "t": title[:110], "ch": (uf.text(v.get("ownerText")) or uf.text(v.get("longBylineText")))[:60], "d": dur})
    return out


def main():
    old = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {}
    if old.get("updated") and "--force" not in sys.argv:
        age = (datetime.now(timezone.utc) - datetime.fromisoformat(old["updated"])).total_seconds() / 3600
        if age < REFRESH_H:
            print(f"music.json are {age:.1f} h; nu caut din nou")
            return
    out, log = {"updated": datetime.now(timezone.utc).isoformat(timespec="seconds")}, []
    for mood, cfg in MOODS.items():
        seen, fresh = set(), []
        for q in cfg["q"]:
            try:
                res = search_long(q)
            except Exception as e:
                log.append(f"{mood}: '{q}' eșuat ({e})")
                continue
            n = 0
            for it in res:
                t = uf.norm(it["t"])
                if it["id"] in seen or it["d"] < cfg["min"] or it["d"] > 10 * 3600 or any(b in t for b in cfg["block"]):
                    continue
                seen.add(it["id"])
                fresh.append(it)
                n += 1
                if n >= 6:      # cel mult 6 pe căutare, ca lista să fie variată
                    break
            time.sleep(1)
        # amestecăm noul cu vechiul, ca lista să nu scadă dacă o căutare dă greș
        prev = [x for x in old.get(mood, []) if x["id"] not in seen]
        random.shuffle(prev)
        out[mood] = (fresh + prev)[:KEEP]
        log.append(f"{mood}: {len(fresh)} găsite, {len(out[mood])} în listă")
    if not any(out.get(m) for m in MOODS):
        print("\n".join(log))
        sys.exit("nimic găsit")
    OUT.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("\n".join(log))


if __name__ == "__main__":
    main()
