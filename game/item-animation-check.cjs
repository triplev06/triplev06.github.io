const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),frames=require('./nes/item-sprites.json');const calls=[];const ctx={save(){},restore(){},translate(){},scale(){},drawImage(...args){calls.push(args.slice(1,5));}};
const sandbox={Image:class{set src(v){this.width=512;this.height=512;this.onload();}},document:{createElement(){return {getContext(){return {drawImage(){},getImageData(){return {data:[]};},putImageData(){}};}};}}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync(__dirname+'/nes-art.js','utf8')+';this.art=AdventureArt;',sandbox);
const png=fs.readFileSync(__dirname+'/nes/item-sprites.png'),width=png.readUInt32BE(16),height=png.readUInt32BE(20);
for(const name of ['fairy','rupees','blueRupee','map','relic','heal']){
 const poses=[];for(const t of [0,.125,.25]){calls.length=0;sandbox.art.item(ctx,name,40,40,t);assert.equal(calls.length,1);poses.push(calls[0]);}
 assert.notDeepEqual(poses[0],poses[1],name+' changes frame');assert.deepEqual(poses[0],poses[2],name+' loops cleanly');
 assert.deepEqual(poses[0],frames.animations[name][0]);assert.deepEqual(poses[1],frames.animations[name][1]);
 for(const [x,y,w,h] of frames.animations[name]){assert(x>=0&&y>=0&&x+w<=width&&y+h<=height);assert.equal(x%16,0);assert.equal(y%16,0);assert.equal(w,16);assert.equal(h,16);}
}
for(const name of ['key','sword','bow']){calls.length=0;sandbox.art.item(ctx,name,0,0,0);const before=calls[0];calls.length=0;sandbox.art.item(ctx,name,0,0,.125);assert.deepEqual(calls[0],before,name+' stays static');}
console.log('PASS fairy wings and rupee/map/Triforce/heart palette frames alternate and loop within isolated atlas cells');
console.log('PASS keys, sword, and bow remain static and correctly cropped');
