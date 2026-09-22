/* Nintendo sprite sheets, ripped by Mister Mike. See nes/CREDITS.md. */
const AdventureArt = (() => {
 const images={},sheets=['link','overworld-enemies','dungeon-enemies','bosses','items','npcs','overworld','level1','font'];
 const ready=Promise.all(sheets.map(name=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{
  if(['overworld','level1'].includes(name)){images[name]=im;resolve();return;}
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
 function room(ctx,r){const im=images[r.sheet];if(im)ctx.drawImage(im,...r.crop,0,0,256,176);}
 function item(ctx,type,x,y,t=0){const f=Math.floor(t*6)%2;const defs={sword:['link',[1,155,8,16]],key:['items',[239,0,8,16]],bow:['items',[143,0,8,16]],boomerang:['link',[64+9*f,185,8,16]],heart:['items',[25,0,16,16]],heal:['items',[0,f?16:0,8,8]],rupees:['items',[72,0,8,16]],relic:['items',[272,f?16:0,16,16]],map:['items',[88,0,8,16]],compass:['items',[58,0,16,16]],container:['items',[25,0,16,16]]};const def=defs[type];if(def)blit(ctx,def[0],def[1],x,y);}
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
 function door(ctx,dir,closed){const vertical=dir==='n'||dir==='s',x=vertical?112:dir==='w'?0:224,y=vertical?(dir==='n'?0:144):72;ctx.save();
  if(!closed){const src={n:[627,886,32,32],s:[627,1030,32,32],w:[515,958,32,32],e:[739,958,32,32]}[dir];ctx.drawImage(images.level1,...src,x,y,32,32);}
  else {ctx.fillStyle='#183c5c';ctx.fillRect(x+(vertical?0:8),y+(vertical?8:0),vertical?32:16,vertical?16:32);ctx.strokeStyle='#00e8d8';ctx.strokeRect(x+4,y+4,24,24);ctx.fillStyle='#000';ctx.fillRect(x+14,y+11,4,9);}
  ctx.restore();
 }
 function pushed(ctx,r){const [x,y]=r.push.cell,im=images[r.sheet];ctx.drawImage(im,r.crop[0]+32,r.crop[1]+32,16,16,x*16,y*16,16,16);ctx.drawImage(im,r.crop[0]+x*16,r.crop[1]+y*16,16,16,x*16,(y-1)*16,16,16);}
function text(ctx,value,x,y,color='white',center=false){const chars='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-,!?&."';if(center)x-=value.length*4;for(let i=0;i<value.length;i++){const ch=value[i].toUpperCase(),index=chars.indexOf(ch);if(index>=0)ctx.drawImage(images.font,336+(index%16)*16,24+Math.floor(index/16)*16+(color==='red'?128:0),8,8,Math.round(x+i*8),Math.round(y),8,8);else if(ch==="'"){ctx.fillStyle='#fff';ctx.fillRect(Math.round(x+i*8+3),y,2,3);}}}
 return {ready,sprite,item,fire,room,sword,beam,door,blit,pushed,text};
})();

