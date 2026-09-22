// Native Canvas art: a projected icosahedron and an articulated sky dragon.
const dieButton=document.querySelector('.work-die'), dieCanvas=dieButton.querySelector('canvas'), dc=dieCanvas.getContext('2d');
const PHI=(1+Math.sqrt(5))/2;
const vertices=[[-1,PHI,0],[1,PHI,0],[-1,-PHI,0],[1,-PHI,0],[0,-1,PHI],[0,1,PHI],[0,-1,-PHI],[0,1,-PHI],[PHI,0,-1],[PHI,0,1],[-PHI,0,-1],[-PHI,0,1]].map(v=>v.map(n=>n/Math.sqrt(1+PHI*PHI)));
const sub=(a,b)=>a.map((v,i)=>v-b[i]);const dot=(a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0);const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];const unit=v=>{const n=Math.hypot(...v);return v.map(x=>x/n);};
const faces=[];const edge=4/(1+PHI*PHI);
for(let a=0;a<12;a++)for(let b=a+1;b<12;b++)for(let c=b+1;c<12;c++){if([sub(vertices[a],vertices[b]),sub(vertices[a],vertices[c]),sub(vertices[b],vertices[c])].every(v=>Math.abs(dot(v,v)-edge)<.001)){let f=[a,b,c];if(dot(cross(sub(vertices[b],vertices[a]),sub(vertices[c],vertices[a])),vertices[a])<0)f=[a,c,b];faces.push(f);}}
const dieMaterials={default:{base:[215,220,223],ink:'#11171a',edge:'#ffffff',design:'panel'},zelda:{base:[28,116,79],ink:'#ffedaf',edge:'#d9b858',design:'relic'},cyberpunk:{base:[74,22,110],ink:'#a3fff7',edge:'#f84dac',design:'circuit'},souls:{base:[63,48,40],ink:'#eed1a0',edge:'#b77f46',design:'engraved'}};
let diceFrame=0,dieVisible=true,rollStart=0,rolling=false,dieResult=20,landed=false,diePalette=dieMaterials.default;
function rollNumber(){let n;do{n=crypto.getRandomValues(new Uint32Array(1))[0];}while(n>=4294967280);return n%20+1;}
function rotation(v,x,y,z){let [a,b,c]=v;[a,c]=[a*Math.cos(y)+c*Math.sin(y),-a*Math.sin(y)+c*Math.cos(y)];[b,c]=[b*Math.cos(x)-c*Math.sin(x),b*Math.sin(x)+c*Math.cos(x)];return [a*Math.cos(z)-b*Math.sin(z),a*Math.sin(z)+b*Math.cos(z),c];}
function dieTarget(){const f=faces[dieResult-1];const n=unit(f.reduce((v,i)=>v.map((x,k)=>x+vertices[i][k]),[0,0,0]));return [Math.atan2(n[1],Math.hypot(n[0],n[2])),Math.atan2(-n[0],n[2]),.08];}
function drawDie(now){
 dc.clearRect(0,0,320,320);let [rx,ry,rz]=dieTarget();const t=rolling?Math.min(1,(now-rollStart)/1800):1;
 if(rolling){const remain=Math.pow(1-t,3);rx+=remain*Math.PI*5;ry+=remain*Math.PI*7;rz+=remain*Math.PI*2;}
 else if(!landed&&!paused&&!reducedMotion.matches){rx+=Math.sin(now/2500)*.12;ry+=Math.sin(now/3000)*.2;}
 const vv=vertices.map(v=>rotation(v,rx,ry,rz));const pp=vv.map(([x,y,z])=>[160+x*110*(3.8/(3.8-z)),158+y*110*(3.8/(3.8-z))]);
 dc.save();dc.translate(160,281);dc.scale(1,.16);const shadow=dc.createRadialGradient(0,0,0,0,0,95);shadow.addColorStop(0,'#0005');shadow.addColorStop(1,'#0000');dc.fillStyle=shadow;dc.beginPath();dc.arc(0,0,95,0,7);dc.fill();dc.restore();
 faces.map((f,i)=>({f,i,z:f.reduce((s,j)=>s+vv[j][2],0)/3})).sort((a,b)=>a.z-b.z).forEach(({f,i,z})=>{
 if(z<-.1)return;const points=f.map(j=>pp[j]);const center=[points.reduce((s,p)=>s+p[0],0)/3,points.reduce((s,p)=>s+p[1],0)/3];const light=.44+(z+1)*.33;
 dc.beginPath();points.forEach((p,j)=>j?dc.lineTo(...p):dc.moveTo(...p));dc.closePath();dc.fillStyle=`rgb(${diePalette.base.map(v=>Math.min(255,Math.round(v*light))).join(',')})`;dc.fill();dc.strokeStyle=diePalette.edge;dc.lineWidth=1.6;dc.stroke();
 dc.save();dc.beginPath();points.forEach((p,j)=>j?dc.lineTo(...p):dc.moveTo(...p));dc.closePath();dc.clip();
 dc.strokeStyle=diePalette.edge;dc.globalAlpha=.6;dc.lineWidth=1;
 if(diePalette.design==='relic'||diePalette.design==='engraved'){dc.beginPath();points.forEach((p,j)=>{const q=p.map((v,k)=>center[k]+(v-center[k])*.78);j?dc.lineTo(...q):dc.moveTo(...q);});dc.closePath();dc.stroke();}
 if(diePalette.design==='circuit'){points.forEach(p=>{dc.beginPath();dc.moveTo(p[0],p[1]);dc.lineTo((p[0]+center[0])/2,p[1]);dc.lineTo((p[0]+center[0])/2,(p[1]+center[1])/2);dc.stroke();});}
 if(diePalette.design==='engraved'){dc.beginPath();dc.moveTo(points[0][0],points[0][1]);dc.lineTo(center[0]-20,center[1]+14);dc.lineTo(center[0]-14,center[1]+28);dc.stroke();}
 dc.globalAlpha=1;dc.fillStyle=diePalette.ink;dc.textAlign='center';dc.textBaseline='middle';dc.font=`${diePalette.design==='panel'||diePalette.design==='circuit'?'700':'500'} ${Math.max(13,22+z*12)}px ${diePalette.design==='relic'||diePalette.design==='engraved'?'Georgia':'monospace'}`;dc.fillText(String(i+1),...center);dc.restore();
 });
 if(rolling&&t===1){rolling=false;landed=true;dieButton.querySelector('.dice-result').textContent=`${dieResult} / 20${dieResult===20?' · Critical success!':dieResult===1?' · Critical failure':' · Initiative rolled'}`;notify(`Baldur’s Gate 3 · Rolled ${dieResult} / 20`);}
 if((rolling||!landed)&&!paused&&!reducedMotion.matches&&dieVisible&&!document.hidden)diceFrame=requestAnimationFrame(drawDie);
}
function refreshDie(){cancelAnimationFrame(diceFrame);diePalette={...dieMaterials[world]};if(world==='default'&&mode==='dark')diePalette={base:[40,43,47],ink:'#fff',edge:'#aaa',design:'panel'};drawDie(performance.now());}
function playD20(){cancelAnimationFrame(diceFrame);dieResult=rollNumber();landed=false;rolling=true;rollStart=performance.now()-(paused||reducedMotion.matches?1800:0);dieButton.querySelector('.dice-result').textContent='Rolling…';drawDie(performance.now());}
new IntersectionObserver(entries=>{dieVisible=entries[0].isIntersecting;if(dieVisible)refreshDie();else cancelAnimationFrame(diceFrame);}).observe(dieButton);
new MutationObserver(refreshDie).observe(document.body,{attributes:true,attributeFilter:['data-world','data-mode','class']});

