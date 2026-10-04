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

- **Feed**: clipuri, citate, idei și Shorts, amestecate. Fiecare citat are dedesubt o operă de artă clasică din domeniul public (The Met Open Access): statui romane și busturi de stoici, soldați și războinici, pictură italiană religioasă, mitologie, gravuri japoneze; imaginea se apropie lent cât e pe ecran. Arta se adună automat (`scripts/fetch_art.py`, workflow „Adună arta pentru citate”); până atunci apare un peisaj desenat în aplicație; butonul ⬇ o salvează ca imagine 1080×1350 de trimis mai departe; filtre pe categorii. Clipurile lungi pornesc doar când apeși pe ele. La fiecare refresh vine alt conținut: aplicația ține minte ce ți-a arătat deja și pune la final ce ai văzut recent; două clipuri de la aceeași persoană nu vin unul după altul.
- **Shorts**: ecran întreg, derulezi în sus și pornesc singure.
- **Azi**: citatul zilei, obiceiuri ca bandă orizontală (fiecare cu emoji-ul lui, un inel de 30 de puncte pentru ultimele 30 de zile și seria de zile dedesubt; atingi emoji-ul ca să bifezi; obicei nou = alegi un emoji de pe tastatură), timer de meditație (5/10/15/20 min, clopoțel, respirație ghidată, ecranul rămâne aprins).
- **Sport** (între Azi și Raft): programul tău de luni până duminică (un mușchi pe zi, 3 exerciții × 3 serii). Sus vezi ziua și exercițiile, la mijloc un corp 3D care face exercițiul (îl rotești cu degetul). „Începe antrenamentul” pornește cronometrul: numărul de repetări urmează ritmul modelului, „Serie gata” pornește pauza cu numărătoare inversă și clopoțel, la final se bifează obiceiul „Mișcare / sport”.
- **Test de stare**: dimineața, la prima deschidere după ora 3, apare „Cum te simți azi?” cu trei fețe (fericit, neutru, trist) până îl completezi. În Azi vezi luna: câte zile fericit, neutru, trist și un calendar colorat.
- **Raft**: cărțile tale PDF stau ca niște cotoare pe un raft; atingi un cotor, cartea iese de pe raft și se deschide. Sus vezi „Continuă lectura”. Cititorul ține minte pagina, are zoom și mod noapte, plus un temporizator de 10 minute pe zi care pornește când deschizi cartea; la final sună un clopoțel și se bifează obiceiul „Citit”. Meditația, cititul de 10 minute și jurnalul completat bifează singure obiceiurile lor. Cărțile stau doar pe telefon.
- **Jurnal de seară** (pagina ascunsă din stânga): în Feed glisezi spre dreapta. Logo-ul HTube devine o carte, coperta se deschide, pagina se apropie de ecran și apare jurnalul: 3 lucruri pentru care ești recunoscător, lecția zilei, ce faci mâine mai bine. Se salvează singur; glisezi spre stânga sau apeși „Feed” ca să te întorci. Atingi în timpul animației ca să sari peste.
- **Salvate**: tot ce ai marcat cu ♥, ca folder în Setări → Colecții.
- **Setări**: statistici, conectare YouTube, adaugi orice clip prin link, lista canalelor.
- `data.js`: 185 de citate (Marcus Aurelius, Seneca, Epictet, Sun Tzu, Musashi, Lao Tzu, Confucius, Goggins și alții, plus proverbe din 15+ culturi) și 33 de idei scurte (Shi Heng Yi, Zeland, Dispenza, Huberman, Hormozi, Jeremy Miner, Chris Voss și alții).
