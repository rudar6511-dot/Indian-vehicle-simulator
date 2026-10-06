import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const scene=new THREE.Scene();
scene.fog=new THREE.Fog(0x9cc9df,180,950);
const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,1600);
camera.position.set(0,9,18);
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const hemi=new THREE.HemisphereLight(0xcfeaff,0x31533a,1.7); scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffffff,2.2); sun.position.set(120,180,80); sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.left=-350; sun.shadow.camera.right=350; sun.shadow.camera.top=350; sun.shadow.camera.bottom=-350; scene.add(sun);

const world=new THREE.Group(); scene.add(world);
const roads=new THREE.Group(), buildings=new THREE.Group(), actors=new THREE.Group(), vehicles=new THREE.Group();
world.add(roads,buildings,actors,vehicles);

const mat=(c,m=0.8)=>new THREE.MeshStandardMaterial({color:c,roughness:m});
const box=(x,y,z,c)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(x,y,z),mat(c));o.castShadow=o.receiveShadow=true;return o};
const cyl=(r,h,c)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,12),mat(c));o.castShadow=o.receiveShadow=true;return o};

function road(x,z,w,d){
 const r=box(w,.08,d,0x30343a);r.position.set(x,.02,z);roads.add(r);
 const n=Math.max(2,Math.floor(Math.max(w,d)/10));
 for(let i=0;i<n;i++){const line=box(w>d?.3:0.3,.04,w>d?3:3,0xf2d35e); if(w>d){line.position.set(x-w/2+6+i*(w-12)/(n-1),.1,z)}else{line.position.set(x,.1,z-d/2+6+i*(d-12)/(n-1));line.rotation.y=Math.PI/2} roads.add(line)}
}
road(0,0,34,900); road(0,0,900,34);
[-150,150].forEach(v=>{road(v,0,24,900);road(0,v,900,24)});
[-300,-100,100,300].forEach(v=>{road(v,v,18,650);road(v,-v,18,650)});

const ground=box(1000,.3,1000,0x4b8050);ground.position.y=-.2;world.add(ground);
const sea=box(1000,.6,1000,0x187da3);sea.position.set(0,-.55,0); // visual base
// coastline ring: city sits on an island surrounded by sea beyond the outer roads
const sea2=new THREE.Mesh(new THREE.PlaneGeometry(1800,1800),new THREE.MeshStandardMaterial({color:0x177fa5,roughness:.35}));
sea2.rotation.x=-Math.PI/2;sea2.position.y=-.05;scene.add(sea2);
const island=box(720,.5,720,0x4b8050);island.position.y=-.15;scene.add(island);

function building(x,z,h,w,d,c){
 const b=box(w,h,d,c);b.position.set(x,h/2,z);buildings.add(b);
 const roof=box(w+.4,.35,d+.4,0x55565b);roof.position.set(x,h+.18,z);buildings.add(roof);
 for(let yy=4;yy<h-2;yy+=4) for(let xx=-w/2+2;xx<w/2-1;xx+=4){
   const win=box(1.5,1.2,.08,0xbbe7ee);win.position.set(x+xx,yy,z-d/2-.05);buildings.add(win);
 }
}
for(let x=-320;x<=320;x+=55) for(let z=-320;z<=320;z+=55){
 if(Math.abs(x)<75||Math.abs(z)<75) continue;
 building(x+(Math.random()*10-5),z+(Math.random()*10-5),12+Math.random()*55,25+Math.random()*18,25+Math.random()*18,[0xc9b59a,0xd7d7d7,0xb7c3c8,0xe0c08b][Math.floor(Math.random()*4)]);
}

function tree(x,z){
 const t=cyl(1.2,5,0x76502f);t.position.set(x,2.5,z);world.add(t);
 const crown=new THREE.Mesh(new THREE.SphereGeometry(4.2,12,10),mat(0x27733d));crown.position.set(x,7,z);crown.castShadow=true;world.add(crown);
}
for(let i=0;i<120;i++){const x=(Math.random()-.5)*650,z=(Math.random()-.5)*650;if(Math.abs(x)<70&&Math.abs(z)<70)continue;tree(x,z)}

