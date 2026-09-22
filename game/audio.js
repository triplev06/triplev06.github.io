class AdventureAudio {
 constructor(make=(name)=>{const a=new Audio('game/audio/'+name+'.mp3');a.preload='metadata';a.dataset.track=name;document.body.append(a);return a;}){
  this.tracks=Object.fromEntries(['overworld','dungeon','item','death','triforce'].map(n=>[n,make(n)]));
  for(const n of ['overworld','dungeon']){this.tracks[n].loop=true;this.tracks[n].volume=.35;}
  for(const n of ['item','death','triforce']){this.tracks[n].volume=.65;this.tracks[n].addEventListener('ended',()=>{if(this.currentCue===n){this.currentCue=null;this.apply();}});}
  this.enabled=false;this.hidden=false;this.mode='paused';this.zone='overworld';this.terminal=false;this.currentCue=null;this.wanted=new Set();
 }
 enable(value){this.enabled=value;this.apply();}
 background(value){this.hidden=value;this.apply();}
 sync(zone,mode){if(zone===this.zone&&mode===this.mode)return;this.zone=zone;this.mode=mode;this.apply();}
 resetCue(){this.currentCue=null;this.terminal=false;for(const n of ['item','death','triforce']){this.tracks[n].pause();this.tracks[n].currentTime=0;}this.apply();}
 cue(name){if(this.terminal&&name==='item')return;if(name!=='item')this.terminal=true;if(!this.enabled)return;
  if(this.currentCue){this.tracks[this.currentCue].pause();this.wanted.delete(this.currentCue);}
  this.currentCue=name;this.tracks[name].currentTime=0;this.apply();
 }
 apply(){const active=this.enabled&&!this.hidden;const desired=new Set();
  if(active&&this.currentCue&&(this.mode!=='paused'||this.terminal))desired.add(this.currentCue);
  if(active&&!this.terminal&&['playing','dialogue'].includes(this.mode)&&['overworld','dungeon'].includes(this.zone))desired.add(this.zone);
  for(const [name,a] of Object.entries(this.tracks)){
   if(name==='overworld'||name==='dungeon')a.volume=this.currentCue==='item' ? .12 : .35;
   if(desired.has(name)){
    if(a.paused){
     Promise.resolve(a.play()).catch(()=>{this.wanted.delete(name);});
    }
   }else a.pause();
  }this.wanted=desired;
 }
}
if(typeof module!=='undefined')module.exports=AdventureAudio;
