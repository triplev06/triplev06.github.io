(async () => {
 const $=s=>document.querySelector(s),canvas=$('#game'),ctx=canvas.getContext('2d');
 const held={},saveKey='vv-zelda-eagle-v2';const soundtrack=new AdventureAudio();let booting=true,audio,sound=true,last=0,frame,uiMode='title',dialogueAction,manualMap=null,sidebarMapRevealed=false,lastMapSignature='',noticeTimer,roomTimer,accumulator=0,menuProgress=0,inputSequence=0,scrollFrame=null;
 $('#start').disabled=true;try{await AdventureArt.ready;}catch(error){$('#curtain-copy').textContent='The sprite sheets could not load. Please reload to try again.';return;}$('#start').disabled=false;
 const engine=new AdventureEngine(AdventureWorld,onEvent);
 let saved=false;try{saved=engine.restore(JSON.parse(localStorage.getItem(saveKey)||'null'));}catch{}
 booting=false;engine.mode='paused';if(saved){$('#start').firstChild.textContent=engine.state.won?'Explore again ':'Continue adventure ';$('#new-game').hidden=false;$('#curtain-copy').textContent=engine.state.won?'The first Triforce fragment is yours.':'Your adventure is saved. Continue from a safe entrance.';}
 try{sound=localStorage.getItem('vv-zelda-sound')!=='off';}catch{}
 $('#sound').textContent=sound?'Sound on':'Sound off';$('#sound').setAttribute('aria-pressed',String(sound));
 function resumeSound(){soundtrack.background(false);soundtrack.sync(engine.room.zone,engine.mode==='scroll'?'playing':engine.mode);soundtrack.enable(sound);if(sound){const AC=window.AudioContext||window.webkitAudioContext;if(AC){audio ||=new AC();audio.resume();}}}
 function save(){try{localStorage.setItem(saveKey,JSON.stringify(engine.state));}catch{$('.save-note').textContent='Saving is unavailable in this browser. Keep this tab open to preserve your adventure.';}}
 function clearInput(){for(const key of Object.keys(held))delete held[key];accumulator=0;}
 function setHeld(key,value){if(value&&!held[key]){held._order ||= {};held._order[key]=++inputSequence;}held[key]=value;if(!value&&held._order)delete held._order[key];}
 function toggleInventory(){if(engine.mode==='inventory')engine.closeInventory();else if(engine.mode==='playing')engine.openInventory();}
 function refreshInventory(){const s=engine.state;for(const b of document.querySelectorAll('[data-equip]')){const id=b.dataset.equip;b.hidden=!engine.inventoryItems().includes(id);b.setAttribute('aria-pressed',String(s.equippedB===id));}$('#inventory-status').textContent=s.equippedB==='bombs'?'B: Bombs · '+s.bombs+' left':s.equippedB==='bow'?'B: Bow · '+(s.arrows?'Arrows cost 1 rupee':'Arrows not yet acquired'):s.equippedB==='boomerang'?'B: Boomerang':'Find a B-button item to equip it.';}

 function sfx(type){if(type==='item'){soundtrack.cue('item');return;}if(!sound||!audio)return;const notes={sword:[180,90],arrow:[420,230],hit:[110,65],hurt:[160,70],item:[440,660,880],heal:[330,440,660],clear:[330,494,660],bombPlace:[120],bomb:[90,60,40],win:[330,440,554,660,880]}[type]||[300];
   notes.forEach((freq,i)=>{const o=audio.createOscillator(),g=audio.createGain(),at=audio.currentTime+i*.08;o.type=type==='sword'?'triangle':'square';o.frequency.setValueAtTime(freq,at);g.gain.setValueAtTime(.025,at);g.gain.exponentialRampToValueAtTime(.001,at+.12);o.connect(g);g.connect(audio.destination);o.start(at);o.stop(at+.13);});
 }
 function onEvent(type,data){
   // Constructor emits before the engine binding exists; room UI is initialized below.
   if(type==='room'){manualMap=null;lastMapSignature='';$('#room-name').textContent=data;$('#room-label').textContent=data;$('#room-label').classList.add('visible');clearTimeout(roomTimer);roomTimer=setTimeout(()=>$('#room-label').classList.remove('visible'),1800);}
   if(type==='save'&&!booting){try{localStorage.setItem(saveKey,JSON.stringify(data));}catch{}}
   if(type==='notice'){showNotice(data);}
   if(type==='sound')sfx(data);
   if(type==='transition'){scrollFrame=document.createElement('canvas');scrollFrame.width=256;scrollFrame.height=240;scrollFrame.getContext('2d').drawImage(canvas,0,0);}
   if(type==='transitionend')scrollFrame=null;
   if(type==='pickup'){clearInput();clearTimeout(roomTimer);$('#room-label').classList.remove('visible');$('#announcement').textContent=data.id==='relic'?'You found the Triforce fragment!':'Item acquired: '+data.id;if(data.id==='relic')soundtrack.cue('triforce');}
   if(type==='pickupend')clearInput();
   if(type==='inventory'){clearTimeout(roomTimer);$('#room-label').classList.remove('visible');clearInput();$('#inventory-panel').hidden=!data;$('#inventory-toggle').setAttribute('aria-pressed',String(data));refreshInventory();$('#announcement').textContent=data?'Inventory open. Arrow keys select a B item. Enter returns to the game.':'Inventory closed.';canvas.focus();}
   if(type==='dialogue'){clearInput();dialogueAction=data.action;$('#speaker').textContent=data.speaker;$('#speech').textContent=data.text;$('#dialogue').hidden=false;$('#continue').focus();$('#announcement').textContent=data.speaker+'. '+data.text;}
   if(type==='dead'){soundtrack.cue('death');clearInput();showCurtain('Fallen, not forgotten.','Your equipment and discoveries are safe. Return to the entrance with full hearts.','Try again','dead');}
   if(type==='win'){clearInput();showCurtain('The Triforce of Wisdom.','Aquamentus is defeated. You completed Level 1 — The Eagle.','Explore the world','won');$('#announcement').textContent='Level 1 complete! You recovered the Triforce fragment.';}
 }
 function showNotice(text){$('#objective').textContent=text;$('#announcement').textContent=text;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('#objective').textContent=engine.room.zone==='dungeon'?'Level 1 · The Eagle':'Follow the route to Level 1',4500);}
 function showCurtain(title,copy,button,mode){uiMode=mode;$('#curtain h2').textContent=title;$('#curtain-copy').textContent=copy;$('#start').textContent=button+' →';$('#curtain').hidden=false;$('#new-game').hidden=mode!=='paused';$('#start').focus();}
 function start(){
   soundtrack.resetCue();if(uiMode==='dead')engine.retry();else engine.mode='playing';
   $('#curtain').hidden=true;uiMode='playing';clearInput();canvas.focus();resumeSound();updateHud();
 }
 function pause(){if(engine.mode==='inventory'){engine.closeInventory();return;}if(engine.mode==='dialogue'||engine.mode==='pickup'||engine.mode==='scroll'||engine.mode==='dead'||engine.mode==='won')return;if(engine.mode==='paused'){start();return;}engine.mode='paused';clearInput();save();showCurtain('Take a breath.','Your progress is saved. The adventure will be here when you return.','Resume adventure','paused');}
 function continueDialogue(){if(engine.mode!=='dialogue')return;$('#dialogue').hidden=true;const action=dialogueAction;dialogueAction=undefined;engine.finishDialogue(action);if(engine.mode==='playing')canvas.focus();resumeSound();updateHud();}
 $('#start').addEventListener('click',start);
 $('#new-game').addEventListener('click',()=>{soundtrack.resetCue();sidebarMapRevealed=false;engine.fresh();save();$('#dialogue').hidden=true;$('#curtain').hidden=true;uiMode='playing';clearInput();canvas.focus();resumeSound();updateHud();});
 $('#inventory-toggle').addEventListener('click',toggleInventory);$('#inventory-close').addEventListener('click',toggleInventory);for(const b of document.querySelectorAll('[data-equip]'))b.addEventListener('click',()=>{engine.equip(b.dataset.equip);refreshInventory();canvas.focus();});
 $('#pause').addEventListener('click',pause);$('#continue').addEventListener('click',continueDialogue);
 $('#sound').addEventListener('click',()=>{sound=!sound;try{localStorage.setItem('vv-zelda-sound',sound?'on':'off');}catch{}soundtrack.background(false);$('#sound').textContent=sound?'Sound on':'Sound off';$('#sound').setAttribute('aria-pressed',String(sound));soundtrack.sync(engine.room.zone,engine.mode==='scroll'?'playing':engine.mode);soundtrack.enable(sound);if(sound){const AC=window.AudioContext||window.webkitAudioContext;if(AC){audio ||=new AC();audio.resume();}}else audio?.suspend();});
 const keyMap={ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right',' ':'attack',j:'attack',z:'attack',k:'shoot',x:'shoot'};
 document.addEventListener('keydown',event=>{const key=event.key.length===1?event.key.toLowerCase():event.key;
   if(event.ctrlKey||event.metaKey||event.altKey||key==='Tab')return;if(['Enter',' '].includes(key)&&event.target.closest?.('button,a,input,select,textarea'))return;
   if(engine.mode==='dialogue'){if(['e','Enter',' '].includes(key)){event.preventDefault();if(!event.repeat)continueDialogue();}return;}
   if(engine.mode==='inventory'){if(['Escape','Enter','i','p'].includes(key)){event.preventDefault();if(!event.repeat)toggleInventory();}else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','a','d','w','s'].includes(key)){event.preventDefault();if(!event.repeat){engine.cycleInventory(['ArrowLeft','ArrowUp','a','w'].includes(key)?-1:1);refreshInventory();}}return;}
   if((key==='i'||key==='Enter')&&engine.mode==='playing'){event.preventDefault();if(!event.repeat)toggleInventory();return;}
   if(key==='Escape'||key==='p'){event.preventDefault();if(!event.repeat)pause();return;}
   if(key==='m'){if(!event.repeat)toggleMap();return;}
   if(engine.mode!=='playing')return;
   // Keep keyboard activation of native controls intact when tabbing away from play.
   if(document.activeElement!==canvas&&[' ','Enter'].includes(key))return;
   if(keyMap[key]){event.preventDefault();setHeld(keyMap[key],true);if(!event.repeat&&keyMap[key]==='attack')engine.attack();if(!event.repeat&&keyMap[key]==='shoot')engine.shoot();}
   if(key==='e'){event.preventDefault();if(!event.repeat){engine.interact();updateHud();}}
 });
 document.addEventListener('keyup',event=>{const key=event.key.length===1?event.key.toLowerCase():event.key;if(keyMap[key]){event.preventDefault();setHeld(keyMap[key],false);}});
 for(const b of document.querySelectorAll('[data-hold],[data-action]')){
   const key=b.dataset.hold||b.dataset.action;
   b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);if(key==='interact'){if(engine.mode==='dialogue')continueDialogue();else engine.interact();}else {setHeld(key,true);if(key==='attack')engine.attack();if(key==='shoot')engine.shoot();}});
   for(const evt of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(evt,()=>setHeld(key,false));
   b.addEventListener('click',e=>{if(e.detail===0){if(key==='interact')engine.interact();else if(key==='attack')engine.attack();else if(key==='shoot')engine.shoot();else engine.update(1/30,{[key]:true});}});
 }
 window.addEventListener('blur',()=>{soundtrack.background(true);clearInput();if(engine.mode==='playing')pause();});
 window.addEventListener('focus',()=>soundtrack.background(false));
 document.addEventListener('visibilitychange',()=>{soundtrack.background(document.hidden);if(document.hidden){clearInput();if(engine.mode==='playing')pause();cancelAnimationFrame(frame);last=0;}else{last=0;cancelAnimationFrame(frame);frame=requestAnimationFrame(tick);}});
 window.addEventListener('pagehide',()=>{save();soundtrack.background(true);});
 function mapZone(){return manualMap||(engine.room.zone==='dungeon'?'dungeon':'overworld');}
 function toggleMap(){manualMap=mapZone()==='overworld'?'dungeon':'overworld';lastMapSignature='';renderMap();}
 $('#map-toggle').addEventListener('click',toggleMap);
 $('#minimap').addEventListener('click',event=>{if(event.target.closest('#reveal-dungeon-map')){sidebarMapRevealed=true;lastMapSignature='';renderMap();$('#minimap').focus({preventScroll:true});}});
 function renderMap(){
   const zone=mapZone(),s=engine.state,signature=[zone,s.room,s.visited.join(),s.items.join(),s.cleared.join(),sidebarMapRevealed].join('|');if(signature===lastMapSignature)return;lastMapSignature=signature;
   $('#map-title').textContent=zone==='dungeon'?'Level 1 · Eagle':'Cave → Eagle';$('#map-toggle').setAttribute('aria-label',zone==='dungeon'?'Show overworld map':'Show dungeon map');
   const map=$('#minimap'),locked=zone==='dungeon'&&!engine.hasDungeonItem('map')&&!sidebarMapRevealed;map.replaceChildren();map.classList.toggle('map-locked',locked);map.setAttribute('aria-label',locked?'Undiscovered dungeon map':zone==='dungeon'?'Dungeon guide map':'Overworld route map');$('.map-legend').hidden=locked;$('#map-caption').textContent=zone==='dungeon'?(engine.hasDungeonItem('map')?'DUNGEON MAP ACQUIRED':sidebarMapRevealed?'SIDEBAR GUIDE REVEALED':'UNDISCOVERED MAP'):'OVERWORLD ROUTE';
   if(locked){const cover=document.createElement('div');cover.className='map-cover';const title=document.createElement('strong');title.textContent='Uncharted chambers';const copy=document.createElement('p');copy.textContent='Find the map in Level 1 to reveal its layout, or open this guide for a little help.';const reveal=document.createElement('button');reveal.id='reveal-dungeon-map';reveal.textContent='Reveal sidebar map';cover.append(title,copy,reveal);map.append(cover);$('#route-note').textContent='The sidebar guide is optional. Revealing it does not unlock the in-game map or compass.';return;}
   const grid=document.createElement('div');grid.className='minimap-grid '+(zone==='dungeon'?'eagle-map':'route-map');const cols=zone==='dungeon'?6:2,rows=zone==='dungeon'?6:5;grid.style.gridTemplateColumns=`repeat(${cols},1fr)`;
   const names={start:'CAVE',r1:'1',r2:'2',r3:'3',r4:'4',r5:'BRIDGE',island:'LEVEL 1',d0:'START',d1:'KEY',d2:'KEY',d3:'HALL',d4:'KEY',compass:'COMP',d5:'KEESE',d6:'PUSH',old:'MAN',d7:'MAP',d9:'KEY',d10:'KEY',d11:'STAIR',cellar:'BOW',d13:'BOOM',d14:'KEY',boss:'BOSS',triforce:'RELIC'};
   for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
    const entry=Object.entries(AdventureWorld.rooms).find(([,r])=>r.zone===zone&&r.map[0]===(zone==='dungeon'?x:x+7)&&r.map[1]===(zone==='dungeon'?y:y+3)),cell=document.createElement('div');cell.className='map-cell';
    if(!entry){cell.classList.add('empty');cell.setAttribute('aria-hidden','true');grid.append(cell);continue;}
    const [id,r]=entry,current=id===s.room||(id==='start'&&s.room==='cave');if(zone==='dungeon')cell.classList.add('dungeon');if(s.visited.includes(id))cell.classList.add('visited');if(current)cell.classList.add('current');cell.title=r.name;cell.setAttribute('aria-label',r.name+(current?' · You are here':''));
    for(const d of Object.keys(r.exits)){if(AdventureWorld.rooms[r.exits[d]].zone!==zone)continue;const line=document.createElement('i');line.className='map-door '+d;cell.append(line);}
    const mark=document.createElement('span');mark.textContent=id==='boss'?'♜':r.item||r.reward?'◆':r.portal?'⌂':'';cell.append(mark);const label=document.createElement('small');label.textContent=names[id];cell.append(label);grid.append(cell);
   }map.append(grid);$('#route-note').textContent=zone==='dungeon'?'Every Eagle room is visible. Keys open locked doors; shutters need enemies defeated or a block pushed.':'From the cave: east once, north four screens, then west across the bridge. Only this route is included.';
 }
 let lastHud='';
 function updateHud(){const s=engine.state,sig=[s.hp,s.sword,s.bow,s.boomerang,s.keys,s.rupees,s.won,s.room,s.cleared.join(),s.equippedB,s.maxHp,s.bombs,s.bombsUnlocked].join();if(sig!==lastHud){lastHud=sig;
  $('#hearts').replaceChildren();for(let i=0;i<s.maxHp/2;i++){const h=document.createElement('span');h.textContent='♥';h.style.color=s.hp>=i*2+2?'#f1786b':'#414b3d';if(s.hp===i*2+1)h.className='half-heart';$('#hearts').append(h);}$('#hearts').setAttribute('aria-label',`${s.hp/2} of ${s.maxHp/2} hearts`);
  $('#sword-state').textContent='SWORD '+(s.sword?'✓':'—');$('#bow-state').textContent='BOW '+(s.bow?'✓':'—');$('#keys').textContent='KEY '+s.keys;$('#rupees').textContent='◆ '+s.rupees;
  $('#quest').textContent=s.won?'Level 1 complete. Triforce fragment recovered.':!s.sword?'Enter the starting cave and take the wooden sword.':!s.visited.includes('d0')?'East, north four screens, then west across the bridge.':s.cleared.includes('boss')?'Collect the heart container, then the Triforce in the eastern room.':!s.boomerang?'Find keys, follow the Eagle map, and collect the boomerang.':'Defeat Aquamentus. Strike its body; sword beams work at full life.';
  document.querySelector('[data-action=shoot]').setAttribute('aria-label',s.equippedB==='bombs'?'Place bomb':s.equippedB==='bow'?'Use bow':'Throw boomerang');
 }renderMap();}
 function drawHud(){const s=engine.state;ctx.fillStyle='#000';ctx.fillRect(0,0,256,64);AdventureArt.hud(ctx);
  const dungeon=engine.room.zone==='dungeon',hasMap=engine.hasDungeonItem('map'),hasCompass=engine.hasDungeonItem('compass');if(dungeon)AdventureArt.text(ctx,'LEVEL-1',16,0);
  for(const [id,r]of Object.entries(AdventureWorld.rooms)){if(r.zone!==(dungeon?'dungeon':'overworld'))continue;const current=id===s.room;if(dungeon&&!hasMap&&!(hasCompass&&current))continue;const x=dungeon?r.map[0]*6+16:(r.map[0]-7)*16+24,y=dungeon?r.map[1]*5+16:(r.map[1]-3)*6+16;ctx.fillStyle=(dungeon?hasCompass&&current:id===s.room||(id==='start'&&s.room==='cave'))?'#80d010':'#747474';ctx.fillRect(x,y,dungeon?5:12,4);}
  AdventureArt.text(ctx,'X'+s.rupees,96,24);AdventureArt.text(ctx,'X'+s.keys,96,40);AdventureArt.text(ctx,'X'+(s.bombs||0),96,48);
  if(s.sword)AdventureArt.item(ctx,'sword',156,40);if(s.equippedB)AdventureArt.item(ctx,s.equippedB,132,40);
  for(let i=0;i<s.maxHp/2;i++)AdventureArt.heart(ctx,176+i*8,40,s.hp>=i*2+2?'full':s.hp===i*2+1?'half':'empty');
 }
 const scene=document.createElement('canvas');scene.width=256;scene.height=240;const sceneCtx=scene.getContext('2d');
 function drawInventory(){const s=engine.state,dungeon=engine.room.zone==='dungeon';AdventureArt.inventory(ctx,dungeon);
  // The upper row is reserved for passive inventory items; A stays assigned to the sword.
  if(s.equippedB)AdventureArt.item(ctx,s.equippedB,72,56);
  const slots=[['boomerang',136],['bombs',160],['bow',184]];for(const [id,x] of slots)if(engine.inventoryItems().includes(id)){AdventureArt.item(ctx,id,x,56);if(s.equippedB===id){ctx.strokeStyle='#d82800';ctx.strokeRect(x-9,46,18,20);}}
  if(dungeon){const hasMap=engine.hasDungeonItem('map'),hasCompass=engine.hasDungeonItem('compass');if(hasMap)AdventureArt.item(ctx,'map',52,120);if(hasCompass)AdventureArt.item(ctx,'compass',52,160);
   for(const [id,r] of Object.entries(AdventureWorld.rooms)){if(r.zone!=='dungeon'||(!hasMap&&!(hasCompass&&id===s.room)))continue;const x=128+r.map[0]*8,y=100+r.map[1]*10;ctx.fillStyle=hasCompass&&id===s.room?'#fff':s.visited.includes(id)?'#2038ec':'#bc7c28';ctx.fillRect(x,y,7,8);}}
  else if(s.won)AdventureArt.item(ctx,'relic',128,140);
 }
 function drawMenu(){if(menuProgress<=0)return;sceneCtx.clearRect(0,0,256,240);sceneCtx.drawImage(canvas,0,0);const offset=Math.round(menuProgress*176);ctx.fillStyle='#000';ctx.fillRect(0,0,256,240);ctx.drawImage(scene,0,64,256,176,0,64+offset,256,176);ctx.save();ctx.translate(0,offset-176);drawInventory();ctx.restore();ctx.drawImage(scene,0,0,256,64,0,offset,256,64);}
 canvas.addEventListener('pointerdown',event=>{if(engine.mode!=='inventory'||menuProgress<1)return;const box=canvas.getBoundingClientRect(),x=(event.clientX-box.left)*256/box.width,y=(event.clientY-box.top)*240/box.height;if(y>=44&&y<78){const id=x>=124&&x<148?'boomerang':x>=148&&x<172?'bombs':x>=172&&x<196?'bow':null;if(id){engine.equip(id);refreshInventory();}}});
 function drawRoomScroll(){if(!engine.scroll||!scrollFrame)return;sceneCtx.clearRect(0,0,256,240);sceneCtx.drawImage(canvas,0,0);const {dir,elapsed,duration}=engine.scroll,progress=Math.min(1,elapsed/duration),horizontal=dir==='e'||dir==='w',sign=dir==='e'||dir==='s'?1:-1,span=horizontal?256:176,offset=Math.round(progress*span)*sign;ctx.save();ctx.beginPath();ctx.rect(0,64,256,176);ctx.clip();ctx.fillStyle='#000';ctx.fillRect(0,64,256,176);ctx.drawImage(scrollFrame,0,64,256,176,horizontal?-offset:0,horizontal?64:64-offset,256,176);ctx.drawImage(scene,0,64,256,176,horizontal?span*sign-offset:0,horizontal?64:64+span*sign-offset,256,176);ctx.restore();}
 function draw(){const r=engine.room,p=engine.player,t=engine.time,s=engine.state;ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,256,240);drawHud();ctx.save();ctx.translate(0,64);AdventureArt.room(ctx,r);
  if(r.sideview){ctx.fillStyle='#000';ctx.fillRect(0,160,256,16);}
  if(r.zone==='dungeon'&&!r.sideview)for(const dir of ['n','s','w','e'])AdventureArt.door(ctx,dir,engine.doorClosed(dir),Boolean(engine.exits()[dir]),Boolean(r.locks?.[dir]&&!s.unlocked.includes(r.locks[dir])),engine.bombDoorOpen(dir));
  AdventureArt.secrets(ctx,r,s.pushed.includes(s.room));if(r.push&&(s.pushed.includes(s.room)||engine.blockMotion))AdventureArt.pushed(ctx,r,engine.blockOffset(),engine.blockMotion);
  if(r.npc){AdventureArt.sprite(ctx,'oldman',r.npc.x,r.npc.y);AdventureArt.fire(ctx,72,64,t);AdventureArt.fire(ctx,176,64,t);ctx.fillStyle='#fff';ctx.font='7px monospace';ctx.textAlign='center';if(s.room==='cave'&&!s.sword){AdventureArt.text(ctx,"IT'S DANGEROUS TO GO",128,20,'white',true);AdventureArt.text(ctx,'ALONE! TAKE THIS.',128,36,'white',true);}else if(s.room==='old'){AdventureArt.text(ctx,'EASTMOST PENNINSULA',128,20,'white',true);AdventureArt.text(ctx,'IS THE SECRET.',128,36,'white',true);}}
  if(r.item&&!s.items.includes(s.room+':'+r.item.id))AdventureArt.item(ctx,r.item.id,r.item.x,r.item.y,t);
  for(const d of engine.drops)if(d.reward||d.life>2||Math.floor(t*12)%2)AdventureArt.item(ctx,d.type,d.x,d.y,t);
  for(const e of engine.enemies)AdventureArt.sprite(ctx,e.type,e.x,e.y,Math.floor(t*5),e.dir,e.hurt>0);
  for(const trap of engine.traps)AdventureArt.sprite(ctx,'trap',trap.x,trap.y);
  for(const b of engine.bombs)AdventureArt.bomb(ctx,b);
  if(engine.pickup)AdventureArt.pickup(ctx,p,engine.pickup,t);else if(p.use>0)AdventureArt.useItem(ctx,p);else if(p.attack<=0&&!(p.invincible>0&&Math.floor(t*12)%2))AdventureArt.sprite(ctx,'hero',p.x,p.y,Math.floor(p.walk),p.dir);
  if(!engine.pickup&&p.attack>0)AdventureArt.sword(ctx,p);
  for(const q of engine.projectiles){if(q.type.includes('oomerang'))AdventureArt.boomerang(ctx,q);else if(q.type==='beam')AdventureArt.beam(ctx,q);else if(q.type==='arrow')AdventureArt.arrow(ctx,q);else if(q.type==='fire')AdventureArt.blit(ctx,'bosses',[101+9*(Math.floor(t*8)%4),11,8,16],q.x,q.y);else{ctx.fillStyle='#fcfcfc';ctx.fillRect(Math.round(q.x)-2,Math.round(q.y)-2,4,4);}}
  for(const q of engine.particles){if(q.type==='swordFragment'){AdventureArt.swordFragment(ctx,q);continue;}ctx.fillStyle=q.color;ctx.fillRect(Math.round(q.x),Math.round(q.y),2,2);}ctx.restore();drawRoomScroll();drawMenu();
 }
 function tick(now){const dt=last?Math.min((now-last)/1000,.1):0;last=now;accumulator+=dt;const fixed=1/60;let steps=0;while(accumulator>=fixed&&steps<6){engine.update(fixed,held);accumulator-=fixed;steps++;}const target=engine.mode==='inventory'?1:0;menuProgress=target?Math.min(1,menuProgress+dt/.22):Math.max(0,menuProgress-dt/.22);soundtrack.sync(engine.room.zone,engine.mode==='scroll'?'playing':engine.mode);updateHud();draw();frame=requestAnimationFrame(tick);}
 updateHud();draw();frame=requestAnimationFrame(tick);
})();
