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
let all=[],starterCards=[],filtered=[],page=0,active='all';
const quickBar=document.createElement('div');quickBar.className='v3-quick-filters';quickBar.setAttribute('role','group');quickBar.setAttribute('aria-label','卡牌集合');
const quickChoices=[['all','ALL CARDS'],['beta','BETA BOOSTER'],['retail','RETAIL'],['heist','THE HEIST'],['power','EMBRACING POWER']];
for(const [value,label] of quickChoices){
 const b=document.createElement('button');b.type='button';b.className='v3-quick-filter';b.dataset.v3View=value;
 b.textContent=label;b.setAttribute('aria-pressed',String(value==='all'));
 if(value==='retail'){b.disabled=true;b.title='RETAIL 卡牌資料尚未加入'}
 b.addEventListener('click',()=>{active=value;series.value='all';filter()});quickBar.append(b);
}
root.querySelector('.beta-filters').before(quickBar);
quickBar.after(count); // Show the dynamic card total directly below the collection filters.

// Match printings by normalized official English name and verified gameplay
// identity. English accents vary across catalog sources (Álvarez / Alvarez),
// and Chinese wording may differ even when the original rules are identical.
const normalizedCardName=c=>String(c.name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
// Normalize superficial whitespace differences without ever merging different
// gameplay text, types, colors or stats just because the names are the same.
const normalizedRules=value=>String(value||'').replace(/\s+/g,' ').trim();
const samePrintingFamily=(a,b)=>{
 if(normalizedCardName(a)!==normalizedCardName(b))return false;
 if(a.type!==b.type || a.color!==b.color || a.cost!==b.cost || a.ram!==b.ram || a.power!==b.power)return false;
 if(a.abilityEnglish && b.abilityEnglish)return normalizedRules(a.abilityEnglish)===normalizedRules(b.abilityEnglish);
 return !!a.abilityZh && normalizedRules(a.abilityZh)===normalizedRules(b.abilityZh);
};
const samePrinting=(a,b)=>a.id===b.id&&a.set===b.set&&a.deck===b.deck;
const searchIdentifiers=c=>[c.id,printedNumber(c),c.set==='topper'?'B'+c.id.slice(1):'']
 .filter(Boolean).map(x=>x.toLowerCase().replace(/^β/,'b'));
const zhName=c=>c.nameZh||window.NCTLocale?.cardName?.(c.name)||c.name;
// T001–T006 are internal identifiers; the actual Box Topper Beta printings read β001–β006.
const printedNumber=c=>c.set==='topper'?'β'+c.id.slice(1):c.id;
const printingLabel=c=>c.set==='topper'?'BOX TOPPER '+printedNumber(c):c.set==='starter'?((c.deck==='heist'?'HEIST ':'POWER ')+c.id):c.id;
const collectionLabel=c=>c.set==='topper'?'BOX TOPPER':c.set==='starter'?(c.deck==='heist'?'THE HEIST':'EMBRACING POWER'):'BETA BOOSTER';
const create=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el};
const betaArtChoices=new Map();
function alternativeBetaImage(c){
 if(c.set!=='beta'||!/^B[0-9]{3}[AB]?$/.test(c.id))return null;
 const officialSlug=c.printingUrl?.split('/cards/')[1]?.split('?')[0];
 const nameSlug=String(c.name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 const slug=nameSlug||officialSlug;
 if(!slug)return null;
 return 'https://holohoard.app/api/img/cards/cyberpunk-tcg/welcome-to-night-city-beta/webp/'+c.id.toLowerCase()+'-'+slug+'.webp';
}
function imageDimensions(src){
 return new Promise(resolve=>{
  const probe=new Image();
  probe.onload=()=>resolve({width:probe.naturalWidth,height:probe.naturalHeight});
  probe.onerror=()=>resolve(null);
  probe.src=src;
 });
}
// Target cards reported blurry in V2. A lossless-looking WebP can be
// visibly sharper than a heavily compressed JPG even at matching dimensions.
// Keep all other Beta cards on the previous strict +20% pixel rule.
const priorityBetaArt=new Set(['B031','B038','B045','B080','B081','B104','B108','B116','B133',
 ...Array.from({length:31},(_,i)=>'B'+String(i+141))]);
function bestBetaImage(c){
 const fallback=c.imageUrl,candidate=alternativeBetaImage(c);
 if(!candidate)return Promise.resolve(fallback);
 if(!betaArtChoices.has(c.id)){
  const task=Promise.all([imageDimensions(fallback),imageDimensions(candidate)]).then(([oldSize,newSize])=>{
   if(!newSize)return fallback;
   if(!oldSize)return candidate;
   const oldPixels=oldSize.width*oldSize.height,newPixels=newSize.width*newSize.height;
   const oldRatio=oldSize.width/oldSize.height,newRatio=newSize.width/newSize.height;
   if(Math.abs(oldRatio-newRatio)>=0.04)return fallback;
   const minPixels=priorityBetaArt.has(c.id)?oldPixels*0.95:oldPixels*1.2;
   return newPixels>=minPixels?candidate:fallback;
  }).catch(()=>fallback);
  betaArtChoices.set(c.id,task);
 }
 return betaArtChoices.get(c.id);
}
function setBestArt(c,img){
 const key=c.set+':'+c.id;
 img.dataset.artKey=key;
 // User-flagged Beta cards now use an explicit same-printing WebP source.
 // Preserve the Shopify JPG for a real browser image-load failure.
 if(c.imageBackupUrl){
  img.onerror=()=>{
   if(img.dataset.artKey!==key)return;
   if(img.dataset.artFallback==='true'){
    img.hidden=true;
    const notice=img.parentElement?.querySelector('.beta-art-fallback');
    if(notice)notice.hidden=false;
    return;
   }
   img.dataset.artFallback='true';
   img.src=c.imageBackupUrl;
  };
  img.src=c.imageUrl;
  return;
 }
 img.src=c.imageUrl;
 if(c.set!=='beta')return;
 bestBetaImage(c).then(url=>{
  if(img.isConnected&&img.dataset.artKey===key&&url!==img.src)img.src=url;
 });
}

const setDisplayTitle=(el,name)=>{const i=String(name).indexOf('：');if(i<0){el.textContent=name;return}el.textContent=String(name).slice(0,i);el.append(create('span','card-title-subline',String(name).slice(i+1).trim()))};
const setEnglishTitle=(el,name)=>{const value=String(name||'');const i=value.indexOf(':');if(i<0){el.textContent=value;return}el.textContent=value.slice(0,i).trim();const subtitle=value.slice(i+1).trim();if(subtitle)el.append(create('span','card-english-subline',subtitle))};
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
// V3 uses a single visible catalogue; the original Starter gallery is an
// audited, hidden source of 40 real printing records.
function switchTo(){
 root.hidden=false;starter.hidden=true;
 buttons.forEach(btn=>{btn.setAttribute('aria-selected','false');btn.classList.remove('selected')});
}
switchTo();
function filter(){
 const q=search.value.toLowerCase().trim().replace(/^β/,'b');
 const selectedSet=series.value,choice=rarity.value;
 const numberQuery=/^(?:b|t)?\d{1,3}[ab]?$/.test(q);
 const selected=[...all,...starterCards].filter(c=>{
  if((active==='heist'||active==='power')&&!(c.set==='starter'&&c.deck===active))return false;
  if(active==='beta'&&!['beta','topper'].includes(c.set))return false;
  if(selectedSet==='heist'&&!(c.set==='starter'&&c.deck==='heist'))return false;
  if(selectedSet==='power'&&!(c.set==='starter'&&c.deck==='power'))return false;
  if(['beta','topper'].includes(selectedSet)&&c.set!==selectedSet)return false;
  if(choice!=='all'&&c.rarity!==choice)return false;
  if(!q)return true;
  const ids=searchIdentifiers(c);
  if(numberQuery)return ids.some(id=>q.startsWith('b')||q.startsWith('t')?id.startsWith(q):id.replace(/^[bt]/,'').startsWith(q));
  return ids.some(id=>id.includes(q))||normalizedCardName(c).includes(q.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim())||c.name.toLowerCase().includes(q)||zhName(c).toLowerCase().includes(q);
 });
 // Explicit card-number searches always return EVERY physical printing.
 // Name browsing, search and rarity filtering otherwise collapse only genuine
 // matching card identities; the Popup still shows their full versions.
 // Starter Legends and their Box Topper counterparts have distinct card
 // artwork/design. Show both faces separately in ALL CARDS, while keeping
 // samePrintingFamily for VERSIONS switching in the Popup.
 const sameGalleryFace=(a,b)=>{
  if(!samePrintingFamily(a,b))return false;
  const separateStarterLegend=(a.set==='starter'&&a.type==='Legend'&&b.set==='topper')||
   (b.set==='starter'&&b.type==='Legend'&&a.set==='topper');
  return !separateStarterLegend;
 };
 filtered=numberQuery?selected:selected.filter((c,i,arr)=>arr.findIndex(other=>sameGalleryFace(c,other))===i);
 page=0;
 quickBar.querySelectorAll('button[data-v3-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v3View===active)));
 render();
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
 img.loading='eager';img.decoding='async';setBestArt(c,img);img.alt=c.name+' 卡面';
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
 const meta=create('div','beta-detail-meta-line');
 meta.append(create('strong','',printedNumber(c)||'STARTER'),create('span','',c.set==='beta'?'BETA':c.set==='topper'?'BOX TOPPER':c.set==='starter'?'STARTER':String(c.set||'').toUpperCase()));
 if(c.rarity)meta.append(create('span','',c.rarity));
 info.append(meta,identity);
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
  tags.append(create('h4','beta-detail-section-label','TAGS / 標籤'));
  for(const tag of c.tags)tags.append(create('span','',translatedTag(tag)));
  info.append(tags);
 }
 const effect=create('section','beta-detail-effect');
 effect.append(create('h4','beta-detail-section-label','EFFECTS / 卡牌能力'));
 effect.append(create('p','beta-ability-text',c.abilityZh||'此卡的中文能力尚未整理，請參考卡面英文原文。'));
 
 info.append(effect);
 const links=create('div','beta-detail-links');
 const addSourceLink=(href,label)=>{
  if(!href)return;
  const a=create('a','beta-source-link');
  a.href=href;a.target='_blank';a.rel='noopener noreferrer';
  a.append(create('span','beta-source-label',label));
  const arrow=create('span','beta-source-arrow','↗');
  arrow.setAttribute('aria-hidden','true');
  a.append(arrow);links.append(a);
 };
 // A printing's link must never fall back to the shared official rules page:
 // it may silently show the Retail or base printing instead of this Beta card.
 // Use an independently verified official printing URL when known; otherwise
 // point to the unique, card-number-specific source for this exact printing.
 if(c.set==='beta'||c.set==='topper'||c.set==='starter'){
  // Only one link, bound to the currently selected printing.
  addSourceLink(c.printingUrl||c.imageSource||c.imageUrl,
   c.printingUrl?'官方說明':'卡牌來源');
 }else{
  addSourceLink(c.imageSource||c.imageUrl,'卡牌來源');
 }
 info.append(links);
 // Show only verified matching printings; never infer from title alone.
 // A shared card identity can have booster, Box Topper, and starter printings.
 // Confirm a matching canonical rules identity; printing-specific fields stay separate.
 const variants=[...all,...starterCards].filter(other=>samePrintingFamily(c,other));
 if(!variants.some(other=>samePrinting(other,c)))variants.unshift(c);
 let versions=null;
 {
  versions=create('section','beta-printings');
  versions.append(create('h4','','VERSIONS / 印刷版本'));
  const strip=create('div','beta-printing-strip');
  for(const variant of variants){
   const button=create('button','beta-printing-option');button.type='button';
   if(samePrinting(variant,c)){button.classList.add('selected');button.setAttribute('aria-current','true')}
   const thumbnail=create('img','');setBestArt(variant,thumbnail);thumbnail.alt=variant.id+' 卡面';thumbnail.loading='lazy';
   const variantLabel=printingLabel(variant)||'STARTER';
   button.append(thumbnail,create('span','',variantLabel));
   button.setAttribute('aria-label','切換至 '+variantLabel+' 印刷版本');
   button.addEventListener('click',()=>openCard(variant));strip.append(button);
  }
  versions.append(strip);visual.append(versions);
 }
 detailBody.append(visual,info);
 root.querySelectorAll('.beta-tile').forEach(el=>el.setAttribute('aria-pressed',String(c.set!=='starter'&&el.dataset.cardId===c.id)));
 starter.querySelectorAll('a[data-starter-key]').forEach(el=>el.setAttribute('aria-current',String(c.set==='starter'&&el.dataset.starterKey===c.starterKey)));
 if(!detail.open){
  if(window.NCTCardModal)window.NCTCardModal.open(detail);
  else detail.showModal();
 }
 detailBody.scrollTop=0;
 document.getElementById('betaDetailHeading').focus({preventScroll:true});
}
// Starter cards reuse the Beta detail layout, but never inherit another printing's
// rules or numbers solely because the English title happens to match.

// Official Beta Starter Deck printings, indexed by physical deck collector
// number β001–β020. These are NOT Welcome to Night City Beta booster UUIDs.
// Verified from each card's official "Beta Starter Deck" printing selector.
const starterPrintingUrls={"heist":["https://cyberpunktcg.com/cards/viktor-vektor-sit-down-and-relax?printing=56a13bb3-7e1d-4846-ac79-9163f33c0143","https://cyberpunktcg.com/cards/dexter-deshawn-one-last-chance?printing=f9c512f2-a41f-4114-9500-cee3f8d8cc35","https://cyberpunktcg.com/cards/heywood-ripperdoc?printing=aebf807a-2fbb-4b60-ae4b-36783314871f","https://cyberpunktcg.com/cards/offduty-malfini?printing=e7ef78a6-72d3-42a4-ba98-14facb194eb9","https://cyberpunktcg.com/cards/secondhand-bombus?printing=2e2f977d-e0a6-4a21-a6b3-92937eb6e909","https://cyberpunktcg.com/cards/t-bug-amateur-philosopher?printing=646dde1d-a112-4c7b-aecc-f63e130d4df0","https://cyberpunktcg.com/cards/kiroshi-optics?printing=b18ce43d-3441-4a55-a6a9-34ae8765aa27","https://cyberpunktcg.com/cards/mandibular-upgrade?printing=c3399413-d205-49e7-871a-4f16d7c3ade6","https://cyberpunktcg.com/cards/zetatech-faceplate?printing=e38dee5b-9f4a-4323-a18f-aff42256b158","https://cyberpunktcg.com/cards/afterparty-at-lizzie-s?printing=a8dcad7d-7b45-427d-8123-3140b30ac612","https://cyberpunktcg.com/cards/jackie-welles-pour-one-out-for-me?printing=a0ef9536-ad3b-47f6-8c2a-171aa3b8b181","https://cyberpunktcg.com/cards/v-corporate-exile?printing=a6511c82-3a16-41b3-a39a-5194897c8648","https://cyberpunktcg.com/cards/delamain-cab?printing=a6bc4a11-ed78-49dc-999b-68b7fe50aefd","https://cyberpunktcg.com/cards/evelyn-parker-scheming-siren?printing=c7bc2b37-c1a4-43aa-a4c3-5dd60514b098","https://cyberpunktcg.com/cards/mt0d12-flathead?printing=d4a627d7-2ea9-4080-9f54-435a7d77fb27","https://cyberpunktcg.com/cards/psycho-squad?printing=e2fe4b47-4d66-4989-bab7-16143f7256ac","https://cyberpunktcg.com/cards/dying-night-v-s-pistol?printing=1dc3c618-a40a-4717-bf4d-a573915c8ac0","https://cyberpunktcg.com/cards/tetratronic-rippler?printing=7ef4d862-b97f-47be-ba0f-071c8e8354b0","https://cyberpunktcg.com/cards/floor-it?printing=d8b28345-bcd5-4c52-b51d-3052d8b24874","https://cyberpunktcg.com/cards/reboot-optics?printing=f393f463-2e62-4d77-aaf4-ed1bafaee8c5"],"power":["https://cyberpunktcg.com/cards/yorinobu-arasaka-embracing-destruction?printing=362bef23-c935-4729-a13b-dc3bc646d9b3","https://cyberpunktcg.com/cards/chrome-fang?printing=1e80ecfb-a3f2-421d-ac71-c05547366fb6","https://cyberpunktcg.com/cards/minotaur?printing=a8dd2d7b-88b8-4b15-b4dd-e3aa3757bb25","https://cyberpunktcg.com/cards/ruthless-lowlife?printing=9c59c8d2-586a-4845-b969-43be1fd3b388","https://cyberpunktcg.com/cards/swordwise-huscle?printing=6c695f7c-8b57-4932-aa4c-d85f0b1d29e3","https://cyberpunktcg.com/cards/arasaka-emergency-radioport?printing=be0d995d-84fc-41c3-bed6-1875caf85fc7","https://cyberpunktcg.com/cards/mantis-blades?printing=7e3cd1e0-4438-46e7-a327-0d9846778bb3","https://cyberpunktcg.com/cards/satori-sword-of-saburo?printing=e9dba54d-79bf-4f33-bd67-ba026e371c03","https://cyberpunktcg.com/cards/industrial-assembly?printing=84bdb994-a01d-4e4c-81d9-a970aef4d08c","https://cyberpunktcg.com/cards/over-the-edge?printing=de9b7361-6d1c-4a27-bcfb-50ec7a78e518","https://cyberpunktcg.com/cards/shattered-memories?printing=4adda471-e0c8-4628-aba1-d1ed11eae0af","https://cyberpunktcg.com/cards/goro-takemura-hands-unclean?printing=25b09451-8cc8-4581-898d-3b5ee6ff6b14","https://cyberpunktcg.com/cards/saburo-arasaka-stubborn-patriarch?printing=54136fbd-ce97-4d23-a8e8-f876e3e64819","https://cyberpunktcg.com/cards/corpo-security?printing=07cad5ea-45c4-404b-99b8-8f53c280a4fb","https://cyberpunktcg.com/cards/emergency-atlus?printing=0a5892de-42fa-4001-b48a-2c294251dad8","https://cyberpunktcg.com/cards/field-operator?printing=34d2a24a-7976-4178-9f9e-b819f15a6a34","https://cyberpunktcg.com/cards/goro-takemura-losing-his-way?printing=fb45ca8c-cb8a-4de9-8cf4-04a697c3fdfd","https://cyberpunktcg.com/cards/maxtac-av?printing=5a28466e-e4e1-408d-9d84-2ce48e95d89d","https://cyberpunktcg.com/cards/sandevistan?printing=e1a14bfa-cd87-4fa9-bfe8-207abb4545c4","https://cyberpunktcg.com/cards/corporate-surveillance?printing=e9d18fa1-0069-4b22-b64e-a75d2e30158a"]};
const starterLinkFor=anchor=>{
 const group=anchor.closest('.deck-collection');
 const deck=group?.querySelector('summary strong')?.textContent?.trim()==='The Heist'?'heist':'power';
 const number=Number(anchor.querySelector('.deck-meta span')?.textContent?.match(/B(\d{3})/)?.[1]);
 return number>=1&&number<=20?starterPrintingUrls[deck][number-1]:null;
};
starter.querySelectorAll('a[data-deck-image]').forEach(anchor=>{
 const official=starterLinkFor(anchor);
 if(official){
  anchor.dataset.printingUrl=official;
  anchor.href=official;
  anchor.setAttribute('aria-label','檢視 '+(anchor.dataset.cardName||'')+' 官方 Beta 初始牌組印刷版本');
 }
});

// Four starter-only game cards have no Welcome to Night City Beta booster
// record to reuse. Values below are transcribed from the official family
// card pages (current rules), NOT a different physical card's collector ID.
const starterOnlyCurrentRules={
 'Dexter DeShawn: One Last Chance':{
  type:'Unit',color:'Yellow',rarity:'Uncommon',cost:3,ram:2,power:4,tags:['FIXER'],
  abilityEnglish:"{Play} {Attack} Adjust a Gig by up to 1. {Defeated} If your ☆ (Street Cred) differs from a Rival's by 10+, draw 2.",
  abilityZh:'【打出（Play）】【攻擊（Attack）】將一顆任務骰的點數調整最多 1。【被擊敗（Defeated）】若你與一名對手的街頭聲望相差至少 10，抽 2 張牌。'
 },
 'MT0D12 Flathead':{
  type:'Unit',color:'Blue',rarity:'Uncommon',cost:5,ram:3,power:7,tags:['DRONE','MILITECH'],
  abilityEnglish:"If you have less ☆ (Street Cred) than a Rival, this Unit can't be blocked.",
  abilityZh:'如果你的街頭聲望低於一名對手，此單位無法被阻擋。'
 },
 'Minotaur':{
  type:'Unit',color:'Red',rarity:'Uncommon',cost:7,ram:2,power:9,tags:['ARASAKA','DRONE','MILITECH'],
  abilityEnglish:"{Play} If you have more ☆ (Street Cred) than a Rival, defeat a rival Unit with power 5 or less.",
  abilityZh:'【打出（Play）】若你的街頭聲望高於一名對手，擊敗一個戰力為 5 或以下的對手單位。'
 },
 'Goro Takemura: Losing His Way':{
  type:'Unit',color:'Green',rarity:'Uncommon',cost:4,ram:3,power:4,tags:['ARASAKA','CORPO'],
  abilityEnglish:"{Attack} If all friendly Legends are face-up, this Unit has +5 power this turn.",
  abilityZh:'【攻擊（Attack）】若所有友方傳奇角色皆正面朝上，此單位本回合戰力 +5。'
 }
};
// Beta booster and Box Topper data provides a working Chinese reference
// for the same named family; the standalone Starter printing itself still
// requires a separate physical-print rules-text comparison.
function starterCardFromAnchor(anchor,cards){
 const english=anchor.dataset.cardName||'';
 // Shared canonical content is sourced from the same Beta record used by
 // booster cards; independent printing properties are never copied over.
 const shared=cards.find(c=>c.name===english);
 const exclusive=starterOnlyCurrentRules[english]||null;
 const source=shared||exclusive||{};
 const code=anchor.dataset.starterCardNumber||anchor.querySelector('.deck-meta span')?.textContent?.match(/B\d{3}/)?.[0]||'';
 const isLegend=anchor.dataset.starterIsLegend==='true'||anchor.querySelector('.deck-meta span')?.textContent?.includes('LEGEND');
 const deck=anchor.closest('.deck-collection')?.querySelector('summary strong')?.textContent?.trim()==='The Heist'?'heist':'power';
 // Construct one printing record pointing at the canonical shared content;
 // this does not make the different physical printings interchangeable.
 return {
  name:english,nameZh:shared?.nameZh||window.NCTLocale?.cardName?.(english)||english,
  id:'β'+code.replace(/^B/,''),
  deck,set:'starter',
  imageUrl:anchor.dataset.deckImage||anchor.href,
  imageSource:anchor.dataset.deckImage||anchor.href,
  printingUrl:anchor.dataset.printingUrl||null,
  type:source.type||(isLegend?'Legend':null),
  color:source.color||null,rarity:isLegend?'Epic':source.rarity||null,
  tags:source.tags||[],cost:source.cost??null,ram:source.ram??null,power:source.power??null,
  abilityEnglish:source.abilityEnglish||'',
  abilityZh:source.abilityZh||'尚無校對過的中文規則內容，請參考官方卡牌頁。',
  canonicalCardId:shared?.id||null,
  starterTextStatus:shared?'same-family-current-reference':'official-current-manual'
 };
}
function openStarterCard(anchor){
 const id=anchor.dataset.starterKey;
 const card=starterCards.find(c=>c.starterKey===id);
 if(card)openCard(card);
}
starter.addEventListener('click',event=>{
 const anchor=event.target.closest('a[data-deck-image]');
 if(!anchor||!starter.contains(anchor))return;
 event.preventDefault();
 event.stopPropagation();
 openStarterCard(anchor);
},true);

function tile(c){
 const btn=create('button','beta-tile');btn.type='button';btn.dataset.cardId=c.id;btn.setAttribute('aria-pressed','false');btn.setAttribute('aria-label','檢視 '+printingLabel(c)+' '+zhName(c));
 const visual=create('span','beta-card-art');
 const img=document.createElement('img');img.loading='lazy';img.decoding='async';setBestArt(c,img);img.alt=c.name+' 卡圖';
 const fallback=create('span','beta-art-fallback','圖片無法顯示');
 img.addEventListener('error',()=>{if(c.imageBackupUrl)return;img.hidden=true;fallback.hidden=false});
 fallback.hidden=true;visual.append(img,fallback);
 const title=create('strong','beta-card-title');setDisplayTitle(title,zhName(c));
 const eng=create('span','beta-card-english');setEnglishTitle(eng,c.name);
 const collection=create('span','v3-card-series',collectionLabel(c));
 collection.dataset.series=c.set==='starter'?c.deck:c.set;
 const meta=create('span','beta-card-meta');
 meta.append(create('b','',printedNumber(c)),create('span','',c.rarity));
 btn.append(visual,title,eng,collection,meta);
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
 count.textContent='顯示 '+filtered.length+' 張卡牌';
 if(!items.length)grid.append(create('p','beta-empty','沒有符合條件的卡牌。'));
}
document.getElementById('betaDetailClose').addEventListener('click',()=>detail.close());
detail.addEventListener('click',event=>{if(event.target!==detail)return;const r=detail.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)detail.close()});
detail.addEventListener('close',()=>{
 root.querySelectorAll('.beta-tile').forEach(el=>el.setAttribute('aria-pressed','false'));
 starter.querySelectorAll('a[data-starter-key]').forEach(el=>el.removeAttribute('aria-current'));
});
search.addEventListener('input',filter);
rarity.addEventListener('change',filter);
series.addEventListener('change',()=>{
 // SERIES is a complete selector: switching from a quick category to
 // another series must not silently produce an empty intersection.
 if(series.value!=='all' && active!=='all'){
  const sameDeck=series.value===active;
  const sameBeta=active==='beta'&&['beta','topper'].includes(series.value);
  if(!sameDeck&&!sameBeta)active='all';
 }
 filter();
});
pageSelect.addEventListener('change',()=>{page=Number(pageSelect.value);render();root.scrollIntoView({block:'start',behavior:'smooth'})});
prev.addEventListener('click',()=>{if(page>0){page--;render();root.scrollIntoView({block:'start',behavior:'smooth'})}});
next.addEventListener('click',()=>{if((page+1)*PAGE_SIZE<filtered.length){page++;render();root.scrollIntoView({block:'start',behavior:'smooth'})}});
fetch('./beta-cards.json?v=32',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(data=>{
 const cards=data.cards||[];
 // Validate the actual Beta numbering: B005 has two printings (A/B);
 // B172 is not part of this 178-card index. The six T cards are Box Toppers.
 const expectedIds=[
  ...Array.from({length:171},(_,i)=>'B'+String(i+1).padStart(3,'0')).filter(id=>id!=='B005'),
  'B005A','B005B',
  ...Array.from({length:6},(_,i)=>'T'+String(i+1).padStart(3,'0'))
 ];
 const actualIds=new Set(cards.map(x=>x.id));
 if(cards.length!==178||actualIds.size!==178||expectedIds.some(id=>!actualIds.has(id)))
  throw Error('Beta 卡牌編號不完整或重複');
 if(cards.some(c=>!c.name||!c.nameZh||!c.imageUrl||!c.rarity||!c.type||!Array.isArray(c.tags)||!c.abilityZh||c.ram===undefined))
  throw Error('Beta 卡牌必要欄位缺漏');

 all=cards;filtered=all.slice();
 starterCards=[];
 // Keep starter card titles in sync with the canonical Beta translation.
 starter.querySelectorAll('a[data-deck-image]').forEach(anchor=>{
  const english=anchor.dataset.cardName||'';
  const zh=cards.find(c=>c.name===english)?.nameZh||window.NCTLocale?.cardName?.(english)||english;
  const label=anchor.querySelector('.deck-name');
  if(label)setDisplayTitle(label,zh);
  const original=anchor.querySelector('.deck-original');if(original)setEnglishTitle(original,english);
  // Use the exact Beta booster list classes and content hierarchy.
  anchor.classList.add('beta-tile');
  anchor.querySelector('.deck-art')?.classList.add('beta-card-art');
  if(label)label.classList.add('beta-card-title');
  if(original)original.classList.add('beta-card-english');
  const meta=anchor.querySelector('.deck-meta');
  if(meta){
   meta.classList.add('beta-card-meta');
   const id=meta.querySelector('span');
   const code=id?.textContent?.match(/B\d{3}/)?.[0]||'';
   anchor.dataset.starterCardNumber=code;
   anchor.dataset.starterIsLegend=Boolean(id?.textContent?.includes('LEGEND')).toString();
   const rarity=anchor.dataset.starterIsLegend==='true'?'Epic':(cards.find(c=>c.name===english)?.rarity||starterOnlyCurrentRules[english]?.rarity||'');
   const amount=meta.querySelector('b');
   if(id){
    const left=create('b','',code);
    const right=create('span','',rarity);
    const marker=amount?.textContent||'';
    meta.replaceChildren(left,right);
    if(marker){
     const badge=create('span','starter-quantity-badge',marker);
     badge.setAttribute('aria-label','牌組內 '+marker.replace('×','')+' 張');
     anchor.querySelector('.deck-art')?.append(badge);
    }
   }
  }
  // Preserve both the shared identity and this exact starter printing.
  const record=starterCardFromAnchor(anchor,cards);
  record.starterKey=record.deck+':'+record.id;
  anchor.dataset.starterKey=record.starterKey;
  starterCards.push(record);
 });
 // Validate the two 20-face starter manifests independently of physical
 // deck quantities (which may contain 2–3 copies of a face).
 const deckCounts={heist:starterCards.filter(c=>c.deck==='heist').length,power:starterCards.filter(c=>c.deck==='power').length};
 const sharedCount=starterCards.filter(c=>c.canonicalCardId).length;
 const uniqueKeys=new Set(starterCards.map(c=>c.starterKey));
 if(deckCounts.heist!==20||deckCounts.power!==20||uniqueKeys.size!==40||sharedCount!==36)
  throw Error('Starter 牌組卡牌數量或共用資料關聯異常');
 if(starterCards.some(c=>!c.printingUrl||!c.printingUrl.includes('?printing=')||!c.imageUrl||!c.name||!c.abilityEnglish||!c.abilityZh||c.ram===undefined||c.rarity==null))
  throw Error('Starter 卡牌資料欄位不完整');
 const rarityNames=[...new Set(cards.map(c=>c.rarity))];
 const order=['Common','Uncommon','Rare','Epic','Secret','Iconic Legend','Iconic Other','Iconic Secret','Nova Rare'];
 rarityNames.sort((a,b)=>order.indexOf(a)-order.indexOf(b));
 for(const name of rarityNames){const option=create('option','',name);option.value=name;rarity.append(option)}
 // Starter records now participate in both the unified name index and all
 // number searches. Include Starter-only rarity in the RARITY dropdown.
 const existingRarities=new Set([...rarity.options].map(option=>option.value));
 for(const rarityName of [...new Set(starterCards.map(c=>c.rarity))]){
  if(rarityName&&!existingRarities.has(rarityName)){const option=create('option','',rarityName);option.value=rarityName;rarity.append(option)}
 }
 status.textContent='已載入 178 張 Beta／Box Topper 與 40 張 Starter 印刷版本。';
 status.hidden=true; // Do not show redundant catalogue introduction on successful load.
 filter();
}).catch(err=>{
 status.hidden=false;
 status.textContent='Beta 資料載入失敗：'+err.message+'。請檢查網路後重新整理。';
 count.textContent='資料暫時無法載入';
});
switchTo();
})();
