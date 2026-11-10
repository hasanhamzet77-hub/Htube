// IMPERIUM — Înțeleptul: un mentor AI cu care vorbești ca într-un jurnal. Răspunde natural, sprijinit pe idei din cărți.
// Merge cu cheia ta de la Anthropic (console.anthropic.com). Cheia stă DOAR pe telefonul tău (nu în copia de siguranță, nu pe GitHub);
// mesajele pleacă direct de pe telefon la Anthropic, fără alt server la mijloc.
(function(){
const KEY="imp-sage-key",API="https://api.anthropic.com/v1/messages";
const MODELS=[["claude-haiku-4-5-20251001","Rapid","răspunsuri scurte, cel mai ieftin"],["claude-sonnet-5-5","Echilibrat","recomandat"],["claude-opus-5-5","Profund","cel mai atent, mai scump"]];
const $s=id=>document.getElementById(id);
const e=s=>String(s??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const st=()=>{S.sage=S.sage||{msgs:[],model:MODELS[1][0],ctx:true};if(!MODELS.some(m=>m[0]===S.sage.model))S.sage.model=MODELS[1][0];return S.sage};
const key=()=>{try{return localStorage.getItem(KEY)||""}catch(_){return ""}};
const hasKey=()=>key().length>20;
let busy=false,ctrl=null,page=null;

// markdown minim → HTML sigur (îngroșat, cursiv, liste, paragrafe)
function md(t){
  const inl=s=>e(s).replace(/\*\*([^*\n]+)\*\*/g,"<b>$1</b>").replace(/(^|[\s(„"])\*([^*\n]+)\*(?=[\s).,;:!?”"]|$)/g,"$1<i>$2</i>").replace(/(^|[\s(])_([^_\n]+)_(?=[\s).,;:!?]|$)/g,"$1<i>$2</i>");
  const out=[];let ul=null;
  for(const raw of String(t||"").replace(/\r/g,"").split("\n")){
    const l=raw.trim(),m=/^(?:[-•*]|\d{1,2}[.)])\s+(.*)$/.exec(l);
    if(m){(ul=ul||[]).push(`<li>${inl(m[1])}</li>`);continue}
    if(ul){out.push(`<ul>${ul.join("")}</ul>`);ul=null}
    if(!l)continue;
    const h=/^#{1,4}\s+(.*)$/.exec(l);out.push(h?`<p><b>${inl(h[1])}</b></p>`:l.startsWith(">")?`<blockquote>${inl(l.replace(/^>\s?/,""))}</blockquote>`:`<p>${inl(l)}</p>`);
  }
  if(ul)out.push(`<ul>${ul.join("")}</ul>`);
  return out.join("");
}

// ce știe Înțeleptul despre tine (dacă îi dai voie): planul zilei, cărțile de pe raft, notițele și jurnalul de azi
function context(){
  const N=st(),now=new Date(),L=[`Azi este ${now.toLocaleDateString("ro-RO",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}, ora ${now.toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit"})}.`];
  if(!N.ctx)return L.join("\n");
  try{
    const t=dk(),hb=(S.habits||[]).map(h=>`${h.n||h.e}${isDone(h,t)?" (făcut azi)":" (încă nefăcut)"}`);
    if(hb.length)L.push("Obiceiurile lui zilnice: "+hb.join("; ")+".");
    if(typeof hgToday==="function"){const g=hgToday(),o=g.open.slice(0,8).map(x=>x.text+(x.time?` (${x.time})`:""));if(o.length)L.push("De făcut azi: "+o.join("; ")+".")}
    const bk=(typeof BOOKS!=="undefined"?BOOKS:[]).slice(0,12).map(b=>b.t).filter(Boolean);
    if(bk.length)L.push("Cărți pe raftul lui din aplicație: "+bk.join("; ")+".");
    const nt=(S.notes||[]).slice(-10).map(n=>`„${String(n.t).slice(0,220)}”${n.b?" ("+n.b+")":""}`);
    if(nt.length)L.push("Notițe pe care și le-a salvat din cărți:\n"+nt.join("\n"));
    const j=(S.journal||{})[t];
    if(j){const g=(j.g||[]).filter(x=>x&&x.trim());if(g.length)L.push("Jurnalul de azi, lucruri bune: "+g.join("; ")+".");if(j.l&&j.l.trim())L.push("Lecția zilei, scrisă de el: "+j.l.trim())}
  }catch(_){}
  return L.join("\n");
}
function system(){
  return `Ești „Înțeleptul”, mentorul din aplicația personală IMPERIUM. Vorbești cu HT, un bărbat care își construiește disciplina, mintea și afacerea, și care folosește conversația cu tine ca pe un jurnal.

Cum vorbești:
- În română, natural și cald, ca un prieten mai în vârstă care a citit mult și a trăit destule. Fără ton de robot, fără liste și titluri dacă nu ți se cer, fără fraze de umplutură.
- Scurt: de obicei 2–4 paragrafe mici. Dacă întrebarea e simplă, răspunsul e simplu.
- Ascultă întâi. Când lipsește ceva important ca să-l poți ajuta, pune o singură întrebare bună în loc să ghicești.
- Fii sincer. Nu-l flata și nu-i da dreptate din politețe; dacă vezi o scuză, o contradicție sau un plan slab, spune-o cu respect și arată de ce.
- Când se potrivește, încheie cu un singur pas concret, mic, pe care îl poate face azi.

De unde îți iei ideile:
- Sprijină-te cât poți pe învățături din cărți și tradiții serioase: stoicii (Marcus Aurelius, Seneca, Epictet), Lao Zi, budismul și tradiția Shaolin, Viktor Frankl, Alan Watts, Vadim Zeland, José Silva, James Clear, Cal Newport, Daniel Kahneman, Nassim Taleb, Ray Dalio, David Goggins, Jocko Willink, Andrew Huberman pentru partea de știință, plus cărțile de pe raftul lui și notițele lui, dacă le vezi mai jos.
- Spune de la cine vine ideea („Epictet ar spune că…”, „În Deep Work, Newport arată că…”), dar redă ideea cu vorbele tale. Nu reproduce pasaje din cărți.
- Nu inventa citate și nu pune vorbe în gura nimănui. Dacă nu ești sigur de formularea exactă sau de sursă, spune ideea și precizează că e o parafrază. Dacă nu știi ceva, spune că nu știi.
- Când două învățături se contrazic, arată ambele perspective și spune care ți se pare mai potrivită pentru situația lui și de ce.

Limite:
- Ești un AI, nu un om și nu un terapeut, medic, avocat sau consultant financiar. Poți oferi perspectivă și principii; pentru decizii medicale, juridice sau de investiții spune clar că merită vorbit și cu un specialist.
- Dacă el pare în pericol sau vorbește despre a-și face rău, lasă filozofia deoparte: vorbește-i direct, cu grijă, și îndeamnă-l să ia legătura acum cu un om apropiat, cu medicul sau cu numărul de urgență 112.

Context despre el și ziua lui (folosește-l doar când ajută răspunsul, fără să-l reciți):
${context()}`;
}

async function call(body,onText){
  const k=key();if(!hasKey())throw new Error("Lipsește cheia AI. Adaug-o din ⚙.");
  ctrl=new AbortController();
  let res;
  try{res=await fetch(API,{method:"POST",signal:ctrl.signal,headers:{"content-type":"application/json","x-api-key":k,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify(body)})}
  catch(err){if(err.name==="AbortError")throw err;throw new Error(navigator.onLine===false?"Nu ai internet acum.":"Nu am putut ajunge la serverul AI. Verifică internetul și încearcă din nou.")}
  if(!res.ok){
    let msg="",type="";try{const j=await res.json();msg=(j.error&&j.error.message)||"";type=(j.error&&j.error.type)||""}catch(_){}
    const er=new Error(res.status===401?"Cheia AI nu e validă. Verific-o în ⚙."
      :res.status===404||/model/i.test(msg)&&res.status===400?"Modelul ales nu e disponibil pentru cheia ta."
      :/credit balance/i.test(msg)?"Contul tău Anthropic nu mai are credit. Încarcă-l din console.anthropic.com → Billing."
      :res.status===429?"Prea multe cereri într-un timp scurt. Încearcă peste un minut."
      :res.status===529||res.status>=500?"Serverul AI e ocupat acum. Încearcă din nou în câteva clipe."
      :"Eroare de la serverul AI"+(msg?": "+msg.slice(0,160):" ("+res.status+")"));
    er.status=res.status;er.modelGone=res.status===404||(res.status===400&&/model/i.test(msg))||type==="not_found_error";throw er;
  }
  if(!body.stream){const j=await res.json();return (j.content||[]).filter(c=>c.type==="text").map(c=>c.text).join("")}
  const rd=res.body.getReader(),dec=new TextDecoder();let buf="",full="";
  for(;;){
    const {done,value}=await rd.read();if(done)break;
    buf+=dec.decode(value,{stream:true});let i;
    while((i=buf.indexOf("\n"))>=0){
      const line=buf.slice(0,i).trim();buf=buf.slice(i+1);
      if(!line.startsWith("data:"))continue;
      let ev;try{ev=JSON.parse(line.slice(5))}catch(_){continue}
      if(ev.type==="content_block_delta"&&ev.delta&&ev.delta.type==="text_delta"){full+=ev.delta.text;onText&&onText(full)}
      else if(ev.type==="error")throw new Error("Răspunsul s-a întrerupt"+(ev.error&&ev.error.message?": "+String(ev.error.message).slice(0,120):"."));
    }
  }
  return full;
}
// dacă modelul ales nu există pentru cheia asta, încercăm automat următorul și îl ținem minte
async function withModel(make,onText){
  const N=st(),order=[N.model,...MODELS.map(m=>m[0]).filter(m=>m!==N.model)];let last;
  for(const m of order){
    try{const r=await call(make(m),onText);if(m!==N.model){N.model=m;save()}return r}
    catch(err){last=err;if(!err.modelGone)throw err}
  }
  throw last;
}
const complete=(sys,user,max)=>withModel(m=>({model:m,max_tokens:max||600,system:sys,messages:[{role:"user",content:user}]}));

// ── pagina de conversație ──
function ensure(){
  if(page)return page;
  page=document.createElement("section");page.id="sgpage";page.hidden=true;
  page.innerHTML=`<header class="sg-bar"><button class="sg-ic" id="sg-back" aria-label="Înapoi"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
      <div class="sg-tt"><b>Înțeleptul</b><small id="sg-sub">mentor AI · răspunde din cărți</small></div>
      <button class="sg-ic" id="sg-new" aria-label="Conversație nouă"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button>
      <button class="sg-ic" id="sg-set" aria-label="Setări"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg></button></header>
    <div class="sg-body" id="sg-body"></div>
    <form class="sg-form" id="sg-form" autocomplete="off"><textarea id="sg-in" rows="1" placeholder="Scrie ce ai pe suflet…" maxlength="4000"></textarea>
      <button class="sg-send" id="sg-send" aria-label="Trimite"><svg viewBox="0 0 24 24"><path d="M5 12h13M12 5l7 7-7 7"/></svg></button></form>`;
  document.body.appendChild(page);
  $s("sg-back").onclick=close;
  $s("sg-set").onclick=()=>settings();
  $s("sg-new").onclick=()=>{const N=st();if(busy)return;if(N.msgs.length&&N.msgs[N.msgs.length-1].r!=="brk"){N.msgs.push({r:"brk",ts:Date.now()});save()}draw();toast("Conversație nouă")};
  const inp=$s("sg-in");
  inp.addEventListener("input",()=>{inp.style.height="auto";inp.style.height=Math.min(140,inp.scrollHeight)+"px"});
  inp.addEventListener("keydown",ev=>{if(ev.key==="Enter"&&!ev.shiftKey&&!("ontouchstart" in window)){ev.preventDefault();$s("sg-form").requestSubmit()}});
  $s("sg-form").addEventListener("submit",ev=>{ev.preventDefault();if(busy){ctrl&&ctrl.abort();return}const t=inp.value.trim();if(!t)return;inp.value="";inp.style.height="auto";send(t)});
  $s("sg-body").addEventListener("click",async ev=>{
    const sug=ev.target.closest("[data-sug]");if(sug){send(sug.textContent.trim());return}
    const a=ev.target.closest("[data-sa]");if(!a)return;const N=st(),m=N.msgs[+a.closest("[data-mi]").dataset.mi];if(!m)return;
    if(a.dataset.sa==="copy"){try{await navigator.clipboard.writeText(m.t);toast("Copiat")}catch(_){toast("Nu am putut copia")}}
    if(a.dataset.sa==="note"&&window.Grow){Grow.saveNote({t:m.t.length>700?m.t.slice(0,700).replace(/\s+\S*$/,"")+"…":m.t,b:"Înțeleptul"});a.textContent="Salvat ✓";a.disabled=true}
    if(a.dataset.sa==="retry"){const i=+a.closest("[data-mi]").dataset.mi,q=N.msgs[i-1];if(q&&q.r==="u"&&!busy){N.msgs.splice(i,1);save();reply()}}
  });
  // tastatura iPhone-ului: pagina se strânge pe partea vizibilă, ca să vezi mereu ce scrii
  if(window.visualViewport){const fit=()=>{if(page.hidden)return;const v=visualViewport;page.style.height=v.height+"px";page.style.transform=`translateY(${v.offsetTop}px)`;bottom()};
    visualViewport.addEventListener("resize",fit);visualViewport.addEventListener("scroll",fit)}
  return page;
}
const bottom=()=>{const b=$s("sg-body");if(b)b.scrollTop=b.scrollHeight};
function bubble(m,i){
  if(m.r==="brk")return `<div class="sg-brk"><span>${new Date(m.ts).toLocaleDateString("ro-RO",{day:"numeric",month:"long"})} · conversație nouă</span></div>`;
  if(m.r==="u")return `<div class="sg-m u" data-mi="${i}"><div class="sg-b">${e(m.t).replace(/\n/g,"<br>")}</div></div>`;
  return `<div class="sg-m a${m.err?" err":""}" data-mi="${i}"><div class="sg-b">${m.err?e(m.t):md(m.t)}</div>${m.err?`<div class="sg-acts"><button data-sa="retry">Încearcă din nou</button></div>`:m.t?`<div class="sg-acts"><button data-sa="note">Salvează în notițe</button><button data-sa="copy">Copiază</button></div>`:""}</div>`;
}
function draw(){
  const N=st(),B=$s("sg-body");if(!B)return;
  $s("sg-form").hidden=!hasKey();$s("sg-new").hidden=!hasKey();
  if(!hasKey()){B.innerHTML=onboard();wireKey(B);return}
  const lastBrk=N.msgs.map(m=>m.r).lastIndexOf("brk"),fresh=!N.msgs.length||lastBrk===N.msgs.length-1;
  B.innerHTML=N.msgs.map(bubble).join("")+(fresh?`<div class="sg-hello"><div class="sg-orb"><i></i></div><h3>Despre ce vorbim azi?</h3><p>Scrie liber, ca într-un jurnal. Îți răspund cu ce au înțeles alții înaintea noastră, pe limba ta.</p>
      <div class="sg-sugs">${["Ce am de învățat din ziua de azi?","Cum rămân disciplinat când nu am chef?","Ajută-mă să iau o decizie grea","Mă simt agitat. De unde încep?"].map(s=>`<button data-sug>${s}</button>`).join("")}</div></div>`:"");
  bottom();
}
function onboard(){
  return `<div class="sg-on"><div class="sg-orb"><i></i></div><h3>Înțeleptul are nevoie de o cheie</h3>
    <p>Ca să poată gândi, se conectează la Claude, modelul AI de la Anthropic, cu <b>cheia ta personală</b>. Se plătește la consum, separat de abonamentul Claude.</p>
    <ol><li>Intră pe <b>console.anthropic.com</b> și fă-ți cont.</li><li>La <b>Billing</b> încarcă un credit mic.</li><li>La <b>API Keys</b> apasă „Create Key” și copiaz-o.</li><li>Lipește cheia mai jos.</li></ol>
    <form id="sg-keyf" autocomplete="off"><input id="sg-key" type="password" placeholder="sk-ant-…" autocapitalize="off" autocorrect="off" spellcheck="false"><button class="btn" type="submit">Salvează cheia</button></form>
    <p class="sg-fine">Cheia rămâne doar pe acest telefon. Nu ajunge în copia de siguranță și nici pe GitHub. Mesajele tale pleacă direct de pe telefon la Anthropic.</p></div>`;
}
function wireKey(root){
  const f=root.querySelector("#sg-keyf");if(!f)return;
  f.addEventListener("submit",ev=>{ev.preventDefault();const v=root.querySelector("#sg-key").value.trim();
    if(!/^sk-ant-[\w-]{20,}$/.test(v)){toast("Cheia ar trebui să înceapă cu sk-ant-");return}
    try{localStorage.setItem(KEY,v)}catch(_){toast("Nu am putut salva cheia");return}
    toast("Cheie salvată pe telefon");draw();document.dispatchEvent(new Event("sage-key"))});
}
function settings(){
  const N=st(),m=document.createElement("div");m.className="gsheet sgset";
  m.innerHTML=`<div class="gs-card"><i class="gs-grab"></i><h3>Înțeleptul</h3>
    <div class="sg-sec"><small>Cum gândește</small><div class="sg-models">${MODELS.map(([id,n,d])=>`<button data-md="${id}" aria-pressed="${N.model===id}"><b>${n}</b><span>${d}</span></button>`).join("")}</div></div>
    <label class="tog"><input type="checkbox" id="sg-ctx" ${N.ctx?"checked":""}> Îmi cunoaște planul zilei, cărțile, notițele și jurnalul de azi</label>
    <p class="note">Cu asta bifată, aceste lucruri se trimit împreună cu mesajul tău, ca răspunsul să fie pentru tine, nu general.</p>
    <div class="sg-sec"><small>Cheia AI</small><p class="note">${hasKey()?"Salvată pe acest telefon: sk-ant-…"+e(key().slice(-4)):"Nu ai pus încă o cheie."}</p>
      <div class="hadd-b">${hasKey()?`<button class="btn ghost" id="sg-keydel">Șterge cheia</button>`:""}<button class="btn ghost" id="sg-clear">Șterge conversațiile</button></div></div>
    <button class="btn" id="sg-ok">Gata</button></div>`;
  document.body.appendChild(m);requestAnimationFrame(()=>m.classList.add("in"));
  const shut=()=>{m.classList.remove("in");setTimeout(()=>m.remove(),350)};
  m.addEventListener("click",ev=>{
    if(ev.target===m||ev.target.closest("#sg-ok")){shut();return}
    const b=ev.target.closest("[data-md]");if(b){N.model=b.dataset.md;save();m.querySelectorAll("[data-md]").forEach(x=>x.setAttribute("aria-pressed",x===b));return}
    if(ev.target.closest("#sg-keydel")&&confirm("Ștergi cheia AI de pe acest telefon?")){try{localStorage.removeItem(KEY)}catch(_){}shut();draw();document.dispatchEvent(new Event("sage-key"));return}
    if(ev.target.closest("#sg-clear")&&confirm("Ștergi toate conversațiile cu Înțeleptul?")){N.msgs=[];save();shut();draw()}
  });
  m.querySelector("#sg-ctx").addEventListener("change",ev=>{N.ctx=ev.target.checked;save()});
}
function send(text){
  if(busy||!hasKey())return;const N=st();
  N.msgs.push({r:"u",t:text,ts:Date.now()});if(N.msgs.length>240)N.msgs=N.msgs.slice(-200);save();
  reply();
}
async function reply(){
  const N=st(),B=$s("sg-body");busy=true;page.classList.add("busy");
  draw();
  const start=N.msgs.map(m=>m.r).lastIndexOf("brk")+1;
  const hist=N.msgs.slice(start).filter(m=>(m.r==="u"||m.r==="a")&&!m.err&&m.t).slice(-24).map(m=>({role:m.r==="u"?"user":"assistant",content:m.t}));
  while(hist.length&&hist[0].role!=="user")hist.shift();
  B.insertAdjacentHTML("beforeend",`<div class="sg-m a live" id="sg-live"><div class="sg-b"><span class="sg-dots"><i></i><i></i><i></i></span></div></div>`);bottom();
  const live=$s("sg-live").firstChild;let got="",raf=0;
  const paint=full=>{got=full;if(raf)return;raf=requestAnimationFrame(()=>{raf=0;const near=B.scrollHeight-B.scrollTop-B.clientHeight<120;live.innerHTML=md(got)+`<span class="sg-cur"></span>`;if(near)bottom()})};
  try{
    const txt=await withModel(m=>({model:m,max_tokens:1024,stream:true,system:system(),messages:hist}),paint);
    N.msgs.push({r:"a",t:(txt||got||"").trim()||"…",ts:Date.now()});
    if(window.Grow)Grow.award(`sage:${dk()}`,5,"Ai vorbit cu Înțeleptul");
  }catch(err){
    if(err.name==="AbortError"){if(got.trim())N.msgs.push({r:"a",t:got.trim(),ts:Date.now()})}
    else N.msgs.push({r:"a",t:err.message||"Ceva n-a mers.",err:1,ts:Date.now()});
  }
  busy=false;page.classList.remove("busy");save();draw();
}
function open(prefill){
  ensure();st();try{stopAll()}catch(_){}
  page.hidden=false;page.style.height="";page.style.transform="";
  requestAnimationFrame(()=>page.classList.add("in"));
  draw();if(prefill&&hasKey())$s("sg-in").value=prefill;
}
function close(){if(!page)return;ctrl&&busy&&ctrl.abort();page.style.transform="";page.classList.remove("in");setTimeout(()=>{page.hidden=true},320);document.dispatchEvent(new Event("sage-key"))}
window.Sage={open,close,hasKey,complete,md,last:()=>{const m=st().msgs.filter(x=>x.r==="a"&&!x.err).pop();return m?m.t:""}};
})();
