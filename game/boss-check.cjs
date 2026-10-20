const assert=require('node:assert/strict'),E=require('./nes-engine.js'),W=require('./nes-world.js');
function arena(){const g=new E(W);g.loadRoom('boss');g.enemies[0].shoot=99;g.player.invincible=99;g.state.sword=true;return g;}
// At every height across the sprite, attack the visible body from both sides.
for(const yOffset of [-14,0,14])for(const dir of ['e','w']){const g=arena(),b=g.enemies[0];b.x=190;b.y=88;g.player.x=190+(dir==='e'?-30:30);g.player.y=88+yOffset;g.player.dir=dir;g.attack();g.projectiles=[];g.update(.01);assert.equal(b.hp,5,dir+' sword at y '+yOffset);g.update(.01);assert.equal(b.hp,5,'One damage per swing');}
for(const dir of ['n','s']){const g=arena(),b=g.enemies[0];b.x=190;b.y=88;g.player.x=190;g.player.y=88+(dir==='n'?34:-34);g.player.dir=dir;g.attack();g.projectiles=[];g.update(.01);assert.equal(b.hp,5,dir+' vertical sword');}
console.log('PASS sword attacks damage head, torso, and lower body from both sides and above/below');
for(const type of ['beam','arrow'])for(const yOffset of [-14,0,14]){const g=arena(),b=g.enemies[0];g.projectiles=[{x:190,y:88+yOffset,vx:1,vy:0,life:1,type,friendly:true}];g.update(.01);assert.equal(b.hp,5,type+' at y '+yOffset);assert(!g.projectiles.some(q=>q.friendly),'Hit projectile is consumed');}
console.log('PASS beams and arrows hit the entire boss sprite');
{const g=arena(),b=g.enemies[0];b.x=190;b.y=88;for(const pos of [{x:165,y:88},{x:215,y:88},{x:190,y:64},{x:190,y:112}])assert(!g.projectileTouches(b,{...pos,vx:1,vy:0,type:'arrow'}),'Miss outside body: '+JSON.stringify(pos));g.player.x=150;g.player.y=88;g.player.dir='e';assert(!g.swordTouches(b));g.player.x=160;g.player.y=114;assert(!g.swordTouches(b));}
console.log('PASS misses outside the body and sword reach remain misses');
{const g=arena(),b=g.enemies[0];g.projectiles=[{x:190,y:88,vx:1,vy:0,life:1,type:'beam',friendly:true},{x:190,y:88,vx:1,vy:0,life:1,type:'arrow',friendly:true}];g.update(.01);assert.equal(b.hp,5,'Damage cooldown prevents stacked hits');b.hurt=0;g.projectiles=[{x:190,y:101,vx:1,vy:0,life:1,type:'beam',friendly:true}];g.update(.01);assert.equal(b.hp,4);}
console.log('PASS boss damage cooldown remains active across projectile types');
