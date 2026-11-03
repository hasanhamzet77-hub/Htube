// IMPERIUM — vocea mantrei: rândurile se pot înregistra cu vocea ta (rămân doar pe telefon)
// și se redau cu puțin ecou cald; ce nu e înregistrat citește cea mai bună voce română de pe telefon.
(function(){
const $v=id=>document.getElementById(id);
const escv=s=>String(s??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const key=t=>"l:"+String(t).trim();

/* ---------- înregistrări (IndexedDB) ---------- */
let dbp=null;
function vdb(){return dbp||(dbp=new Promise((res,rej)=>{const r=indexedDB.open("imperium-voice",1);
  r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains("lines"))r.result.createObjectStore("lines")};
  r.onsuccess=()=>res(r.result);r.onerror=()=>{dbp=null;rej(r.error)}}))}
const tx=(mode,fn)=>vdb().then(d=>new Promise((res,rej)=>{const t=d.transaction("lines",mode),s=t.objectStore("lines"),q=fn(s);t.oncomplete=()=>res(q&&q.result);t.onerror=()=>rej(t.error)}));
const getRec=t=>tx("readonly",s=>s.get(key(t))).catch(()=>null);
const putRec=(t,blob)=>tx("readwrite",s=>s.put(blob,key(t)));
const delRec=t=>tx("readwrite",s=>s.delete(key(t)));
const has=async lines=>{const r=await Promise.all(lines.map(getRec));return r.filter(Boolean).length};

/* ---------- redare: vocea ta, cu un ecou cald discret ---------- */
let ctx=null,verb=null,cur=null;
function ac(){
  if(!ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;ctx=new C();
    // „camera”: 1,8 s de ecou moale, ca într-o încăpere liniștită
    const len=Math.floor(ctx.sampleRate*1.8),ir=ctx.createBuffer(2,len,ctx.sampleRate);
    for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3.2)*(i<ctx.sampleRate*.012?i/(ctx.sampleRate*.012):1)}
    verb=ctx.createConvolver();verb.buffer=ir}
  if(ctx.state==="suspended")ctx.resume().catch(()=>{});
  return ctx;
}
function stop(){try{cur&&cur.stop()}catch(e){}cur=null;try{speechSynthesis.cancel()}catch(e){}}
async function playBlob(blob){
  const c=ac();if(!c)throw new Error("no audio");
  const buf=await c.decodeAudioData(await blob.arrayBuffer());
  stop();
  const src=c.createBufferSource();src.buffer=buf;
  const hp=c.createBiquadFilter();hp.type="highpass";hp.frequency.value=85;
  const warm=c.createBiquadFilter();warm.type="lowshelf";warm.frequency.value=220;warm.gain.value=2.5;
  const dry=c.createGain();dry.gain.value=.92;const wet=c.createGain();wet.gain.value=.2;
  src.connect(hp).connect(warm);warm.connect(dry).connect(c.destination);warm.connect(verb).connect(wet).connect(c.destination);
  cur=src;src.start();
  return new Promise(r=>{src.onended=()=>{if(cur===src)cur=null;r()}});
}

/* ---------- vocea telefonului: alegem cea mai naturală voce română ---------- */
const VK="imp-voice";
const roVoices=()=>{try{return speechSynthesis.getVoices().filter(v=>/^ro/i.test(v.lang))}catch(e){return[]}};
const quality=v=>/premium/i.test(v.name)?3:/enhanced|îmbunătăț|imbunatat|neural|natural/i.test(v.name)?2:/siri/i.test(v.name)?2:0;
const qLabel=v=>quality(v)===3?"premium":quality(v)===2?"îmbunătățită":"standard";
function best(){const vs=roVoices();let pick=null;try{pick=localStorage.getItem(VK)}catch(e){}
  return vs.find(v=>v.name===pick)||vs.slice().sort((a,b)=>quality(b)-quality(a))[0]||null}
function say(text,o={}){
  try{const ss=window.speechSynthesis;if(!ss)return false;if(o.cancel!==false)stop();
    const v=best(),q=v?quality(v):0;
    // rupem rândul în fraze: pauzele scurte dintre ele îl fac să sune mai omenesc
    const parts=String(text).replace(/([.;:!?])\s+/g,"$1\n").split("\n").filter(Boolean);
    parts.forEach((p,i)=>{const u=new SpeechSynthesisUtterance(p);u.lang="ro-RO";if(v)u.voice=v;
      u.rate=o.rate||(q?.92:.88);u.pitch=o.pitch||(q?1:.96);u.volume=1;ss.speak(u)});
    return true}catch(e){return false}
}
try{if(window.speechSynthesis){speechSynthesis.getVoices();speechSynthesis.addEventListener("voiceschanged",()=>{panelRefresh&&panelRefresh()})}}catch(e){}

