// HTube · Sport — programul tău de luni până duminică, cronometru pe serii și un corp 3D care face exercițiul.
// Planul: un mușchi pe zi, 3 exerciții × 3 serii (pieptul și brațele de 2 ori pe săptămână).
(()=>{
"use strict";
const PLAN=[
 {d:"Luni",m:"Piept",tag:"Pre-oboseală + forță",ex:[
  {n:"Fluturări cu gantere",sets:3,reps:"15–20",rest:60,a:"fly",cue:"Greutate mică, tempo lent. Întindere adâncă jos, strânge mâinile spre interior la vârf. Simte pieptul înainte de împins."},
  {n:"Împins cu bara · cu pauză",sets:3,reps:"8–12",rest:120,a:"bench",cue:"Omoplații strânși, piept sus. Coboară în 3 s spre linia sfârcurilor, pauză 1 s pe piept, apoi împinge gândind „strâng mâinile”."},
  {n:"Flotări la piept (dips) · aplecat",sets:3,reps:"max",rest:90,a:"dips",cue:"Trunchiul aplecat în față = piept, nu triceps. Coboară adânc, simte întinderea. Adaugă greutate când devin ușoare."}]},
 {d:"Marți",m:"Spate",tag:"Compus greu întâi",ex:[
  {n:"Ramat cu bara · aplecat",sets:3,reps:"8–12",rest:120,a:"row",cue:"Spate drept, aplecat ~45°. Trage spre abdomenul inferior, strânge omoplații."},
  {n:"Ramat cu gantera · un braț",sets:3,reps:"12–15",rest:75,a:"dbrow",cue:"Sprijinit pe bancă. Trage gantera spre șold, coborâre controlată. Fă ambele brațe."},
  {n:"Pull-over cu gantera",sets:3,reps:"15–20",rest:60,a:"pullover",cue:"Culcat pe bancă. Coboară gantera în spatele capului, simte întinderea dorsalilor."}]},
 {d:"Miercuri",m:"Brațe",tag:"Prioritate",ex:[
  {n:"Flexii biceps cu bara",sets:3,reps:"10–15",rest:75,a:"curl",cue:"Coatele fixe lângă corp, fără balans. Ultimele repetări trebuie să fie grele."},
  {n:"Extensii triceps deasupra capului",sets:3,reps:"12–15",rest:75,a:"ohext",cue:"O ganteră cu ambele mâini. Coatele fixe, coboară în spatele capului."},
  {n:"Superset: ciocan + flotări pe bancă",sets:3,reps:"12–15",rest:90,a:"hammer",cue:"Flexii ciocan, apoi imediat dips pe marginea băncii, fără pauză între ele."}]},
 {d:"Joi",m:"Umeri",tag:"Lățime și postură",ex:[
  {n:"Împins de la umeri · bară/gantere",sets:3,reps:"8–12",rest:120,a:"ohp",cue:"Șezut, spatele drept. Coboară până la urechi, împinge sus."},
  {n:"Ridicări laterale",sets:3,reps:"15–20",rest:60,a:"lateral",cue:"Izolare, fără avânt. Astea dau lățimea umerilor."},
  {n:"Ridicări posterioare din aplecat",sets:3,reps:"15–20",rest:60,a:"rear",cue:"Aplecat la ~90°. Ridică spre exterior, izolează spatele umărului."}]},
 {d:"Vineri",m:"Piept",tag:"Piept superior + întindere",ex:[
  {n:"Fluturări înclinate cu gantere",sets:3,reps:"15–20",rest:60,a:"ifly",cue:"Bancă la ~30°. Ușor și lent, întindere adâncă pe pieptul superior, strânge mâinile la vârf."},
  {n:"Împins înclinat cu gantere · cu pauză",sets:3,reps:"8–12",rest:120,a:"ipress",cue:"Bancă la 30–45°, omoplați strânși. Coboară în 3 s, pauză 1 s jos, împinge spre centru."},
  {n:"Flotări la piept (dips) · aplecat",sets:3,reps:"max",rest:90,a:"dips",cue:"Aplecat în față. Coboară adânc, caută întinderea în pectoral la fiecare repetare."}]},
 {d:"Sâmbătă",m:"Brațe",tag:"A 2-a doză · sau pauză",ex:[
  {n:"Flexii biceps alternative cu gantere",sets:3,reps:"12–15",rest:60,a:"altcurl",cue:"Rotește ușor palma în sus pe ridicare."},
  {n:"Extensii triceps deasupra capului",sets:3,reps:"12–15",rest:75,a:"ohext",cue:"Întindere completă jos pentru capul lung al tricepsului."},
  {n:"Superset: ciocan + flotări pe bancă",sets:3,reps:"12–15",rest:90,a:"hammer",cue:"Pompare finală pe braț, fără pauză între cele două mișcări."}]},
 {d:"Duminică",m:"Picioare",tag:"O dată pe săptămână",ex:[
  {n:"Genoflexiuni cu bara · în spate",sets:3,reps:"8–12",rest:150,a:"squat",cue:"Spate drept, coboară sub 90° dacă poți, controlat."},
  {n:"Îndreptări românești cu bara",sets:3,reps:"10–12",rest:120,a:"rdl",cue:"Împinge bazinul în spate, bara pe lângă coapse. Ischiogambierii și fesierii."},
  {n:"Fandări înapoi cu gantere",sets:3,reps:"12 / picior",rest:75,a:"lunge",cue:"Pas mare înapoi, trunchi vertical. Alternează picioarele."}]}
];
const DSH=["L","Ma","Mi","J","V","S","D"];

// ── animațiile: direcții ale segmentelor (o = spre exterior, y = sus, z = în față), poză A ↔ poză B ──
const ST={torso:[0,1,0],ua:[.1,-1,0],fa:[.1,-1,.03],th:[.05,-1,0],sh:[.03,-1,0]};
const LIE_LEGS={th:[.16,-.06,1],sh:[.06,-1,.08]};
const AN={
 fly:{o:"lie",eq:"db2",ax:"z",hot:["torso"],t:[2.4,.2,1.3,.4],A:{torso:[0,0,-1],...LIE_LEGS,ua:[.06,1,0],fa:[.03,1,0]},B:{torso:[0,0,-1],...LIE_LEGS,ua:[1,.08,.05],fa:[1,.28,.05]}},
 bench:{o:"lie",eq:"bb",hot:["torso"],t:[3,1,1,.4],A:{torso:[0,0,-1],...LIE_LEGS,ua:[.13,1,0],fa:[.13,1,0]},B:{torso:[0,0,-1],...LIE_LEGS,ua:[.82,-.28,.22],fa:[.06,1,.04]}},
 dips:{o:"stand",pin:"hands",barY:1.22,props:"bars",hot:["torso","ua"],t:[2,.3,1.1,.3],A:{torso:[0,.9,.44],ua:[.16,-1,.06],fa:[.12,-1,0],th:[.05,-1,.28],sh:[.03,-.35,-1]},B:{torso:[0,.86,.5],ua:[.22,-.28,-.94],fa:[.14,-1,.12],th:[.05,-1,.32],sh:[.03,-.3,-1]}},
 row:{o:"stand",pin:"feet",eq:"bb",hot:["torso"],t:[1.1,.4,2,.3],A:{torso:[0,.74,.67],th:[.06,-.97,.22],sh:[.04,-1,-.06],ua:[.12,-1,.06],fa:[.12,-1,0]},B:{torso:[0,.74,.67],th:[.06,-.97,.22],sh:[.04,-1,-.06],ua:[.26,-.36,-.9],fa:[.1,-1,.1]}},
 dbrow:{o:"stand",pin:"feet",eq:"dbR",ax:"z",props:"rowbench",hot:["torso"],t:[1.1,.4,2,.3],
   A:{torso:[0,.35,.94],thR:[.1,-1,.06],shR:[.05,-1,0],thL:[.08,-1,.3],shL:[.06,-1,0],uaL:[.1,-1,.12],faL:[.08,-1,.04],uaR:[.12,-1,.05],faR:[.1,-1,.02]},
   B:{torso:[0,.35,.94],thR:[.1,-1,.06],shR:[.05,-1,0],thL:[.08,-1,.3],shL:[.06,-1,0],uaL:[.1,-1,.12],faL:[.08,-1,.04],uaR:[.3,-.2,-.93],faR:[.06,-1,.1]}},
 pullover:{o:"lie",eq:"db1",ax:"arm",hot:["torso"],t:[2.4,.3,1.4,.4],A:{torso:[0,0,-1],...LIE_LEGS,ua:[.09,1,.06],fa:[.02,1,0]},B:{torso:[0,0,-1],...LIE_LEGS,ua:[.1,.28,-.96],fa:[.03,.16,-1]}},
 curl:{o:"stand",pin:"feet",eq:"bb",hot:["ua","fa"],t:[1,.3,2.2,.3],A:{ua:[.13,-1,.02],fa:[.13,-1,.06]},B:{ua:[.13,-1,.1],fa:[.08,.78,.62]}},
 ohext:{o:"stand",pin:"feet",eq:"db1",ax:"y",hot:["ua","fa"],t:[1.1,.3,2.2,.3],A:{ua:[.12,1,-.12],fa:[.07,-.72,-.69]},B:{ua:[.12,1,-.12],fa:[.04,1,0]}},
 hammer:{o:"stand",pin:"feet",eq:"db2",ax:"sag",hot:["ua","fa"],t:[1,.3,2,.3],A:{ua:[.14,-1,.02],fa:[.14,-1,.05]},B:{ua:[.14,-1,.08],fa:[.1,.72,.68]}},
 ohp:{o:"seat",eq:"db2",ax:"x",hot:["ua","delt"],t:[1.1,.3,2.2,.3],A:{th:[.13,0,1],sh:[.05,-1,.05],ua:[1,-.12,.1],fa:[.04,1,.05]},B:{th:[.13,0,1],sh:[.05,-1,.05],ua:[.32,1,.04],fa:[.14,1,0]}},
 lateral:{o:"stand",pin:"feet",eq:"db2",ax:"z",hot:["delt"],t:[1.1,.3,2,.3],A:{ua:[.16,-1,.08],fa:[.16,-1,.14]},B:{ua:[1,.06,.12],fa:[1,.14,.16]}},
 rear:{o:"stand",pin:"feet",eq:"db2",ax:"z",hot:["delt","torso"],t:[1.1,.3,2,.3],A:{torso:[0,.32,.95],th:[.06,-.95,.3],sh:[.04,-1,-.06],ua:[.1,-1,.1],fa:[.08,-1,.08]},B:{torso:[0,.32,.95],th:[.06,-.95,.3],sh:[.04,-1,-.06],ua:[1,-.08,-.06],fa:[1,-.18,0]}},
 ifly:{o:"incline",eq:"db2",ax:"z",hot:["torso"],t:[2.4,.2,1.3,.4],A:{torso:[0,.5,-.87],th:[.15,-.08,1],sh:[.05,-1,.1],ua:[.06,.87,.5],fa:[.03,.87,.5]},B:{torso:[0,.5,-.87],th:[.15,-.08,1],sh:[.05,-1,.1],ua:[1,.12,-.1],fa:[1,.32,0]}},
 ipress:{o:"incline",eq:"db2",ax:"x",hot:["torso"],t:[3,1,1,.4],A:{torso:[0,.5,-.87],th:[.15,-.08,1],sh:[.05,-1,.1],ua:[.12,.87,.5],fa:[.1,.87,.5]},B:{torso:[0,.5,-.87],th:[.15,-.08,1],sh:[.05,-1,.1],ua:[.8,-.38,.2],fa:[.05,.87,.5]}},
 altcurl:{o:"stand",pin:"feet",eq:"db2",ax:"x",alt:"arms",hot:["ua","fa"],t:[1,.3,2,.2],A:{ua:[.13,-1,.02],fa:[.13,-1,.06]},B:{ua:[.13,-1,.1],fa:[.08,.78,.62]}},
 squat:{o:"stand",pin:"feet",eq:"bbBack",rel:true,hot:["th"],t:[2.4,.3,1.3,.4],A:{torso:[0,1,.04],th:[.08,-1,0],sh:[.08,-1,0],ua:[.85,-.4,-.35],fa:[.3,.55,-.78]},B:{torso:[0,.78,.62],th:[.26,-.08,1],sh:[.12,-.94,-.34],ua:[.85,-.4,-.35],fa:[.3,.55,-.78]}},
 rdl:{o:"stand",pin:"feet",eq:"bb",hot:["th"],t:[2.4,.3,1.3,.4],A:{torso:[0,1,.02],ua:[.1,-1,.05],fa:[.08,-1,.02]},B:{torso:[0,.45,.89],th:[.06,-.97,.2],sh:[.05,-1,-.06],ua:[.1,-1,.04],fa:[.08,-1,0]}},
 lunge:{o:"stand",pin:"ankleL",eq:"db2",ax:"z",alt:"legs",hot:["th"],t:[1.6,.3,1.2,.4],A:{ua:[.15,-1,0],fa:[.15,-1,0]},B:{ua:[.15,-1,0],fa:[.15,-1,0],thL:[.06,-.18,.98],shL:[.04,-1,.06],thR:[.06,-.6,-.8],shR:[.04,-.25,-.97]}}
};

const MUS={
 fly:{p:["pecs"],s:["deltF"]}, bench:{p:["pecs"],s:["triceps","deltF"]}, dips:{p:["pecs","triceps"],s:["deltF"]},
 row:{p:["lats","back"],s:["biceps","traps","deltR"]}, dbrow:{p:["lats","back"],s:["biceps","deltR"]}, pullover:{p:["lats","pecs"],s:["triceps"]},
 curl:{p:["biceps"],s:["forearm"]}, ohext:{p:["triceps"],s:[]}, hammer:{p:["biceps","forearm"],s:["triceps"]},
 ohp:{p:["deltF","deltS"],s:["triceps","traps"]}, lateral:{p:["deltS"],s:["traps","deltF"]}, rear:{p:["deltR","back"],s:["traps"]},
 ifly:{p:["pecs"],s:["deltF"]}, ipress:{p:["pecs","deltF"],s:["triceps"]}, altcurl:{p:["biceps"],s:["forearm"]},
 squat:{p:["quads","glutes"],s:["hams","adduct","back"]}, rdl:{p:["hams","glutes"],s:["back"]}, lunge:{p:["quads","glutes"],s:["hams","adduct","calves"]}
};
const MUS_RO={pecs:"piept",lats:"dorsali",back:"spate",traps:"trapez",deltF:"umăr față",deltS:"umăr lateral",deltR:"umăr spate",biceps:"biceps",triceps:"triceps",forearm:"antebraț",abs:"abdomen",quads:"cvadriceps",hams:"femurali",glutes:"fesieri",calves:"gambe",adduct:"adductori"};
// ── încărcarea Three.js ──
const THREE_URL="https://cdn.jsdelivr.net/npm/three@0.149.0/build/three.min.js";
let threeP=null;
const loadThree=()=>threeP||(threeP=new Promise((res,rej)=>{
  if(window.THREE)return res(window.THREE);
  const s=document.createElement("script");s.src=THREE_URL;
  s.onload=()=>res(window.THREE);s.onerror=()=>{threeP=null;rej(new Error("three"))};document.head.appendChild(s);
}));

// ── scena 3D ──
let G=null;   // tot ce ține de scenă
function buildScene(THREE,canvas){
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.outputEncoding=THREE.sRGBEncoding;
  const scene=new THREE.Scene();
  const cam=new THREE.PerspectiveCamera(32,1,.05,40);
  // lumină de studio, ca la o sculptură: lumină puternică de sus, contur alb din spate
  scene.add(new THREE.HemisphereLight(0xffffff,0x16161c,.32));
  const key=new THREE.DirectionalLight(0xffffff,.95);key.position.set(1.6,4.2,2.6);scene.add(key);
  const rim=new THREE.DirectionalLight(0xffffff,.7);rim.position.set(-2.8,2.4,-2.6);scene.add(rim);
  const rim2=new THREE.DirectionalLight(0xdfe4ff,.35);rim2.position.set(3,1.5,-2);scene.add(rim2);
  const fill=new THREE.DirectionalLight(0xbfd2ff,.16);fill.position.set(-2,.8,3);scene.add(fill);
  const plat=new THREE.Mesh(new THREE.CircleGeometry(1.45,72),new THREE.MeshBasicMaterial({color:0x9a9aa8,transparent:true,opacity:.07}));
  plat.rotation.x=-Math.PI/2;scene.add(plat);
  [1.45,1.0,.55].forEach((r,i)=>{const m=new THREE.Mesh(new THREE.RingGeometry(r-.012,r,128),new THREE.MeshBasicMaterial({color:0xb4b4c4,transparent:true,opacity:i?.14:.42,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.y=.002+i*.001;scene.add(m)});
  // textura de fibre musculare (în relief), generată pe loc
  const fc=document.createElement("canvas");fc.width=fc.height=256;const fx=fc.getContext("2d");
  const img=fx.createImageData(256,256);
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){const v=128+30*Math.sin(x*.55+Math.sin(y*.045+x*.07)*2.2)+((x*7919+y*104729)%23-11);const k=(y*256+x)*4;img.data[k]=img.data[k+1]=img.data[k+2]=v;img.data[k+3]=255}
  fx.putImageData(img,0,0);
  const fiber=new THREE.CanvasTexture(fc);fiber.wrapS=fiber.wrapT=THREE.RepeatWrapping;fiber.repeat.set(7,1);
  const M={
    body:new THREE.MeshStandardMaterial({color:0x7d7e84,roughness:.62,metalness:.04,bumpMap:fiber,bumpScale:.12}),
    core:new THREE.MeshStandardMaterial({color:0x55565b,roughness:.72,metalness:.03}),
    skin:new THREE.MeshStandardMaterial({color:0x7a7b80,roughness:.58,metalness:.03}),
    hot:new THREE.MeshStandardMaterial({color:0xd0170f,roughness:.42,metalness:.04,emissive:0xff1000,emissiveIntensity:.42,bumpMap:fiber,bumpScale:.12}),
    sec:new THREE.MeshStandardMaterial({color:0xc4695c,roughness:.5,metalness:.04,emissive:0x6a1208,emissiveIntensity:.2,bumpMap:fiber,bumpScale:.12}),
    metal:new THREE.MeshStandardMaterial({color:0x9aa0b8,roughness:.25,metalness:.85}),
    plate:new THREE.MeshStandardMaterial({color:0x22242f,roughness:.55,metalness:.4}),
    pad:new THREE.MeshStandardMaterial({color:0x2c2f40,roughness:.7,metalness:.1}),
    frame:new THREE.MeshStandardMaterial({color:0x4b5066,roughness:.4,metalness:.7})
  };
  const cap=(r,l)=>new THREE.CapsuleGeometry(r,l,6,16);
  const SPH=new THREE.SphereGeometry(1,30,22);
  const body={meshes:{}};
  // un mușchi = un elipsoid cu fibre; cheia spune grupa (ca să-l putem aprinde în roșu)
  const mus=(parent,key,rx,ry,rz,x,y,z,rotZ=0,rotX=0,rotY=0)=>{
    const m=new THREE.Mesh(SPH,M.body);m.scale.set(rx,ry,rz);m.position.set(x,y,z);m.rotation.set(rotX,rotY,rotZ);
    parent.add(m);(body.meshes[key]=body.meshes[key]||[]).push(m);return m};
  const part=(parent,mat,rx,ry,rz,x,y,z,rotZ=0,rotX=0)=>{const m=new THREE.Mesh(SPH,mat);m.scale.set(rx,ry,rz);m.position.set(x,y,z);m.rotation.set(rotX,0,rotZ);parent.add(m);return m};
  const bone=(parent,r,l,y,sx=1,sz=1)=>{const m=new THREE.Mesh(cap(r,l),M.core);m.position.y=y;m.scale.set(sx,1,sz);parent.add(m);return m};
  const rod=(parent,mat,r,l,x,y,z,rotZ=0,rotX=0)=>{const m=new THREE.Mesh(cap(r,l),mat);m.position.set(x,y,z);m.rotation.set(rotX,0,rotZ);parent.add(m);return m};
  const root=new THREE.Group();scene.add(root);
  const pelvis=new THREE.Group();root.add(pelvis);
  const pm=new THREE.Mesh(cap(.085,.15),M.core);pm.rotation.z=Math.PI/2;pm.scale.set(1,1,.8);pelvis.add(pm);
  for(const s of [-1,1])mus(pelvis,"abs",.04,.07,.04,s*.06,.0,.06,s*.35);                 // flexorii șoldului / „V”-ul
  const torso=new THREE.Group();torso.position.y=.04;pelvis.add(torso);
  bone(torso,.098,.22,.2,1.3,.86);
  part(torso,M.core,.172,.16,.122,0,.37,0);
  for(const s of [-1,1]){
    mus(pelvis,"glutes",.083,.09,.066,s*.072,-.04,-.074);
    mus(pelvis,"glutes",.03,.062,.032,s*.114,-.03,.01,s*.15);                       // tensor fascia lata
    // piept: partea de jos și partea de sus (claviculară)
    mus(torso,"pecs",.099,.063,.043,s*.083,.392,.088,s*.18);
    mus(torso,"pecs",.086,.042,.036,s*.078,.446,.078,s*.36);
    // dinții de fierăstrău, oblicii, abdomenul
    for(let k=0;k<3;k++)mus(torso,"abs",.022,.03,.02,s*(.128-k*.004),.335-k*.038,.07-k*.01,s*.5);
    mus(torso,"abs",.042,.085,.05,s*.108,.165,.047,-s*.15);
    mus(torso,"abs",.034,.05,.04,s*.118,.25,.062,-s*.1);
    [[.316,.03],[.256,.03],[.196,.03],[.136,.031]].forEach(([y,ry],r)=>mus(torso,"abs",.032,ry,.021,s*.034,y,.101-r*.002));
    // spate: dorsali, rotatori, erectori
    mus(torso,"lats",.068,.168,.07,s*.13,.3,-.032,s*.3);
    mus(torso,"back",.056,.046,.03,s*.1,.405,-.086,s*.2);
    mus(torso,"back",.035,.16,.032,s*.035,.24,-.09);
    mus(torso,"traps",.06,.035,.045,s*.09,.505,-.018,-s*.45);
    // claviculă și gât
    rod(torso,M.skin,.012,.14,s*.09,.478,.072,s*(Math.PI/2-.16));
    rod(torso,M.skin,.014,.1,s*.026,.578,.03,s*.32,.25);
    part(torso,M.skin,.012,.022,.012,s*.088,.697,0);                                 // urechi
  }
  mus(torso,"abs",.058,.05,.026,0,.072,.092);                                          // abdomenul de jos
  mus(torso,"traps",.12,.05,.06,0,.49,-.03);
  mus(torso,"traps",.07,.06,.03,0,.37,-.096);
  bone(torso,.046,.07,.575);
  // capul: craniu, maxilar, arcade, nas
  part(torso,M.skin,.088,.105,.1,0,.705,0);
  part(torso,M.skin,.058,.05,.062,0,.648,.018);
  part(torso,M.skin,.011,.02,.014,0,.686,.094);
  const arms={},legs={};
  for(const s of [-1,1]){
    const k=s<0?"R":"L";
    const sh=new THREE.Group();sh.position.set(s*.205,.47,0);torso.add(sh);
    mus(sh,"deltF",.05,.08,.05,s*.008,-.035,.04);
    mus(sh,"deltS",.055,.086,.056,s*.028,-.03,0);
    mus(sh,"deltR",.05,.08,.05,s*.01,-.035,-.04);
    const ua=new THREE.Group();sh.add(ua);
    bone(ua,.032,.2,-.145);
    mus(ua,"biceps",.042,.1,.045,0,-.15,.03);
    mus(ua,"biceps",.03,.06,.03,s*.03,-.205,.012);                                    // brahial
    mus(ua,"triceps",.04,.112,.04,-s*.01,-.12,-.03);
    mus(ua,"triceps",.035,.08,.035,s*.022,-.1,-.022);
    const el=new THREE.Group();el.position.y=-.29;ua.add(el);
    mus(el,"forearm",.036,.1,.034,s*.012,-.07,.012);
    mus(el,"forearm",.034,.1,.03,-s*.012,-.1,.008);
    mus(el,"forearm",.03,.09,.028,s*.012,-.11,-.012);
    bone(el,.025,.12,-.19);
    // mâna: palmă, degete, degetul mare
    part(el,M.skin,.034,.045,.016,0,-.3,0);
    for(let f=0;f<4;f++)rod(el,M.skin,.0085,.045,(f-1.5)*.0155,-.36,0);
    rod(el,M.skin,.009,.035,s*.031,-.305,.014,s*.6);
    arms[k]={ua,el};
    const hip=new THREE.Group();hip.position.set(s*.1,-.02,0);pelvis.add(hip);
    bone(hip,.046,.3,-.215);
    mus(hip,"quads",.04,.17,.04,0,-.2,.05);                                            // drept femural
    mus(hip,"quads",.05,.17,.05,s*.035,-.22,.012);                                     // vast lateral
    mus(hip,"quads",.045,.07,.045,-s*.03,-.35,.03);                                    // vast medial („lacrima”)
    (body.meshes.quads=body.meshes.quads||[]).push(rod(hip,M.body,.012,.36,0,-.2,.047,-s*.25));   // croitor
    mus(hip,"adduct",.045,.14,.045,-s*.035,-.13,0);
    mus(hip,"hams",.05,.17,.05,s*.012,-.22,-.035);
    mus(hip,"hams",.045,.16,.045,-s*.02,-.22,-.03);
    const kn=new THREE.Group();kn.position.y=-.43;hip.add(kn);
    part(kn,M.skin,.034,.034,.026,0,.01,.04);                                          // rotula
    part(kn,M.core,.05,.06,.05,0,0,0);
    bone(kn,.033,.36,-.23);
    part(kn,M.skin,.03,.04,.032,0,-.41,0);                                             // gleznă
    mus(kn,"calves",.04,.1,.042,-s*.018,-.11,-.032);
    mus(kn,"calves",.036,.09,.038,s*.02,-.1,-.03);
    mus(kn,"calves",.042,.08,.035,0,-.2,-.025);
    mus(kn,"calves",.022,.12,.022,s*.02,-.15,.03);
    const an=new THREE.Group();an.position.y=-.42;kn.add(an);
    part(an,M.skin,.045,.03,.11,0,-.03,.05);
    part(an,M.skin,.042,.016,.03,0,-.045,.15);
    legs[k]={hip,kn,an};
  }
  // echipament
  const barbell=new THREE.Group();
  {const bar=new THREE.Mesh(new THREE.CylinderGeometry(.014,.014,1.7,12),M.metal);bar.rotation.z=Math.PI/2;barbell.add(bar);
   for(const s of [-1,1]){for(let i=0;i<2;i++){const p=new THREE.Mesh(new THREE.CylinderGeometry(i?.12:.17,i?.12:.17,.045,32),M.plate);p.rotation.z=Math.PI/2;p.position.x=s*(.62+i*.05);barbell.add(p)}
     const c=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.05,16),M.metal);c.rotation.z=Math.PI/2;c.position.x=s*.56;barbell.add(c)}}
  scene.add(barbell);
  const mkDb=()=>{const g=new THREE.Group();const h=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.15,10),M.metal);h.rotation.z=Math.PI/2;g.add(h);
    for(const s of [-1,1]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.062,.062,.06,24),M.plate);p.rotation.z=Math.PI/2;p.position.x=s*.1;g.add(p)}
    scene.add(g);return g};
  const dbs={R:mkDb(),L:mkDb(),C:mkDb()};
  const props=new THREE.Group();scene.add(props);
  G={THREE,renderer,scene,cam,root,pelvis,torso,arms,legs,body,M,barbell,dbs,props,yaw:.7,pitch:.22,target:new THREE.Vector3(0,.85,0),dist:4.2};
  setupDrag(canvas);
}

