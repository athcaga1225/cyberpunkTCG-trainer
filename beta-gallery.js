/* NIGHT CITY TRAINING: Beta gallery index; core mechanics not inferred from card images. */
(()=>{'use strict';
const root=document.getElementById('betaCardCollection'),starter=document.getElementById('starterDeckGallery');
if(!root||!starter)return;
const buttons=[...document.querySelectorAll('[data-card-view]')];
const search=document.getElementById('betaSearch'),rarity=document.getElementById('betaRarity'),series=document.getElementById('betaSeries');
const grid=document.getElementById('betaResults'),count=document.getElementById('betaCount');
const pages=document.getElementById('betaPages'),prev=document.getElementById('betaPrevious'),next=document.getElementById('betaNext');
const status=document.getElementById('betaLoadStatus'),detail=document.getElementById('betaCardDetail'),detailBody=document.getElementById('betaCardDetailBody');
const PAGE_SIZE=24;
let all=[],filtered=[],page=0,active='starter';
const zhName=c=>c.nameZh||window.NCTLocale?.cardName?.(c.name)||c.name;
const create=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el};
function switchTo(view){
 active=view==='beta'?'beta':'starter';
 root.hidden=active!=='beta';
 starter.hidden=active!=='starter';
 buttons.forEach(btn=>{const yes=btn.dataset.cardView===active;btn.setAttribute('aria-selected',String(yes));btn.classList.toggle('selected',yes)});
}
buttons.forEach(btn=>btn.addEventListener('click',()=>switchTo(btn.dataset.cardView)));
function filter(){
 const q=search.value.toLowerCase().trim();
 const choice=rarity.value,set=series.value;
 filtered=all.filter(c=>(set==='all'||c.set===set)&&(choice==='all'||c.rarity===choice)&&(!q||c.id.toLowerCase().includes(q)||c.name.toLowerCase().includes(q)||zhName(c).toLowerCase().includes(q)));
 page=0;render();
}

function openCard(c){
 detailBody.replaceChildren();
 // Use the same image-first hierarchy as the physical card and the reviewed mockup.
 const visual=create('div','beta-detail-art');
 const frame=create('div','beta-detail-image-frame');
 const img=document.createElement('img');
 img.loading='eager';img.decoding='async';img.src=c.imageUrl;img.alt=c.name+' 卡面';
 frame.append(img);visual.append(frame);
 const info=create('div','beta-detail-copy');
 const identity=create('div','beta-card-identity');
 const accent=create('span','beta-title-accent');accent.setAttribute('aria-hidden','true');
 const names=create('div','beta-card-names');
 const title=create('h3','beta-detail-title',zhName(c));
 const english=create('p','beta-detail-english',c.name);
 names.append(title,english);
 const badges=create('div','beta-detail-eyebrow');
 badges.append(create('span','beta-detail-rarity',c.rarity.toUpperCase()),create('span','beta-detail-number',c.id));
 identity.append(accent,names,badges);
 info.append(identity);
 // Color, type and numbers require verified card data. Do not invent them.
 const values=[['COST',c.cost],['RAM',c.ram],['POW',c.power]];
 const verified=values.filter(([,v])=>v!==null&&v!==undefined&&v!=='');
 if(verified.length){
  const stats=create('div','beta-detail-stats');
  for(const [label,value] of verified){
   const stat=create('div','beta-detail-stat');
   stat.append(create('small','',label),create('strong','',String(value)));
   stats.append(stat);
  }
  info.append(stats);
 }
 if(c.color||c.type){
  const tags=create('div','beta-detail-tags');
  if(c.color)tags.append(create('span','beta-color-pill',String(c.color)));
  if(c.type)tags.append(create('span','',String(c.type)));
  info.append(tags);
 }
 const effect=create('section','beta-detail-effect');
 effect.append(create('h4','', '效果'));
 effect.append(create('p','beta-ability-text',c.abilityZh||'此卡的中文能力尚未整理，請參考卡面英文原文。'));
 info.append(effect);
 const links=create('div','beta-detail-links');
 const source=create('a','');
 source.href=c.abilitySource||c.imageSource||c.imageUrl;
 source.target='_blank';source.rel='noopener noreferrer';
 source.textContent=c.abilitySource?'官方能力原文 ↗':'卡牌來源 ↗';
 const original=create('a','');
 original.href=c.imageUrl;original.target='_blank';original.rel='noopener noreferrer';
 original.textContent='開啟原始卡圖 ↗';
 links.append(source,original);info.append(links);
 detailBody.append(visual,info);
 root.querySelectorAll('.beta-tile').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.cardId===c.id)));
 if(!detail.open){
  if(window.NCTCardModal)window.NCTCardModal.open(detail);
  else detail.showModal();
 }
 detailBody.scrollTop=0;
 document.getElementById('betaDetailHeading').focus({preventScroll:true});
}
function tile(c){
 const btn=create('button','beta-tile');btn.type='button';btn.dataset.cardId=c.id;btn.setAttribute('aria-pressed','false');btn.setAttribute('aria-label','檢視 '+c.id+' '+zhName(c));
 const visual=create('span','beta-card-art');
 const img=document.createElement('img');img.loading='lazy';img.decoding='async';img.src=c.imageUrl;img.alt=c.name+' 卡圖';
 const fallback=create('span','beta-art-fallback','圖片無法顯示');
 img.addEventListener('error',()=>{img.hidden=true;fallback.hidden=false});
 fallback.hidden=true;visual.append(img,fallback);
 const title=create('strong','beta-card-title',zhName(c));
 const eng=create('span','beta-card-english',c.name);
 const meta=create('span','beta-card-meta');
 meta.append(create('b','',c.id),create('span','',c.rarity));
 btn.append(visual,title,eng,meta);
 btn.addEventListener('click',()=>openCard(c));
 return btn;
}
function render(){
 if(detail.open)detail.close();
 grid.replaceChildren();
 const start=page*PAGE_SIZE,items=filtered.slice(start,start+PAGE_SIZE);
 for(const c of items)grid.append(tile(c));
 const totalPages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
 pages.textContent='第 '+(page+1)+' / '+totalPages+' 頁';
 prev.disabled=page===0;next.disabled=page>=totalPages-1;
 count.textContent='符合條件 '+filtered.length+' / '+all.length+' 張';
 if(!items.length)grid.append(create('p','beta-empty','沒有符合條件的卡牌。'));
}
document.getElementById('betaDetailClose').addEventListener('click',()=>detail.close());
detail.addEventListener('click',event=>{if(event.target===detail)detail.close()});
detail.addEventListener('close',()=>root.querySelectorAll('.beta-tile').forEach(el=>el.setAttribute('aria-pressed','false')));
search.addEventListener('input',filter);
rarity.addEventListener('change',filter);
series.addEventListener('change',filter);
prev.addEventListener('click',()=>{if(page>0){page--;render();root.scrollIntoView({block:'start',behavior:'smooth'})}});
next.addEventListener('click',()=>{if((page+1)*PAGE_SIZE<filtered.length){page++;render();root.scrollIntoView({block:'start',behavior:'smooth'})}});
fetch('./beta-cards.json?v=2',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(data=>{
 const cards=data.cards||[];
 if(cards.length!==178||new Set(cards.map(x=>x.id)).size!==178)throw Error('Beta 卡牌清單不完整');
 all=cards;filtered=all.slice();
 const rarityNames=[...new Set(cards.map(c=>c.rarity))];
 const order=['Common','Uncommon','Rare','Epic','Secret','Iconic Legend','Iconic Other','Iconic Secret','Nova Rare'];
 rarityNames.sort((a,b)=>order.indexOf(a)-order.indexOf(b));
 for(const name of rarityNames){const option=create('option','',name);option.value=name;rarity.append(option)}
 status.textContent='已載入 178 張 Beta 卡牌，其中 '+cards.filter(c=>c.abilityZh).length+' 張已完成繁中能力翻譯。';
 render();
}).catch(err=>{
 status.textContent='Beta 資料載入失敗：'+err.message+'。請檢查網路後重新整理。';
 count.textContent='資料暫時無法載入';
});
switchTo('starter');
})();
