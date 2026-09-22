(async () => {
 const $=s=>document.querySelector(s),canvas=$('#game'),ctx=canvas.getContext('2d');
 const held={},saveKey='vv-zelda-eagle-v2';const soundtrack=new AdventureAudio();let booting=true,audio,sound=true,last=0,frame,uiMode='title',dialogueAction,manualMap=null,lastMapSignature='',noticeTimer,roomTimer;
 $('#start').disabled=true;try{await AdventureArt.ready;}catch(error){$('#curtain-copy').textContent='The sprite sheets could not load. Please reload to try again.';return;}$('#start').disabled=false;
 const engine=new AdventureEngine(AdventureWorld,onEvent);
 let saved=false;try{saved=engine.restore(JSON.parse(localStorage.getItem(saveKey)||'null'));}catch{}
 booting=false;engine.mode='paused';if(saved){$('#start').firstChild.textContent=engine.state.won?'Explore again ':'Continue adventure ';$('#new-game').hidden=false;$('#curtain-copy').textContent=engine.state.won?'The first Triforce fragment is yours.':'Your adventure is saved. Continue from a safe entrance.';}
 try{sound=localStorage.getItem('vv-zelda-sound')!=='off';}catch{}
 $('#sound').textContent=sound?'Sound on':'Sound off';$('#sound').setAttribute('aria-pressed',String(sound));
 function resumeSound(){soundtrack.background(false);soundtrack.sync(engine.room.zone,engine.mode);soundtrack.enable(sound);if(sound){const AC=window.AudioContext||window.webkitAudioContext;if(AC){audio ||=new AC();audio.resume();}}}
 function save(){try{localStorage.setItem(saveKey,JSON.stringify(engine.state));}catch{$('.save-note').textContent='Saving is unavailable in this browser. Keep this tab open to preserve your adventure.';}}
 function clearInput(){for(const key of Object.keys(held))delete held[key];}
 function sfx(type){if(type==='item'){soundtrack.cue('item');return;}if(!sound||!audio)return;const notes={sword:[180,90],arrow:[420,230],hit:[110,65],hurt:[160,70],item:[440,660,880],heal:[330,440,660],clear:[330,494,660],win:[330,440,554,660,880]}[type]||[300];
   notes.forEach((freq,i)=>{const o=audio.createOscillator(),g=audio.createGain(),at=audio.currentTime+i*.08;o.type=type==='sword'?'triangle':'square';o.frequency.setValueAtTime(freq,at);g.gain.setValueAtTime(.025,at);g.gain.exponentialRampToValueAtTime(.001,at+.12);o.connect(g);g.connect(audio.destination);o.start(at);o.stop(at+.13);});
 }
 function onEvent(type,data){
   // Constructor emits before the engine binding exists; room UI is initialized below.
   if(type==='room'){manualMap=null;lastMapSignature='';$('#room-name').textContent=data;$('#room-label').textContent=data;$('#room-label').classList.add('visible');clearTimeout(roomTimer);roomTimer=setTimeout(()=>$('#room-label').classList.remove('visible'),1800);}
   if(type==='save'&&!booting){try{localStorage.setItem(saveKey,JSON.stringify(data));}catch{}}
   if(type==='notice'){showNotice(data);}
   if(type==='sound')sfx(data);
   if(type==='dialogue'){clearInput();dialogueAction=data.action;$('#speaker').textContent=data.speaker;$('#speech').textContent=data.text;$('#dialogue').hidden=false;$('#continue').focus();$('#announcement').textContent=data.speaker+'. '+data.text;}
   if(type==='dead'){soundtrack.cue('death');clearInput();showCurtain('Fallen, not forgotten.','Your equipment and discoveries are safe. Return to the entrance with full hearts.','Try again','dead');}
   if(type==='win'){clearInput();soundtrack.cue('triforce');showCurtain('The Triforce of Wisdom.','Aquamentus is defeated. You completed Level 1 — The Eagle.','Explore the world','won');$('#announcement').textContent='Level 1 complete! You recovered the Triforce fragment.';}
 }
 function showNotice(text){$('#objective').textContent=text;$('#announcement').textContent=text;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('#objective').textContent=engine.room.zone==='dungeon'?'Level 1 · The Eagle':'Follow the route to Level 1',4500);}
 function showCurtain(title,copy,button,mode){uiMode=mode;$('#curtain h2').textContent=title;$('#curtain-copy').textContent=copy;$('#start').textContent=button+' →';$('#curtain').hidden=false;$('#new-game').hidden=mode!=='paused';$('#start').focus();}
 function start(){
   soundtrack.resetCue();if(uiMode==='dead')engine.retry();else engine.mode='playing';
   $('#curtain').hidden=true;uiMode='playing';clearInput();canvas.focus();resumeSound();updateHud();
 }
 function pause(){if(engine.mode==='dialogue'||engine.mode==='dead'||engine.mode==='won')return;if(engine.mode==='paused'){start();return;}engine.mode='paused';clearInput();save();showCurtain('Take a breath.','Your progress is saved. The adventure will be here when you return.','Resume adventure','paused');}
 function continueDialogue(){if(engine.mode!=='dialogue')return;$('#dialogue').hidden=true;const action=dialogueAction;dialogueAction=undefined;engine.finishDialogue(action);if(engine.mode==='playing')canvas.focus();resumeSound();updateHud();}
 $('#start').addEventListener('click',start);
 $('#new-game').addEventListener('click',()=>{soundtrack.resetCue();engine.fresh();save();$('#dialogue').hidden=true;$('#curtain').hidden=true;uiMode='playing';clearInput();canvas.focus();resumeSound();updateHud();});
 $('#pause').addEventListener('click',pause);$('#continue').addEventListener('click',continueDialogue);
 $('#sound').addEventListener('click',()=>{sound=!sound;try{localStorage.setItem('vv-zelda-sound',sound?'on':'off');}catch{}soundtrack.background(false);$('#sound').textContent=sound?'Sound on':'Sound off';$('#sound').setAttribute('aria-pressed',String(sound));soundtrack.sync(engine.room.zone,engine.mode);soundtrack.enable(sound);if(sound){const AC=window.AudioContext||window.webkitAudioContext;if(AC){audio ||=new AC();audio.resume();}}else audio?.suspend();});
 const keyMap={ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right',' ':'attack',j:'attack',z:'attack',k:'shoot',x:'shoot'};
 document.addEventListener('keydown',event=>{const key=event.key.length===1?event.key.toLowerCase():event.key;
   if(event.ctrlKey||event.metaKey||event.altKey||key==='Tab')return;
   if(engine.mode==='dialogue'){if(['e','Enter',' '].includes(key)){event.preventDefault();if(!event.repeat)continueDialogue();}return;}
   if(key==='Escape'||key==='p'){event.preventDefault();if(!event.repeat)pause();return;}
   if(key==='m'){if(!event.repeat)toggleMap();return;}
   if(engine.mode!=='playing')return;
   // Keep keyboard activation of native controls intact when tabbing away from play.
   if(document.activeElement!==canvas&&[' ','Enter'].includes(key))return;
   if(keyMap[key]){event.preventDefault();held[keyMap[key]]=true;if(!event.repeat)engine.update(1/30,held);}
   if(['e','Enter'].includes(key)){event.preventDefault();if(!event.repeat){engine.interact();updateHud();}}
 });
 document.addEventListener('keyup',event=>{const key=event.key.length===1?event.key.toLowerCase():event.key;if(keyMap[key]){event.preventDefault();held[keyMap[key]]=false;}});
 for(const b of document.querySelectorAll('[data-hold],[data-action]')){
   const key=b.dataset.hold||b.dataset.action;
   b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);if(key==='interact'){if(engine.mode==='dialogue')continueDialogue();else engine.interact();}else {held[key]=true;engine.update(1/30,held);}});
   for(const evt of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(evt,()=>held[key]=false);
   b.addEventListener('click',e=>{if(e.detail===0){if(key==='interact')engine.interact();else if(key==='attack')engine.attack();else if(key==='shoot')engine.shoot();else engine.update(1/30,{[key]:true});}});
 }
 window.addEventListener('blur',()=>{soundtrack.background(true);clearInput();if(engine.mode==='playing')pause();});
 window.addEventListener('focus',()=>soundtrack.background(false));
 document.addEventListener('visibilitychange',()=>{soundtrack.background(document.hidden);if(document.hidden){clearInput();if(engine.mode==='playing')pause();cancelAnimationFrame(frame);last=0;}else{last=0;cancelAnimationFrame(frame);frame=requestAnimationFrame(tick);}});
 window.addEventListener('pagehide',()=>{save();soundtrack.background(true);});
 function mapZone(){return manualMap||(engine.room.zone==='dungeon'?'dungeon':'overworld');}
 function toggleMap(){manualMap=mapZone()==='overworld'?'dungeon':'overworld';lastMapSignature='';renderMap();}
 $('#map-toggle').addEventListener('click',toggleMap);
 function renderMap(){
   const zone=mapZone(),s=engine.state,signature=[zone,s.room,s.visited.join(),s.items.join(),s.cleared.join()].join('|');if(signature===lastMapSignature)return;lastMapSignature=signature;
   $('#map-title').textContent=zone==='dungeon'?'Level 1 · Eagle':'Cave → Eagle';$('#map-toggle').setAttribute('aria-label',zone==='dungeon'?'Show overworld map':'Show dungeon map');
   const map=$('#minimap');map.replaceChildren();const grid=document.createElement('div');grid.className='minimap-grid '+(zone==='dungeon'?'eagle-map':'route-map');const cols=zone==='dungeon'?6:2,rows=zone==='dungeon'?6:5;grid.style.gridTemplateColumns=`repeat(${cols},1fr)`;
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
 function updateHud(){const s=engine.state,sig=[s.hp,s.sword,s.bow,s.boomerang,s.keys,s.rupees,s.won,s.room,s.cleared.join()].join();if(sig!==lastHud){lastHud=sig;
  $('#hearts').replaceChildren();for(let i=0;i<s.maxHp/2;i++){const h=document.createElement('span');h.textContent='♥';h.style.color=s.hp>=i*2+2?'#f1786b':'#414b3d';if(s.hp===i*2+1)h.className='half-heart';$('#hearts').append(h);}$('#hearts').setAttribute('aria-label',`${s.hp/2} of ${s.maxHp/2} hearts`);
  $('#sword-state').textContent='SWORD '+(s.sword?'✓':'—');$('#bow-state').textContent='BOW '+(s.bow?'✓':'—');$('#keys').textContent='KEY '+s.keys;$('#rupees').textContent='◆ '+s.rupees;
  $('#quest').textContent=s.won?'Level 1 complete. Triforce fragment recovered.':!s.sword?'Enter the starting cave and take the wooden sword.':!s.visited.includes('d0')?'East, north four screens, then west across the bridge.':s.cleared.includes('boss')?'Collect the heart container, then the Triforce in the eastern room.':!s.boomerang?'Find keys, follow the Eagle map, and collect the boomerang.':'Defeat Aquamentus. Aim for its head; sword beams work at full life.';
  document.querySelector('[data-action=shoot]').setAttribute('aria-label',s.boomerang?'Throw boomerang':'Boomerang not yet acquired');
 }renderMap();}
 function drawHud(){const s=engine.state;ctx.fillStyle='#000';ctx.fillRect(0,0,256,64);ctx.font='8px monospace';ctx.textAlign='left';ctx.fillStyle='#fff';AdventureArt.text(ctx,engine.room.zone==='dungeon'?'LEVEL-1':'',16,5);
  const dungeon=engine.room.zone==='dungeon';for(const [id,r]of Object.entries(AdventureWorld.rooms)){if(r.zone!==(dungeon?'dungeon':'overworld'))continue;const x=dungeon?r.map[0]*6+16:(r.map[0]-7)*16+24,y=dungeon?r.map[1]*5+20:(r.map[1]-3)*6+20;ctx.fillStyle=id===s.room||(id==='start'&&s.room==='cave')?'#fff':'#747474';ctx.fillRect(x,y,dungeon?5:12,4);}
  AdventureArt.item(ctx,'rupees',92,21);AdventureArt.item(ctx,'key',92,38);ctx.fillStyle='#fff';AdventureArt.text(ctx,'X'+String(s.rupees).padStart(2,'0'),100,17);AdventureArt.text(ctx,'X'+s.keys,100,35);
  ctx.strokeStyle='#2038ec';ctx.strokeRect(124,22,18,26);ctx.strokeRect(148,22,18,26);ctx.fillStyle='#fff';AdventureArt.text(ctx,'B',130,11);AdventureArt.text(ctx,'A',154,11);if(s.sword)AdventureArt.item(ctx,'sword',157,35);if(s.boomerang)AdventureArt.item(ctx,'boomerang',133,35,0);
  ctx.fillStyle='#d82800';AdventureArt.text(ctx,'-LIFE-',176,17,'red');for(let i=0;i<s.maxHp/2;i++){ctx.fillStyle=i*2<s.hp?'#d82800':'#747474';ctx.fillRect(179+i*9,34,3,5);ctx.fillRect(183+i*9,34,3,5);ctx.fillRect(178+i*9,36,9,3);ctx.fillRect(180+i*9,39,5,2);ctx.fillRect(182+i*9,41,1,1);if(s.hp===i*2+1){ctx.fillStyle='#747474';ctx.fillRect(183+i*9,34,3,7);}}
 }
 function draw(){const r=engine.room,p=engine.player,t=engine.time,s=engine.state;ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,256,240);drawHud();ctx.save();ctx.translate(0,64);AdventureArt.room(ctx,r);
  if(r.sideview){ctx.fillStyle='#000';ctx.fillRect(0,160,256,16);}
  if(r.zone==='dungeon'&&!r.sideview)for(const dir of Object.keys(r.exits))AdventureArt.door(ctx,dir,engine.doorClosed(dir));
  if(r.push){const [bx,by]=r.push.cell;if(s.pushed.includes(s.room)){AdventureArt.pushed(ctx,r);}else if(r.push.stairs){ctx.fillStyle='#008088';ctx.fillRect(128,80,16,16);}}
  if(r.npc){AdventureArt.sprite(ctx,'oldman',r.npc.x,r.npc.y);AdventureArt.fire(ctx,72,64,t);AdventureArt.fire(ctx,176,64,t);ctx.fillStyle='#fff';ctx.font='7px monospace';ctx.textAlign='center';if(s.room==='cave'&&!s.sword){AdventureArt.text(ctx,"IT'S DANGEROUS TO GO",128,20,'white',true);AdventureArt.text(ctx,'ALONE! TAKE THIS.',128,36,'white',true);}else if(s.room==='old'){AdventureArt.text(ctx,'EASTMOST PENNINSULA',128,20,'white',true);AdventureArt.text(ctx,'IS THE SECRET.',128,36,'white',true);}}
  if(r.item&&!s.items.includes(s.room+':'+r.item.id))AdventureArt.item(ctx,r.item.id,r.item.x,r.item.y,t);
  for(const d of engine.drops)AdventureArt.item(ctx,d.type,d.x,d.y,t);
  for(const e of engine.enemies)AdventureArt.sprite(ctx,e.type,e.x,e.y,Math.floor(t*5),e.dir,e.hurt>0);
  for(const trap of engine.traps)AdventureArt.sprite(ctx,'trap',trap.x,trap.y);
  if(p.attack<=0&&!(p.invincible>0&&Math.floor(t*12)%2))AdventureArt.sprite(ctx,'hero',p.x,p.y,Math.floor(p.walk),p.dir);
  if(p.attack>0)AdventureArt.sword(ctx,p);
  for(const q of engine.projectiles){if(q.type.includes('oomerang'))AdventureArt.item(ctx,'boomerang',q.x,q.y,t);else if(q.type==='beam')AdventureArt.beam(ctx,q);else if(q.type==='fire')AdventureArt.blit(ctx,'bosses',[101+9*(Math.floor(t*8)%4),11,8,16],q.x,q.y);else{ctx.fillStyle='#fcfcfc';ctx.fillRect(Math.round(q.x)-2,Math.round(q.y)-2,4,4);}}
  for(const q of engine.particles){ctx.fillStyle=q.color;ctx.fillRect(Math.round(q.x),Math.round(q.y),2,2);}ctx.restore();
 }
 function tick(now){const dt=last?Math.min((now-last)/1000,.035):0;last=now;engine.update(dt,held);soundtrack.sync(engine.room.zone,engine.mode);updateHud();draw();frame=requestAnimationFrame(tick);}
 updateHud();draw();frame=requestAnimationFrame(tick);
})();
