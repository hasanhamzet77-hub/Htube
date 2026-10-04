#!/usr/bin/env python3
"""HTube — adună opere de artă clasică din domeniul public (The Metropolitan Museum of Art, Open Access, CC0)
pentru imaginile de sub citate: statui romane și stoici, soldați și războinici, pictură italiană religioasă,
mitologie, artă japoneză și chineză, peisaje dramatice. Le salvează micșorate în art/ și scrie art.json.
Rulează pe GitHub Actions (are nevoie de internet). Fără chei API."""
import io, json, re, sys, time, urllib.parse, urllib.request
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("pip install pillow")

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "art"
API = "https://collectionapi.metmuseum.org/public/collection/v1"
AIC = "https://api.artic.edu/api/v1/artworks/search"
UA = {"User-Agent": "HTube/1.0 (personal app; github.com/hasanhamzet77-hub/htube)"}
PER_THEME = 16

# temă -> listă de (căutare, departament)  · 11 Pictură europeană, 13 Artă greacă și romană,
# 12 Sculptură europeană, 6 Artă asiatică, 17 Artă medievală, 9 Desene și gravuri
THEMES = {
    "stoic":  [("Marcus Aurelius", 13), ("Roman portrait head", 13), ("bust philosopher", 13), ("Socrates", None),
               ("Seneca", None), ("Roman emperor marble", 13), ("bust of a man marble", 12)],
    "roman":  [("Roman soldier", None), ("Roman", 11), ("triumph", 11), ("emperor", 13), ("Caesar", None), ("legion", None)],
    "war":    [("battle", 11), ("warrior", None), ("armor", None), ("Mars", 11), ("knight", 11), ("Hercules", 11), ("David Goliath", 11)],
    "sacred": [("angel", 11), ("Saint Michael", 11), ("Annunciation", 11), ("saint", 11), ("Madonna", 11), ("altarpiece", 11)],
    "myth":   [("Apollo", 11), ("Minerva", 11), ("Prometheus", None), ("Hercules", 12), ("Jupiter", 11), ("Orpheus", 11)],
    "east":   [("samurai", 6), ("Hokusai", 6), ("Hiroshige", 6), ("Chinese landscape", 6), ("warrior", 6), ("Mount Fuji", 6)],
    "nature": [("storm sea", 11), ("sunrise landscape", 11), ("mountains landscape", 11), ("Turner", 11), ("shipwreck", 11), ("waterfall", 11)],
}
BLOCK = re.compile(r"nude|naked|venus|bath|leda|crucif|martyr|massacre|decapit|beheading|lamentation|entombment|dead christ|judith|salome|rape|susanna|bacchanal|satyr|danae", re.I)
BAD_CLASS = re.compile(r"coin|gem|glass|textile|ceramic|vase|jewel|seal|furniture|metalwork|book|manuscript|photograph", re.I)


def get(url, binary=False, tries=2, timeout=15):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as r:
                data = r.read()
                return data if binary else json.loads(data.decode("utf-8"))
        except Exception as e:
            err = e
            time.sleep(1.5 * (i + 1))
    raise err


def search(q, dept):
    p = {"q": q, "hasImages": "true"}
    if dept:
        p["departmentId"] = dept
    res = get(f"{API}/search?" + urllib.parse.urlencode(p))
    return (res.get("objectIDs") or [])[:60]


