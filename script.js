const projects = [{"name": "TheoHealth", "tag": "CO-FOUNDER \u00b7 AI STRATEGY", "year": "2025\u201426", "desc": "Turning everyday stories into better care.", "body": "Co-founded TheoHealth, a conversational medical diary that turns patient narratives into structured clinical data. Helped secure enough startup funding to get the venture started, find mentors, and lead the startup\u2019s AI strategy. Led a 10-person team, refined the experience through 40+ user surveys, and established physician partnerships for pilot testing. I have since stepped away from the team.", "metric": "85%", "label": "AI extraction accuracy", "tech": "Gemini API \u00b7 Firebase \u00b7 React Native", "award": "1st \u00b7 Give Back Hack / 3rd \u00b7 OSU Appathon", "link": "", "flow": ["Patient narrative", "AI extraction", "Clinical data"]}, {"name": "Gotham AI", "tag": "MULTIMODAL AI", "year": "2025", "desc": "Three personas. One very capable assistant.", "body": "Built an assistant with three Batman-universe personas, custom voices, biometric authentication, real-time vision, and five mini-games. Combined RAG, function calling, and streaming for responsive interactions. Added Council Mode for parallel responses from all three personas, cinematic intros, and more than 15 Easter eggs.", "metric": "3", "label": "voice-distinct personas", "tech": "Llama 4 \u00b7 Groq \u00b7 React \u00b7 Supabase", "award": "2nd \u00b7 BDAA Projects Series Showcase", "link": "https://github.com/triplev06/GothamAI", "flow": ["Voice + vision", "RAG + tools", "Live response"]}, {"name": "BLACKOUT", "tag": "AI \u00d7 INFRASTRUCTURE", "year": "2025", "desc": "Exploring what happens when the grid goes dark.", "body": "Built BLACKOUT with a team for the AEP sponsor challenge at Hack OHI/O 2025. The prototype calculates weather-dependent line ratings using IEEE 738, visualizes grid stress, simulates outages with N-1 contingency analysis, and explores 24-hour load scenarios. A Claude-powered conversational assistant helps transmission planners query the grid data.", "metric": "2nd", "label": "Hack OHI/O 2025", "tech": "React \u00b7 TypeScript \u00b7 Python / Flask \u00b7 PyPSA \u00b7 Plotly \u00b7 Claude \u00b7 RAG", "award": "2nd \u00b7 AEP sponsor track, Hack OHI/O 2025", "link": "https://github.com/triplev06/aepHackathon", "flow": ["Outage scenario", "AI agents", "Grid simulation"]}, {"name": "AutoPatt", "tag": "COMPUTER VISION", "year": "2024\u201425", "desc": "Precision at a very different scale.", "body": "Built a semiconductor tracking system using OpenCV and Arduino-controlled servos to automate detection and rotation with approximately 99% accuracy. The early Intel hackathon prototype is public; the later project repository is private.", "metric": "~99%", "label": "tracking accuracy", "tech": "Python \u00b7 OpenCV \u00b7 Arduino \u00b7 C", "award": "1st \u00b7 Intel Hack OHI/O / 2nd \u00b7 OSU Tech Showcase", "link": "https://github.com/triplev06/Intel-Hack-I-O-idea", "flow": ["Camera input", "Object detection", "Servo alignment"]}, {"name": "AdviseBot", "tag": "AGENTIC AI", "year": "2024", "desc": "A clearer path through academic advising.", "body": "Built an AI-driven virtual academic advisor to improve the OSU advisory workflow, achieving a 40% improvement in efficiency.", "metric": "40%", "label": "workflow efficiency improvement", "tech": "Agentic AI", "award": "1st \u00b7 Accenture OSU Case Competition", "link": "https://docs.google.com/presentation/d/1Lv4M7nYDbX-TdNwPD_kOThuMOeA8bba6p0GpzjwIuLg/edit", "flow": ["Student question", "Academic guidance", "Next steps"]}];
const $ = s => document.querySelector(s);
const discoveries = {
 bg3: ['Baldur’s Gate 3', 'Roll the die in Selected Work.', 'The dice have spoken.'],
 pokemon: ['Pokémon', 'Find the flying visitor around the working prototypes, or summon it in About.', 'Rayquaza appeared.'],
  zelda: ['The Legend of Zelda', 'A golden triangle near the beginning.', 'You found the Triforce. Courage, wisdom, and a little curiosity.'],
  elden: ['Elden Ring', 'Even an ambitious journey needs a moment of grace.', 'Lost Grace discovered. Rest a while, Tarnished.'],
  cyberpunk: ['Cyberpunk 2077', 'A familiar year is hiding in the toolkit.', 'Connection established. Welcome to Night City, choom.'],
  witcher: ['The Witcher 3', 'Check the toolkit for one more contract.', 'Contract complete. A coin for your curiosity.'],
  zombies: ['CoD Zombies', 'Something mysterious waits at the bottom.', 'Mystery box opened. You pulled the Ray Gun!']
};
let found = new Set(), toastTimer;
try { const saved = JSON.parse(localStorage.getItem('vv-discoveries') || '[]'); if(Array.isArray(saved)) found = new Set(saved.filter(x => Object.hasOwn(discoveries,x))); } catch {}
function persist(){try{localStorage.setItem('vv-discoveries',JSON.stringify([...found]));}catch{}}
function notify(message){$('.toast').textContent=message;$('.toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('.toast').classList.remove('visible'),5500);}
function renderQuest(){
 document.dispatchEvent(new CustomEvent('discoverieschange'));

 document.querySelectorAll('.quest-count').forEach(el=>el.textContent=`${found.size}/7`);
 $('#quest-list').replaceChildren();
 Object.entries(discoveries).forEach(([key,[name,hint]])=>{const li=document.createElement('li');li.classList.toggle('found',found.has(key));li.append(`${found.has(key)?'✓':'◇'} ${name}`);const small=document.createElement('small');small.textContent=found.has(key)?'Discovered':hint;li.append(small);$('#quest-list').append(li);});
 $('.quest-status').textContent=found.size===7?'All seven found. Thanks for exploring my favorite worlds!':`${found.size} of 7 discoveries. Follow the hints, or keep exploring.`;

}
let previousFocus;
function openDialog(dialog){previousFocus=document.activeElement;dialog.showModal();dialog.querySelector('.close').focus();}
for(const dialog of document.querySelectorAll('dialog')){
 dialog.querySelector('.close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>previousFocus?.focus());
}
for(const button of document.querySelectorAll('[data-project]'))button.addEventListener('click',()=>{
 const p=projects[Number(button.dataset.project)];
 for(const [id,key] of Object.entries({'project-title':'name','project-tag':'tag','project-body':'body','project-metric':'metric','project-label':'label','project-award':'award','project-tech':'tech'}))document.getElementById(id).textContent=p[key];
 $('#project-link').replaceChildren();
 if(p.link){const a=document.createElement('a');a.href=p.link;a.target='_blank';a.rel='noopener noreferrer';a.className='primary';a.textContent=p.link.includes('github')?'Explore the code ↗':'View presentation ↗';$('#project-link').append(a);}else{const p=document.createElement('p');p.textContent='Private repository';$('#project-link').append(p);}
 openDialog($('#project-dialog'));
});
for(const button of document.querySelectorAll('[data-secret]'))button.addEventListener('click',()=>{const key=button.dataset.secret;const isNew=!found.has(key);found.add(key);persist();renderQuest();$('.toast').classList.remove('visible');});
document.querySelectorAll('.quest-open').forEach(b=>b.addEventListener('click',()=>{renderQuest();openDialog($('#quest-dialog'));}));

$('#reset-quest').addEventListener('click',()=>{found.clear();persist();renderQuest();});
const sectionObserver=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){document.querySelectorAll('header nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));}},{rootMargin:'-20% 0px -55% 0px'});
document.querySelectorAll('main section[id]').forEach(s=>sectionObserver.observe(s));
renderQuest();
const validWorlds = ['default','zelda','cyberpunk','souls'];
let world='default', mode=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light', paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
try { const w=localStorage.getItem('vv-world');if(validWorlds.includes(w))world=w;const m=localStorage.getItem('vv-mode');if(['light','dark'].includes(m))mode=m;paused=paused||localStorage.getItem('vv-motion-paused')==='true'; }catch{}
function applyWorld(){
 document.body.dataset.world=world;document.body.dataset.mode=mode;document.body.classList.toggle('motion-paused',paused);
 document.querySelectorAll('[data-world]').forEach(b=>{if(b.tagName==='BUTTON')b.setAttribute('aria-pressed',String(b.dataset.world===world));});
 $('#mode-toggle').textContent=mode==='dark'?'Light mode':'Dark mode';$('#motion-toggle').textContent=paused?'Resume motion':'Pause motion';$('#motion-toggle').setAttribute('aria-pressed',String(paused));
 document.querySelector('meta[name="theme-color"]').content=getComputedStyle(document.body).getPropertyValue('--bg').trim();
 try{localStorage.setItem('vv-world',world);localStorage.setItem('vv-mode',mode);localStorage.setItem('vv-motion-paused',String(paused));}catch{}
}
document.querySelectorAll('.world-options button').forEach(b=>b.addEventListener('click',()=>{world=b.dataset.world;applyWorld();notify(`${b.querySelector('strong').textContent} theme selected.`);}));
$('#mode-toggle').addEventListener('click',()=>{mode=mode==='dark'?'light':'dark';applyWorld();});
$('#motion-toggle').addEventListener('click',()=>{paused=!paused;applyWorld();});
function markDiscoveries(){document.querySelectorAll('[data-secret]').forEach(b=>b.classList.toggle('discovered',found.has(b.dataset.secret)));}
document.querySelectorAll('[data-secret]').forEach(b=>b.addEventListener('click',markDiscoveries));$('#reset-quest').addEventListener('click',markDiscoveries);
applyWorld();markDiscoveries();