const ray=document.createElement('button');ray.className='sky-ray drawn-ray';ray.hidden=true;ray.setAttribute('aria-label','Mega evolve Rayquaza');ray.innerHTML='<img class="ray-art" alt="Rayquaza" src="https://img.pokemondb.net/artwork/vector/large/rayquaza.png"><span>Click to Mega Evolve</span>';const rayHabitat=document.querySelector('.more-work');rayHabitat.append(ray);
const megaArt=new Image();megaArt.src='https://img.pokemondb.net/artwork/vector/rayquaza-mega.png';let rayFrame=0,rayPhase='idle',rayStart=0,phaseStart=0,lastTime=0,travel=0,hovering=false,origin={x:0,y:0},pos={x:0,y:0};
function resetRay(){cancelAnimationFrame(rayFrame);ray.hidden=true;rayPhase='idle';ray.className='sky-ray drawn-ray';}
function summonRayquaza(){resetRay();ray.hidden=false;ray.disabled=false;rayPhase='flying';rayStart=lastTime=performance.now();travel=0;hovering=false;ray.querySelector('span').textContent='Click to Mega Evolve';ray.querySelector('img').src='https://img.pokemondb.net/artwork/vector/large/rayquaza.png';ray.querySelector('img').alt='Rayquaza';pos={x:8,y:100};rayTick(rayStart);}
function rayTick(now){
 if(rayPhase==='idle')return;const still=paused||reducedMotion.matches,dt=Math.min(50,now-lastTime);lastTime=now;if(!hovering&&!still)travel+=dt;
 const width=ray.offsetWidth,height=ray.offsetHeight,habitatWidth=rayHabitat.clientWidth,habitatHeight=rayHabitat.clientHeight,roomX=Math.max(0,habitatWidth-width-16),roomY=Math.max(0,habitatHeight-height-160);
 if(rayPhase==='flying'){pos={x:8+roomX*(.5-.4*Math.cos(travel/4200)),y:85+roomY*(.4+.28*Math.sin(travel/3400))};}
 else{
 const age=now-phaseStart,progress=still?1:Math.min(1,age/1000),ease=progress*progress*(3-2*progress);const bounds=rayHabitat.getBoundingClientRect();const center={x:(habitatWidth-width)/2,y:Math.max(80,Math.min(habitatHeight-height,(innerHeight-height)/2-bounds.top))};pos={x:origin.x+(center.x-origin.x)*ease,y:origin.y+(center.y-origin.y)*ease};
 if(age>(still?0:1100)&&rayPhase==='evolving'){rayPhase='mega';ray.classList.add('mega');ray.querySelector('span').textContent='Mega Rayquaza';ray.querySelector('img').src=megaArt.src;ray.querySelector('img').alt='Mega Rayquaza';notify('Rayquaza Mega Evolved!');}
 if(age>(still?1600:3000)){const out=(age-(still?1600:3000))/1300;pos.x+=out*out*(habitatWidth+width);pos.y-=out*out*habitatHeight*.5;if(out>=1){resetRay();return;}}
 }
 ray.style.left='0';ray.style.top='0';ray.style.transform=`translate3d(${pos.x}px,${pos.y}px,0)`;ray.querySelector('img').style.transform=still?'none':`translateY(${Math.sin(now/700)*5}px) rotate(${Math.sin(now/1300)*7}deg)`;
 if(!document.hidden)rayFrame=requestAnimationFrame(rayTick);
}
ray.addEventListener('mouseenter',()=>hovering=true);ray.addEventListener('mouseleave',()=>hovering=false);ray.addEventListener('focus',()=>hovering=true);ray.addEventListener('blur',()=>hovering=false);
ray.addEventListener('click',()=>{if(rayPhase!=='flying')return;if(!megaArt.complete||!megaArt.naturalWidth){notify('Mega artwork is loading. Try again shortly.');return;}origin={...pos};phaseStart=performance.now();rayPhase='evolving';ray.disabled=true;ray.classList.add('evolving');ray.querySelector('span').textContent='Mega Evolution';});
$('#motion-toggle').addEventListener('click',()=>{if(paused)resetRay();refreshDie();});reducedMotion.addEventListener('change',()=>{resetRay();refreshDie();});document.addEventListener('keydown',e=>{if(e.key==='Escape')resetRay();});document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(rayFrame);cancelAnimationFrame(diceFrame);if(!document.hidden){lastTime=performance.now();if(rayPhase!=='idle')rayTick(lastTime);refreshDie();}});
for(const path of ['assets/ray-gun.png','assets/mystery-box.png']){const img=new Image();img.src=path;}
refreshDie();

let habitatSeen=false;new IntersectionObserver(entries=>{const visible=entries[0].isIntersecting;if(visible&&!habitatSeen){habitatSeen=true;summonRayquaza();}if(!visible){cancelAnimationFrame(rayFrame);}else if(rayPhase!=="idle"){cancelAnimationFrame(rayFrame);lastTime=performance.now();rayTick(lastTime);}}, {threshold:.05}).observe(rayHabitat);

ray.querySelector('img').addEventListener('error',()=>{resetRay();notify('Character artwork could not load. Please try again when connected.');});