/* un rând al mantrei: vocea ta dacă l-ai înregistrat, altfel vocea telefonului */
async function line(text){
  const b=await getRec(text);
  if(b){try{await playBlob(b);return}catch(e){}}
  say(text);
}
// apelat la apăsarea „Începe”, ca iPhone-ul să permită sunetul mai târziu
function unlock(){try{const c=ac();if(c){const b=c.createBuffer(1,1,22050),s=c.createBufferSource();s.buffer=b;s.connect(c.destination);s.start()}}catch(e){}
  try{if(window.speechSynthesis){const u=new SpeechSynthesisUtterance(" ");u.volume=0;speechSynthesis.speak(u)}}catch(e){}}

/* ---------- curățăm înregistrarea: tăiem liniștea, aducem volumul la același nivel ---------- */
async function polish(blob){
  const c=ac();if(!c)return blob;
  const b=await c.decodeAudioData(await blob.arrayBuffer());
  const d=b.getChannelData(0),sr=b.sampleRate,n=d.length,win=Math.floor(sr*.02);
  let peak=0;for(let i=0;i<n;i++){const a=Math.abs(d[i]);if(a>peak)peak=a}
  if(peak<.01)return null;
  const th=Math.max(.012,peak*.06),rms=i=>{let s=0;for(let k=i;k<Math.min(n,i+win);k++)s+=d[k]*d[k];return Math.sqrt(s/win)};
  let st=0;while(st<n-win&&rms(st)<th)st+=win;let en=n-win;while(en>st&&rms(en)<th)en-=win;
  st=Math.max(0,st-Math.floor(sr*.12));en=Math.min(n,en+win+Math.floor(sr*.35));
  const len=en-st,g=.89/peak,fade=Math.floor(sr*.03),out=new Int16Array(len);
  for(let i=0;i<len;i++){let v=d[st+i]*g;if(i<fade)v*=i/fade;if(i>len-fade)v*=(len-i)/fade;out[i]=Math.max(-1,Math.min(1,v))*32767}
  const hdr=new ArrayBuffer(44),w=new DataView(hdr),s=(o,t)=>{for(let i=0;i<t.length;i++)w.setUint8(o+i,t.charCodeAt(i))};
  s(0,"RIFF");w.setUint32(4,36+len*2,true);s(8,"WAVE");s(12,"fmt ");w.setUint32(16,16,true);w.setUint16(20,1,true);w.setUint16(22,1,true);
  w.setUint32(24,sr,true);w.setUint32(28,sr*2,true);w.setUint16(32,2,true);w.setUint16(34,16,true);s(36,"data");w.setUint32(40,len*2,true);
  return new Blob([hdr,out.buffer],{type:"audio/wav"});
}