// rotești corpul trăgând cu degetul
function setupDrag(cv){
  let x0=null,y0=0,yaw0=0,p0=0;
  cv.addEventListener("pointerdown",e=>{x0=e.clientX;y0=e.clientY;yaw0=G.yaw;p0=G.pitch;cv.setPointerCapture(e.pointerId)});
  cv.addEventListener("pointermove",e=>{if(x0===null)return;G.yaw=yaw0-(e.clientX-x0)*.01;G.pitch=Math.max(-.05,Math.min(.9,p0+(e.clientY-y0)*.005));draw.dirty=true});
  const up=e=>{if(x0!==null&&e&&Math.abs(e.clientX-x0)<6&&Math.abs(e.clientY-y0)<6)demo();x0=null};cv.addEventListener("pointerup",up);cv.addEventListener("pointercancel",up);
}

// ── aplicarea unei poze ──
let tmp=null;
function vec(a,side){const T=G.THREE;return new T.Vector3(a[0]*side,a[1],a[2]).normalize()}
function quatTo(base,dir){return new G.THREE.Quaternion().setFromUnitVectors(base,dir)}
function mixArr(a,b,t){return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]}
function full(p){ // completează o poză cu valorile implicite, pe ambele părți
  const o={torso:p.torso||ST.torso};
  for(const k of ["R","L"]){
    o["ua"+k]=p["ua"+k]||p.ua||ST.ua;o["fa"+k]=p["fa"+k]||p.fa||ST.fa;
    o["th"+k]=p["th"+k]||p.th||ST.th;o["sh"+k]=p["sh"+k]||p.sh||ST.sh;
  }
  return o;
}
function mixPose(A,B,t){const o={};for(const k in A)o[k]=mixArr(A[k],B[k],t);return o}
function mirror(p){const o={torso:p.torso};for(const k of ["ua","fa","th","sh"]){o[k+"R"]=p[k+"L"];o[k+"L"]=p[k+"R"]}return o}

