'use strict';
let managedContent=null;
const escapeHTML=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeImage=v=>/^(?:[a-zA-Z0-9_./-]+\.(?:jpg|jpeg|png|webp)|data:image\/(?:jpeg|png|webp);base64,[a-zA-Z0-9+/=]+)$/.test(v||'')?v:'';
const validLink=v=>{try{const u=new URL(v);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}};
function contentDB(){return new Promise((resolve,reject)=>{const q=indexedDB.open('moshir-editor',1);q.onupgradeneeded=()=>q.result.createObjectStore('draft');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)})}
async function readEditorDraft(){const db=await contentDB();try{return await new Promise((resolve,reject)=>{const q=db.transaction('draft').objectStore('draft').get('content');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)})}finally{db.close()}}
function applyManagedContent(){
 if(!managedContent)return;
 const c=managedContent,imgs=Object.fromEntries(c.images.map(x=>[x.key,x]));
 const old={hero:'hero.jpg',germany:'germany.jpg',norway:'norway-work.jpg',japan:'japan.jpg',romania:'romania.jpg',serbia:'serbia.jpg',training:'training.jpg',engineering:'engineering.jpg',interview:'interview.jpg',resume:'resume.jpg'};
 document.querySelectorAll('img').forEach(im=>{for(const [key,file] of Object.entries(old)){if(im.getAttribute('src')==='./'+file&&imgs[key]){im.src=safeImage(imgs[key].file)||'./'+file;im.alt=imgs[key].alt;im.style.objectPosition=imgs[key].position||'50% 50%';break}}});
 for(let i=0;i<3;i++){const x=imgs['team'+i],figure=document.querySelectorAll('.person .portrait')[i];if(figure&&safeImage(x?.file)){figure.replaceChildren();const im=document.createElement('img');im.src=x.file;im.alt=x.alt;im.style.objectPosition=x.position;figure.append(im)}}
 if(lang==='fa'){
 document.title=c.seo.title;document.querySelector('meta[name="description"]').content=c.seo.description;
 const rail=document.createElement('div');rail.className='career-motion';rail.setAttribute('aria-label','شناخت، آمادگی، اقدام');rail.innerHTML='<span>شناخت</span><i aria-hidden="true"></i><span>آمادگی</span><i aria-hidden="true"></i><span>اقدام</span>';document.querySelector('.hero-copy')?.append(rail);
 const x=c.contact,section=document.getElementById('contact-channels');
 if(section&&(x.phone||x.email||x.address)){section.innerHTML='<div><span class="eyebrow">ارتباط با مشیر</span><h2>پیش از شروع، با ما گفت‌وگو کنید.</h2><p>'+escapeHTML(x.address)+'</p><p>'+escapeHTML(x.hours)+'</p></div><div class="managed-contacts">'+(x.phone?'<a dir="ltr" href="tel:'+escapeHTML(x.phone.replace(/[^+0-9]/g,''))+'">'+escapeHTML(x.phone)+'</a>':'')+(x.email?'<a href="mailto:'+escapeHTML(x.email)+'">'+escapeHTML(x.email)+'</a>':'')+(validLink(x.whatsapp)?'<a target="_blank" rel="noopener" href="'+escapeHTML(validLink(x.whatsapp))+'">گفت‌وگو در واتساپ ←</a>':'')+'<p>'+escapeHTML(x.license)+'</p></div>'}
 }
}
// Blog articles have independent HTML URLs so their text can be read without JavaScript.
blogSection=function(){const posts=(managedContent?.posts||[]).filter(x=>x.status==='published');return `<section class="wrap section blog-section" id="blog"><div class="section-head"><div><span class="eyebrow">وبلاگ و راهنماهای مشیر</span><h2>تصمیم بهتر، با اطلاعات روشن‌تر.</h2></div><p class="intro">مسیرها، آمادگی شغلی و تجربه‌های حرفه‌ای؛ با نویسنده و تاریخ بازبینی.</p></div><div class="blog-grid">${posts.map(a=>`<article><a href="./blog/${encodeURIComponent(a.id)}.html">${safeImage(a.image)?`<img src="${escapeHTML(a.image)}" alt="${escapeHTML(a.alt)}" width="650" height="400" loading="lazy">`:''}<div><span>${escapeHTML(a.category)}</span><h3>${escapeHTML(a.title)}</h3><p>${escapeHTML(a.lead)}</p><small>${escapeHTML(a.author)} · ${escapeHTML(a.date)} · مطالعه ←</small></div></a></article>`).join('')}</div></section>`};
(async()=>{try{
 const response=await fetch('./content.json',{cache:'no-cache'});if(!response.ok)throw Error('content');managedContent=await response.json();
 if(new URLSearchParams(location.search).has('editor-preview')){const draft=await readEditorDraft();if(draft)managedContent=draft;const m=document.createElement('meta');m.name='robots';m.content='noindex';document.head.append(m)}
 for(const x of managedContent.images){if(countryData[x.key]){countryData[x.key].image=safeImage(x.file);countryData[x.key].alt=escapeHTML(x.alt)}}
 for(const a of managedContent.posts){if(a.status!=='published'){delete articles[a.id];continue}articles[a.id]={...a,title:escapeHTML(a.title),category:escapeHTML(a.category),lead:escapeHTML(a.lead),notice:escapeHTML(a.notice),sections:a.sections.map(s=>s.map(escapeHTML)),image:safeImage(a.image),sources:[]}}
 }catch(e){console.error('Content loading failed',e)}render(initialLanguage());})();
