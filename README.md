# HTube

Feed personal pe telefon: motivație, minte, afaceri, oameni, sănătate și înțelepciune. Fără știri, fără algoritm. Se actualizează singur.

**Link:** https://hasanhamzet77-hub.github.io/Htube/
Deschide-l în Safari → Share → **Add to Home Screen**.

## Cum se actualizează

- La fiecare **2 ore**, GitHub rulează automat `scripts/update_feed.py`, care aduce clipurile noi (video și Shorts) de pe canalele din `channels.json` și le scrie în `feed.json`.
- Aplicația verifică feed-ul când o deschizi, când revii în ea și la fiecare 10 minute. Clipurile noi apar cu eticheta **NOU** sau ca buton „↑ clipuri noi”.
- Butonul ↻ din colț reamestecă feed-ul. Feed-ul nu se termină: clipurile, citatele, ideile și benzile de Shorts se amestecă la infinit.
- Actualizare manuală: pe GitHub → **Actions** → „Actualizează feed-ul HTube” → **Run workflow**.

## Cum adaugi sau scoți canale

Editează `channels.json` direct pe GitHub (creionul ✏️). Fiecare canal are nume, `@handle` și categorie (`mot`, `dev`, `biz`, `soc`, `san`). La salvare, feed-ul se actualizează imediat.

## YouTube Premium

Player-ul e cel oficial YouTube. Pe iPhone, player-ul din HTube nu poate folosi contul Premium (Safari blochează cookie-urile YouTube în aplicațiile web). La reclame apeși Skip, sau butonul **YouTube** din bara unui clip lung deschide clipul în aplicația YouTube, de la secunda la care erai, fără reclame.

## Ce e în aplicație

- **Feed**: clipuri, citate, idei și Shorts, amestecate; filtre pe categorii. Clipurile lungi pornesc doar când apeși pe ele. La fiecare refresh vine alt conținut: aplicația ține minte ce ți-a arătat deja și pune la final ce ai văzut recent; două clipuri de la aceeași persoană nu vin unul după altul.
- **Shorts**: ecran întreg, derulezi în sus și pornesc singure.
- **Azi**: citatul zilei, obiceiuri (bifezi zilnic, vezi seria de zile și ultima săptămână), timer de meditație (5/10/15/20 min, clopoțel, respirație ghidată, ecranul rămâne aprins) și raftul de cărți: încarci PDF-uri și le citești în aplicație, cu pagina la care ai rămas, zoom și mod noapte. Jurnal de seară: 3 lucruri pentru care ești recunoscător, lecția zilei și ce faci mâine mai bine; se salvează singur și vezi serile trecute. Meditația, cititul de 10 minute și jurnalul completat bifează singure obiceiurile lor. Cărțile stau doar pe telefon.
- **Salvate**: tot ce ai marcat cu ♥.
- **Setări**: statistici, conectare YouTube, adaugi orice clip prin link, lista canalelor.
- `data.js`: 185 de citate (Marcus Aurelius, Seneca, Epictet, Sun Tzu, Musashi, Lao Tzu, Confucius, Goggins și alții, plus proverbe din 15+ culturi) și 33 de idei scurte (Shi Heng Yi, Zeland, Dispenza, Huberman, Hormozi, Jeremy Miner, Chris Voss și alții).