function human(name,x,z,shirt){
 const g=new THREE.Group();g.name=name;
 const skin=mat(0x9b603f), cloth=mat(shirt), dark=mat(0x20242a);
 const torso=box(1.25,2,0.75,cloth);torso.position.y=3.2;g.add(torso);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.62,16,12),skin);head.position.y=4.75;head.castShadow=true;g.add(head);
 const hair=new THREE.Mesh(new THREE.SphereGeometry(.66,16,10,0,Math.PI*2,0,Math.PI*.48),dark);hair.position.y=5.0;g.add(hair);
 for(const s of [-1,1]){
  const arm=box(.34,1.8,.34,cloth);arm.position.set(s*.9,3.35,0);arm.userData.swing=s;g.add(arm);
  const leg=box(.42,1.9,.42,dark);leg.position.set(s*.34,1.45,0);leg.userData.swing=-s;g.add(leg);
 }
 g.position.set(x,0,z);actors.add(g);return g;
}
const colors=[0x2e6fce,0xd74b4b,0x2c9b65,0xe1a72f,0x7b4bb7,0xe46c2f,0x2c9da8,0xd65c9b];
const npcs=[]; for(let i=0;i<28;i++){const a=i/28*Math.PI*2,r=80+Math.random()*220;npcs.push({g:human("NPC-"+i,Math.cos(a)*r,Math.sin(a)*r,colors[i%colors.length]),a,r,speed:.7+Math.random()*.8});}

function car(color=0xe7e7e7,scale=1){
 const g=new THREE.Group();
 const body=box(2.3*scale,.8*scale,4.4*scale,color);body.position.y=1;g.add(body);
 const cabin=box(1.8*scale,.85*scale,2.2*scale,0x263a48);cabin.position.y=1.72*scale;cabin.position.z=-.1*scale;g.add(cabin);
 for(const x of [-1,1])for(const z of [-1.35,1.35]){const w=cyl(.43*scale,.3*scale,0x161616);w.rotation.z=Math.PI/2;w.position.set(x*1.2*scale,.55*scale,z*scale);g.add(w)}
 return g;
}
const playerCar=car(0xf1b52c,1.25);playerCar.position.set(0,0,18);vehicles.add(playerCar);
const traffic=[];
for(let i=0;i<18;i++){const v=car(colors[i%colors.length],.8);v.position.set((i%2?12:-12),(0),(i*37)%520-260);v.rotation.y=i%2?Math.PI/2:-Math.PI/2;vehicles.add(v);traffic.push({g:v,dir:i%2?1:-1});}

function tractor(x,z){
 const g=new THREE.Group(); const body=box(2.4,1.3,3.2,0x238c3d);body.position.y=1.2;g.add(body);
 const seat=box(1.2,1.1,1,0x222);seat.position.set(0,2,0);g.add(seat);
 const rear=cyl(.8,.6,0x171717);rear.rotation.z=Math.PI/2;rear.position.set(0,.8,-1.2);g.add(rear);
 const front=cyl(.45,.5,0x171717);front.rotation.z=Math.PI/2;front.position.set(0,.65,1.25);g.add(front);
 g.position.set(x,0,z);vehicles.add(g);return g;
}
for(let i=0;i<10;i++)tractor(-250+i*50, -120+(i%2)*35);

