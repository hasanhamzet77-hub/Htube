// IMPERIUM — trimite seara notificarea pentru jurnal (Web Push).
// Abonamentele sunt în push/subs.json (doar adresa telefonului; fără cheia privată nu se poate trimite nimic).
// Cheia privată VAPID stă în secretul GitHub VAPID_PRIVATE.
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(process.cwd() + "/");
const webpush = require("web-push");

const PUB = "BBu5kjxtRDHu6WHChz9WwL2lBGNCMDjTw1HvEfnxOdLYOSLsuV9JuMyQuP2Eq1k_0s2JLamP9qkbCGrg5X4JUTw";
const PRIV = (process.env.VAPID_PRIVATE || "").trim();
const SENT = ".pushsent/sent.json";
if (!PRIV) { console.log("::notice::Lipsește secretul VAPID_PRIVATE — nu trimit nimic."); process.exit(0); }
webpush.setVapidDetails("https://hasanhamzet77-hub.github.io/htube/", PUB, PRIV);

const subs = JSON.parse(fs.readFileSync("push/subs.json", "utf8"));
const sent = fs.existsSync(SENT) ? JSON.parse(fs.readFileSync(SENT, "utf8")) : [];
const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
  .formatToParts(new Date()).map(p => [p.type, p.value]));
const now = +parts.hour * 60 + +parts.minute;
const LINES = [
  "Trei lucruri bune de azi și o lecție. Două minute, apoi somn liniștit.",
  "Pentru ce ești recunoscător azi? Scrie înainte să se piardă ziua.",
  "Ce ai făcut azi care te apropie de omul care vrei să fii?",
  "Ziua se încheie. Ce a mers bine și ce faci mâine mai bine?",
  "Disciplina se vede în lucrurile mici. Completează jurnalul de azi.",
  "Un minut de liniște: ce te-a învățat ziua de azi?",
  "Marcus Aurelius își scria gândurile în fiecare seară. E rândul tău."
];
const body = LINES[new Date().getDate() % LINES.length];
let changed = false;
for (const s of subs) {
  const id = s.e.slice(-16), target = (s.h ?? 21) * 60 + (s.m ?? 30);
  if (sent.includes(id)) { console.log(id, "deja trimis azi"); continue; }
  if (now < target || now > target + 150) { console.log(id, "nu e ora", now, target); continue; }
  try {
    await webpush.sendNotification({ endpoint: s.e, keys: s.k }, JSON.stringify({ title: "Jurnalul de seară", body, url: "./?open=jurnal" }), { TTL: 3 * 3600, urgency: "normal" });
    console.log(id, "trimis");
    sent.push(id); changed = true;
  } catch (e) {
    console.log("::warning::", id, e.statusCode || "", String(e.body || e.message).slice(0, 200));
    if (e.statusCode === 404 || e.statusCode === 410) console.log("::warning::Abonament expirat: activează din nou notificările din Setări și trimite codul nou.");
  }
}
if (changed) { fs.mkdirSync(".pushsent", { recursive: true }); fs.writeFileSync(SENT, JSON.stringify(sent)); fs.writeFileSync(".pushsent/changed", "1"); }