const ORIENT={
  stand:{pos:[0,.95,0],target:[0,.82,0],dist:4.1,yaw:.75},
  lie:{pos:[0,.56,.28],target:[0,.55,-.05],dist:3.6,yaw:1.15},
  incline:{pos:[0,.56,.3],target:[0,.7,0],dist:3.7,yaw:1.05},
  seat:{pos:[0,.56,0],target:[0,.85,0],dist:3.9,yaw:.7}
};
function applyPose(p,an){
  const T=G.THREE,DOWN=new T.Vector3(0,-1,0),UP=new T.Vector3(0,1,0);
  const tq=quatTo(UP,vec(p.torso,1));G.torso.quaternion.copy(tq);
  const inv=tq.clone().invert();
  for(const [k,s] of [["R",-1],["L",1]]){
    const qa=quatTo(DOWN,vec(p["ua"+k],s)),qf=quatTo(DOWN,vec(p["fa"+k],s));
    G.arms[k].ua.quaternion.copy(an.rel?qa:inv.clone().multiply(qa));
    G.arms[k].el.quaternion.copy(qa.clone().invert().multiply(qf));
    const qt=quatTo(DOWN,vec(p["th"+k],s)),qs=quatTo(DOWN,vec(p["sh"+k],s));
    G.legs[k].hip.quaternion.copy(qt);
    G.legs[k].kn.quaternion.copy(qt.clone().invert().multiply(qs));
  }
}
const wpos=(obj,y=0)=>obj.localToWorld(new G.THREE.Vector3(0,y,0));
const handPos=k=>wpos(G.arms[k].el,-.29);
const anklePos=k=>wpos(G.legs[k].an,0);

