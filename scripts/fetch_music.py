#!/usr/bin/env python3
"""IMPERIUM — muzică de fundal fără reclame, găzduită în aplicație.
Sursa: biblioteca lui Kevin MacLeod (incompetech.com), licență Creative Commons Attribution 4.0
(gratuită, cu menționarea autorului; creditele apar în Setări). Plus pistele de meditație generate în music/ht-*.m4a.
Alege piesele după descriere (epic/cinematic, sală, meditație, citit), le taie la max 6 minute,
le aduce la același volum și le salvează mici (AAC mono 64 kbps) în music/. Scrie music.json."""
import json, re, subprocess, sys, time, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "music"
MJ = ROOT / "music.json"
BASE = "https://incompetech.com/music/royalty-free/"
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"}
MAXLEN = 360

BAD = ["humor", "silly", "comed", "funny", "medieval", "ren faire", "polka", "holiday", "christmas", "children", "circus",
       "horror", "creepy", "scary", "country", "bluegrass", "vaudeville", "tango", "lounge", "8-bit", "chiptune", "cartoon",
       "zany", "goofy", "quirky", "disco", "carnival", "kids", "spooky", "halloween", "ragtime", "tavern", "latin", "reggae", "swing",
       "waltz", "americana", "western", "funk", "surf", "mariachi", "hawaii", "elevator", "cheesy", "sexy", "romantic", "kiss", "love"]
# piese cunoscute din biblioteca lui Kevin MacLeod care se potrivesc foarte bine (au prioritate dacă există)
PREF = {
    "feed": ["Heroic Age", "Five Armies", "Crusade", "Achilles", "Lord of the Land", "Clash Defiant", "Strength of the Titans",
             "Long Road Ahead", "Noble Race", "Eternal Hope", "Rites", "Prelude and Action", "The Descent", "Unwritten Return",
             "Interloper", "Dark Times", "Final Battle of the Dark Wizards", "Inspired", "Majestic Hills", "Egmont Overture"],
    "sport": ["Volatile Reaction", "Movement Proposition", "Take the Lead", "Metalmania", "Exhilarate", "Ouroboros",
              "Raving Energy", "Rocket", "Sneaky Adventure", "Malicious", "Pump", "Power Restored", "Clash Defiant"],
    "azi": ["Meditation Impromptu 01", "Meditation Impromptu 02", "Meditation Impromptu 03", "That Zen Moment", "Healing",
            "Ethereal Relaxation", "Dreamer", "Tranquility", "Tranquility Base", "Ascending the Vale", "Ripples", "Floating Cities"],
    "raft": ["Gymnopedie No 1", "Gymnopedie No. 1", "Gymnopedie No 2", "Gymnopedie No. 2", "Gymnopedie No 3", "Clear Air",
             "At Rest", "Lasting Hope", "Peaceful Desolation", "Bittersweet", "Autumn Day", "Reawakening", "Study And Relax",
             "Trio for Piano, Cello, and Clarinet", "Prelude No. 1", "Danse Morialta", "Wholesome"],
}
NEED = {"feed": ["epic", "heroic", "cinematic", "orchestra", "majestic", "triumph", "inspir", "uplift", "noble", "grand"],
        "sport": ["driving", "action", "aggress", "intense", "energetic", "rock", "electronic", "dubstep", "metal", "heavy", "pumped"],
        "azi": ["calm", "relax", "meditat", "zen", "ambient", "drone", "bowl", "ethereal", "healing", "tranquil", "peaceful", "mystical"],
        "raft": ["piano", "guitar", "strings", "cello", "harp", "calm", "relax", "gentle", "reflective", "contemplat"]}
ZONES = {
    "sport": {"n": 9, "lufs": -15, "min": 120, "bpm": 112,
              "plus": {"driving": 3, "action": 3, "aggress": 4, "intense": 3, "energetic": 3, "pumped": 4, "rock": 3, "electronic": 2,
                       "dubstep": 3, "electro": 2, "drums": 2, "distorted": 2, "guitar": 1, "synth": 1, "fight": 3, "chase": 2,
                       "battle": 2, "powerful": 2, "heavy": 3, "metal": 3, "workout": 4, "sport": 3, "hard": 1},
              "minus": ["calm", "relax", "sad", "somber", "gentle", "soft", "piano solo", "lullaby"]},
    "feed": {"n": 10, "lufs": -19, "min": 120, "bpm": 0,
             "plus": {"epic": 5, "heroic": 4, "cinematic": 3, "orchestra": 3, "dramatic": 2, "powerful": 2, "inspir": 3,
                      "uplift": 2, "majestic": 3, "triumph": 3, "grand": 2, "brass": 2, "french horn": 2, "timpani": 2,
                      "choir": 2, "strings": 1, "determin": 2, "hope": 2, "adventure": 2, "noble": 2, "victory": 2},
             "minus": ["sad", "lullaby", "electric guitar"]},
    "azi": {"n": 7, "lufs": -23, "min": 180, "bpm": 0,
            "plus": {"calming": 4, "relax": 3, "meditat": 5, "mystical": 3, "peaceful": 3, "zen": 4, "ambient": 3, "drone": 3,
                     "bowl": 4, "ethereal": 3, "dream": 2, "healing": 4, "spiritual": 3, "new age": 3, "pad": 2, "tranquil": 3,
                     "floating": 2, "space": 1, "atmospher": 2},
            "minus": ["drums", "action", "driving", "intense", "rock", "dark"]},
    "raft": {"n": 9, "lufs": -22, "min": 150, "bpm": 0,
             "plus": {"piano": 4, "calm": 3, "relax": 3, "gentle": 3, "soft": 2, "quiet": 2, "reflective": 3, "contemplat": 3,
                      "classical": 3, "guitar": 1, "strings": 1, "bittersweet": 2, "thoughtful": 3, "warm": 2, "peaceful": 2, "study": 3},
             "minus": ["drums", "action", "driving", "intense", "dark", "rock", "electronic", "synth"]},
}
LOCAL = {"azi": [("ht-432-liniste.m4a", "432 Hz · Liniște", 480), ("ht-528-recunostinta.m4a", "528 Hz · Recunoștință", 480),
                 ("ht-theta-focus.m4a", "Theta 6 Hz · Focus adânc (cu căști)", 480)]}


