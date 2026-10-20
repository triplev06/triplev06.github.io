const assert=require('node:assert/strict'),E=require('./nes-engine.js'),W=require('./nes-world.js');
function arena(id='d4'){const e=new E(W,()=>{},()=>.99);e.loadRoom(id);e.enemies=[];e.player.invincible=99;return e;}
function ticks(e,n){for(let i=0;i<n;i++)e.update(1/60);}
{
 const events=[],e=new E(W,(name)=>events.push(name));e.enemies=[];const x=e.player.x;
 e.collect('sword');assert.equal(e.mode,'pickup');assert.equal(e.pickup.twoHands,false);
 e.update(.5,{right:true});assert.equal(e.player.x,x);assert.equal(e.mode,'pickup');ticks(e,70);assert.equal(e.mode,'playing');
 e.collect('relic');assert.equal(e.pickup.twoHands,true);assert(!events.includes('win'));ticks(e,100);assert.equal(e.mode,'pickup');ticks(e,50);assert.equal(e.mode,'won');assert.equal(events.filter(x=>x==='win').length,1);
}
console.log('PASS important pickups freeze movement, select the lifting pose, and delay victory until the Triforce hold completes');
{
 const e=arena();e.state.bombs=8;e.state.equippedB='bombs';e.player.x=120;e.player.y=56;e.player.dir='n';
 assert(e.placeBomb());assert.equal(e.state.bombs,7);assert.equal(e.bombs[0].stage,0);
 const victim={...W.stats.aquamentus,type:'aquamentus',id:0,x:120,y:40,hp:10,hurt:0};e.enemies=[victim];
 e.updateBombs(.81);assert.equal(e.bombs[0].stage,1);assert.equal(victim.hp,6);victim.hurt=0;
 e.updateBombs(.40);assert.equal(e.bombs[0].stage,2);assert.equal(victim.hp,6);assert(e.bombDoorOpen('n'));assert.equal(e.exits().n,'d7');
 e.updateBombs(.20);assert.equal(e.bombs[0].stage,3);e.updateBombs(.10);assert.equal(e.bombs.length,0);
 e.loadRoom('d7');assert(e.bombDoorOpen('s'));assert.equal(e.exits().s,'d4');
 const saved=JSON.parse(JSON.stringify(e.state)),restored=new E(W);assert(restored.restore(saved));restored.loadRoom('d4');assert(restored.bombDoorOpen('n'));
}
console.log('PASS four bomb stages, single damage per target, reciprocal hidden passage, and save restoration');
{
 const e=arena();e.state.bombs=3;assert(e.placeBomb());assert(e.placeBomb());assert(!e.placeBomb());assert.equal(e.state.bombs,1);
 e.bombs=[];e.state.boomerang=true;e.state.equippedB='bombs';assert(e.placeBomb());assert.equal(e.state.equippedB,'bombs');assert(!e.placeBomb());
 const d={type:'bombs'};e.drops=[d];e.state.bombs=7;e.takeDrop(d);assert.equal(e.state.bombs,8);
 e.openInventory();assert(e.inventoryItems().includes('bombs'));assert(e.equip('bombs'));e.closeInventory();
}
console.log('PASS bomb ammunition, simultaneous limit, pickup cap, and B inventory selection');
{
 const e=arena(),q={type:'beam',x:120,y:88};e.splitSword(q);e.splitSword(q);
 assert.equal(e.particles.length,4);assert.equal(new Set(e.particles.map(p=>Math.sign(p.vx)+','+Math.sign(p.vy))).size,4);
 e.splitSword({type:'arrow',x:120,y:88});assert.equal(e.particles.length,4);
 e.particles=[];e.projectiles=[{type:'beam',x:120,y:88,vx:125,vy:0,life:.001,friendly:true}];e.update(.01);assert.equal(e.particles.filter(p=>p.type==='swordFragment').length,4);
}
console.log('PASS sword beams break into four quadrants once and arrows do not');
{
 const e=arena('d3');e.transition('n');assert.equal(e.mode,'scroll');const x=e.player.x;e.update(.2,{right:true});assert.equal(e.player.x,x);ticks(e,30);assert.equal(e.mode,'playing');
}
console.log('PASS room scrolling freezes gameplay until the transition completes');