// ── recuzita (bancă, paralele) ──
function buildProps(an){
  const T=G.THREE,P=G.props,M=G.M;
  while(P.children.length)P.remove(P.children[0]);
  const box=(w,h,d,x,y,z,mat,rx=0)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.rotation.x=rx;P.add(m);return m};
  const legsUnder=(x,z,top)=>{box(.04,top,.04,x-.11,top/2,z,M.frame);box(.04,top,.04,x+.11,top/2,z,M.frame)};
  if(an.o==="lie"){box(.3,.07,1.1,0,.435,-.18,M.pad);legsUnder(0,.25,.4);legsUnder(0,-.62,.4)}
  if(an.o==="incline"){box(.3,.07,.42,0,.435,.38,M.pad);const L=.78,a=Math.PI/6;box(.3,.07,L,0,.47+Math.sin(a)*L/2-.02,.2-Math.cos(a)*L/2,M.pad,a);legsUnder(0,.5,.4);legsUnder(0,-.35,.4)}
  if(an.o==="seat"){box(.36,.07,.36,0,.435,0,M.pad);box(.32,.62,.06,0,.78,-.21,M.pad);legsUnder(0,.12,.4);legsUnder(0,-.14,.4)}
  if(an.props==="bars"){for(const s of [-1,1]){const x=s*G.barX;const b=new T.Mesh(new T.CylinderGeometry(.02,.02,.75,12),M.metal);b.rotation.x=Math.PI/2;b.position.set(x,an.barY,0);P.add(b);
    box(.035,an.barY,.035,x,an.barY/2,.33,M.frame);box(.035,an.barY,.035,x,an.barY/2,-.33,M.frame)}}
  if(an.props==="rowbench"){const h=G.benchHand;const top=h.y-.04;box(.32,.07,.95,h.x+.02,top-.035,h.z+.25,M.pad);legsUnder(h.x+.02,h.z-.12,top-.07);legsUnder(h.x+.02,h.z+.62,top-.07)}
}