# a doua sursă: Art Institute of Chicago (domeniu public, CC0), imagini prin IIIF
AIC_Q = {
    "stoic": ["Roman portrait head marble", "Marcus Aurelius", "philosopher", "Roman emperor bust", "Greek portrait head"],
    "roman": ["Roman soldier", "Roman triumph", "Roman ruins", "Roman emperor", "gladiator"],
    "war": ["battle", "warrior", "armor knight", "Hercules", "Saint George dragon"],
    "sacred": ["angel Italian", "Saint Michael", "Annunciation", "altarpiece Italian", "saint Italian painting"],
    "myth": ["Apollo", "Minerva", "Prometheus", "Jupiter", "Orpheus"],
    "east": ["samurai", "Hokusai", "Hiroshige", "Chinese landscape", "Japanese warrior print"],
    "nature": ["storm at sea", "sunrise", "mountain landscape", "Turner", "waterfall"],
}
def aic(theme, items, seen, log):
    for q in AIC_Q.get(theme, []):
        if len(items) >= PER_THEME:
            return
        url = AIC + "?" + urllib.parse.urlencode({"q": q, "limit": 40, "fields": "id,title,image_id,artist_title,artist_display,date_display,classification_title,is_public_domain,term_titles"})
        try:
            res = get(url)
        except Exception as e:
            log.append(f"AIC {theme}/{q}: căutare eșuată {e}")
            continue
        taken = 0
        for o in res.get("data", []):
            if len(items) >= PER_THEME or taken >= 4:
                break
            key = "aic" + str(o.get("id"))
            if key in seen or not o.get("is_public_domain") or not o.get("image_id"):
                continue
            title = o.get("title") or ""
            if BLOCK.search(title + " " + " ".join(o.get("term_titles") or [])) or BAD_CLASS.search(o.get("classification_title") or ""):
                continue
            try:
                im = Image.open(io.BytesIO(get(f"https://www.artic.edu/iiif/2/{o['image_id']}/full/843,/0/default.jpg", binary=True))).convert("RGB")
            except Exception as e:
                log.append(f"AIC img {o.get('id')}: {e}")
                continue
            if min(im.size) < 380:
                continue
            im.thumbnail((900, 900))
            f = f"{theme}-aic{o['id']}.jpg"
            im.save(OUT / f, "JPEG", quality=78, optimize=True, progressive=True)
            items.append({"f": f, "id": key, "t": title[:90], "a": (o.get("artist_title") or "")[:60], "d": (o.get("date_display") or "")[:30],
                          "w": im.size[0], "h": im.size[1], "src": "Art Institute of Chicago"})
            seen.add(key)
            taken += 1
            time.sleep(.2)
        log.append(f"AIC {theme}/{q}: +{taken}")


def main():
    OUT.mkdir(exist_ok=True)
    old = {}
    if (ROOT / "art.json").exists():
        try:
            old = json.loads((ROOT / "art.json").read_text(encoding="utf-8"))
        except Exception:
            old = {}
    seen, out, log = set(), {}, []
    met_ok = True
    try:
        get(f"{API}/search?q=Marcus%20Aurelius&hasImages=true", tries=1, timeout=12)
    except Exception as e:
        met_ok = False
        log.append(f"Met indisponibil de aici ({e}); folosesc Art Institute of Chicago")
    for theme, queries in THEMES.items():
        items = [x for x in old.get(theme, []) if (OUT / x["f"]).exists()]   # păstrăm ce avem deja
        for x in items:
            seen.add(x["id"])
        for q, dept in (queries if met_ok else []):
            if len(items) >= PER_THEME:
                break
            try:
                ids = search(q, dept)
            except Exception as e:
                log.append(f"{theme}/{q}: căutare eșuată {e}")
                continue
            taken, fails = 0, 0
            for oid in ids:
                if len(items) >= PER_THEME or taken >= 4:   # cel mult 4 pe căutare, ca să fie variat
                    break
                if oid in seen:
                    continue
                try:
                    o = get(f"{API}/objects/{oid}", tries=1, timeout=12)
                except Exception as e:
                    log.append(f"Met obj {oid}: {e}")
                    fails += 1
                    if fails > 6:
                        met_ok = False
                        break
                    continue
                title = o.get("title") or ""
                if not o.get("isPublicDomain") or not o.get("primaryImageSmall"):
                    continue
                if BLOCK.search(title + " " + " ".join(t.get("term", "") for t in (o.get("tags") or []))):
                    continue
                if BAD_CLASS.search(o.get("classification") or ""):
                    continue
                try:
                    im = Image.open(io.BytesIO(get(o["primaryImageSmall"], binary=True))).convert("RGB")
                except Exception:
                    continue
                w, h = im.size
                if min(w, h) < 380:
                    continue
                im.thumbnail((900, 900))
                f = f"{theme}-{oid}.jpg"
                im.save(OUT / f, "JPEG", quality=78, optimize=True, progressive=True)
                items.append({"src": "The Met", "f": f, "id": oid, "t": title[:90], "a": (o.get("artistDisplayName") or o.get("culture") or "")[:60],
                              "d": (o.get("objectDate") or "")[:30], "w": im.size[0], "h": im.size[1]})
                seen.add(oid)
                taken += 1
                time.sleep(.15)
            log.append(f"{theme}/{q}: +{taken}")
        if len(items) < PER_THEME:
            aic(theme, items, seen, log)
        out[theme] = items
        print(theme, len(items), flush=True)
    # ștergem imaginile care nu mai sunt folosite
    used = {x["f"] for v in out.values() for x in v}
    for p in OUT.glob("*.jpg"):
        if p.name not in used:
            p.unlink()
    (ROOT / "art.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("\n".join(log))
    (ROOT / "art_log.txt").write_text("\n".join(log) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
