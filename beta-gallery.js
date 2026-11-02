/* NIGHT CITY TRAINING: Beta gallery index; core mechanics not inferred from card images. */
(()=>{'use strict';
const root=document.getElementById('betaCardCollection'),starter=document.getElementById('starterDeckGallery');
if(!root||!starter)return;
// Keep the shared dialog outside either tab's hidden subtree.
const sharedDialog=document.getElementById('betaCardDetail');
if(sharedDialog)document.getElementById('decks').append(sharedDialog);
const buttons=[...document.querySelectorAll('[data-card-view]')];
const search=document.getElementById('betaSearch'),rarity=document.getElementById('betaRarity'),series=document.getElementById('betaSeries');
const grid=document.getElementById('betaResults'),count=document.getElementById('betaCount');
const pages=document.getElementById('betaPages'),pageSelect=document.getElementById('betaPageSelect'),prev=document.getElementById('betaPrevious'),next=document.getElementById('betaNext');
const status=document.getElementById('betaLoadStatus'),detail=document.getElementById('betaCardDetail'),detailBody=document.getElementById('betaCardDetailBody');
const PAGE_SIZE=24;
let all=[],filtered=[],page=0,active='beta';
const zhName=c=>c.nameZh||window.NCTLocale?.cardName?.(c.name)||c.name;
const create=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el};
const tagZh={
 'ARASAKA':'荒坂','MERC':'傭兵','GANGER':'幫派成員','NETRUNNER':'竄網使',
 'TYGER CLAWS':'虎鉤眾','CORPO':'企業人士','MILITECH':'軍武科技','MAELSTROM':'漩戰幫',
 'ANIMAL':'蠻獸派','ROCKER':'搖滾客','SAMURAI':'武士','VALENTINO':'瓦倫提諾',
 '6TH STREET':'六街遊俠','DRONE':'無人機','ZETATECH':'ZETA科技','CYBERWARE':'義體',
 'TRAUMA TEAM':'創傷小組','RIPPERDOC':'神機醫','VOODOO BOYS':'巫毒仔',
 'SCAVENGER':'清道夫','MEDTECH':'醫療技師','MOX':'茉刺盟','DOLL':'玩偶','MAINE\'S CREW':'魅音小隊','MYSTIC':'秘術師','ALDECALDO':'阿德卡多族',
 'VEHICLE':'載具','TECHIE':'械鬥匠','WEAPON':'武器','BRAINDANCE':'幻舞','EXTREME':'極限',
 'QUICKHACK':'快速破解','PLAN':'計畫','NOMAD':'遊牧民','FIXER':'合事佬','NCPD':'夜城警察局','RAFFEN SHIV':'劫戮民','AI':'人工智慧','NETWATCH':'衛網監理'
};
const typeZh={Legend:'傳奇卡',Unit:'單位卡',Gear:'裝備卡',Program:'程式卡'};
const colorZh={Red:'紅色',Yellow:'黃色',Blue:'藍色',Green:'綠色'};
const rarityZh={Common:'普通',Uncommon:'非普通',Rare:'稀有',Epic:'史詩',Secret:'秘密',
 'Iconic Legend':'標誌性傳奇','Iconic Other':'標誌性特殊','Iconic Secret':'標誌性秘密','Nova Rare':'新星稀有'};
const translatedTag=t=>(tagZh[String(t).toUpperCase()]||t)+'（'+t+'）';
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
 // Verified cards use their own color accent; unverified cards remain neutral.
 const color=String(c.color||'').toLowerCase();
 detail.dataset.cardColor=['red','yellow','blue','green'].includes(color)?color:'neutral';
 detailBody.replaceChildren();
 // Use the same image-first hierarchy as the physical card and the reviewed mockup.
 const visual=create('div','beta-detail-art');
 const frame=create('div','beta-detail-image-frame');
 const img=document.createElement('img');
 img.loading='eager';img.decoding='async';img.src=c.imageUrl;img.alt=c.name+' 卡面';
 img.draggable=false;img.style.pointerEvents='none';frame.append(img);visual.append(frame);
 const info=create('div','beta-detail-copy');
 const identity=create('div','beta-card-identity');
 const accent=create('span','beta-title-accent');accent.setAttribute('aria-hidden','true');
 const names=create('div','beta-card-names');
 const title=create('h3','beta-detail-title',zhName(c));
 const english=create('p','beta-detail-english',c.name);
 names.append(title,english);
 const kind=c.type?create('p','beta-card-kind',typeZh[c.type]||c.type):null;
 if(kind)names.append(kind);
 identity.append(accent,names);
 info.append(identity);
 // Show the same three-cell COST / RAM / POW layout for every Beta card.
 // Null means the value is not printed on that card and is shown as an em dash.
 if(['beta','topper','starter'].includes(c.set) && Object.prototype.hasOwnProperty.call(c,'ram')){
  const stats=create('div','beta-detail-stats');
  for(const [label,value] of [['COST',c.cost],['RAM',c.ram],['POW',c.power]]){
   const stat=create('div','beta-detail-stat');
   stat.append(create('small','',label),create('strong','',value===null||value===undefined?'—':String(value)));
   stats.append(stat);
  }
  info.append(stats);
 }
 if(Array.isArray(c.tags)&&c.tags.length){
  const tags=create('div','beta-detail-tags');
  for(const tag of c.tags)tags.append(create('span','',translatedTag(tag)));
  info.append(tags);
 }
 const effect=create('section','beta-detail-effect');
 effect.append(create('p','beta-ability-text',c.abilityZh||'此卡的中文能力尚未整理，請參考卡面英文原文。'));
 info.append(effect);
 const links=create('div','beta-detail-links');
 const source=create('a','');
 source.href=c.abilitySource||c.imageSource||c.imageUrl;
 source.target='_blank';source.rel='noopener noreferrer';
 source.textContent=c.abilitySource?'官方能力原文 ↗':'卡牌來源 ↗';
 links.append(source);info.append(links);
 detailBody.append(visual,info);
 root.querySelectorAll('.beta-tile').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.cardId===c.id)));
 if(!detail.open){
  if(window.NCTCardModal)window.NCTCardModal.open(detail);
  else detail.showModal();
 }
 detailBody.scrollTop=0;
 document.getElementById('betaDetailHeading').focus({preventScroll:true});
}
// Starter cards reuse the Beta detail layout, but never inherit another printing's
// rules or numbers solely because the English title happens to match.
function openStarterCard(anchor){
 const english=anchor.dataset.cardName||'';
 const matching=all.find(c=>c.name===english);
 // Reuse verified shared-card attributes only; do not borrow Beta rules or stats.
 const card={name:english,nameZh:matching?.nameZh||window.NCTLocale?.cardName?.(english)||english,
  imageUrl:anchor.dataset.deckImage||anchor.href,
  imageSource:anchor.href,
  set:'starter',type:matching?.type||null,color:matching?.color||null,tags:matching?.tags||[],cost:null,ram:null,power:null,
  abilityZh:'初始牌組版本的能力與數值尚未逐張核對，請以左側實體卡面為準。'};
 openCard(card);
}
starter.addEventListener('click',event=>{
 const anchor=event.target.closest('a[data-deck-image]');
 if(!anchor||!starter.contains(anchor))return;
 event.preventDefault();
 event.stopPropagation();
 openStarterCard(anchor);
},true);

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
 pages.textContent='／共 '+totalPages+' 頁';
 pageSelect.replaceChildren();
 for(let n=1;n<=totalPages;n++){const option=create('option','',`第 ${n} 頁`);option.value=String(n-1);pageSelect.append(option)}
 pageSelect.value=String(page);
 prev.disabled=page===0;next.disabled=page>=totalPages-1;
 count.textContent='符合條件 '+filtered.length+' / '+all.length+' 張';
 if(!items.length)grid.append(create('p','beta-empty','沒有符合條件的卡牌。'));
}
document.getElementById('betaDetailClose').addEventListener('click',()=>detail.close());
detail.addEventListener('click',event=>{if(event.target!==detail)return;const r=detail.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)detail.close()});
detail.addEventListener('close',()=>root.querySelectorAll('.beta-tile').forEach(el=>el.setAttribute('aria-pressed','false')));
search.addEventListener('input',filter);
rarity.addEventListener('change',filter);
series.addEventListener('change',filter);
pageSelect.addEventListener('change',()=>{page=Number(pageSelect.value);render();root.scrollIntoView({block:'start',behavior:'smooth'})});
prev.addEventListener('click',()=>{if(page>0){page--;render();root.scrollIntoView({block:'start',behavior:'smooth'})}});
next.addEventListener('click',()=>{if((page+1)*PAGE_SIZE<filtered.length){page++;render();root.scrollIntoView({block:'start',behavior:'smooth'})}});
fetch('./beta-cards.json?v=20',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(data=>{
 const cards=data.cards||[];
 if(cards.length!==178||new Set(cards.map(x=>x.id)).size!==178)throw Error('Beta 卡牌清單不完整');
 all=cards;filtered=all.slice();
 // Keep starter card titles in sync with the canonical Beta translation.
 starter.querySelectorAll('a[data-deck-image]').forEach(anchor=>{
  const english=anchor.dataset.cardName||'';
  const zh=cards.find(c=>c.name===english)?.nameZh||window.NCTLocale?.cardName?.(english)||english;
  const label=anchor.querySelector('.deck-name');
  if(label)label.textContent=zh;
 });
 const rarityNames=[...new Set(cards.map(c=>c.rarity))];
 const order=['Common','Uncommon','Rare','Epic','Secret','Iconic Legend','Iconic Other','Iconic Secret','Nova Rare'];
 rarityNames.sort((a,b)=>order.indexOf(a)-order.indexOf(b));
 for(const name of rarityNames){const option=create('option','',name);option.value=name;rarity.append(option)}
 status.textContent='已載入 '+cards.length+' 張 Beta 卡牌。';
 render();
}).catch(err=>{
 status.textContent='Beta 資料載入失敗：'+err.message+'。請檢查網路後重新整理。';
 count.textContent='資料暫時無法載入';
});
switchTo('beta');
})();