function airport(){
 const base=box(150,.5,100,0x7a7d80);base.position.set(420,.05,420);world.add(base);
 const terminal=box(55,10,25,0xd9d9d9);terminal.position.set(420,5,420);world.add(terminal);
 const runway=box(18,.2,190,0x34373b);runway.position.set(420,.4,420);world.add(runway);
 const helipad=cyl(18,.3,0x444);helipad.position.set(455,.5,420);world.add(helipad);
 const H=box(11,.05,2,0xffffff);H.position.set(455,.7,420);world.add(H);
 for(let z=345;z<500;z+=15){const mark=box(1,.05,8,0xffffff);mark.position.set(420,.6,z);world.add(mark)}
 const plane=aircraft(0xffffff);plane.position.set(420,3,365);plane.rotation.y=Math.PI/2;vehicles.add(plane);
 const heli=helicopter();heli.position.set(455,8,420);vehicles.add(heli);
}
function aircraft(c){
 const g=new THREE.Group();const fus=box(3,2,16,c);g.add(fus);
 const wing=box(28,.3,3,0xc9c9c9);wing.position.y=.1;g.add(wing);
 const tail=box(6,3,2,0xd0d0d0);tail.position.set(0,1.8,-6);g.add(tail);return g;
}
function helicopter(){const g=new THREE.Group();g.add(box(4,2,7,0x334d61));const rotor=box(14,.15,.35,0x222);rotor.position.y=2.2;g.add(rotor);return g}
airport();

const player=human("Player",0,10,0xd64545);player.visible=true;
let driving=true,weather="clear",night=false;
const keys={};addEventListener("keydown",e=>{keys[e.key.toLowerCase()]=true;if(e.key.toLowerCase()==="e")driving=!driving;if(e.key.toLowerCase()==="r"){playerCar.position.set(0,0,18);player.position.set(0,0,10)}if(e.key.toLowerCase()==="n")setNight();if(e.key.toLowerCase()==="t")cycleWeather()});
addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);
function setNight(){night=!night;sun.intensity=night?.35:2.2;hemi.intensity=night?.45:1.7;scene.background=new THREE.Color(night?0x08101f:0x9cc9df);scene.fog.color=new THREE.Color(night?0x10182a:0x9cc9df)}
function cycleWeather(){weather=weather==="clear"?"rain":weather==="rain"?"fog":"clear";scene.fog.near=weather==="fog"?30:180;scene.fog.far=weather==="fog"?280:950;show("Weather: "+weather)}
function show(t){const m=document.querySelector("#message");m.textContent=t;m.style.opacity=1;clearTimeout(show.t);show.t=setTimeout(()=>m.style.opacity=0,1600)}
function movePlayer(dt){
 const dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);
 const dz=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
 const len=Math.hypot(dx,dz)||1; const sp=driving?35:10;
 if(dx||dz){if(driving){playerCar.position.x+=dx/len*sp*dt;playerCar.position.z+=dz/len*sp*dt;playerCar.rotation.y=Math.atan2(dx,dz)}else{player.position.x+=dx/len*sp*dt;player.position.z+=dz/len*sp*dt;player.rotation.y=Math.atan2(dx,dz)}}
}
let last=performance.now();
function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.05);last=now;movePlayer(dt);
 traffic.forEach((v,i)=>{v.g.position.x+=v.dir*dt*8;if(Math.abs(v.g.position.x)>340)v.g.position.x=-v.g.position.x});
 npcs.forEach((n,i)=>{n.a+=n.speed*dt*.012;n.g.position.x=Math.cos(n.a)*n.r;n.g.position.z=Math.sin(n.a)*n.r;n.g.rotation.y=-n.a+Math.PI/2;n.g.children.forEach((c,j)=>{if(c.userData.swing)c.rotation.x=Math.sin(now*.008+n.a*3)*.45*c.userData.swing})});
 const target=driving?playerCar:player; const desired=new THREE.Vector3(target.position.x+12*Math.sin(target.rotation.y),8,target.position.z+12*Math.cos(target.rotation.y));camera.position.lerp(desired,.08);camera.lookAt(target.position.x,target.position.y+2,target.position.z);
 document.querySelector("#stats").textContent=`Vehicle: ${driving?"ON":"OFF"} · NPCs: ${npcs.length} · Weather: ${weather} · ${night?"Night":"Day"}`;
 renderer.render(scene,camera)}
