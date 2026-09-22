/* Browser recreation of the opening route and Eagle. No ROM or emulator. */
class AdventureEngine {
 constructor(world,emit=()=>{}){this.world=world;this.emit=emit;this.fresh();}
 fresh(){this.movementOrder={};this.inputSequence=0;this.state={version:2,room:'start',hp:6,maxHp:6,sword:false,bow:false,boomerang:false,keys:0,rupees:0,items:[],cleared:[],visited:[],unlocked:[],pushed:[],won:false};this.time=0;this.mode='playing';this.loadRoom('start',120,88);}
 restore(data){if(!data||data.version!==2||!this.world.rooms[data.room]||!['items','cleared','visited','unlocked','pushed'].every(k=>Array.isArray(data[k])))return false;this.state={...this.state,...data};this.state.maxHp=data.maxHp===8?8:6;this.state.hp=Math.max(1,Math.min(this.state.maxHp,Number(data.hp)||this.state.maxHp));this.loadRoom(this.world.rooms[data.room].zone==='dungeon'?'d0':'start',120,128);return true;}
 get room(){return this.world.rooms[this.state.room];}
 loadRoom(id,x=120,y=136){this.state.room=id;this.grid=this.world.tiles(id);if(!this.state.visited.includes(id))this.state.visited.push(id);this.player={x,y,dir:'n',cooldown:0,attack:0,invincible:.8,walk:0};this.enemies=this.state.cleared.includes(id)?[]:this.room.enemies.map(([type,ex,ey],i)=>({...this.world.stats[type],type,x:ex,y:ey,id:i,maxHp:this.world.stats[type].hp,shoot:1.4+i*.3,hurt:0,stun:0,phase:i,turn:0,dir:'s'}));this.traps=(this.room.traps||[]).map(([x,y])=>({x,y,homeX:x,homeY:y,phase:'idle',dx:0,dy:0}));this.projectiles=[];this.particles=[];this.drops=[];this.roomTime=0;this.portalArmed=!this.room.portal||Math.hypot(x-this.room.portal.x,y-this.room.portal.y)>24;this.shotCooldown=0;this.noticeCooldown=0;this.pushTime=0;this.swordHits=new Set();if(this.state.pushed.includes(id))this.applyPush();this.emit('room',this.room.name);this.emit('save',this.state);}
 solid(x,y,half=5){for(const dx of [-half,half])for(const dy of [-half,half]){const tx=Math.floor((x+dx)/16),ty=Math.floor((y+dy)/16);if(tx<0||tx>15||ty<0||ty>10)continue;if(this.grid[ty][tx]!=='floor')return true;}return false;}
 move(e,dx,dy,half=5){const ox=e.x,oy=e.y;if(!this.solid(e.x+dx,e.y,half))e.x+=dx;if(!this.solid(e.x,e.y+dy,half))e.y+=dy;return ox!==e.x||oy!==e.y;}
 // Follow cardinal tile-center waypoints so ground enemies can round corners.
 navigate(e,dt,speed){
  const cells=[];for(let y=1;y<10;y++)for(let x=1;x<15;x++)if(!this.solid(x*16+8,y*16+8))cells.push([x,y]);
  if(!cells.length)return;
  const nearest=(x,y)=>cells.reduce((a,b)=>Math.hypot(b[0]*16+8-x,b[1]*16+8-y)<Math.hypot(a[0]*16+8-x,a[1]*16+8-y)?b:a);
  if(this.solid(e.x,e.y)){const c=nearest(e.x,e.y);e.x=c[0]*16+8;e.y=c[1]*16+8;e.path=null;}
  if(!e.path?.length){
   const start=nearest(e.x,e.y),target=nearest(this.player.x,this.player.y),key=c=>c.join(','),queue=[start],prev=new Map([[key(start),null]]);
   for(let i=0;i<queue.length;i++){const c=queue[i];if(key(c)===key(target))break;
    for(const [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]]){const n=[c[0]+dx,c[1]+dy];if(n[0]<1||n[0]>14||n[1]<1||n[1]>9||this.solid(n[0]*16+8,n[1]*16+8)||prev.has(key(n)))continue;prev.set(key(n),c);queue.push(n);}}
   let end=prev.has(key(target))?target:queue.reduce((a,b)=>Math.hypot(b[0]-target[0],b[1]-target[1])<Math.hypot(a[0]-target[0],a[1]-target[1])?b:a);
   const path=[];while(end){path.unshift({x:end[0]*16+8,y:end[1]*16+8});end=prev.get(key(end));}e.path=path.slice(0,4);
  }
  const dest=e.path[0];if(!dest)return;const dx=dest.x-e.x,dy=dest.y-e.y;
  if(Math.abs(dx)<.1&&Math.abs(dy)<.1){e.path.shift();return;}
  const horizontal=Math.abs(dx)>.1;e.dir=horizontal?(dx>0?'e':'w'):(dy>0?'s':'n');const step=speed*dt;
  if(!this.move(e,horizontal?Math.sign(dx)*Math.min(Math.abs(dx),step):0,horizontal?0:Math.sign(dy)*Math.min(Math.abs(dy),step)))e.path=null;
 }
 vector(dir){return {n:[0,-1],s:[0,1],w:[-1,0],e:[1,0]}[dir];}
 message(text){if(this.noticeCooldown<=0){this.emit('notice',text);this.noticeCooldown=1.5;}}
 say(speaker,text,action){this.mode='dialogue';this.emit('dialogue',{speaker,text,action});}
 finishDialogue(action){this.mode='playing';if(action)this.collect(action);}
 interact(){if(this.mode!=='playing')return;const p=this.player,r=this.room;
  if(r.npc&&Math.hypot(p.x-r.npc.x,p.y-r.npc.y)<56){if(this.state.room==='cave'&&!this.state.sword)this.say('OLD MAN',"IT'S DANGEROUS TO GO ALONE! TAKE THIS.",'sword');else if(this.state.room==='old')this.say('OLD MAN','EASTMOST PENNINSULA IS THE SECRET.');else this.say('OLD MAN','GO EAST, THEN NORTH FOUR TIMES. CROSS THE BRIDGE TO LEVEL 1.');return;}
  if(r.push&&!this.state.pushed.includes(this.state.room)){const [x,y]=r.push.cell;if(Math.hypot(p.x-(x*16+8),p.y-(y*16+8))<27){this.pushBlock();return;}}
  if(r.item&&!this.state.items.includes(this.state.room+':'+r.item.id)&&Math.hypot(p.x-r.item.x,p.y-r.item.y)<25){this.collect(r.item.id);return;}
  if(r.portal&&Math.hypot(p.x-r.portal.x,p.y-r.portal.y)<25){this.portal();return;}
  const drop=this.drops.find(d=>Math.hypot(p.x-d.x,p.y-d.y)<24);if(drop)this.takeDrop(drop);else this.message('Move closer to an item or the old man. Push blocks with E.');
 }
 collect(id){const tag=this.state.room+':'+id;if(this.state.items.includes(tag))return;this.state.items.push(tag);
  if(['sword','bow','boomerang'].includes(id))this.state[id]=true;
  if(id==='sword')this.emit('notice','Wooden sword acquired. At full life, your sword fires a beam.');
  if(id==='bow')this.say('BOW ACQUIRED','You found the bow. Arrows are sold beyond this excerpt’s route. Your sword and boomerang can complete Level 1.');
  if(id==='boomerang')this.emit('notice','Boomerang acquired · K / X / B. Stun enemies and collect drops.');
  if(id==='key'){this.state.keys++;this.emit('notice','Small key acquired.');}
  if(id==='map'||id==='compass')this.emit('notice',id==='map'?'Dungeon map collected. Your full minimap is already available.':'Compass collected. The Triforce waits beyond Aquamentus.');
  if(id==='container'){this.state.maxHp=8;this.state.hp=8;this.emit('notice','Heart container! Maximum life increased to four hearts.');}
  if(id==='relic'){this.state.hp=this.state.maxHp;this.state.won=true;this.mode='won';this.emit('win');}
  this.emit('sound','item');this.emit('save',this.state);
 }
 takeDrop(d){this.drops=this.drops.filter(x=>x!==d);if(d.reward)this.collect(d.type);else{if(d.type==='heal')this.state.hp=Math.min(this.state.maxHp,this.state.hp+2);else this.state.rupees++;this.emit('sound','item');this.emit('save',this.state);}}
 applyPush(){const push=this.room.push;if(!push)return;const [x,y]=push.cell;this.grid[y][x]='floor';this.grid[y-1][x]='wall';}
 pushBlock(){if(this.enemies.length){this.message('Defeat the enemies before pushing this block.');return;}this.state.pushed.push(this.state.room);this.applyPush();this.emit('sound','clear');this.emit('notice',this.room.push.stairs?'A staircase is revealed.':'The shutter opens.');this.emit('save',this.state);}
 portal(){const r=this.room;if(!r.portal)return;if(r.push?.stairs&&!this.state.pushed.includes(this.state.room)){this.message('Push the block beside the staircase first.');return;}const to=r.portal.to;if(to==='d0'&&!this.state.sword){this.message('Take the sword from the starting cave first.');return;}if(to==='cellar')this.loadRoom(to,56,32);else if(to==='d11')this.loadRoom(to,152,88);else this.loadRoom(to,120,128);}
 doorClosed(dir){return Boolean((this.room.gates?.includes(dir)&&this.enemies.length)||(this.room.locks?.[dir]&&!this.state.unlocked.includes(this.room.locks[dir]))||(this.room.push?.opens===dir&&!this.state.pushed.includes(this.state.room)));}
 transition(dir){const target=this.room.exits[dir];if(!target){this.message('This excerpt follows the marked route to Level 1.');this.bounce(dir);return;}
  if((this.room.gates?.includes(dir)&&this.enemies.length)||(this.room.push?.opens===dir&&!this.state.pushed.includes(this.state.room))){this.message('The shutter is closed. Clear the room or push its block.');this.bounce(dir);return;}
  const lock=this.room.locks?.[dir];if(lock&&!this.state.unlocked.includes(lock)){if(this.state.keys<=0){this.message('You need a small key. Check the rooms on your map.');this.bounce(dir);return;}this.state.keys--;this.state.unlocked.push(lock);this.emit('sound','item');}
  const dungeon=this.world.rooms[target].zone==='dungeon';let x=this.player.x,y=this.player.y;if(dir==='n')y=dungeon?135:158;if(dir==='s')y=dungeon?40:18;if(dir==='w')x=dungeon?215:238;if(dir==='e')x=dungeon?40:18;if(dungeon){if(dir==='n'||dir==='s')x=120;else y=88;}
  if(this.state.room==='cave'){x=72;y=48;}if(this.state.room==='d0'&&dir==='s'){x=120;y=95;}this.loadRoom(target,x,y);
 }
 bounce(dir){if(dir==='n')this.player.y=this.room.zone==='dungeon'?38:10;if(dir==='s')this.player.y=this.room.zone==='dungeon'?138:165;if(dir==='w')this.player.x=this.room.zone==='dungeon'?38:10;if(dir==='e')this.player.x=this.room.zone==='dungeon'?218:245;}
 attack(){const p=this.player;if(this.mode!=='playing'||p.cooldown>0)return;if(!this.state.sword){this.message('Enter the cave and take the wooden sword.');return;}p.attack=.18;p.cooldown=.28;this.swordHits.clear();this.emit('sound','sword');if(this.state.hp===this.state.maxHp&&!this.projectiles.some(q=>q.type==='beam')){const [x,y]=this.vector(p.dir);this.projectiles.push({x:p.x+x*14,y:p.y+y*14,vx:x*125,vy:y*125,life:2,friendly:true,type:'beam'});}}
 shoot(){if(this.mode!=='playing'||this.shotCooldown>0)return;if(!this.state.boomerang){this.message('Find the boomerang in the Eagle dungeon.');return;}if(this.projectiles.some(q=>q.friendly&&q.type==='boomerang'))return;const p=this.player,[dx,dy]=this.vector(p.dir);this.projectiles.push({x:p.x,y:p.y,vx:dx*115,vy:dy*115,life:2.2,age:0,friendly:true,type:'boomerang',hit:new Set()});this.shotCooldown=.4;this.emit('sound','arrow');}
 burst(x,y,color,count){for(let i=0;i<count;i++){const a=i*Math.PI*2/count;this.particles.push({x,y,vx:Math.cos(a)*22,vy:Math.sin(a)*22,life:.25,color});}}
 damageEnemy(e,damage=1){if(e.hurt>0||e.hp<=0)return;e.hp-=damage;e.hurt=.25;if(e.type!=='aquamentus'){const d=Math.max(1,Math.hypot(e.x-this.player.x,e.y-this.player.y));this.move(e,(e.x-this.player.x)/d*7,(e.y-this.player.y)/d*7);}this.emit('sound','hit');this.burst(e.x,e.y,'#fcfcfc',5);if(e.hp<=0){this.state.rupees++;if(e.type!=='aquamentus')this.drops.push({x:e.x,y:e.y,type:e.id%2===0?'heal':'rupees'});}}
 hurt(source){const p=this.player;if(p.invincible>0)return;if(source){const d=Math.max(1,Math.hypot(p.x-source.x,p.y-source.y));this.move(p,(p.x-source.x)/d*10,(p.y-source.y)/d*10);}this.state.hp--;p.invincible=1;this.emit('sound','hurt');if(this.state.hp<=0){this.mode='dead';this.emit('dead');}}
 retry(){this.state.hp=this.state.maxHp;this.mode='playing';this.loadRoom(this.room.zone==='dungeon'?'d0':'start',120,128);}
 update(dt,input={}){if(this.mode!=='playing')return;dt=Math.min(dt,.035);this.time+=dt;this.roomTime+=dt;this.noticeCooldown-=dt;this.shotCooldown-=dt;const p=this.player;p.cooldown=Math.max(0,p.cooldown-dt);p.attack=Math.max(0,p.attack-dt);p.invincible=Math.max(0,p.invincible-dt);
  let dx=(input.right?1:0)-(input.left?1:0),dy=(input.down?1:0)-(input.up?1:0);this.inputSequence++;for(const key of ['up','down','left','right']){if(!input[key])delete this.movementOrder[key];else if(this.movementOrder[key]===undefined)this.movementOrder[key]=this.inputSequence;}
  if(this.room.sideview){const ladder=Math.abs(p.x-56)<8||Math.abs(p.x-184)<8;if(dx){p.dir=dx>0?'e':'w';this.move(p,dx*75*dt,0);}if(ladder&&dy){p.y+=dy*70*dt;}else if(!ladder)this.move(p,0,85*dt);p.y=Math.max(8,Math.min(122,p.y));p.x=Math.max(37,Math.min(215,p.x));p.walk+=dt*8;}
  else if(dx||dy){const horizontal=dx>0?'right':'left',vertical=dy>0?'down':'up';p.dir=dx&&(!dy||this.movementOrder[horizontal]<=this.movementOrder[vertical])?(dx>0?'e':'w'):(dy>0?'s':'n');const speed=78/Math.hypot(dx,dy);const moved=this.move(p,dx*speed*dt,dy*speed*dt);p.walk+=dt*10;if(!moved&&this.room.push&&!this.state.pushed.includes(this.state.room)){const [bx,by]=this.room.push.cell;if(Math.hypot(p.x-(bx*16+8),p.y-(by*16+8))<26){this.pushTime+=dt;if(this.pushTime>.4){this.pushBlock();this.pushTime=0;}}}}
  if(input.attack)this.attack();if(input.shoot)this.shoot();
  const old=this.state.room;if(p.y<5)this.transition('n');else if(p.y>171)this.transition('s');else if(p.x<5)this.transition('w');else if(p.x>251)this.transition('e');if(old!==this.state.room)return;
  const r=this.room;if(r.portal&&Math.hypot(p.x-r.portal.x,p.y-r.portal.y)>24)this.portalArmed=true;if(r.portal&&this.portalArmed&&this.roomTime>.6&&Math.hypot(p.x-r.portal.x,p.y-r.portal.y)<13){if(!r.push?.stairs||this.state.pushed.includes(this.state.room)){this.portal();return;}}
  if(r.item&&!this.state.items.includes(old+':'+r.item.id)&&Math.hypot(p.x-r.item.x,p.y-r.item.y)<12){if(r.item.id==='sword'&&!this.state.sword)this.interact();else this.collect(r.item.id);if(this.mode!=='playing')return;}
  for(const d of [...this.drops])if(Math.hypot(p.x-d.x,p.y-d.y)<12)this.takeDrop(d);
  for(const e of this.enemies){if(e.hp<=0)continue;e.hurt=Math.max(0,e.hurt-dt);e.stun=Math.max(0,e.stun-dt);e.phase+=dt;e.shoot-=dt;e.turn-=dt;
   if(e.type==='aquamentus'){e.x=190+Math.sin(this.time*.8)*16;e.y=88;}
   else if(e.stun<=0&&e.hurt<=0){if(e.type==='keese'){e.x+=Math.cos(e.phase*1.7)*e.speed*dt;e.y+=Math.sin(e.phase*1.2)*e.speed*dt;e.x=Math.max(36,Math.min(220,e.x));e.y=Math.max(38,Math.min(135,e.y));}
    else {const speed=e.type==='gel'&&e.phase%1.2>.4?0:e.speed;this.navigate(e,dt,speed);}}if(e.range&&e.shoot<=0&&e.stun<=0){e.shoot=e.range;if(e.type==='aquamentus'){const a=Math.atan2(p.y-e.y,p.x-e.x);for(const o of [-.3,0,.3])this.projectiles.push({x:e.x-10,y:e.y-9,vx:Math.cos(a+o)*58,vy:Math.sin(a+o)*58,life:4,type:'fire',friendly:false});}else{const [vx,vy]=this.vector(e.dir);this.projectiles.push({x:e.x,y:e.y,vx:vx*65,vy:vy*65,life:e.type==='goriya'?1.5:3,age:0,type:e.type==='goriya'?'enemyBoomerang':'rock',friendly:false});}}
   const distance=Math.hypot(p.x-e.x,p.y-e.y);if(distance<(e.type==='aquamentus'?18:12)&&e.stun<=0){if(e.type==='wallmaster'&&p.invincible<=0){this.emit('notice','A Wallmaster caught you! Back to the entrance.');this.loadRoom('d0',120,128);return;}this.hurt(e);}
   const targetY=e.type==='aquamentus'?e.y-10:e.y;if(p.attack>0&&!this.swordHits.has(e.id)){const [vx,vy]=this.vector(p.dir),along=(e.x-p.x)*vx+(targetY-p.y)*vy,across=Math.abs((e.x-p.x)*vy-(targetY-p.y)*vx);if(along>-4&&along<27&&across<13){this.swordHits.add(e.id);this.damageEnemy(e);}}
  }
  for(const trap of this.traps){if(trap.phase==='idle'){if(Math.abs(p.x-trap.x)<9){trap.dy=Math.sign(p.y-trap.y);trap.dx=0;trap.phase='dash';}else if(Math.abs(p.y-trap.y)<9){trap.dx=Math.sign(p.x-trap.x);trap.dy=0;trap.phase='dash';}}
   if(trap.phase==='dash'){trap.x+=trap.dx*125*dt;trap.y+=trap.dy*125*dt;if((trap.dx&&(trap.x<41||trap.x>215))||(trap.dy&&(trap.y<41||trap.y>135))||Math.hypot(trap.x-trap.homeX,trap.y-trap.homeY)>92)trap.phase='return';}
   if(trap.phase==='return'){const d=Math.hypot(trap.homeX-trap.x,trap.homeY-trap.y);if(d<2){trap.x=trap.homeX;trap.y=trap.homeY;trap.phase='idle';}else{trap.x+=(trap.homeX-trap.x)/d*36*dt;trap.y+=(trap.homeY-trap.y)/d*36*dt;}}if(Math.hypot(trap.x-p.x,trap.y-p.y)<13)this.hurt(trap);}
  const had=this.enemies.length>0;this.enemies=this.enemies.filter(e=>e.hp>0);if(had&&!this.enemies.length){this.state.cleared.push(old);this.emit('sound','clear');this.emit('save',this.state);}
  if(r.reward&&this.state.cleared.includes(old)&&!this.state.items.includes(old+':'+r.reward)&&!this.drops.some(d=>d.reward))this.drops.push({x:r.rewardPos[0],y:r.rewardPos[1],type:r.reward,reward:true});
  for(const q of this.projectiles){q.age=(q.age||0)+dt;if(q.type==='boomerang'&&q.age>.55){const a=Math.atan2(p.y-q.y,p.x-q.x);q.vx=Math.cos(a)*135;q.vy=Math.sin(a)*135;if(Math.hypot(p.x-q.x,p.y-q.y)<9)q.life=0;}if(q.type==='enemyBoomerang'&&q.age>.65&&!q.turned){q.vx*=-1;q.vy*=-1;q.turned=true;}q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;
   if(q.x<0||q.x>256||q.y<0||q.y>176)q.life=0;
   if(q.friendly){for(const e of this.enemies){if(q.life>0&&Math.hypot(q.x-e.x,q.y-(e.type==='aquamentus'?e.y-10:e.y))<11){if(q.type==='boomerang'){if(!q.hit.has(e.id)){q.hit.add(e.id);if(['keese','gel'].includes(e.type))this.damageEnemy(e);else if(e.type!=='aquamentus')e.stun=1.8;}}else{this.damageEnemy(e);q.life=0;break;}}}if(q.life>0&&q.type==='boomerang')for(const d of [...this.drops])if(Math.hypot(d.x-q.x,d.y-q.y)<10)this.takeDrop(d);}
   else if(q.life>0&&Math.hypot(q.x-p.x,q.y-p.y)<9){const [vx,vy]=this.vector(p.dir),facing=(q.x-p.x)*vx+(q.y-p.y)*vy>0,approaching=q.vx*vx+q.vy*vy<0;if(['rock','enemyBoomerang'].includes(q.type)&&facing&&approaching&&p.attack===0)this.emit('sound','hit');else this.hurt(q);q.life=0;}
  }this.projectiles=this.projectiles.filter(q=>q.life>0);for(const q of this.particles){q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;}this.particles=this.particles.filter(q=>q.life>0);
 }
}
if(typeof module!=='undefined')module.exports=AdventureEngine;