def get(url, tries=3):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                return r.read()
        except Exception as e:
            err = e
            time.sleep(2 * (i + 1))
    raise err


def secs(s):
    t = 0
    for x in re.findall(r"\d+", s or ""):
        t = t * 60 + int(x)
    return t


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:50]


def main():
    OUT.mkdir(exist_ok=True)
    log = []
    try:
        pieces = json.loads(get(BASE + "pieces.json"))
    except Exception as e:
        sys.exit(f"nu am putut citi lista incompetech: {e}")
    log.append(f"{len(pieces)} piese în bibliotecă")
    used, chosen = set(), {}
    order = ["feed", "sport", "azi", "raft"]
    for zone in order:
        z = ZONES[zone]
        scored = []
        for p in pieces:
            hay = " ".join(str(p.get(k) or "") for k in ("title", "description", "feel", "instruments")).lower()
            d = secs(p.get("length"))
            if d < z["min"] or any(b in hay for b in BAD):
                continue
            pref = p["title"].strip().lower() in [x.lower() for x in PREF.get(zone, [])]
            if not pref and not any(k in hay for k in NEED[zone]):
                continue
            s = sum(w for k, w in z["plus"].items() if k in hay) - sum(6 for k in z["minus"] if k in hay) + (25 if pref else 0)
            try:
                bpm = int(p.get("bpm") or 0)
            except ValueError:
                bpm = 0
            if z["bpm"] and bpm >= z["bpm"]:
                s += 3
            if s >= 5:
                scored.append((s, p))
        scored.sort(key=lambda x: -x[0])
        chosen[zone] = [p for _, p in scored[: z["n"] * 3]]      # rezerve, dacă unele nu se descarcă
        log.append(f"{zone}: {len(scored)} candidate")
    out = {"credit": "Muzică: Kevin MacLeod (incompetech.com) · Licență Creative Commons: By Attribution 4.0 · creativecommons.org/licenses/by/4.0/"}
    keep = set()
    for zone in order:
        lst, z = chosen[zone], ZONES[zone]
        items = []
        for p in lst:
            if len(items) >= z["n"]:
                break
            if p["filename"] in used:
                continue
            name = f"km-{slug(p['title'])}.m4a"
            dst = OUT / name
            if not dst.exists():
                try:
                    src = OUT / "tmp.mp3"
                    data = get(BASE + "mp3-royaltyfree/" + urllib.parse.quote(p["filename"]))
                    if len(data) < 100000 or data[:15].lower().startswith((b"<!doctype", b"<html")):
                        raise ValueError(f"nu e mp3 ({len(data)} octeți)")
                    src.write_bytes(data)
                    d = secs(p.get("length"))
                    af = f"loudnorm=I={z['lufs']}:TP=-1.5:LRA=11"
                    if d > MAXLEN:
                        af += f",afade=t=out:st={MAXLEN - 5}:d=5"
                    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-t", str(MAXLEN), "-af", af,
                                    "-ac", "1", "-ar", "44100", "-c:a", "aac", "-b:a", "64k", "-movflags", "+faststart", str(dst)], check=True)
                    src.unlink()
                except Exception as e:
                    log.append(f"  ! {p['title']}: {str(e)[:120]}")
                    (OUT / "tmp.mp3").unlink(missing_ok=True)
                    dst.unlink(missing_ok=True)
                    continue
            keep.add(name)
            used.add(p["filename"])
            items.append({"f": "music/" + name, "t": p["title"], "a": "Kevin MacLeod", "d": min(secs(p.get("length")), MAXLEN)})
        log.append(f"  {zone} → " + "; ".join(i["t"] for i in items))
        for f, t, d in LOCAL.get(zone, []):
            if (OUT / f).exists():
                keep.add(f)
                items.append({"f": "music/" + f, "t": t, "a": "IMPERIUM", "d": d})
        out[zone] = items
    for f in OUT.glob("km-*.m4a"):
        if f.name not in keep:
            f.unlink()
    MJ.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    (ROOT / "music_log.txt").write_text("\n".join(log) + "\n", encoding="utf-8")
    print("\n".join(log))
    print("::notice::" + " · ".join(f"{k} {len(out.get(k, []))}" for k in ZONES))


if __name__ == "__main__":
    main()