/* ---------- ecranul de înregistrare ---------- */
const css=document.createElement("style");css.textContent=`
.vp{border:1px solid var(--line);border-radius:12px;padding:12px;margin:2px 0 12px;font-size:14px}
.vp .vh{display:flex;justify-content:space-between;gap:8px;align-items:baseline;margin-bottom:8px}
.vp .vh b{font-weight:700}.vp .vh span{color:var(--muted);font-size:12.5px}
.vp .vb{display:flex;gap:8px;flex-wrap:wrap}.vp .vb button{flex:1 1 auto;min-height:40px;border:0;border-radius:10px;background:var(--soft);color:var(--ink);font:600 14px var(--sans);padding:0 12px}
.vp .vb button.pri{background:var(--ink);color:var(--bg)}
.vp select{width:100%;margin:10px 0 8px;min-height:40px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--ink);font:500 14px var(--sans);padding:0 10px}
.vp .vt{color:var(--muted);font-size:12.5px;line-height:1.45;margin:6px 0 0}
#vrec{position:fixed;inset:0;z-index:30;background:#0b0c0f;color:#ecebe7;display:flex;flex-direction:column;padding:calc(env(safe-area-inset-top,0px) + 14px) 22px calc(env(safe-area-inset-bottom,0px) + 18px)}
#vrec .vtop{display:flex;justify-content:space-between;align-items:center;font:600 14px var(--sans);color:#8d8f98}
#vrec .vtop button{background:none;border:0;color:#ecebe7;font:600 15px var(--sans);padding:8px 0}
#vrec .vline{flex:1;display:grid;place-items:center;text-align:center;font-family:var(--serif);font-size:clamp(22px,6.4vw,30px);line-height:1.35;padding:10px 4px}
#vrec .vmic{width:96px;height:96px;border-radius:50%;border:0;margin:0 auto 14px;display:grid;place-items:center;background:#e5484d;color:#fff;font:700 13px var(--sans);box-shadow:0 0 0 0 rgba(229,72,77,.5);transition:transform .15s}
#vrec .vmic.on{animation:vpulse 1.2s infinite;border-radius:28px}
@keyframes vpulse{0%{box-shadow:0 0 0 0 rgba(229,72,77,.55)}100%{box-shadow:0 0 0 22px rgba(229,72,77,0)}}
#vrec .vmeter{height:4px;border-radius:4px;background:#22242a;overflow:hidden;margin:0 auto 14px;width:60%}
#vrec .vmeter i{display:block;height:100%;width:0;background:#e9c46a;transition:width .08s}
#vrec .vrow{display:flex;gap:10px}#vrec .vrow button{flex:1;min-height:48px;border-radius:12px;border:0;background:#191b20;color:#ecebe7;font:600 15px var(--sans)}
#vrec .vrow button.pri{background:#e9c46a;color:#0e0f12}#vrec .vrow button:disabled{opacity:.35}
#vrec .vhint{color:#8d8f98;font-size:13px;text-align:center;margin:0 0 14px;line-height:1.45}
@media (prefers-reduced-motion:reduce){#vrec .vmic.on{animation:none}}`;
document.head.appendChild(css);

function recorder(lines,onDone,start){
  let i=start||0,stream=null,mr=null,chunks=[],raf=0,an=null,t0=0;
  const ov=document.createElement("div");ov.id="vrec";ov.setAttribute("role","dialog");ov.setAttribute("aria-label","Înregistrează mantra");
  document.body.appendChild(ov);
  const draw=async()=>{const rec=await getRec(lines[i]);
    ov.innerHTML=`<div class="vtop"><span>Rândul ${i+1} din ${lines.length}</span><button data-v="close">Gata</button></div>
      <div class="vline">${escv(lines[i])}</div>
      <p class="vhint">Spune rândul rar și liniștit, cu telefonul la 20–30 cm. Apasă pe cerc ca să începi și din nou ca să oprești.</p>
      <div class="vmeter"><i></i></div>
      <button class="vmic" data-v="rec" aria-label="Înregistrează">${rec?"Din nou":"Înregistrează"}</button>
      <div class="vrow"><button data-v="prev" ${i?"":"disabled"}>‹ Înapoi</button><button data-v="play" ${rec?"":"disabled"}>Ascultă</button><button class="pri" data-v="next">${i<lines.length-1?"Următorul ›":"Termină"}</button></div>`};
  const meter=()=>{if(!an)return;const a=new Uint8Array(an.fftSize);an.getByteTimeDomainData(a);let m=0;for(const x of a)m=Math.max(m,Math.abs(x-128));
    const el=ov.querySelector(".vmeter i");if(el)el.style.width=Math.min(100,m/1.1)+"%";const b=ov.querySelector(".vmic");if(b)b.textContent=`Oprește · ${((Date.now()-t0)/1000).toFixed(0)} s`;raf=requestAnimationFrame(meter)};
  const startRec=async()=>{
    try{stream=stream||await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:true,autoGainControl:true}})}
    catch(e){alertBox("Nu am acces la microfon. Permite-l din Setări → IMPERIUM (sau Safari) → Microfon.");return}
    const c=ac();try{if(c){const s=c.createMediaStreamSource(stream);an=c.createAnalyser();an.fftSize=1024;s.connect(an)}}catch(e){}
    const type=["audio/mp4","audio/webm;codecs=opus","audio/webm"].find(t=>window.MediaRecorder&&MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(t));
    chunks=[];mr=new MediaRecorder(stream,type?{mimeType:type}:undefined);
    mr.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
    mr.onstop=async()=>{cancelAnimationFrame(raf);an=null;
      const raw=new Blob(chunks,{type:mr.mimeType||"audio/mp4"});let fin=raw;
      try{fin=await polish(raw)}catch(e){fin=raw}
      if(!fin){alertBox("N-am auzit nimic. Mai încearcă o dată, puțin mai aproape de telefon.");draw();return}
      await putRec(lines[i],fin);await draw();try{await playBlob(fin)}catch(e){}};
    mr.start();t0=Date.now();const b=ov.querySelector(".vmic");b.classList.add("on");b.dataset.v="stop";meter();
  };
  const alertBox=m=>{const p=ov.querySelector(".vhint");if(p){p.textContent=m;p.style.color="#ff8a8a"}};
  const close=()=>{stop();try{mr&&mr.state==="recording"&&mr.stop()}catch(e){}if(stream)stream.getTracks().forEach(t=>t.stop());cancelAnimationFrame(raf);ov.remove();onDone&&onDone()};
  ov.addEventListener("click",async e=>{const b=e.target.closest("[data-v]");if(!b)return;const v=b.dataset.v;
    if(v==="rec"){stop();startRec()}
    else if(v==="stop"){try{mr.stop()}catch(e){}}
    else if(v==="play"){const r=await getRec(lines[i]);if(r)playBlob(r).catch(()=>{})}
    else if(v==="prev"&&i>0){stop();i--;draw()}
    else if(v==="next"){stop();if(mr&&mr.state==="recording"){try{mr.stop()}catch(e){}return}if(i<lines.length-1){i++;draw()}else close()}
    else if(v==="close")close();
  });
  ac();draw();
}