// ── exercițiul curent în scenă ──
let cur=null;   // {an,A,B,cycle,phase,rep,mir,pinTarget}
function setExercise(key){
  if(!G)return;
  const an=AN[key]||AN.curl,o=ORIENT[an.o];
  const A=full(an.A),B=full(an.B);
  cur={key,an,A,B,cycle:an.t.reduce((a,b)=>a+b,0),phase:0,rep:0,mir:false};
  G.root.position.set(...o.pos);G.target.set(...o.target);G.dist=o.dist;G.yaw=o.yaw;G.pitch=.22;
  // calibrare: unde stau mâinile/gleznele în poza A
  applyPose(A,an);G.root.updateMatrixWorld(true);
  if(an.pin==="feet"){const y=Math.min(anklePos("R").y,anklePos("L").y);G.root.position.y+=.075-y}
  G.root.updateMatrixWorld(true);
  if(an.props==="bars"){const h=handPos("R");G.barX=Math.abs(h.x)}
  if(an.props==="rowbench")G.benchHand=handPos("L");
  if(an.pin==="ankleL"){cur.pinT={L:anklePos("L"),R:anklePos("R")}}
  for(const m of Object.values(G.body.meshes).flat())m.material=G.M.body;
  const mu=MUS[key]||{p:[],s:[]};
  for(const h of mu.s)for(const m of G.body.meshes[h]||[])m.material=G.M.sec;
  for(const h of mu.p)for(const m of G.body.meshes[h]||[])m.material=G.M.hot;
  buildProps(an);
  G.barbell.visible=an.eq==="bb"||an.eq==="bbBack";
  G.dbs.R.visible=an.eq==="db2"||an.eq==="dbR";G.dbs.L.visible=an.eq==="db2";G.dbs.C.visible=an.eq==="db1";
  draw.dirty=true;
}
const ease=t=>.5-.5*Math.cos(Math.PI*Math.min(1,Math.max(0,t)));
function blendAt(ph){
  const [t1,hB,t2]=cur.an.t;
  if(ph<t1)return ease(ph/t1);
  if(ph<t1+hB)return 1;
  if(ph<t1+hB+t2)return 1-ease((ph-t1-hB)/t2);
  return 0;
}
function poseNow(){
  const an=cur.an;let A=cur.A,B=cur.B;
  if(cur.mir){A=mirror(A);B=mirror(B)}
  const p=mixPose(A,B,blendAt(cur.phase));
  if(an.alt==="arms"){ // brațele lucrează pe rând
    const q=mixPose(A,B,blendAt((cur.phase+cur.cycle/2)%cur.cycle));
    p.uaL=q.uaL;p.faL=q.faL;
    if(!anim.on){p.uaL=A.uaL;p.faL=A.faL}
  }
  return p;
}
function place(){
  const an=cur.an,T=G.THREE,o=ORIENT[an.o];
  const p=poseNow();
  G.root.position.set(o.pos[0],G.root.position.y,o.pos[2]);
  applyPose(p,an);G.root.updateMatrixWorld(true);
  if(an.pin==="feet"){const y=Math.min(anklePos("R").y,anklePos("L").y);G.root.position.y+=.075-y}
  else if(an.pin==="hands"){const y=(handPos("R").y+handPos("L").y)/2;G.root.position.y+=an.barY-y}
  else if(an.pin==="ankleL"&&cur.pinT){const k=cur.mir?"R":"L",now=anklePos(k),t=cur.pinT[k];G.root.position.add(t.clone().sub(now))}
  else if(!an.pin)G.root.position.y=o.pos[1];
  G.root.updateMatrixWorld(true);
  const hR=handPos("R"),hL=handPos("L");
  if(G.barbell.visible){
    if(an.eq==="bbBack"){const n=wpos(G.torso,.47),bk=new T.Vector3(0,0,-.12).applyQuaternion(G.torso.quaternion);G.barbell.position.copy(n.add(bk));}
    else G.barbell.position.copy(hR.clone().add(hL).multiplyScalar(.5));
    G.barbell.quaternion.identity();
  }
  const orient=(db,k,pos)=>{
    db.position.copy(pos);
    const X=new T.Vector3(1,0,0);let axis;
    const fa=wpos(G.arms[k].el,-.29).sub(wpos(G.arms[k].el,0)).normalize();
    if(an.ax==="z")axis=new T.Vector3(0,0,1);
    else if(an.ax==="y")axis=new T.Vector3(0,1,0);
    else if(an.ax==="arm")axis=fa;
    else if(an.ax==="sag"){axis=new T.Vector3().crossVectors(fa,X);if(axis.lengthSq()<1e-4)axis.set(0,0,1);axis.normalize()}
    else axis=X;
    db.quaternion.setFromUnitVectors(X,axis);
  };
  if(G.dbs.R.visible)orient(G.dbs.R,"R",hR);
  if(G.dbs.L.visible)orient(G.dbs.L,"L",hL);
  if(G.dbs.C.visible)orient(G.dbs.C,"R",hR.clone().add(hL).multiplyScalar(.5));
}
// bucla de animație: rulează doar cât pagina Sport e deschisă
const anim={on:false,raf:0,last:0};
function draw(ts){
  anim.raf=requestAnimationFrame(draw);
  if(!G||!cur)return;
  const dt=Math.min(.05,((ts||0)-(anim.last||ts||0))/1000);anim.last=ts;
  if(anim.on){
    cur.phase+=dt;
    if(cur.phase>=cur.cycle){cur.phase-=cur.cycle;cur.rep++;if(cur.an.alt==="legs")cur.mir=!cur.mir;onRep()}
  }else{cur.phase=0}
  place();
  // cameră
  const T=G.THREE,c=G.cam,t=G.target;
  const breathe=anim.on?0:Math.sin((ts||0)/900)*.004;
  c.position.set(t.x+G.dist*Math.cos(G.pitch)*Math.sin(G.yaw),t.y+G.dist*Math.sin(G.pitch)+breathe,t.z+G.dist*Math.cos(G.pitch)*Math.cos(G.yaw));
  c.lookAt(t);
  G.renderer.render(G.scene,c);
}
function resize(){
  if(!G)return;const cv=G.renderer.domElement,w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;
  G.renderer.setSize(w,h,false);G.cam.aspect=w/h;G.cam.updateProjectionMatrix();
}
function startLoop(){if(!anim.raf){anim.last=0;anim.raf=requestAnimationFrame(draw)}}
function stopLoop(){cancelAnimationFrame(anim.raf);anim.raf=0}

