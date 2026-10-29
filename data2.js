// IMPERIUM — conținut suplimentar pentru feed: citate (traduceri libere din surse cunoscute), idei și fire.
// Se adaugă peste data.js / threads.js, ca feed-ul să aibă mult mai multe lucruri înainte să se repete.
(function(){
const Q=window.QUOTES=window.QUOTES||[];
const add=(c,who,src,list)=>list.forEach(t=>Q.push([t,who,src,c]));

// ── Marcus Aurelius, Meditații ──
add("int","Marcus Aurelius","Meditații 8.33",["Primește fără mândrie, lasă să plece fără împotrivire."]);
add("int","Marcus Aurelius","Meditații",[
 "Ai putere asupra minții tale, nu asupra evenimentelor din afară. Înțelege asta și vei găsi tăria.",
 "Privește în interior. Acolo e izvorul binelui, și poate țâșni mereu dacă sapi mereu.",
 "Cât de mult timp câștigă cel care nu se uită la ce a spus vecinul, ci doar la ce face el însuși.",
 "Amintește-ți că doar prezentul îl trăiești și doar pe el îl pierzi.",
 "Nu te lăsa tulburat de viitor. Îl vei întâmpina, dacă va fi nevoie, cu aceeași rațiune pe care o folosești acum.",
 "Ceea ce împiedică acțiunea o face să avanseze.",
 "Ești o mică suflare care poartă un trup.",
 "Alexandru cel Mare și catârgiul lui au ajuns, după moarte, în același loc.",
 "Pune-ți întrebarea la fiecare lucru: este acesta necesar?",
 "Dacă vrei liniște, fă mai puțin. Mai bine: fă ce e esențial.",
 "Fericirea vieții tale depinde de calitatea gândurilor tale.",
 "Nu face nimic la întâmplare și nimic altfel decât după un principiu.",
 "Acceptă lucrurile cu care te leagă destinul și iubește oamenii cu care te-a adus împreună.",
 "Lucrează, dar nu ca un nefericit și nu ca unul care vrea să fie compătimit sau admirat.",
 "Totul e efemer: și cel care își amintește, și cel amintit.",
 "Când ești supărat pe greșeala cuiva, întoarce-te la tine și vezi unde ai greșit și tu la fel.",
 "Cel care trăiește în armonie cu sine trăiește în armonie cu universul.",
 "Să fii ca un promontoriu: valurile se izbesc de el neîncetat, iar el stă drept și liniștește apa din jur.",
 "Gândește-te la tine ca la cineva care a murit deja și trăiește ce a mai rămas ca pe un dar.",
 "Orice lucru frumos e frumos prin sine și se încheie în sine; lauda nu face parte din el.",
 "Nu irosi ce ți-a mai rămas din viață gândindu-te la ce fac alții.",
 "Fii tolerant cu ceilalți și strict cu tine.",
 "Încetează să rătăcești. Nu vei mai avea timp să-ți citești notițele. Grăbește-te spre scop.",
]);

// ── Seneca, Scrisori către Lucilius și Despre scurtimea vieții ──
add("int","Seneca","Scrisori către Lucilius",[
 "Avem mai multe lucruri care ne sperie decât care ne zdrobesc.",
 "Cine se teme de ce s-ar putea întâmpla suferă de două ori.",
 "Câtă vreme amânăm, viața trece pe lângă noi.",
 "Fiecare zi e o viață separată.",
 "Ne învățăm unii pe alții, și învățând, învățăm noi înșine.",
 "Cere-ți mereu socoteală: ce slăbiciune ai vindecat azi? Ce viciu ai înfrânt?",
 "Alege un om de valoare și ține-l mereu în fața ochilor; trăiește ca și cum te-ar privi.",
 "Nu e om mai nefericit decât cel care n-a fost niciodată încercat.",
 "Ce contează nu e cât de mult trăiești, ci cât de bine.",
 "Un om fericit e mulțumit cu ce are, oricât de puțin.",
 "Grăbește-te să trăiești bine și gândește-te că fiecare zi e o viață întreagă.",
]);

// ── Epictet, Manualul și Discursurile ──
add("int","Epictet","Manualul / Discursuri",[
 "Nu explica nimic din ce ai de gând să faci. Fă-o.",
 "Dacă vrei să fii scriitor, scrie.",
 "Mai întâi spune-ți cine vrei să fii; apoi fă ce ai de făcut.",
 "Bogăția nu înseamnă să ai mult, ci să ai nevoie de puțin.",
 "Nimic mare nu se naște dintr-odată; nici strugurele, nici smochina.",
 "Antrenează-te mai întâi în lucrurile mici, apoi treci la cele mari.",
 "Dacă ești supărat pe cineva, gândește-te: el face ce crede că e corect.",
]);

// ── Miyamoto Musashi, Cartea celor cinci cercuri și Dokkōdō ──
add("int","Miyamoto Musashi","Cartea celor cinci cercuri / Dokkōdō",[
 "Acceptă totul așa cum este.",
 "Gândește-te ușor la tine și profund la lume.",
 "Fii detașat de dorință toată viața.",
 "Nu căuta casă frumoasă, nici mâncare aleasă.",
 "Nu te teme de moarte; fii hotărât pe Cale.",
 "Gândește fără ezitare. Antrenează-te zi și noapte.",
 "Privirea largă: vezi lucrurile depărtate ca și cum ar fi aproape și pe cele apropiate ca și cum ar fi departe.",
]);

// ── Sun Tzu, Arta războiului ──
add("biz","Sun Tzu","Arta războiului",[
 "În mijlocul haosului se află și oportunitatea.",
 "Planurile tale să fie întunecate ca noaptea; când lovești, cazi ca un trăsnet.",
 "Tot războiul se bazează pe înșelăciune.",
 "Generalul care câștigă face multe calcule înainte de bătălie.",
 "Lasă-i adversarului o cale de ieșire; un dușman încolțit luptă până la capăt.",
 "Dacă ești departe, fă-l să creadă că ești aproape; dacă ești aproape, fă-l să creadă că ești departe.",
]);

// ── Lao Tzu, Tao Te Ching ──
add("int","Lao Tzu","",["Natura nu se grăbește, și totuși totul se împlinește."]);
add("int","Lao Tzu","Tao Te Ching",[
 "Cine îi stăpânește pe alții e puternic; cine se stăpânește pe sine e cu adevărat puternic.",
 "Fii ca apa: se potrivește oricărui vas și totuși sfărâmă piatra.",
 "Copacul cât să-l cuprinzi cu brațele crește dintr-un lăstar subțire.",
 "Cel care se mulțumește cu ce are nu va fi niciodată umilit.",
 "Ce e rigid se frânge; ce e flexibil rezistă.",
 "Cel mai bun conducător e cel despre care oamenii abia știu că există.",
]);

// ── Confucius, Analecte ──
add("dev","Confucius","",["Nu contează cât de încet mergi, atâta vreme cât nu te oprești."]);
add("dev","Confucius","Analecte",[
 "Omul superior cere de la sine; omul mărunt cere de la ceilalți.",
 "Când vezi un om nevrednic, privește în tine.",
 "Omul ales e lent în vorbe și iute în fapte.",
]);

// ── alți gânditori ──
add("int","Aristotel","Etica nicomahică",["Devenim drepți făcând fapte drepte, cumpătați făcând fapte cumpătate, curajoși făcând fapte curajoase."]);
add("int","Platon","Republica",["Prima și cea mai mare victorie e să te cucerești pe tine însuți."]);
add("int","Heraclit","Fragmente",["Caracterul omului e destinul lui."]);
add("dev","Viktor Frankl","Omul în căutarea sensului",["Între stimul și reacție există un spațiu. În acel spațiu stă puterea noastră de a ne alege răspunsul.","Când nu mai putem schimba o situație, suntem provocați să ne schimbăm pe noi înșine."]);
add("dev","Carl Jung","Scrieri",["Până nu faci inconștientul conștient, el îți va conduce viața și îl vei numi destin."]);
add("mot","Theodore Roosevelt","Discursul „Omul din arenă”, 1910",["Meritul îi aparține omului care e efectiv în arenă, cu fața plină de praf, sudoare și sânge, care se luptă cu vitejie."]);
add("int","Benjamin Franklin","Almanahul săracului Richard",["Cine eșuează în a se pregăti se pregătește să eșueze.","O investiție în cunoaștere plătește cea mai bună dobândă."]);
add("dev","Bruce Lee","Scrieri",["Fii ca apa, prietene.","Absoarbe ce e util, aruncă ce e inutil, adaugă ce e al tău.","Cunoașterea nu e de ajuns, trebuie să aplici. Voința nu e de ajuns, trebuie să faci.","Nu te ruga pentru o viață ușoară. Roagă-te pentru puterea de a îndura una grea."]);
add("mot","Muhammad Ali","",["Nu număra zilele. Fă ca zilele să conteze.","Campionii nu se fac în săli. Se fac din ceva adânc în ei: o dorință, un vis, o viziune."]);
add("mot","Mike Tyson","",["Disciplina înseamnă să faci ce urăști să faci, dar s-o faci ca și cum ai iubi-o."]);
add("mot","Arnold Schwarzenegger","",["Forța nu vine din a câștiga. Luptele tale îți dezvoltă forța."]);

// ── David Goggins ──
add("mot","David Goggins","Can't Hurt Me",[
 "Nu te opri când ești obosit. Oprește-te când ai terminat.",
 "Cele mai importante conversații din viața ta sunt cele pe care le porți cu tine însuți.",
 "Nimeni nu vine să te salveze.",
 "Ieși din zona de confort în fiecare zi, chiar și puțin. Așa se călește mintea.",
 "Cei mai mulți oameni care nu reușesc nu au dat niciodată tot.",
]);

// ── Jocko Willink ──
add("mot","Jocko Willink","Discipline Equals Freedom / Extreme Ownership",[
 "Nu te gândi dacă ai chef. Ridică-te și mergi.",
 "Nu există scurtătură. Treaba trebuie făcută.",
 "Liderul își asumă vina și dă meritele echipei.",
 "Disciplina începe cu ceasul care sună dimineața: te ridici sau nu.",
 "Ține-ți ego-ul sub control. Ego-ul nu ascultă și nu învață.",
 "Decide. Chiar și o decizie bună luată acum bate una perfectă luată prea târziu.",
 "Nu cauta motivație. Construiește-ți obiceiuri.",
]);

// ── antreprenori ──
add("biz","Alex Hormozi","$100M Offers / Leads",[
 "Fă ceva atât de bun încât oamenilor să le fie jenă să spună nu.",
 "Volumul negociază cu talentul. Fă de 10 ori mai mult decât crezi că trebuie.",
 "Primii 100 sunt urâți. Fă-i oricum.",
 "Cel care e dispus să fie prost mai mult timp devine bun.",
]);
add("biz","Grant Cardone","The 10X Rule",["Obscuritatea e problema ta, nu concurența.","Fixează-ți ținte de zece ori mai mari decât crezi că poți și apoi muncește de zece ori mai mult.","Succesul e datoria ta, obligația ta și responsabilitatea ta."]);
add("biz","Ray Dalio","Principles",["Durere plus reflecție egal progres.","Adevărul, mai exact o înțelegere corectă a realității, e fundamentul oricărui rezultat bun.","Nu confunda ce vrei să fie adevărat cu ce este adevărat."]);
add("biz","Brian Tracy","Eat That Frog!",["Fă primul lucrul cel mai greu și cel mai important.","Claritatea e poate cel mai important concept al succesului personal.","Succesul e previzibil: urmează legi pe care le poți învăța."]);
add("biz","Jeremy Miner","NEPQ",["Oamenii cumpără pentru motivele lor, nu pentru ale tale.","Cu cât pari mai puțin nevoit să vinzi, cu atât oamenii vor mai mult să cumpere."]);
add("biz","Warren Buffett","",["Fii temător când alții sunt lacomi și lacom când alții sunt temători.","Cea mai bună investiție pe care o poți face e în tine însuți."]);
add("biz","Charlie Munger","",["Pune-te în situația să meriți ce vrei. E un concept simplu: livrezi ce ai vrea să cumperi."]);
add("biz","Naval Ravikant","",["Învață să vinzi. Învață să construiești. Dacă le știi pe amândouă, nu poți fi oprit.","Fii de neînlocuit fiind autentic."]);
add("biz","Henry Ford","",["Fie că crezi că poți, fie că crezi că nu poți, ai dreptate."]);

// ── Alan Watts (idei spuse cu cuvintele noastre) ──
add("int","Alan Watts","Idei din prelegeri (parafrazat)",[
 "Schimbarea nu se înțelege stând pe mal. Intră în ea și mișcă-te odată cu ea.",
 "Mintea agitată se liniștește singură când încetezi s-o tot amesteci.",
 "Nu te poți prinde pe tine în definiții, cum nici ochiul nu se poate vedea pe sine.",
 "Cine nu știe să trăiască azi nu se va bucura nici de viitorul pe care îl plănuiește.",
 "Ce ai face cu viața ta dacă banii n-ar fi o problemă?",
 "Nu ești un străin în lume. Ești o parte prin care lumea se privește pe ea însăși.",
]);
add("int","Alan Watts","Idei din prelegeri (parafrazat)",[
 "Viața nu e o călătorie spre o destinație. E o melodie: rostul ei e să fie cântată.",
 "Cine se agață de siguranță pierde exact clipa pe care voia s-o păzească.",
 "Nu ești o picătură separată de ocean. Ești oceanul care face un val.",
 "Prezentul e singurul loc în care se întâmplă ceva.",
]);
// ── sănătate și minte ──
add("san","Andrew Huberman","Huberman Lab",[
 "Lumina soarelui dimineața e cel mai puternic semnal pentru ceasul tău intern.",
 "Somnul e fundația: sănătatea mintală și fizică încep cu el.",
 "Frigul ridică dopamina pentru ore întregi, fără prăbușirea de după.",
 "Mișcarea nu e opțională pentru creier.",
]);
add("dev","Shi Heng Yi","Din prelegeri (parafrazat)",[
 "Disciplina nu e pedeapsă. E grija față de tine însuți.",
 "Nu poți controla valurile, dar poți învăța să mergi pe ele.",
 "Liniștea nu se găsește afară. Se cultivă înăuntru.",
 "Ce repeți zi de zi devii.",
]);
add("dev","Vadim Zeland","Transurfing",["Nu lupta cu lumea. Alege și permite-ți să ai.","Cu cât dai mai multă importanță unui lucru, cu atât e mai greu să-l obții."]);
add("dev","James Clear","Atomic Habits",["Obiceiurile sunt dobânda compusă a dezvoltării personale.","Nu te ridici la nivelul obiectivelor; cazi la nivelul sistemelor."]);
add("soc","Dale Carnegie","Cum să-ți faci prieteni",["Nu critica, nu condamna, nu te plânge.","Vorbește-i omului despre el și te va asculta ore întregi."]);
add("soc","Chris Voss","Never Split the Difference",["Empatia tactică: arată-i omului că îi înțelegi situația, chiar dacă nu ești de acord."]);

// ── proverbe ──
add("int","Proverb românesc","",["Apa trece, pietrele rămân.","Picătura găurește piatra.","Cine sapă groapa altuia cade singur în ea.","Lupul își schimbă părul, dar năravul ba.","Unde-s doi puterea crește.","Banul face banul.","Ochii văd, mâinile fac."]);
add("int","Proverb japonez","",["Bambusul care se îndoaie e mai puternic decât stejarul care rezistă.","Învinge-te pe tine și îi vei învinge pe toți."]);
add("int","Proverb chinezesc","",["Apa liniștită curge adânc."]);
add("int","Proverb german","",["Dimineața are aur în gură. (Morgenstund hat Gold im Mund)","Încrederea e bună, controlul e mai bun. (Vertrauen ist gut, Kontrolle ist besser)","Unde e voință, e și drum. (Wo ein Wille ist, ist auch ein Weg)"]);
add("int","Proverb latin","",["Prin muncă, totul. (Labor omnia vincit)","Nicio zi fără o linie. (Nulla dies sine linea)"]);
add("int","Socrate","Apologia lui Socrate, după Platon",["Știu că nu știu nimic."]);
add("int","Proverb arab","",["Cel care vrea să facă ceva găsește o cale; cel care nu vrea găsește o scuză."]);

// ── idei noi ──
const I=window.IDEAS=window.IDEAS||[];
const idea=(c,who,h,t)=>I.push({c,who,h,t,s:who+" (idee)"});
idea("dev","Marcus Aurelius","Jurnalul de seară","Marcus Aurelius își scria seara gândurile doar pentru el. Nu pentru alții, nu pentru laudă. Scrie trei rânduri: ce a mers, unde ai greșit, ce faci mâine altfel.");
idea("int","Seneca","Exercițiul sărăciei voluntare","Câteva zile pe lună, trăiește cu foarte puțin: mâncare simplă, haine aspre. Apoi întreabă-te: de asta mă temeam? Frica de pierdere scade când o încerci de bunăvoie.");
idea("int","Epictet","Dihotomia controlului","Împarte orice problemă în două coloane: ce depinde de mine (efortul, atitudinea, alegerile) și ce nu (rezultatul, ceilalți, trecutul). Pune toată energia doar în prima coloană.");
idea("int","Stoicism","Vederea de sus","Imaginează-te privind de sus: orașul, țara, planeta. Problema de azi se vede cât un fir de praf. Nu dispare, dar își recapătă proporția reală.");
idea("int","Stoicism","Memento mori","Nu e un gând sumbru, ci un filtru: dacă azi ar fi ultima zi, ai mai pierde timp cu supărarea asta? Folosește-l ca să alegi ce contează.");
idea("int","Miyamoto Musashi","Ritmul","Musashi spune că totul are ritm: lupta, comerțul, viața. Învață când să accelerezi și când să aștepți. Cine își impune ritmul conduce.");
idea("int","Miyamoto Musashi","Ochiul care vede tot","Nu te fixa pe un singur detaliu. Privește întregul cu o privire liniștită și largă; așa observi mișcarea înainte să vină.");
idea("biz","Sun Tzu","Alege terenul","Nu te bate acolo unde e puternic adversarul. Mută competiția pe terenul unde tu ai avantajul: o nișă, un serviciu, o viteză pe care el n-o are.");
idea("int","Lao Tzu","Wu wei","A acționa fără forțare: ca apa care ocolește piatra. Nu înseamnă lene, ci efortul pus exact unde curge natural.");
idea("dev","Shi Heng Yi","Observă, nu reacționa","Când apare un impuls (telefon, mâncare, nervi), numește-l în gând: „poftă”, „nerăbdare”. Simplul fapt că îl vezi îți dă câteva secunde de libertate.");
idea("dev","Shi Heng Yi","Practica zilnică","Stăpânirea de sine nu vine dintr-o zi grea, ci din puțin în fiecare zi: 10 minute de liniște, aceeași oră de trezire, aceeași rutină.");
idea("mot","David Goggins","Responsabilitatea în oglindă","Lipește bilețele pe oglindă cu ce trebuie să schimbi la tine. Citește-le zilnic, fără menajamente. Le scoți doar când le-ai bifat.");
idea("mot","David Goggins","Callusing the mind","Fă intenționat lucruri incomode: duș rece, alergat în ploaie, încă o serie. Mintea se bătătorește ca palma și devine greu de rănit.");
idea("mot","Jocko Willink","Default aggressive","Când ai o problemă, nu aștepta să ți se spună. Fă primul pas: suni, repari, propui. Inițiativa e jumătate din victorie.");
idea("mot","Jocko Willink","Detașarea","Când situația te înghite, fă un pas înapoi, literal. Ridică privirea, respiră și vezi tot câmpul. Liderul care se detașează vede ce nu văd ceilalți.");
idea("biz","Alex Hormozi","Regula celor 100","Înainte să spui că ceva nu merge, fă-l de 100 de ori: 100 de apeluri, 100 de anunțuri, 100 de oferte. Abia apoi ai date.");
idea("biz","Alex Hormozi","Garanția","O garanție puternică scade riscul clientului. Dacă ești sigur pe ce vinzi, ia tu riscul și vei vinde mai mult.");
idea("biz","Alex Hormozi","Mai mult, mai bine, nou","Pentru a crește: fă mai mult din ce merge, apoi fă-l mai bine, abia apoi încearcă ceva nou.");
idea("biz","Grant Cardone","Urmărirea","Cele mai multe vânzări se fac după al cincilea contact, iar cei mai mulți renunță după primul. Notează fiecare client și revino.");
idea("biz","Jeremy Miner","Întrebarea de consecință","„Ce se întâmplă dacă nu rezolvi asta în următoarele luni?” Clientul își simte singur problema; tu nu trebuie să împingi.");
idea("biz","Ray Dalio","Radical transparent","Spune ce gândești și cere oamenilor să-ți spună ce gândesc despre tine. Adevărul incomod te protejează de greșeli scumpe.");
idea("biz","Ray Dalio","Mașinăria","Privește-ți viața ca pe o mașinărie: obiective, rezultate, probleme. Când apare o problemă, nu te învinovăți: găsește piesa care nu merge și repar-o.");
idea("biz","Warren Buffett","Cercul de competență","Investește doar în ce înțelegi bine. Nu contează cât de mare e cercul, contează să știi unde îi sunt marginile.");
idea("biz","Naval Ravikant","Pârghia","Munca ta se multiplică prin pârghie: oameni, capital, cod sau conținut. Caută activități unde efortul de azi produce și mâine.");
idea("biz","Brian Tracy","Lista ABCDE","Scrie sarcinile zilei și pune-le litere: A = trebuie, B = ar trebui, C = ar fi bine, D = delegă, E = elimină. Nu treci la B până nu ai terminat A.");
idea("san","Andrew Huberman","Frigul cu cap","Apa rece, câteva minute pe săptămână, crește dopamina și reziliența. Ideal dimineața; după antrenamentul de forță, mai bine așteaptă câteva ore.");
idea("san","Andrew Huberman","Sauna","Câteva sesiuni de saună pe săptămână (aprox. 15–20 min) sunt asociate cu sănătatea inimii și eliberează hormon de creștere. Bea apă și electroliți.");
idea("san","Andrew Huberman","NSDR","Odihna profundă fără somn (10–20 min, întins, respirație lentă) reîncarcă atenția după-amiaza mai bine decât încă o cafea.");
idea("san","Andrew Huberman","Fereastra de somn","Același oră de culcare și trezire, chiar și în weekend. Ceasul intern iubește regularitatea mai mult decât orele în plus.");
idea("san","Peter Attia","Stabilitatea","Forța, echilibrul și mobilitatea de acum decid cum te vei mișca la 70 de ani. Antrenează-te pentru bătrânețea pe care o vrei.");
idea("san","Somn","Camera rece și întunecată","Dormi mai bine într-o cameră răcoroasă (aprox. 18°), complet întunecată, fără telefon lângă pat.");
idea("dev","James Clear","Stivuirea obiceiurilor","Leagă un obicei nou de unul vechi: „După ce îmi fac cafeaua, citesc două pagini.” Obiceiul vechi devine declanșatorul celui nou.");
idea("dev","James Clear","Mediul bate voința","Fă obiceiurile bune vizibile (cartea pe pernă) și pe cele rele greu de făcut (telefonul în altă cameră).");
idea("dev","Cal Newport","Minimalismul digital","Șterge aplicațiile care te consumă 30 de zile. La final, readu doar ce îți aduce valoare reală.");
idea("dev","Vadim Zeland","Coordonarea intenției","Când se întâmplă ceva „rău”, spune-ți: „Așa trebuie să fie, e spre binele meu.” Nu negi realitatea; nu-i mai dai putere asupra ta.");
idea("dev","Vadim Zeland","Diapozitivul","Imaginează-ți scena obiectivului atins ca pe un diapozitiv: ce vezi, ce simți. Revino la el zilnic, calm, fără obsesie.");
idea("dev","Joe Dispenza","Primele minute ale zilei","Primele gânduri ale dimineții setează tonul zilei. Înainte de telefon, câteva minute: cine vrei să fii azi?");
idea("soc","Dale Carnegie","Admite repede","Când greșești, spune-o imediat și clar. Oamenii devin mai îngăduitori cu cel care își asumă singur.");
idea("soc","Chris Voss","„Ai dreptate” vs „Așa e”","„Ai dreptate” încheie discuția. „Așa e” înseamnă că omul s-a simțit înțeles. Urmărește să auzi „așa e”.");
idea("soc","Robert Cialdini","Raritatea","Oamenii vor mai mult ce e rar sau pe cale să dispară. Spune sincer ce e limitat: stoc, timp, locuri.");
idea("soc","Robert Cialdini","Angajamentul","Un mic „da” duce la unul mai mare. Începe cu o cerere ușoară; omul vrea să rămână consecvent cu ce a spus.");
idea("biz","Pareto","Clienții care contează","Aprox. 20% dintre clienți aduc 80% din profit. Află cine sunt și dă-le lor timpul cel mai bun.");
idea("dev","Stoicism","Rezerva","Pornește la orice cu clauza „dacă nimic nu mă împiedică”. Te implici total, dar rezultatul nu te mai zdrobește.");

// ── fire noi ──
idea("int","Alan Watts","Muzica, nu finalul","Nu asculți o melodie ca să ajungi la ultima notă și nici nu dansezi ca să ajungi într-un anumit colț al camerei. Azi, fă un lucru obișnuit (mersul, mâncatul, munca la o mașină) pentru el însuși, nu doar ca să-l termini.");
idea("int","Alan Watts","Dacă banii n-ar conta","Scrie pe o foaie: ce ai face toată ziua dacă n-ai avea grija banilor? Apoi caută o felie din asta pe care o poți face deja săptămâna asta. Watts spunea că, dacă faci bine ce iubești, banii vin de multe ori după.");
idea("int","Alan Watts","Lasă apa să se așeze","Când mintea e agitată, nu te lupta cu gândurile. Stai 3 minute, respiră și doar privește-le cum trec, ca nisipul care se așază în apă. Limpezimea vine singură.");
idea("int","Alan Watts","Înțelepciunea nesiguranței","Viitorul nu poate fi controlat complet. Cu cât îl strângi mai tare, cu atât ratezi azi. Fă planul, apoi întoarce-te cu atenția la ce faci acum.");
const T=window.THREADS=window.THREADS||[];
T.push(
 {c:"int",who:"Alan Watts",h:"Ce ai face dacă banii n-ar conta?",src:"Prelegere celebră (rezumat cu cuvintele noastre)",parts:[
  "Watts le punea studenților o întrebare simplă: ce ți-ar plăcea să faci, dacă banii n-ar fi o problemă?",
  "Cei mai mulți răspundeau ceva ce iubeau de fapt: să picteze, să scrie, să trăiască în natură, să construiască.",
  "Ideea lui: e absurd să-ți petreci viața făcând ce nu-ți place, doar ca să câștigi bani ca să continui să faci ce nu-ți place.",
  "Dacă faci cu adevărat bine ce iubești, de obicei găsești și o cale să trăiești din asta.",
  "Întrebarea pentru tine: ce parte din munca ta ai face-o și gratis? Acolo e direcția."]},
 {c:"int",who:"Alan Watts",h:"Viața ca muzică",src:"Idee din prelegeri (rezumat cu cuvintele noastre)",parts:[
  "Școala ne învață să urcăm din clasă în clasă, apoi la facultate, la job, la promovare, mereu spre ceva ce urmează.",
  "La final ajungem la pensie și ne dăm seama că am alergat spre un capăt, iar „ceva”-ul era chiar drumul.",
  "Watts compara viața cu muzica: rostul unei melodii nu e ultima notă, ci cântatul ei.",
  "Nu înseamnă să renunți la obiective. Înseamnă să fii prezent cât lucrezi la ele."]},
 {c:"int",who:"Seneca",h:"Despre mânie",src:"Despre mânie (traducere liberă)",parts:[
  "Mânia e o nebunie scurtă: nu-și mai stăpânește nici decența, nici legăturile, e surdă la rațiune.",
  "Cel mai bun leac al mâniei e întârzierea. Nu-i cere să dispară, cere-i să aștepte.",
  "Primele impulsuri nu le putem opri; putem însă refuza să le urmăm.",
  "Când simți că fierbi, schimbă ceva în corp: coboară vocea, încetinește pasul, taci.",
  "Nimic nu e mai demn de admirat decât un om puternic care rămâne blând."]},
 {c:"int",who:"Marcus Aurelius",h:"Lecțiile de la cei din jur",src:"Meditații, cartea 1 (rezumat)",parts:[
  "Marcus își începe jurnalul mulțumind fiecărui om care l-a format: de la bunicul, bunătatea și calmul.",
  "De la tatăl lui: modestia și bărbăția. De la mama: simplitatea și generozitatea.",
  "De la profesori: să citească atent, să nu se mulțumească cu o înțelegere superficială.",
  "Exercițiul tău: scrie trei oameni și ce ai învățat de la fiecare.",
  "Recunoștința față de oameni îți arată ce valori vrei să duci mai departe."]},
 {c:"int",who:"Miyamoto Musashi",h:"Dokkōdō: Calea singurătății",src:"Dokkōdō, 1645 (selecție)",parts:[
  "Scris cu o săptămână înainte să moară, Dokkōdō are 21 de reguli pentru o viață disciplinată.",
  "Acceptă totul așa cum e. Nu căuta plăcerea de dragul ei. Nu te lăsa purtat de sentimente schimbătoare.",
  "Gândește-te ușor la tine și profund la lume. Nu regreta ce ai făcut. Nu fi gelos.",
  "Nu căuta lucruri frumoase pe care să le posezi. Nu te teme de moarte.",
  "Nu te abate niciodată de la Cale."]},
 {c:"mot",who:"Jocko Willink",h:"Cele 4 legi ale luptei",src:"Extreme Ownership (rezumat)",parts:[
  "1. Acoperă și mișcă-te: echipele se sprijină unele pe altele. Nimeni nu câștigă singur.",
  "2. Simplu: dacă planul nu poate fi explicat în câteva fraze, e prea complicat.",
  "3. Prioritizează și execută: alege problema cea mai mare, rezolv-o, apoi treci la următoarea.",
  "4. Comanda descentralizată: fiecare om știe scopul și poate decide singur.",
  "Peste toate: asumarea extremă. Orice se întâmplă în lumea ta e responsabilitatea ta."]},
 {c:"biz",who:"Alex Hormozi",h:"Cum aduci clienți",src:"$100M Leads (rezumat)",parts:[
  "Există patru căi: vorbești cu cei care te cunosc, cu străini, postezi conținut gratuit, plătești reclame.",
  "Începe cu cei care te cunosc deja: prieteni, foști clienți. E cel mai ieftin.",
  "Dă valoare gratis până când oamenii simt că ar trebui să-ți plătească.",
  "Fă mai mult decât crezi că e normal. Volumul rezolvă multe probleme.",
  "Măsoară totul: câți au văzut, câți au răspuns, câți au cumpărat."]},
 {c:"san",who:"Andrew Huberman",h:"Frig și căldură",src:"Huberman Lab (rezumat)",parts:[
  "Frigul: în total cam 11 minute pe săptămână, împărțite în 2–4 sesiuni, aduc beneficii.",
  "Dopamina crește mult după frig și rămâne ridicată ore întregi.",
  "Sauna: în total cam o oră pe săptămână, în 2–3 sesiuni, la 80–100°.",
  "Alternanța cald–rece antrenează vasele de sânge și reziliența la stres.",
  "Termină cu frigul dacă vrei energie, cu căldura dacă vrei relaxare."]},
 {c:"dev",who:"Viktor Frankl",h:"Sensul în suferință",src:"Omul în căutarea sensului (rezumat)",parts:[
  "Frankl a supraviețuit lagărelor de concentrare și a observat cine rezista.",
  "Rezistau mai des cei care aveau un motiv să trăiască: o persoană, o operă, o misiune.",
  "Nu putem alege mereu ce ni se întâmplă, dar putem alege cum răspundem.",
  "Sensul nu se inventează; se descoperă prin muncă, iubire și curaj în fața suferinței.",
  "Întrebarea nu e ce aștepți tu de la viață, ci ce așteaptă viața de la tine."]},
 {c:"biz",who:"Ray Dalio",h:"Cei 5 pași spre ce vrei",src:"Principles (rezumat)",parts:[
  "1. Ai obiective clare.",
  "2. Identifică problemele care îți stau în cale și nu le tolera.",
  "3. Diagnostichează-le până la cauza de bază.",
  "4. Fă un plan care le rezolvă.",
  "5. Execută planul. Repetă ciclul."]}
);
})();