/* ---------- panoul din setările meditației ---------- */
let panelRefresh=null;
async function panel(el,lines){
  if(!el)return;lines=[...new Set(lines.map(s=>String(s).trim()))];
  panelRefresh=()=>panel(el,lines);
  const n=await has(lines),vs=roVoices(),b=best(),good=vs.some(v=>quality(v)>0);
  el.innerHTML=`<div class="vp">
    <div class="vh"><b>${n===lines.length?"Vocea ta":n?"Vocea ta, parțial":"Vocea telefonului"}</b><span>${n?`${n} din ${lines.length} rânduri înregistrate`:b?`${escv(b.name)} · ${qLabel(b)}`:"nicio voce română găsită"}</span></div>
    <div class="vb"><button class="pri" data-vp="rec">${n===lines.length?"Reînregistrează":n?"Continuă înregistrarea":"Înregistrează cu vocea ta"}</button><button data-vp="test">Ascultă</button>${n?'<button data-vp="del">Șterge</button>':""}</div>
    ${vs.length>1?`<select data-vp="sel" aria-label="Vocea telefonului">${vs.map(v=>`<option value="${escv(v.name)}"${b&&v.name===b.name?" selected":""}>${escv(v.name)} · ${qLabel(v)}</option>`).join("")}</select>`:""}
    <p class="vt">${n===lines.length?"Mantra se redă cu vocea ta, cu un ecou cald discret. Înregistrările rămân doar pe telefon.":
      n?"Rândurile neînregistrate le citește vocea telefonului.":
      "Cel mai natural sună vocea ta: înregistrezi o dată fiecare rând (" + lines.length + "), iar mantra se redă apoi cu ea."}
    ${!n&&!good?" Pentru o voce de telefon mai naturală: Setări → Accesibilitate → Conținut vorbit → Voci → Română → descarcă „Ioana (Îmbunătățită)”, apoi redeschide aplicația.":""}</p></div>`;
  el.onclick=async e=>{const b2=e.target.closest("[data-vp]");if(!b2)return;const v=b2.dataset.vp;
    if(v==="rec"){let st=0;if(n&&n<lines.length){for(let k=0;k<lines.length;k++){if(!(await getRec(lines[k]))){st=k;break}}}recorder(lines,()=>panel(el,lines),st)}
    else if(v==="test"){unlock();const r=await getRec(lines[0]);if(r){for(const l of lines.slice(0,2)){const x=await getRec(l);if(x){try{await playBlob(x)}catch(_){}}}}else say(lines[0])}
    else if(v==="del"){if(b2.dataset.armed){for(const l of lines)await delRec(l);panel(el,lines)}else{b2.dataset.armed="1";b2.textContent="Sigur? Apasă din nou";setTimeout(()=>{if(b2.isConnected){delete b2.dataset.armed;b2.textContent="Șterge"}},3000)}}
  };
  el.onchange=e=>{if(e.target.dataset.vp==="sel"){try{localStorage.setItem(VK,e.target.value)}catch(_){}say("Mulțumesc pentru încă o zi.");panel(el,lines)}};
}

window.Voice={say,line,unlock,stop,panel,has};
})();
