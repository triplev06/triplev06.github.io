const assert=require('node:assert/strict'),W=require('./nes-world.js'),E=require('./nes-engine.js');
function finish(g){for(let i=0;i<12;i++)g.update(1/60);assert.equal(g.blockMotion,null);}
for(const room of ['d6','d11'])for(const dir of ['n','s','w','e']){
 const g=new E(W);g.loadRoom(room);g.enemies=[];g.traps=[];const [bx,by]=g.room.push.cell,[dx,dy]=g.vector(dir);g.player.x=bx*16+8-dx*14;g.player.y=by*16+8-dy*14;g.player.dir=dir;
 const before={x:g.player.x,y:g.player.y};assert(g.pushBlock());assert(!g.state.pushed.includes(room),'Not committed until animation ends');g.update(.035);assert(g.blockMotion.elapsed>0&&g.blockMotion.elapsed<.18);assert.equal(g.player.x,before.x);assert.equal(g.player.y,before.y);finish(g);
 assert.equal(g.grid[by][bx],'floor');assert.equal(g.grid[by+dy][bx+dx],'wall');assert.deepEqual(g.state.blockMoves[room],{dx,dy});assert(!g.solid(g.player.x,g.player.y),'Player must remain outside the block');assert(!g.pushBlock(),'Cannot push twice');
 const save=JSON.parse(JSON.stringify(g.state)),restored=new E(W);assert(restored.restore(save));restored.loadRoom(room);assert.equal(restored.grid[by+dy][bx+dx],'wall');assert(!restored.solid(restored.player.x,restored.player.y));
}
console.log('PASS both dungeon blocks animate in all four push directions, preserve collision, and survive save/reload');
{
 const g=new E(W);g.loadRoom('d11',118,88);g.enemies=[];g.traps=[];g.player.dir='w';g.grid[5][5]='wall';assert(!g.pushBlock());assert(!g.blockMotion);assert.deepEqual(g.state.pushed,[]);g.grid[5][5]='floor';g.player.x=104;assert(!g.pushBlock(),'Cannot push while inside the source block');g.player.x=118;g.enemies=[{hp:1,x:40,y:40}];assert(!g.pushBlock(),'Must clear enemies');g.enemies=[];g.traps=[{x:88,y:88}];assert(!g.pushBlock(),'Destination occupied');
}
console.log('PASS blocked, occupied, misaligned, and uncleared pushes are rejected');
{
 const g=new E(W);g.loadRoom('d11',118,88);g.player.dir='w';g.enemies=[];g.traps=[];g.state.sword=true;g.state.boomerang=true;g.state.bow=true;g.state.equippedB='boomerang';g.projectiles=[{x:50,y:50,vx:40,vy:0,life:2}];
 assert(g.openInventory());const time=g.time,pos={...g.player},shot={...g.projectiles[0]};for(let i=0;i<100;i++)g.update(.03,{left:true,attack:true,shoot:true});assert.equal(g.time,time);assert.deepEqual(g.player,pos);assert.deepEqual(g.projectiles[0],shot);assert(!g.equip('candle'));assert(g.equip('bow'));g.closeInventory();g.shoot();assert(!g.projectiles.some(q=>q.type==='arrow'),'A bow without arrows cannot shoot');assert(g.openInventory());g.cycleInventory(1);assert.equal(g.state.equippedB,'boomerang');g.closeInventory();g.shoot();assert(g.projectiles.some(q=>q.type==='boomerang'));assert(g.pushBlock('w'));assert(!g.openInventory(),'Do not interrupt a block slide');finish(g);
 const restored=new E(W);assert(restored.restore(JSON.parse(JSON.stringify(g.state))));assert.equal(restored.state.equippedB,'boomerang');
}
console.log('PASS inventory pauses all simulation, equips only owned B items, and persists selection');
{
 let spawned=0,rupees=0;for(let i=0;i<1000;i++){const g=new E(W,()=>{},()=>i/1000);g.damageEnemy({type:'octorok',hp:1,hurt:0,x:80,y:80,id:i});assert.equal(g.state.rupees,0,'No automatic money on kills');spawned+=g.drops.length;rupees+=g.drops.filter(d=>['rupees','blueRupee'].includes(d.type)).length;}
 assert.equal(spawned,313);assert.equal(rupees,313);
 const g=new E(W);g.loadRoom('cave',128,120);g.enemies=[];g.drops=[{type:'rupees',x:60,y:60,life:.01}];g.update(.02);assert.equal(g.drops.length,0);g.drops=[{type:'key',x:60,y:60,reward:true}];for(let i=0;i<600;i++)g.update(.02);assert.equal(g.drops.length,1,'Dungeon key cannot expire');const d={type:'blueRupee',x:60,y:60,life:8};g.drops.push(d);g.takeDrop(d);assert.equal(g.state.rupees,5);
}
console.log('PASS red Octorok drop-rate threshold, no automatic currency, five-rupee pickups, and permanent puzzle rewards');
{
 const g=new E(W);g.state.pushed=['d11'];g.loadRoom('d11',104,72);assert(!g.solid(g.player.x,g.player.y),'Legacy saves recover a safe spawn');assert(g.state.blockMoves.d11);
 const g2=new E(W);g2.state.boomerang=true;const data=JSON.parse(JSON.stringify(g2.state));delete data.blockMoves;delete data.equippedB;assert(g2.restore(data));assert.equal(g2.state.equippedB,'boomerang');
}
console.log('PASS legacy saves migrate block offsets and equipped items safely');
