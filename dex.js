// IMPERIUM — DEX: apeși pe un cuvânt în cititor → „Explicație” → sensurile lui, din dexonline.ro (rezervă: Wikționar).
// Definițiile se iau pe loc de pe internet și se țin minte pe telefon pentru cuvintele căutate.
(function(){
const CK="imp-dex",MAXC=150;
let cache={};try{cache=JSON.parse(localStorage.getItem(CK)||"{}")}catch(_){cache={}}
const keep=(w,v)=>{try{cache[w]={v,t:Date.now()};const ks=Object.keys(cache);if(ks.length>MAXC)ks.sort((a,b)=>cache[a].t-cache[b].t).slice(0,ks.length-MAXC).forEach(k=>delete cache[k]);localStorage.setItem(CK,JSON.stringify(cache))}catch(_){}};
const e=s=>String(s??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
// diacritice vechi (ş ţ cu sedilă) → corecte; litere mici; fără cratime/apostrofuri pe margini
const norm=w=>String(w||"").replace(/ş/g,"ș").replace(/Ş/g,"Ș").replace(/ţ/g,"ț").replace(/Ţ/g,"Ț").replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,"").trim();
const tmo=(p,ms)=>Promise.race([p,new Promise((_,r)=>setTimeout(()=>r(new Error("timeout")),ms))]);

// curățăm HTML-ul primit: păstrăm doar îngroșat, cursiv, indici; restul devine text
function clean(html){
  const d=new DOMParser().parseFromString(`<div>${html}</div>`,"text/html").body.firstChild;
  const out=n=>{
    if(n.nodeType===3)return e(n.data);
    if(n.nodeType!==1)return "";
    const t=n.tagName.toLowerCase(),inner=[...n.childNodes].map(out).join("");
    if(t==="script"||t==="style")return "";
    if(t==="b"||t==="strong")return `<b>${inner}</b>`;
    if(t==="i"||t==="em")return `<i>${inner}</i>`;
    if(t==="sup")return `<sup>${inner}</sup>`;
    if(t==="br")return "<br>";
    return inner;
  };
  return out(d);
}
// sensurile numerotate (1. 2. 3., ◊, ♦) pe rânduri separate: fiecare e un alt context
const senses=h=>h.replace(/\s<b>\s*(\d{1,2})[.)]?\s*<\/b>\s*/g," $1. ").replace(/\s<b>\s*([IVX]{1,4}\.|[◊♦])\s*<\/b>\s*/g," $1 ").replace(/\s(\d{1,2})\)\s/g," $1. ").replace(/\s(\d{1,2}\.)\s(?=\S)/g,"<br><span class=\"dx-n\">$1</span> ").replace(/\s([◊♦])\s/g,"<br><span class=\"dx-n\">$1</span> ").replace(/\s(\(\w{1,6}\.\))/g," $1");
// marcajul intern dexonline (@bold@, $italic$) → HTML, dacă lipsește htmlRep
const fromInternal=s=>e(s).replace(/@([^@]+)@/g,"<b>$1</b>").replace(/\$([^$]+)\$/g,"<i>$1</i>").replace(/[#%]/g,"");

const PRIO=["DEX '16","DEX '09","DEX '12","DEX '98","DEX '96","DEX '75","MDA2","MDA","NODEX","DLRLC","DLRM"];
async function fromDexonline(w){
  const r=await tmo(fetch(`https://dexonline.ro/definitie/${encodeURIComponent(w)}/json`),9000);
  if(!r.ok)throw new Error("dex "+r.status);
  const j=await r.json(),defs=(j&&j.definitions)||[];
  const main=[],syn=[];
  for(const d of defs){
    const src=d.sourceName||"",h=d.htmlRep?clean(d.htmlRep):fromInternal(d.internalRep||"");
    if(!h.trim())continue;
    if(/sinonim|syn/i.test(src)){syn.push(h);continue}
    if(/DOOM|ortograf|DOR|DMLR|etimolog/i.test(src))continue;   // dicționare de ortografie: fără sens
    main.push({src,h});
  }
  const rank=s=>{const i=PRIO.findIndex(p=>s.startsWith(p));return i<0?99:i};
  main.sort((a,b)=>rank(a.src)-rank(b.src));
  // fiecare dicționar o singură dată, ca să vezi explicații diferite
  const seen=new Set(),pick=[];for(const m of main){if(seen.has(m.src))continue;seen.add(m.src);pick.push(m);if(pick.length>=4)break}
  if(!pick.length&&!syn.length)return null;
  return {kind:"dex",word:j.word||w,items:pick.map(m=>({src:m.src,h:senses(m.h)})),syn:syn.slice(0,2)};
}
// rezervă: Wikționarul românesc (merge oricând din aplicație)
async function fromWikt(w,depth=0){
  const u=`https://ro.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(w)}&prop=text&redirects=1&format=json&origin=*`;
  const r=await tmo(fetch(u),9000);const j=await r.json();if(!j.parse)return null;
  const doc=new DOMParser().parseFromString(j.parse.text["*"],"text/html");
  const hs=[...doc.querySelectorAll("h2")];const ro=hs.find(h=>/română/i.test(h.textContent));if(!ro)return null;
  const start=ro.closest(".mw-heading")||ro;
  const items=[];let pos="",lemma=null;
  for(let n=start.nextElementSibling;n;n=n.nextElementSibling){
    const h=n.matches("h2,.mw-heading2")?n:null;if(h)break;
    const hx=n.matches("h3,h4,h5,.mw-heading3,.mw-heading4,.mw-heading5")?n:null;
    if(hx){pos=hx.textContent.replace(/\[.*?\]/g,"").trim();continue}
    if(/etimologie|pronunție|pronuntie|traduceri|sinonime|antonime|declinare|conjugare|vezi și|referințe|cuvinte derivate|expresii/i.test(pos))continue;
    if(n.tagName==="OL"){
      const lis=[...n.children].filter(x=>x.tagName==="LI");
      const sens=lis.map(li=>{const c=li.cloneNode(true);c.querySelectorAll("ul,dl,ol,sup,.reference").forEach(x=>x.remove());
        const ex=li.querySelector("dl dd,ul li");return {t:clean(c.innerHTML).trim(),ex:ex?clean(ex.innerHTML).trim():""}}).filter(x=>x.t);
      // pagină de formă flexionară („forma de plural a …”) → mergem la cuvântul de bază
      if(!lemma&&sens.length&&/form[aă] (de )?(flexionar|plural|feminin|genitiv|articulat|nearticulat)|forma .* a (substantivului|verbului|adjectivului)|forma .* a lui/i.test(sens[0].t.replace(/<[^>]+>/g,""))){
        const a=n.querySelector("a[title]");if(a)lemma=a.getAttribute("title")}
      if(sens.length)items.push({src:pos||"Sens",h:sens.map((s,i)=>`<span class="dx-n">${i+1}.</span> ${s.t}${s.ex?`<em class="dx-ex">${s.ex}</em>`:""}`).join("<br>")});
    }
  }
  if(lemma&&depth<1&&lemma!==w){const l=await fromWikt(lemma,depth+1);if(l){l.from=w;return l}}
  if(!items.length)return null;
  return {kind:"wikt",word:w,items:items.slice(0,5),syn:[]};
}
// ultima rezervă: cuvinte în engleză (cărțile în engleză)
async function fromEn(w){
  const r=await tmo(fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(w)}`),9000);if(!r.ok)return null;
  const j=await r.json(),langs=Object.values(j||{}).flat();if(!langs.length)return null;
  const order=langs.sort((a,b)=>(b.language==="Romanian")-(a.language==="Romanian")||(b.language==="English")-(a.language==="English")).slice(0,3);
  const items=order.map(x=>({src:`${x.language==="English"?"Engleză":x.language==="Romanian"?"Română":x.language} · ${x.partOfSpeech}`,
    h:(x.definitions||[]).filter(d=>d.definition).slice(0,5).map((d,i)=>`<span class="dx-n">${i+1}.</span> ${clean(d.definition)}`).join("<br>")})).filter(x=>x.h);
  return items.length?{kind:"en",word:w,items,syn:[]}:null;
}
async function lookup(w){
  const k=w.toLowerCase();if(cache[k]&&Date.now()-cache[k].t<90*864e5)return cache[k].v;
  let res=null;
  for(const f of [()=>fromDexonline(k),()=>fromWikt(k),()=>k!==w?fromWikt(w):null,()=>fromEn(k)]){
    try{res=await f();if(res)break}catch(_){}
  }
  if(res)keep(k,res);
  return res;
}

function sheet(html){
  const m=document.createElement("div");m.className="gsheet dxs";m.innerHTML=`<div class="gs-card"><i class="gs-grab"></i>${html}</div>`;
  document.body.appendChild(m);requestAnimationFrame(()=>m.classList.add("in"));
  const close=()=>{m.classList.remove("in");setTimeout(()=>m.remove(),350)};
  m.addEventListener("click",ev=>{if(ev.target===m||ev.target.closest("[data-dxx]"))close()});
  let y0=null;m.addEventListener("touchstart",ev=>{const c=m.querySelector(".gs-card");if(c.scrollTop<=0)y0=ev.touches[0].clientY},{passive:true});
  m.addEventListener("touchend",ev=>{if(y0!=null&&ev.changedTouches[0].clientY-y0>90)close();y0=null},{passive:true});
  return m;
}
async function open(word,ctx){
  const w=norm(word);if(!w)return;
  const ext=`https://dexonline.ro/definitie/${encodeURIComponent(w.toLowerCase())}`;
  const ctxH=ctx?(()=>{const s=String(ctx),i=s.toLowerCase().indexOf(String(word).toLowerCase());if(i<0)return "";
    const a=Math.max(0,s.lastIndexOf(" ",Math.max(0,i-70))),b=s.indexOf(" ",Math.min(s.length,i+word.length+70));const seg=s.slice(a,b<0?s.length:b).trim();
    const j=seg.toLowerCase().indexOf(String(word).toLowerCase());
    return `<p class="dx-ctx">„…${e(seg.slice(0,j))}<mark>${e(seg.slice(j,j+word.length))}</mark>${e(seg.slice(j+word.length))}…”</p>`})():"";
  const m=sheet(`<div class="dx-hd"><div><small>Explicație</small><h3>${e(w)}</h3></div><button data-dxx aria-label="Închide">×</button></div>${ctxH}<div class="dx-body"><div class="dx-load"><i></i><i></i><i></i></div></div>`);
  const body=m.querySelector(".dx-body");
  if(!navigator.onLine&&!cache[w.toLowerCase()]){body.innerHTML=`<p class="dx-none">Ai nevoie de internet ca să caut cuvântul prima dată.</p>`;return}
  const r=await lookup(w);if(!m.isConnected)return;
  if(!r){body.innerHTML=`<p class="dx-none">N-am găsit „${e(w)}” în dicționare. Poate e un nume propriu sau un termen rar.</p><a class="btn ghost dx-ext" href="${ext}" target="_blank" rel="noopener">Caută pe dexonline.ro ↗</a>`;return}
  body.innerHTML=`${r.from?`<p class="dx-lem">„${e(r.from)}” e o formă a cuvântului <b>${e(r.word)}</b></p>`:r.word&&r.word.toLowerCase()!==w.toLowerCase()?`<p class="dx-lem">Forma de bază: <b>${e(r.word)}</b></p>`:""}
    ${r.items.map((x,i)=>`<div class="dx-def${i?"":" first"}"><small>${e(x.src)}</small><div>${x.h}</div></div>`).join("")}
    ${r.syn.length?`<div class="dx-def syn"><small>Sinonime</small><div>${r.syn.join("<br>")}</div></div>`:""}
    <a class="btn ghost dx-ext" href="${ext}" target="_blank" rel="noopener">Toate definițiile pe dexonline.ro ↗</a>
    <p class="dx-src">${r.kind==="dex"?"Sursa: dexonline.ro":r.kind==="wikt"?"Sursa: Wikționar (ro.wiktionary.org)":"Sursa: Wiktionary (en.wiktionary.org)"}</p>`;
}
window.Dex={open,lookup};
})();
