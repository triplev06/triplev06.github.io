/* Nintendo sprite sheets, ripped by Mister Mike. See nes/CREDITS.md. */
const AdventureArt = (() => {
 const images={},sheets=['link','overworld-enemies','dungeon-enemies','bosses','items','npcs','overworld','level1','font','hud','hud-clean','item-sprites','dungeon-tiles','overworld-clean'];
 const ready=Promise.all(sheets.map(name=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{
  if(['overworld','level1','hud','hud-clean','item-sprites','dungeon-tiles','overworld-clean'].includes(name)){images[name]=im;resolve();return;}
  const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);const data=g.getImageData(0,0,c.width,c.height);
  for(let i=0;i<data.data.length;i+=4){const r=data.data[i],g=data.data[i+1],b=data.data[i+2];if((r===0&&g===128&&b===0)||(r===116&&g===116&&b===116)||(name==='items'&&r===255&&g===255&&b===255)||(name==='font'&&r===0&&g===0&&b===0))data.data[i+3]=0;}
  g.putImageData(data,0,0);images[name]=c;resolve();
 };im.onerror=()=>reject(new Error('Unable to load '+name));im.src='game/nes/'+name+'.png';})));
 function blit(ctx,sheet,box,x,y,flip=false,flipY=false){const im=images[sheet];if(!im)return;const [sx,sy,w=16,h=16]=box;ctx.save();ctx.translate(Math.round(x),Math.round(y));if(flip||flipY)ctx.scale(flip?-1:1,flipY?-1:1);ctx.drawImage(im,sx,sy,w,h,-w/2,-h/2,w,h);ctx.restore();}
 function sprite(ctx,type,x,y,frame=0,dir='s',flash=false){
  const f=frame%2;let sheet='dungeon-enemies',box,flip=false,flipY=false;
  if(type==='hero'){sheet='link';box=[{s:1,n:69,w:35,e:35}[dir]+17*f,11];flip=dir==='w';}
  else if(type==='oldman'){sheet='npcs';box=[1,11];}
  else if(type==='octorok'||type==='blueOctorok'){sheet='overworld-enemies';box=[1+17*f+(dir==='w'||dir==='e'?34:0),type==='octorok'?11:28];flip=dir==='e';flipY=dir==='n';}
  else if(type==='moblin'){sheet='overworld-enemies';box=[dir==='s'?82:dir==='n'?99:116+17*f,11];flip=dir==='w';}
  else if(type==='keese')box=[183+17*f,11];
  else if(type==='stalfos')box=[1,59];
  else if(type==='gel')box=[1+9*f,11,8,16];
  else if(type==='goriya'){box=[dir==='s'?222:dir==='n'?239:256+17*f,11];flip=dir==='w';}
  else if(type==='wallmaster')box=[393+17*f,11];
  else if(type==='trap')box=[164,59];
  else if(type==='aquamentus'){sheet='bosses';box=[1+25*f,11,24,32];}
  if(!box)return;ctx.save();if(flash)ctx.globalAlpha=.45;blit(ctx,sheet,box,x,y,flip,flipY);ctx.restore();
 }
 function room(ctx,r){const im=images[r.sheet==='overworld'?'overworld-clean':r.sheet];if(im)ctx.drawImage(im,...r.crop,0,0,256,176);}
 const itemFrames={"sword":[0,0,16,16],"boomerang":[16,0,16,16],"bow":[32,0,16,16],"key":[48,0,16,16],"rupees":[64,0,16,16],"blueRupee":[80,0,16,16],"heal":[96,0,16,16],"fairy":[112,0,16,16],"container":[128,0,16,16],"map":[144,0,16,16],"compass":[160,0,16,16],"relic":[176,0,16,16],"bombs":[192,0,16,16],"arrow":[208,0,16,16],"candle":[224,0,16,16],"animations":{"fairy":[[112,0,16,16],[112,16,16,16]],"rupees":[[64,0,16,16],[64,16,16,16]],"blueRupee":[[80,0,16,16],[80,16,16,16]],"map":[[144,0,16,16],[144,16,16,16]],"relic":[[176,0,16,16],[176,16,16,16]],"heal":[[96,0,16,16],[96,16,16,16]]},"clock":[240,0,16,16]};
 function item(ctx,type,x,y,t=0){const name=type==='heart'?'container':type;const animation=itemFrames.animations?.[name],box=animation?animation[Math.floor(t*8)%animation.length]:itemFrames[name];if(box)blit(ctx,'item-sprites',box,x,y);}
 function arrow(ctx,q){ctx.save();ctx.translate(Math.round(q.x),Math.round(q.y));ctx.rotate(q.vx?(q.vx>0?Math.PI/2:-Math.PI/2):q.vy>0?Math.PI:0);item(ctx,'arrow',0,0);ctx.restore();}
 function boomerang(ctx,q){const f=Math.floor((q.age||0)*24)%8;const poses=[[64,false,false],[73,false,false],[82,false,false],[73,true,false],[64,true,false],[73,true,true],[82,false,true],[73,false,true]],pose=poses[f];blit(ctx,'link',[pose[0],185,8,16],q.x,q.y,pose[1],pose[2]);}
 function bomb(ctx,b){const frames=[[129,185,8,16],[138,185,16,16],[155,185,16,16],[172,185,16,16]],frame=frames[b.stage];blit(ctx,'link',frame,b.x,b.y);if(b.stage>0){const alternate=Math.floor(b.elapsed*60)%2,offsets=alternate?[[7,-13],[-13,0],[-7,14]]:[[-7,-13],[14,0],[7,14]];for(const [x,y]of offsets)blit(ctx,'link',frame,b.x+x,b.y+y);}}
 // The wooden-sword fragment faces upper left in the sheet; mirror into each quadrant.
 function swordFragment(ctx,q){blit(ctx,'link',[27,155,8,16],q.x,q.y,q.vx>0,q.vy>0);}
 function pickup(ctx,p,pickup,t){blit(ctx,'link',[pickup.twoHands?229:212,11,16,16],p.x,p.y);item(ctx,pickup.id,p.x+(pickup.twoHands?0:-4),p.y-16,t);}
 function useItem(ctx,p){blit(ctx,'link',[{s:106,e:123,w:123,n:140}[p.dir],11,16,16],p.x,p.y,p.dir==='w');}
 function fire(ctx,x,y,t){blit(ctx,'npcs',[Math.floor(t*6)%2?52:35,11],x,y);}
 function blade(ctx,x,y,dir){ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.rotate({n:0,e:Math.PI/2,s:Math.PI,w:-Math.PI/2}[dir]);blit(ctx,'link',[1,155,8,16],0,0);ctx.restore();}
 function sword(ctx,p){
  // Original attack frames include both Link and the sword. Align by Link's body.
  const extended=p.attack>.06;
  if(p.dir==='s')blit(ctx,'link',extended?[18,47,16,27]:[35,47,16,24],p.x,p.y+(extended?5.5:4));
  else if(p.dir==='n')blit(ctx,'link',extended?[18,97,16,27]:[35,100,16,24],p.x,p.y-(extended?5.5:4));
  else blit(ctx,'link',extended?[18,77,27,16]:[46,77,24,16],p.x+(p.dir==='e'?1:-1)*(extended?5.5:4),p.y,p.dir==='w');
 }
 function beam(ctx,q){blade(ctx,q.x,q.y,q.vx?(q.vx>0?'e':'w'):(q.vy>0?'s':'n'));}
 function door(ctx,dir,closed,exists=true,locked=false,bombed=false){const vertical=dir==='n'||dir==='s',x=vertical?112:dir==='w'?0:224,y=vertical?(dir==='n'?0:144):72;const sx=bombed?947:!exists?815:!closed?848:locked?881:914,sy={n:11,w:44,e:77,s:110}[dir];ctx.drawImage(images['dungeon-tiles'],sx,sy,32,32,x,y,32,32);}
 function secrets(ctx,r,revealed){if(r.push?.stairs){const x=r.portal.x-8,y=r.portal.y-8;ctx.drawImage(images['dungeon-tiles'],984,11,16,16,x,y,16,16);if(revealed)ctx.drawImage(images['dungeon-tiles'],1035,28,16,16,x,y,16,16);}}
 function pushed(ctx,r,offset,motion){const [x,y]=r.push.cell,dx=motion?motion.dx*motion.elapsed/motion.duration:offset.dx,dy=motion?motion.dy*motion.elapsed/motion.duration:offset.dy;ctx.drawImage(images['dungeon-tiles'],984,11,16,16,x*16,y*16,16,16);ctx.drawImage(images['dungeon-tiles'],1001,11,16,16,Math.round((x+dx)*16),Math.round((y+dy)*16),16,16);}
 function hud(ctx){ctx.drawImage(images['hud-clean'],258,11,256,56,0,8,256,56);}
 function heart(ctx,x,y,fill='full'){const sx={empty:627,half:636,full:645}[fill];ctx.drawImage(images.hud,sx,117,8,8,x,y,8,8);}
 function inventory(ctx,dungeon){ctx.fillStyle='#000';ctx.fillRect(0,0,256,176);ctx.drawImage(images['hud-clean'],0,11,256,88,0,0,256,88);ctx.drawImage(images['hud-clean'],dungeon?258:0,112,256,88,0,88,256,88);}
function text(ctx,value,x,y,color='white',center=false){const chars='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-,!?&."';if(center)x-=value.length*4;for(let i=0;i<value.length;i++){const ch=value[i].toUpperCase(),index=chars.indexOf(ch);if(index>=0)ctx.drawImage(images.font,336+(index%16)*16,24+Math.floor(index/16)*16+(color==='red'?128:0),8,8,Math.round(x+i*8),Math.round(y),8,8);else if(ch==="'"){ctx.fillStyle='#fff';ctx.fillRect(Math.round(x+i*8+3),y,2,3);}}}
 return {ready,sprite,item,fire,room,sword,beam,door,blit,pushed,text,secrets,hud,heart,inventory,arrow,boomerang,bomb,swordFragment,pickup,useItem};
})();

