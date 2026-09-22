// Transient, click-through discovery effects. The page remains interactive.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const scene = document.createElement('div');
scene.className = 'discovery-scene';
scene.setAttribute('aria-hidden', 'true');
scene.hidden=true;
const discoveryAnnouncement=document.createElement('span');
discoveryAnnouncement.className='discovery-announcement';
discoveryAnnouncement.setAttribute('role','status');
document.body.append(discoveryAnnouncement);
document.body.append(scene);
let sceneTimers = [];
const symbols = {
 zelda: `<svg class="triforce" viewBox="0 0 300 280" aria-hidden="true"><path class="tri tri-top" d="M150 30 90 134 210 134Z"/><path class="tri tri-left" d="M90 134 30 238 150 238Z"/><path class="tri tri-right" d="M210 134 150 238 270 238Z"/></svg>`,
 zombies: `<div class="zombie-art"><div class="energy-column"></div><img class="crate-sprite" src="assets/mystery-box.png" alt=""><img class="weapon-sprite" src="assets/ray-gun.png" alt=""></div>`,
 elden: `<div class="bonfire-mark" aria-hidden="true">✧</div>`,
 cyberpunk: `<div class="glitch-code" aria-hidden="true"><span>CONNECTION ESTABLISHED</span><span>2077 / NIGHT CITY</span><span>NEURAL LINK ONLINE</span></div>`,
 witcher: `<div class="coin-flight" aria-hidden="true"><div class="coin-spin"><div class="coin-face coin-front">✦<small>HEADS</small></div><div class="coin-face coin-back">☾<small>TAILS</small></div></div></div>`
};
function stopScene() {
 sceneTimers.forEach(clearTimeout);sceneTimers=[];
 scene.hidden=true;scene.replaceChildren();
}
function playDiscovery(key, trigger) {
 stopScene();
 discoveryAnnouncement.textContent="";
 if(key==='cyberpunk'){playPageGlitch();return;}
 if(key==='bg3'){clearPageGlitch();playD20();return;}
 if(key==='pokemon'){clearPageGlitch();summonRayquaza();return;}
 clearPageGlitch();
 const still=paused||reducedMotion.matches;
 const coinResult=crypto.getRandomValues(new Uint32Array(1))[0]%2===0?'Heads':'Tails';
 const titles={zelda:'TRIFORCE RESTORED',zombies:'YOU GOT THE RAY GUN',elden:'BONFIRE FOUND',cyberpunk:'WELCOME TO NIGHT CITY',witcher:`${coinResult.toUpperCase()}. FORTUNE HAS SPOKEN.`};
 const subtitles={zelda:'Power. Wisdom. Courage.',zombies:'A little luck from the mystery box.',elden:'Rest here, Tarnished.',cyberpunk:'You’re connected, choom.',witcher:'A coin for your curiosity.'};
 scene.className=`discovery-scene effect-${key}${still?' still':''}`;
 scene.innerHTML=`<div class="discovery-ripple"></div><div class="discovery-sparks" aria-hidden="true">${Array.from({length:16},(_,i)=>`<i style="--angle:${i*22.5}deg;--distance:${100+(i%4)*24}px;--delay:${(i%3)*.12}s"></i>`).join('')}</div><div class="scene-art">${symbols[key]}</div><div class="scene-caption"><h2 id="discovery-title"></h2><p></p></div>`;
 scene.querySelector('h2').textContent=titles[key];scene.querySelector('.scene-caption p').textContent=subtitles[key];
 if(key==='witcher')scene.style.setProperty('--coin-end',coinResult==='Heads'?'1800deg':'1980deg');
 scene.hidden=false;
 // Restart every CSS animation even when the same trigger is clicked rapidly.
 void scene.offsetWidth;
 scene.classList.add('playing');
 sceneTimers.push(setTimeout(()=>{discoveryAnnouncement.textContent=`${titles[key]} — ${subtitles[key]}`;},still?0:2500));
 sceneTimers.push(setTimeout(()=>scene.classList.add('departing'),still?1500:3800));
 sceneTimers.push(setTimeout(stopScene,still?1800:4500));
}
document.querySelectorAll('[data-secret]').forEach(button=>button.addEventListener('click',()=>playDiscovery(button.dataset.secret,button)));
reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches){scene.classList.add('still');document.body.classList.remove('screen-glitch');}});

let glitchTimer, glitchFrame, glitchNodes=[];
const rgbVeil=document.createElement('div');
rgbVeil.className='rgb-veil';rgbVeil.setAttribute('aria-hidden','true');document.body.append(rgbVeil);
function clearPageGlitch(){
 clearTimeout(glitchTimer);cancelAnimationFrame(glitchFrame);
 document.body.classList.remove('rgb-glitch','rgb-still');
 for(const {wrapper,original} of glitchNodes)wrapper.replaceWith(original);
 glitchNodes=[];
}
function playPageGlitch(){
 clearPageGlitch();
 const still=paused||reducedMotion.matches;
 // Keep original text nodes and reserve each word's width so weight changes cannot reflow it.
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{
  acceptNode(node){
   const parent=node.parentElement;
   if(!parent||!node.textContent.trim()||parent.closest('script,style,dialog,.discovery-scene,.discovery-announcement,.toast,.rgb-veil,svg'))return NodeFilter.FILTER_REJECT;
   const r=parent.getBoundingClientRect();
   return r.width&&r.height?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
  }
 });
 const candidates=[];while(walker.nextNode())candidates.push(walker.currentNode);
 let count=0;
 for(const original of candidates){
  const wrapper=document.createElement('span');wrapper.className='glitch-text-run';
  const value=original.textContent;let cursor=0,changed=false;
  for(const match of value.matchAll(/[\p{L}\p{N}’'-]+/gu)){
   const range=document.createRange();range.setStart(original,match.index);range.setEnd(original,match.index+match[0].length);
   const width=range.getBoundingClientRect().width;if(!width)continue;
   wrapper.append(document.createTextNode(value.slice(cursor,match.index)));
   const word=document.createElement('span');word.className=`rgb-word rgb-${count%3}`;
   word.textContent=match[0];word.style.width=`${width}px`;word.style.setProperty('--glitch-delay',`${(count%5)*-.22}s`);
   wrapper.append(word);cursor=match.index+match[0].length;changed=true;count++;
  }
  if(changed){wrapper.append(document.createTextNode(value.slice(cursor)));original.replaceWith(wrapper);glitchNodes.push({wrapper,original});}
 }
 glitchFrame=requestAnimationFrame(()=>{
  document.body.classList.add(still?'rgb-still':'rgb-glitch');
  glitchTimer=setTimeout(clearPageGlitch,still?1100:2400);
 });
}
$('#motion-toggle').addEventListener('click',()=>{if(paused)clearPageGlitch();});
reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)clearPageGlitch();});

$('#motion-toggle').addEventListener('click',()=>{if(paused)stopScene();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){stopScene();clearPageGlitch();}});