// ── sesiunea de antrenament ──
const sess={state:"idle",ex:0,set:0,start:0,paused:0,pauseAt:0,restEnd:0,setStart:0,done:{}};
let tick=0,wl=null;
const now=()=>Date.now();
const elapsed=()=>sess.start?Math.max(0,(sess.pauseAt||now())-sess.start-sess.paused):0;
const day=()=>PLAN[sel];
const exNow=()=>day().ex[sess.state==="idle"?exSel:sess.ex];
let sel=(new Date().getDay()+6)%7,exSel=0;
function onRep(){if(sess.state==="set")renderLive()}
async function wakeOn(){try{wl=await navigator.wakeLock.request("screen")}catch(e){wl=null}}
function wakeOff(){try{wl&&wl.release()}catch(e){}wl=null}

function startWorkout(){
  try{audioUnlock()}catch(e){}
  Object.assign(sess,{state:"set",ex:0,set:0,start:now(),paused:0,pauseAt:0,done:{}});
  beginSet();wakeOn();window.Music&&Music.workout(true);
  clearInterval(tick);tick=setInterval(renderLive,250);
}
function beginSet(){
  sess.state="set";sess.setStart=now();
  setExercise(day().ex[sess.ex].a);anim.on=true;cur.rep=0;cur.phase=0;
  render();
}
function setDone(){
  const e=day().ex[sess.ex];
  sess.done[sess.ex+"-"+sess.set]=1;
  const lastSet=sess.set>=e.sets-1,lastEx=sess.ex>=day().ex.length-1;
  if(lastSet&&lastEx){finish();return}
  sess.state="rest";anim.on=false;
  sess.restEnd=now()+e.rest*1000;
  if(lastSet){sess.ex++;sess.set=0}else sess.set++;
  setExercise(day().ex[sess.ex].a);   // în pauză vezi deja exercițiul care urmează
  render();
}
function finish(){
  sess.state="done";anim.on=false;clearInterval(tick);wakeOff();window.Music&&Music.workout(false);
  const dur=Math.round(elapsed()/1000);
  S.wlog=S.wlog||{};S.wlog[dk()]={d:sel,dur};save();
  try{bell(.4);setTimeout(()=>bell(.3),2600)}catch(e){}
  try{autoDone("sport")}catch(e){}
  if(navigator.vibrate)navigator.vibrate([60,40,60]);
  render();
}
function stopWorkout(){
  if(sess.state!=="done"&&!confirm("Oprești antrenamentul?"))return;
  Object.assign(sess,{state:"idle",start:0,pauseAt:0});anim.on=false;clearInterval(tick);wakeOff();window.Music&&Music.workout(false);
  setExercise(day().ex[exSel].a);render();
}
function togglePause(){
  if(sess.pauseAt){sess.paused+=now()-sess.pauseAt;if(sess.state==="rest")sess.restEnd+=now()-sess.pauseAt;sess.pauseAt=0;anim.on=sess.state==="set"}
  else{sess.pauseAt=now();anim.on=false}
  render();
}

