// IMPERIUM — corpul anatomic 3D (plasă MakeHuman CC0, sculptată pentru definiție musculară)
(function(){
const SKIN={skin:{c:0x9e5f45,sh:0x6a1e0c},clay:{c:0x9a9a9e,sh:0x303034}};
async function load(THREE,base,opts={}){
  const [meta,buf]=await Promise.all([fetch(base+".json").then(r=>r.json()),fetch(base+".bin").then(r=>r.arrayBuffer())]);
  const A=meta.a,T={uint16:Uint16Array,int8:Int8Array,uint8:Uint8Array,uint32:Uint32Array};
  const arr=k=>new T[A[k].t](buf,A[k].o,A[k].n);
  const g=new THREE.BufferGeometry();
  // poziții: uint16 cuantizate -> metri
  const q=arr("pos"),pos=new Float32Array(q.length);
  for(let i=0;i<q.length;i+=3)for(let j=0;j<3;j++)pos[i+j]=meta.lo[j]+q[i+j]*meta.sc;
  g.setAttribute("position",new THREE.BufferAttribute(pos,3));
  g.setAttribute("normal",new THREE.InterleavedBufferAttribute(new THREE.InterleavedBuffer(arr("nor"),4),3,0,true));
  g.setAttribute("uv",new THREE.BufferAttribute(arr("uv"),2,true));
  if(A.si){g.setAttribute("skinIndex",new THREE.BufferAttribute(arr("si"),4));g.setAttribute("skinWeight",new THREE.BufferAttribute(arr("sw"),4,true))}
  if(A.mus)g.setAttribute("mus",new THREE.BufferAttribute(arr("mus"),4));
  if(A.col)g.setAttribute("col",new THREE.BufferAttribute(arr("col"),4,true));
  g.setIndex(new THREE.BufferAttribute(arr("idx"),1));
  g.computeBoundingSphere();
  const mode=SKIN[opts.mode]||SKIN.skin;
  const mat=new THREE.MeshPhysicalMaterial({color:mode.c,roughness:.48,metalness:0,envMapIntensity:.3,sheen:.35,sheenRoughness:.55,sheenColor:new THREE.Color(mode.sh),
    clearcoat:.12,clearcoatRoughness:.45,specularIntensity:.55});
  const tl=u=>new Promise(res=>new THREE.TextureLoader().load(u,res,undefined,()=>res(null)));
  const [nm,det]=await Promise.all([tl(base+"_nrm.jpg"),tl(base+"_det.jpg")]);
  if(nm){nm.anisotropy=4;mat.normalMap=nm;mat.normalScale=new THREE.Vector2(opts.ns||1,opts.ns||1)}
  const heat=new Float32Array(24);
  const det0=det||new THREE.DataTexture(new Uint8Array([0,0,0,255]),1,1);det0.needsUpdate=true;
  mat.defines={USE_UV:""};
  const U={detail:{value:det0},heat:{value:heat},hotCol:{value:new THREE.Color(0xd4160c)},secCol:{value:new THREE.Color(0xc0503e)},clay:{value:opts.mode==="clay"?1:0}};
  mat.onBeforeCompile=sh=>{
    Object.assign(sh.uniforms,U);
    sh.vertexShader=sh.vertexShader.replace("#include <common>",`#include <common>
attribute vec4 mus;attribute vec4 col;uniform float heat[24];varying vec4 vCol;varying float vHeat;`)
      .replace("#include <begin_vertex>",`#include <begin_vertex>
vCol=col;int mi=int(mus.x+.5);float hv=0.;for(int i=0;i<24;i++){if(i==mi)hv=heat[i];}vHeat=hv*mus.y/255.;`);
    sh.fragmentShader=sh.fragmentShader.replace("#include <common>",`#include <common>
uniform sampler2D detail;uniform vec3 hotCol;uniform vec3 secCol;uniform float clay;varying vec4 vCol;varying float vHeat;`)
      .replace("#include <color_fragment>",`#include <color_fragment>
float ao=mix(.42,1.,vCol.r);
vec4 dt=texture2D(detail,vUv);float brief=smoothstep(.35,.65,dt.g);float cav=dt.b;
ao*=1.-.45*cav;
vec3 sk=diffuseColor.rgb;
sk=mix(sk,sk*vec3(1.06,.86,.82),vCol.g*(1.-clay));              // roșeață (coate, genunchi, mâini, față)
float hh=clamp(abs(vHeat),0.,1.);
vec3 hc=vHeat>0.?hotCol:secCol;
sk=mix(sk,hc,hh*.9);
sk=mix(sk,vec3(.03,.03,.035),brief);                          // slip
diffuseColor.rgb=sk*ao;`)
      .replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
roughnessFactor=mix(roughnessFactor,.85,smoothstep(.35,.65,texture2D(detail,vUv).g));`)
      .replace("#include <lights_physical_fragment>",`#include <lights_physical_fragment>
{float bf=smoothstep(.35,.65,texture2D(detail,vUv).g);material.sheenColor*=1.-bf;material.clearcoat*=1.-bf;}`)
      .replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
totalEmissiveRadiance+=hc*hh*.22;`);
  };
  mat.customProgramCacheKey=()=>"imperium-body";
  const mesh=opts.skinned?new THREE.SkinnedMesh(g,mat):new THREE.Mesh(g,mat);
  mesh.frustumCulled=false;
  return {mesh,geo:g,mat,meta,heat,
    setHeat(o){heat.fill(0);for(const k in o)heat[meta.mus?meta.mus.indexOf(k):+k]=o[k];},
    setMode(m){const s=SKIN[m]||SKIN.skin;mat.color.setHex(s.c);mat.sheenColor.setHex(s.sh);U.clay.value=m==="clay"?1:0}};
}
function lights(THREE,scene,renderer){
  const L=new THREE.Group();scene.add(L);
  L.add(new THREE.HemisphereLight(0xfff0e6,0x141416,.28));
  const key=new THREE.DirectionalLight(0xffeee0,1.7);key.position.set(-1.6,3.4,2.0);L.add(key);
  const fill=new THREE.DirectionalLight(0xe4ecff,.35);fill.position.set(2.6,.9,2.4);L.add(fill);
  const rim=new THREE.DirectionalLight(0xffffff,1.3);rim.position.set(2.6,2.2,-2.2);L.add(rim);
  const rim2=new THREE.DirectionalLight(0xfff0e6,.8);rim2.position.set(-2.8,1.4,-2.0);L.add(rim2);
  if(renderer){  // reflexii de studio (softbox-uri)
    const es=new THREE.Scene();es.background=new THREE.Color(0x0c0c0e);
    const box=(w,h,x,y,z,c)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);es.add(m)};
    box(3,3,-4,6,4,0xfff1e4);box(2,4,6,2,-4,0xffffff);box(2,4,-6,1,-3,0x908880);
    const pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromScene(es,.04).texture;pm.dispose();
  }
  return {key,fill,rim,rim2,group:L};
}
window.BodyLib={load,lights};
})();
