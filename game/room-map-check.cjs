const assert=require('node:assert/strict'),E=require('./nes-engine.js'),W=require('./nes-world.js');
for(const dir of ['n','s','e','w']){
 const entry=Object.entries(W.rooms).find(([,r])=>r.exits[dir]&&r.zone==='dungeon'&&!r.push);
 const e=new E(W);e.loadRoom(entry[0]);e.enemies=[];e.state.keys=9;e.player.dir=dir==='n'?'s':'n';e.transition(dir);
 assert.equal(e.state.room,entry[1].exits[dir]);assert.equal(e.player.dir,dir);for(let i=0;i<30;i++)e.update(1/60);assert.equal(e.player.dir,dir);
}
for(const dir of ['n','s','e','w']){
 const e=new E(W);e.state.sword=true;e.loadRoom('start');e.player.dir=dir;e.portal();assert.equal(e.state.room,'cave');assert.equal(e.player.dir,dir);
 e.loadRoom('d11');e.state.pushed.push('d11');e.player.dir=dir;e.portal();assert.equal(e.state.room,'cellar');assert.equal(e.player.dir,dir);e.portal();assert.equal(e.state.room,'d11');assert.equal(e.player.dir,dir);
}
console.log('PASS doors, cave entrances, and staircase portals retain travel direction through room changes');
const e=new E(W);assert(!e.hasDungeonItem('map'));assert(!e.hasDungeonItem('compass'));e.loadRoom('d7');e.collect('map');assert(e.hasDungeonItem('map'));assert(!e.hasDungeonItem('compass'));e.loadRoom('compass');e.collect('compass');assert(e.hasDungeonItem('compass'));
const restored=new E(W);assert(restored.restore(JSON.parse(JSON.stringify(e.state))));assert(restored.hasDungeonItem('map'));assert(restored.hasDungeonItem('compass'));restored.fresh();assert(!restored.hasDungeonItem('map'));assert(!restored.hasDungeonItem('compass'));
console.log('PASS map and compass unlock separately, persist through saves, and reset on new adventures');