// ── interfața ──
const $s=id=>document.getElementById(id);
const fmt=s=>{s=Math.max(0,Math.floor(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=String(s%60).padStart(2,"0");return h?`${h}:${String(m).padStart(2,"0")}:${x}`:`${m}:${x}`};
function weekDates(){const d=new Date();const off=(d.getDay()+6)%7;return DSH.map((_,i)=>{const x=new Date(d);x.setHours(12,0,0,0);x.setDate(d.getDate()-off+i);return dk(x)})}
const musTags=a=>{const m=MUS[a];if(!m)return"";return `<span class="sptags">${m.p.map(k=>`<i class="p">${MUS_RO[k]}</i>`).join("")}${m.s.map(k=>`<i>${MUS_RO[k]}</i>`).join("")}</span>`};
function render(){
  const D=day(),wd=weekDates(),ti=(new Date().getDay()+6)%7;
  $s("sp-kick").textContent=sel===ti?"Azi":D.d;
  $s("sp-title").textContent=`${D.d} · ${D.m}`;
  $s("sp-tag").textContent=D.tag||"";
  $s("sp-week").innerHTML=PLAN.map((p,i)=>`<button class="spd${i===sel?" on":""}${i===ti?" today":""}${(S.wlog||{})[wd[i]]?" done":""}" data-day="${i}"><b>${DSH[i]}</b><small>${p.m}</small></button>`).join("");
  $s("sp-list").innerHTML=D.ex.map((e,i)=>{
    const active=sess.state==="idle"?i===exSel:i===sess.ex;
    const dots=Array.from({length:e.sets},(_,j)=>`<i class="${sess.done[i+"-"+j]?"on":""}"></i>`).join("");
    return `<button class="spex${active?" on":""}" data-ex="${i}"><span class="spn">${i+1}</span><span class="spt"><b>${esc(e.n)}</b><small>${e.sets} × ${e.reps} · pauză ${e.rest} s</small><em>${esc(e.cue)}</em></span><span class="spdots">${dots}</span></button>`}).join("");
  renderLive(true);
}
function renderLive(full){
  const P=$s("sp-panel");if(!P)return;
  const D=day(),e=exNow();
  if(sess.state==="idle"){
    if(full!==true&&P.dataset.st==="idle")return;
    const est=Math.round(D.ex.reduce((a,x)=>a+x.sets*(45+x.rest),0)/60);
    P.dataset.st="idle";
    P.innerHTML=`<button class="spgo" id="sp-go"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg><span><b>Începe antrenamentul</b><small>${D.ex.length} exerciții · ~${est} min</small></span></button>`;
    $s("sp-hud").innerHTML=`<b>${esc(e.n)}</b><small>${e.sets} × ${e.reps}</small>${musTags(e.a)}`;
    return;
  }
  if(sess.state==="done"){
    if(P.dataset.st==="done")return;P.dataset.st="done";
    P.innerHTML=`<div class="spdone"><div class="spbig">✓</div><b>Antrenament complet</b><small>${fmt(elapsed()/1000)} · ${D.m}</small><button class="btn" id="sp-close">Gata</button></div>`;
    $s("sp-hud").innerHTML=`<b>Bravo!</b><small>${D.d} bifat</small>`;return;
  }
  const tot=fmt(elapsed()/1000),paused=!!sess.pauseAt;
  if(sess.state==="set"){
    const reps=cur?cur.rep:0;
    if(P.dataset.st!=="set"+sess.ex+"-"+sess.set+paused){
      P.dataset.st="set"+sess.ex+"-"+sess.set+paused;
      P.innerHTML=`<div class="splive">
        <div class="sprow"><small>Exercițiul ${sess.ex+1}/${D.ex.length} · Seria ${sess.set+1}/${e.sets}</small><span class="sptot" id="sp-tot"></span></div>
        <b class="spname">${esc(e.n)}</b>
        <div class="sprep"><span id="sp-rep">0</span><small>repetări<br>țintă ${e.reps}</small><span class="spst" id="sp-st"></span></div>
        <div class="spbtns"><button class="spic" id="sp-pause" aria-label="Pauză">${paused?'<svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg>':'<svg viewBox="0 0 24 24"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>'}</button>
        <button class="btn spok" id="sp-ok">✓ Serie gata</button><button class="spic" id="sp-stop" aria-label="Oprește"><svg viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg></button></div></div>`;
    }
    $s("sp-tot").textContent="⏱ "+tot;$s("sp-rep").textContent=reps;
    $s("sp-st").textContent=fmt((((sess.pauseAt||now())-sess.setStart))/1000);
    $s("sp-hud").innerHTML=`<b>${esc(e.n)}</b><small>Seria ${sess.set+1}/${e.sets} · rep ${reps}</small>`;
    return;
  }
  // pauză între serii
  const left=Math.max(0,(sess.restEnd-(sess.pauseAt||now()))/1000),R=day().ex[sess.ex],restTot=(sess.set===0?D.ex[sess.ex-1]:R).rest;
  if(P.dataset.st!=="rest"+sess.ex+"-"+sess.set+paused){
    P.dataset.st="rest"+sess.ex+"-"+sess.set+paused;
    P.innerHTML=`<div class="splive rest">
      <div class="sprow"><small>Pauză</small><span class="sptot" id="sp-tot"></span></div>
      <div class="sprest"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" class="trk"/><circle cx="50" cy="50" r="44" class="arc" id="sp-arc" stroke-dasharray="276.5"/></svg><span id="sp-left"></span></div>
      <small class="spnext">Urmează: <b>${esc(R.n)}</b> · seria ${sess.set+1}/${R.sets}</small>
      <div class="spbtns"><button class="btn ghost" id="sp-plus">+30 s</button><button class="btn" id="sp-skip">Începe acum</button></div></div>`;
  }
  $s("sp-tot").textContent="⏱ "+tot;$s("sp-left").textContent=fmt(Math.ceil(left));
  $s("sp-arc").style.strokeDashoffset=(276.5*(1-left/restTot)).toFixed(1);
  $s("sp-hud").innerHTML=`<b>Pauză ${fmt(Math.ceil(left))}</b><small>urmează ${esc(R.n)}</small>`;
  if(left<=0&&!paused){try{bell(.3)}catch(e){}if(navigator.vibrate)navigator.vibrate(120);beginSet()}
}

// ── evenimente ──
document.addEventListener("click",e=>{
  if(!e.target.closest("#v-sport"))return;
  const d=e.target.closest("[data-day]");
  if(d){if(sess.state!=="idle"&&sess.state!=="done"){toast("Termină sau oprește antrenamentul întâi");return}
    sess.state="idle";sess.done={};sel=+d.dataset.day;exSel=0;setExercise(day().ex[0].a);render();return}
  const x=e.target.closest("[data-ex]");
  if(x&&(sess.state==="idle"||sess.state==="done")){if(sess.state==="done"){sess.state="idle";sess.done={}}exSel=+x.dataset.ex;setExercise(day().ex[exSel].a);render();demo();return}
  if(e.target.closest("#sp-go")){startWorkout();return}
  if(e.target.closest("#sp-ok")){setDone();return}
  if(e.target.closest("#sp-pause")){togglePause();return}
  if(e.target.closest("#sp-stop")){stopWorkout();return}
  if(e.target.closest("#sp-skip")){sess.restEnd=now();renderLive();return}
  if(e.target.closest("#sp-plus")){sess.restEnd+=30000;renderLive();return}
  if(e.target.closest("#sp-close")){Object.assign(sess,{state:"idle",start:0,done:{}});render();return}
  if(e.target.closest("#sp-stage")&&sess.state==="idle"&&!e.target.closest("canvas"))demo();
});

// o demonstrație de 3 repetări când alegi un exercițiu (atingi corpul ca s-o repeți)
let demoT=0;
function demo(){
  if(!cur||sess.state!=="idle")return;
  clearTimeout(demoT);cur.phase=0;cur.rep=0;anim.on=true;
  demoT=setTimeout(()=>{if(sess.state==="idle")anim.on=false},cur.cycle*3000);
}
// ── pornire ──
let inited=false;
async function show(){
  S.habits&&S.habits.forEach(h=>{if(!h.k&&/mișcare|sport|antren/i.test(h.n))h.k="sport"});
  render();
  if(!inited){
    inited=true;
    try{
      const T=await loadThree();
      buildScene(T,$s("sp-cv"));
      new ResizeObserver(resize).observe($s("sp-stage"));resize();
      setExercise(exNow().a);$s("sp-load").hidden=true;
      // o demonstrație scurtă la prima deschidere
      demo();
    }catch(err){inited=false;$s("sp-load").textContent="Modelul 3D are nevoie de internet prima dată.";return}
  }
  resize();startLoop();
}
function hide(){stopLoop()}
document.addEventListener("visibilitychange",()=>{if(document.hidden)stopLoop();else if(!$s("v-sport").hidden&&G)startLoop()});
window.Sport={show,hide,PLAN};
})();
