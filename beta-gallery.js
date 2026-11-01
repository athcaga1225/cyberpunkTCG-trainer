/* NIGHT CITY TRAINING: Beta gallery index; core mechanics not inferred from card images. */
(()=>{'use strict';
const root=document.getElementById('betaCardCollection'),starter=document.getElementById('starterDeckGallery');
if(!root||!starter)return;
const buttons=[...document.querySelectorAll('[data-card-view]')];
const search=document.getElementById('betaSearch'),rarity=document.getElementById('betaRarity'),series=document.getElementById('betaSeries');
const grid=document.getElementById('betaResults'),count=document.getElementById('betaCount');
const pages=document.getElementById('betaPages'),prev=document.getElementById('betaPrevious'),next=document.getElementById('betaNext');
const status=document.getElementById('betaLoadStatus');
const PAGE_SIZE=24;
let all=[],filtered=[],page=0,active='starter';
const zhName=name=>window.NCTLocale?.cardName?.(name)||name;
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
 filtered=all.filter(c=>(set==='all'||c.set===set)&&(choice==='all'||c.rarity===choice)&&(!q||c.id.toLowerCase().includes(q)||c.name.toLowerCase().includes(q)||zhName(c.name).toLowerCase().includes(q)));
 page=0;render();
}
function openCard(c){
 const dlg=document.getElementById('deckImageDialog');if(!dlg)return;
 const title=document.getElementById('deckDialogTitle'),subtitle=document.getElementById('deckDialogEnglish');
 const name=zhName(c.name);title.textContent=name;subtitle.textContent=name===c.name?'':c.name;
 const img=document.getElementById('deckDialogImage');img.src=c.imageUrl;img.alt=c.name+' '+c.id+' Beta 卡圖';
 const link=document.getElementById('deckDialogSource');
 if(c.imageSource){link.href=c.imageSource;link.hidden=false}else link.hidden=true;
 if(window.NCTCardModal)window.NCTCardModal.open(dlg);else dlg.showModal();
 title.focus({preventScroll:true});
}
function tile(c){
 const btn=create('button','beta-tile');btn.type='button';btn.setAttribute('aria-label','檢視 '+c.id+' '+zhName(c.name));
 const visual=create('span','beta-card-art');
 const img=document.createElement('img');img.loading='lazy';img.decoding='async';img.src=c.imageUrl;img.alt=c.name+' 卡圖';
 const fallback=create('span','beta-art-fallback','圖片無法顯示');
 img.addEventListener('error',()=>{img.hidden=true;fallback.hidden=false});
 fallback.hidden=true;visual.append(img,fallback);
 const title=create('strong','beta-card-title',zhName(c.name));
 const eng=create('span','beta-card-english',c.name);
 const meta=create('span','beta-card-meta');
 meta.append(create('b','',c.id),create('span','',c.rarity));
 btn.append(visual,title,eng,meta);
 btn.addEventListener('click',()=>openCard(c));
 return btn;
}
function render(){
 grid.replaceChildren();
 const start=page*PAGE_SIZE,items=filtered.slice(start,start+PAGE_SIZE);
 for(const c of items)grid.append(tile(c));
 const totalPages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
 pages.textContent='第 '+(page+1)+' / '+totalPages+' 頁';
 prev.disabled=page===0;next.disabled=page>=totalPages-1;
 count.textContent='符合條件 '+filtered.length+' / '+all.length+' 張';
 if(!items.length)grid.append(create('p','beta-empty','沒有符合條件的卡牌。'));
}
search.addEventListener('input',filter);
rarity.addEventListener('change',filter);
series.addEventListener('change',filter);
prev.addEventListener('click',()=>{if(page>0){page--;render();root.scrollIntoView({block:'start',behavior:'smooth'})}});
next.addEventListener('click',()=>{if((page+1)*PAGE_SIZE<filtered.length){page++;render();root.scrollIntoView({block:'start',behavior:'smooth'})}});
fetch('./beta-cards.json?v=1',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(data=>{
 const cards=data.cards||[];
 if(cards.length!==178||new Set(cards.map(x=>x.id)).size!==178)throw Error('Beta 卡牌清單不完整');
 all=cards;filtered=all.slice();
 const rarityNames=[...new Set(cards.map(c=>c.rarity))];
 const order=['Common','Uncommon','Rare','Epic','Secret','Iconic Legend','Iconic Other','Iconic Secret','Nova Rare'];
 rarityNames.sort((a,b)=>order.indexOf(a)-order.indexOf(b));
 for(const name of rarityNames){const option=create('option','',name);option.value=name;rarity.append(option)}
 status.textContent='已載入 172 張 Beta 主系列與 6 張 Box Topper，共 178 張。';
 render();
}).catch(err=>{
 status.textContent='Beta 資料載入失敗：'+err.message+'。請檢查網路後重新整理。';
 count.textContent='資料暫時無法載入';
});
switchTo('starter');
})();