scene.background=new THREE.Color(0x9cc9df);
document.querySelector("#loading").remove();show("3D city ready — airport, sea, NPCs, vehicles & weather loaded");
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
animate(performance.now());

// --- OPEN WORLD EXPANSION: original vehicle/aircraft categories, rain, harbour and airport link ---
const rainGroup=new THREE.Group(); scene.add(rainGroup);
const rainGeo=new THREE.BufferGeometry();
const rainCount=1400, rainPos=new Float32Array(rainCount*3);
for(let i=0;i<rainCount;i++){rainPos[i*3]=(Math.random()-.5)*900;rainPos[i*3+1]=Math.random()*180;rainPos[i*3+2]=(Math.random()-.5)*900;}
rainGeo.setAttribute("position",new THREE.BufferAttribute(rainPos,3));
const rainMat=new THREE.PointsMaterial({color:0xbfdcff,size:.7,transparent:true,opacity:.65});
const rain=new THREE.Points(rainGeo,rainMat); rain.visible=false; rainGroup.add(rain);

function bridgeToAirport(){
 const bridge=box(80,.8,18,0x55595e); bridge.position.set(380,.35,420); world.add(bridge);
 for(let x=345;x<420;x+=10){const rail=box(.25,2,18,0x34383d);rail.position.set(x,1.4,420);world.add(rail);}
}
bridgeToAirport();

function harbour(){
 const pier=box(120,1,28,0x75624b);pier.position.set(-360,.2,0);world.add(pier);
 for(let x=-405;x<=-315;x+=15){const post=cyl(.35,7,0x4b3828);post.position.set(x,3,-10);world.add(post);}
 const dockRoad=box(130,.15,8,0x30343a);dockRoad.position.set(-360,.85,0);world.add(dockRoad);
}
harbour();

function bike(x,z,c){
 const g=new THREE.Group();const frame=box(.35,.8,.35,c);frame.position.y=1.1;g.add(frame);
 for(const dz of [-1,1]){const w=cyl(.48,.16,0x171717);w.rotation.z=Math.PI/2;w.position.set(0,.55,dz*1.15);g.add(w);}
 g.position.set(x,0,z);vehicles.add(g);return g;
}
function bus(x,z,c){
 const g=new THREE.Group();const b=box(3,3,8,c);b.position.y=2;g.add(b);
 const roof=box(2.7,.15,7.5,0xdfe7ea);roof.position.y=3.55;g.add(roof);
 g.position.set(x,0,z);vehicles.add(g);return g;
}
function truck(x,z,c){
 const g=new THREE.Group();const body=box(3,2.4,5,c);body.position.y=1.8;g.add(body);
 const cab=box(3,2.5,2.4,0xe4e4e4);cab.position.set(0,2.2,2.7);g.add(cab);
 g.position.set(x,0,z);vehicles.add(g);return g;
}
for(let i=0;i<8;i++){bike(-280+i*18,90,colors[i%colors.length]);}
for(let i=0;i<6;i++){bus(-260+i*28,150,colors[(i+2)%colors.length]);}
for(let i=0;i<8;i++){truck(-300+i*35,-190,colors[(i+4)%colors.length]);}

const originalCycleWeather=cycleWeather;
cycleWeather=function(){
 originalCycleWeather();
 rain.visible=weather==="rain";
};
const originalAnimate=animate;
// rain movement is added through a lightweight frame listener
let rainLast=performance.now();
function rainTick(now){
 const dt=Math.min((now-rainLast)/1000,.05); rainLast=now;
 if(rain.visible){
  const p=rain.geometry.attributes.position.array;
  for(let i=0;i<rainCount;i++){p[i*3+1]-=95*dt;if(p[i*3+1]<0)p[i*3+1]=180;}
  rain.geometry.attributes.position.needsUpdate=true;
 }
 requestAnimationFrame(rainTick);
}
requestAnimationFrame(rainTick);
