// IMPERIUM — NoFap: cronometru de la ultima resetare (secunde → minute → ore → zile → săptămâni → luni → ani),
// încercările tale și cea mai lungă perioadă. Totul rămâne doar pe telefon.
(function(){
const $n=id=>document.getElementById(id);
const st=()=>{S.nf=S.nf||{start:null,tries:[],best:0};return S.nf};
const MILES=[1,3,7,14,21,30,45,60,90,120,180,270,365,730];
const pad=n=>String(n).padStart(2,"0");

// diferența în unități de calendar: ani și luni după calendar, apoi săptămâni, zile, ore, minute, secunde
function parts(from,to){
  const a=new Date(from),b=new Date(to);if(b<a)return {y:0,mo:0,w:0,d:0,h:0,mi:0,s:0};
  let y=b.getFullYear()-a.getFullYear(),mo=b.getMonth()-a.getMonth();
  let tot=y*12+mo;const anc=t=>{const x=new Date(a);x.setMonth(a.getMonth()+t);return x};
  if(anc(tot)>b)tot--;if(tot<0)tot=0;
  y=Math.floor(tot/12);mo=tot%12;
  let rest=Math.floor((b-anc(tot))/1000);
  const d0=Math.floor(rest/86400);rest-=d0*86400;
  const h=Math.floor(rest/3600);rest-=h*3600;const mi=Math.floor(rest/60),s=rest-mi*60;
  return {y,mo,w:Math.floor(d0/7),d:d0%7,h,mi,s};
}
function fmtDur(ms){
  if(!ms||ms<1000)return "0 s";
  const out=[];
  // pentru durate (fără dată de început) folosim zile și săptămâni simple
  const days=Math.floor(ms/864e5),h=Math.floor(ms%864e5/36e5),mi=Math.floor(ms%36e5/6e4),s=Math.floor(ms%6e4/1e3);
  if(days>=365)out.push(Math.floor(days/365)+(Math.floor(days/365)===1?" an":" ani"));
  const dr=days%365;if(dr>=30)out.push(Math.floor(dr/30)+(Math.floor(dr/30)===1?" lună":" luni"));
  const dd=dr%30;if(dd>=7)out.push(Math.floor(dd/7)+" săpt.");if(dd%7)out.push(dd%7+(dd%7===1?" zi":" zile"));
  if(!days){if(h)out.push(h+" h");if(mi)out.push(mi+" min");if(!h)out.push(s+" s")}
  else if(days<7&&h)out.push(h+" h");
  return out.slice(0,3).join(" ");
}
// ceasul: zilele mari (mereu vizibile), dedesubt orele și minutele; secundele doar în prima oră
function clock(start,now){
  const ms=Math.max(0,now-start),D=Math.floor(ms/864e5),h=Math.floor(ms%864e5/36e5),mi=Math.floor(ms%36e5/6e4),s=Math.floor(ms%6e4/1e3);
  const p=parts(start,now),big=[];
  if(p.y)big.push(p.y+(p.y===1?" an":" ani"));if(p.mo)big.push(p.mo+(p.mo===1?" lună":" luni"));if(p.w)big.push(p.w+" săpt.");if(p.d&&big.length)big.push(p.d+(p.d===1?" zi":" zile"));
  const t=(v,l)=>`<div class="nf-t"><b>${v}</b><small>${l}</small></div>`;
  return `<div class="nf-days"><b>${D}</b><span>${D===1?"zi":"zile"}</span></div>
    ${D>=7?`<div class="nf-brk">= ${big.join(" · ")}</div>`:""}
    <div class="nf-hms">${t(pad(h),"ore")}${t(pad(mi),"min")}${ms<36e5?t(pad(s),"sec"):""}</div>`;
}
let tick=0;
function render(){
  const R=$n("nf-root");if(!R)return;const N=st(),now=Date.now();
  const tries=N.tries.length+(N.start?1:0);
  const cur=N.start?now-N.start:0,best=Math.max(N.best||0,cur);
  if(!N.start){
    R.innerHTML=`<div class="sec nf"><div class="nf-hd"><h3>NoFap</h3><span class="muted">${tries?`${tries} ${tries===1?"încercare":"încercări"}`:"Prima încercare"}</span></div>
      <p class="note">Cronometrul pornește acum și numără secundele, minutele, orele, zilele, săptămânile și lunile. Dacă rupi ciclul, apeși Reset și începi din nou; aici rămân încercările și recordul tău.</p>
      <div class="hadd-b"><button class="btn" id="nf-go">Pornește acum</button><button class="btn ghost" id="nf-from">Am început deja…</button></div>
      <div id="nf-date" hidden><input type="datetime-local" id="nf-dt"><div class="hadd-b"><button class="btn" id="nf-dt-ok">Pornește de la data asta</button></div></div>
      ${hist(N)}</div>`;
    return;
  }
  const p=parts(N.start,now),days=cur/864e5,next=MILES.find(m=>m>days)||Math.ceil(days/365+1)*365,prev=[0,...MILES].filter(m=>m<=days).pop()||0;
  const pr=Math.max(0,Math.min(1,(days-prev)/(next-prev)));
  R.innerHTML=`<div class="sec nf">
    <div class="nf-hd"><h3>NoFap</h3><span class="muted">Încercarea ${tries}</span></div>
    <div class="nf-clock" id="nf-clock">${clock(N.start,now)}</div>
    <div class="nf-goal"><div class="nf-bar"><i style="width:${(pr*100).toFixed(1)}%"></i></div><small>Următorul prag: <b>${next} ${next===1?"zi":"zile"}</b> · mai ai ${fmtDur(Math.max(0,next*864e5-cur))}</small></div>
    <div class="nf-stats">
      <div><small>Încercări</small><b>${tries}</b></div>
      <div><small>Cea mai lungă perioadă</small><b>${fmtDur(best)}</b>${cur>=best&&N.tries.length?`<em>record acum 🔥</em>`:""}</div>
      <div><small>Început</small><b>${new Date(N.start).toLocaleDateString("ro-RO",{day:"numeric",month:"short"})}, ${new Date(N.start).toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit"})}</b></div>
    </div>
    <button class="btn nf-reset" id="nf-reset">Reset · am rupt ciclul</button>
    ${hist(N)}
  </div>`;
}
function hist(N){
  if(!N.tries.length)return "";
  const L=N.tries.slice().reverse().slice(0,12);
  return `<div class="nf-hist"><small class="nf-ht">Încercările de până acum</small>${L.map((t,i)=>{const n=N.tries.length-i,d=t.e-t.s;
    return `<div class="nf-row"><span>#${n} · ${new Date(t.s).toLocaleDateString("ro-RO",{day:"numeric",month:"short"})} – ${new Date(t.e).toLocaleDateString("ro-RO",{day:"numeric",month:"short"})}</span><b>${fmtDur(d)}${d===N.best?" 🏆":""}</b></div>`}).join("")}</div>`;
}
// actualizăm doar ceasul, o dată pe secundă, cât timp pagina e pe ecran
function loop(){
  clearInterval(tick);
  tick=setInterval(()=>{const R=$n("nf-root");if(!R||!R.offsetParent||document.hidden)return;const N=st();if(!N.start)return;
    const c=$n("nf-clock");if(c)c.innerHTML=clock(N.start,Date.now());
    if(new Date().getSeconds()===0)render()},1000);
}
document.addEventListener("click",e=>{
  if(!e.target.closest("#nf-root"))return;const N=st();
  if(e.target.closest("#nf-go")){N.start=Date.now();save();render();return}
  if(e.target.closest("#nf-from")){const d=$n("nf-date");d.hidden=!d.hidden;if(!d.hidden){const x=new Date(Date.now()-864e5);x.setMinutes(x.getMinutes()-x.getTimezoneOffset());$n("nf-dt").value=x.toISOString().slice(0,16)}return}
  if(e.target.closest("#nf-dt-ok")){const v=$n("nf-dt").value,t=v?new Date(v).getTime():NaN;if(!isFinite(t)||t>Date.now()){toast("Alege o dată din trecut");return}N.start=t;save();render();return}
  if(e.target.closest("#nf-reset")){
    if(!confirm("Resetezi cronometrul? Încercarea de acum se salvează în istoric."))return;
    const now=Date.now(),d=now-N.start;N.tries.push({s:N.start,e:now});if(d>(N.best||0))N.best=d;
    N.start=now;save();render();toast(`Salvat: ${fmtDur(d)}. Începi din nou, acum.`);return}
});
window.NoFap={render(){render();loop()}};
})();
