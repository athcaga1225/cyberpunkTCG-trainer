/* Visual tabletop: real CYBERDEX card art and official starter deck manifests.
   Not an actual game state. One source art URL is unavailable. */
(()=>{'use strict';
const $=id=>document.getElementById(id),root=$('battleTour'),select=$('battleDeckChoice');
const decks=window.NCT_STARTER_DECKS,locale=window.NCTLocale,art={"heist":{"Viktor Vektor: Sit Down and Relax":{"id":"B001","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b001-viktor-vektor-sit-down-and-relax.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"Dexter DeShawn: One Last Chance":{"id":"B002","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b002-dexter-deshawn-one-last-chance.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"Heywood Ripperdoc":{"id":"B003","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b003-heywood-ripperdoc.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"Offduty Malfini":{"id":"B004","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b004-offduty-malfini.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"Secondhand Bombus":{"id":"B005","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b005-secondhand-bombus.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"T-Bug: Amateur Philosopher":{"id":"B006","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b006-t-bug-amateur-philosopher.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"Kiroshi Optics":{"id":"B007","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b007-kiroshi-optics.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"Mandibular Upgrade":{"id":"B008","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b008-mandibular-upgrade.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"Zetatech Faceplate":{"id":"B009","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b009-zetatech-faceplate.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"Afterparty at Lizzie's":{"id":"B010","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b010-afterparty-at-lizzie-s.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"Jackie Welles: Pour One Out For Me":{"id":"B011","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b011-jackie-welles-pour-one-out-for-me.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"V: Corporate Exile":{"id":"B012","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b012-v-corporate-exile.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"Delamain Cab":{"id":"B013","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b013-delamain-cab.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"Evelyn Parker: Scheming Siren":{"id":"B014","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b014-evelyn-parker-scheming-siren.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"MT0D12 Flathead":{"id":"B015","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b015-mt0d12-flathead.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"Psycho Squad":{"id":"B016","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b016-psycho-squad.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"Dying Night: V's Pistol":{"id":"B017","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b017-dying-night-v-s-pistol.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"Tetratonic Rippler":{"id":"B018","url":null,"source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck/card-tetratronic-rippler-the-heist-beta"},"Floor It":{"id":"B019","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b019-floor-it.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"},"Reboot Optics":{"id":"B020","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/the-heist-beta-starter-deck/webp/b020-reboot-optics.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/the-heist-beta-starter-deck"}},"power":{"Yorinobu Arasaka: Embracing Destruction":{"id":"B001","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b001-yorinobu-arasaka-embracing-destruction.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Chrome Fang":{"id":"B002","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b002-chrome-fang.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Minotaur":{"id":"B003","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b003-minotaur.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Ruthless Lowlife":{"id":"B004","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b004-ruthless-lowlife.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Swordwise Huscle":{"id":"B005","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b005-swordwise-huscle.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Arasaka Emergency Radioport":{"id":"B006","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b006-arasaka-emergency-radioport.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Mantis Blades":{"id":"B007","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b007-mantis-blades.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Satori: Sword of Saburo":{"id":"B008","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b008-satori-sword-of-saburo.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Industrial Assembly":{"id":"B009","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b009-industrial-assembly.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Over the Edge":{"id":"B010","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b010-over-the-edge.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Shattered Memories":{"id":"B011","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b011-shattered-memories.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Goro Takemura: Hands Unclean":{"id":"B012","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b012-goro-takemura-hands-unclean.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Saburo Arasaka: Stubborn Patriarch":{"id":"B013","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b013-saburo-arasaka-stubborn-patriarch.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Corpo Security":{"id":"B014","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b014-corpo-security.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Emergency Atlus":{"id":"B015","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b015-emergency-atlus.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Field Operator":{"id":"B016","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b016-field-operator.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Goro Takemura: Losing His Way":{"id":"B017","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b017-goro-takemura-losing-his-way.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"MaxTac AV":{"id":"B018","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b018-maxtac-av.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Sandevistan":{"id":"B019","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b019-sandevistan.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"},"Corporate Surveillance":{"id":"B020","url":"https://holohoard.app/api/img/cards/cyberpunk-tcg/embracing-power-beta-starter-deck/webp/b020-corporate-surveillance.webp","source":"https://holohoard.app/explore/game/cyberpunk-tcg/embracing-power-beta-starter-deck"}}};
if(!root||!select||!decks)return;
const norm=s=>String(s).toLowerCase().replace(/[^a-z0-9]/g,'');
const nameOf=s=>locale?.cardTitle(s)||s;
const keyOf=k=>k==='theHeist'?'heist':'power';
let choice='theHeist',hand=[],showLegends=false;
try{const prev=localStorage.getItem('nct-preview-deck');if(decks[prev])choice=prev}catch{}
select.value=choice;
function lookup(k,name){return Object.entries(art[keyOf(k)]||{}).find(([n])=>norm(n)===norm(name)||(norm(name)==='tetratronicrippler'&&norm(n)==='tetratonicrippler'))?.[1]||null}
function shuffle(k){const pool=[];for(const c of decks[k].main)for(let n=0;n<c.qty;n++)pool.push(c.name);for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}return pool.slice(0,6)}

const hoverBox=$('battleCardHover'),hoverImage=$('battleHoverImage'),
      hoverName=$('battleHoverName'),hoverFallback=$('battleHoverFallback');
let hoverTarget=null;
function hideHover(){
 if(!hoverBox)return;
 hoverTarget=null;hoverBox.hidden=true;hoverBox.setAttribute('aria-hidden','true');
}
function positionHover(anchor){
 if(!hoverBox||!anchor||hoverBox.hidden)return;
 const rect=anchor.getBoundingClientRect();
 const width=hoverBox.getBoundingClientRect().width;
 const height=hoverBox.getBoundingClientRect().height;
 const pad=14;
 let left=rect.right+16;
 if(left+width>innerWidth-pad)left=rect.left-width-16;
 if(left<pad)left=Math.max(pad,Math.round((innerWidth-width)/2));
 let top=rect.top-(height-rect.height)/2;
 top=Math.max(pad,Math.min(top,innerHeight-height-pad));
 hoverBox.style.left=Math.round(left)+'px';
 hoverBox.style.top=Math.round(top)+'px';
}
function showHover(anchor,k,name,image){
 if(!hoverBox||!image?.url||!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
 hoverTarget=anchor;
 hoverName.textContent=nameOf(name);
 hoverFallback.hidden=true;
 hoverImage.hidden=false;
 hoverImage.src=image.url;
 hoverImage.alt=nameOf(name)+' 放大卡面';
 hoverBox.hidden=false;
 hoverBox.setAttribute('aria-hidden','false');
 requestAnimationFrame(()=>{if(hoverTarget===anchor)positionHover(anchor)});
}
if(hoverImage)hoverImage.addEventListener('error',()=>{
 hoverImage.hidden=true;hoverFallback.hidden=false;
 if(hoverTarget)requestAnimationFrame(()=>positionHover(hoverTarget));
});
window.addEventListener('scroll',hideHover,true);
window.addEventListener('resize',hideHover);

function card(k,name,back=false,kind='standard'){
 const el=document.createElement('button');el.type='button';el.className='preview-art-card'+(back?' face-down':'');
 if(back){
  const isLegend=kind==='legend';
  const src=isLegend?'https://chromeandgigs.com/card-backs/legend.png':'https://chromeandgigs.com/card-backs/standard.png';
  el.disabled=true;
  el.classList.add(isLegend?'legend-back':'standard-back');
  el.setAttribute('aria-label',isLegend?'傳奇角色專用卡背':'一般卡牌卡背');
  const fallback=document.createElement('span');
  fallback.className='preview-back-design';
  fallback.textContent='CYBERPUNK TCG';
  el.append(fallback);
  const image=document.createElement('img');
  image.src=src;image.alt='';image.className='preview-card-back-image';
  image.loading='lazy';image.decoding='async';
  image.addEventListener('error',()=>{image.remove();el.classList.add('missing-back')});
  el.append(image);
  return el;
 }
 const image=lookup(k,name);el.title=nameOf(name);el.setAttribute('aria-label','放大查看 '+nameOf(name));
 const fallback=document.createElement('span');fallback.className='preview-art-fallback';fallback.textContent=locale?.cardName(name)||name;el.append(fallback);
 if(image?.url){const img=document.createElement('img');img.src=image.url;img.alt=nameOf(name)+' 卡面';img.loading='lazy';img.decoding='async';img.addEventListener('error',()=>{img.remove();el.classList.add('missing-art')});el.append(img)}else el.classList.add('missing-art');
 el.addEventListener('pointerenter',()=>showHover(el,k,name,image));
 el.addEventListener('pointerleave',hideHover);
 el.addEventListener('focus',()=>showHover(el,k,name,image));
 el.addEventListener('blur',hideHover);
 el.addEventListener('click',()=>{hideHover();open(k,name,image)});
 return el;
}
function open(k,name,image){hideHover();const dlg=$('battleCardDialog');if(!dlg?.showModal)return;$('battleCardTitle').textContent=nameOf(name);
 const img=$('battleCardFullImage'),fallback=$('battleCardNoImage'),link=$('battleCardSource');
 if(image?.url){img.src=image.url;img.alt=nameOf(name);img.hidden=false;fallback.hidden=true}else{img.removeAttribute('src');img.hidden=true;fallback.hidden=false;fallback.textContent='此卡在 CYBERDEX 的來源資料中暫無可用卡圖。'}
 if(image?.source){link.href=image.source;link.hidden=false}else link.hidden=true;dlg.showModal()}
function legend(k,who){const node=root.querySelector('.'+who+'-legends .cardbacks');if(!node)return;node.replaceChildren();for(const c of decks[k].legends)node.append(card(k,c.name,who==='opponent'||!showLegends,'legend'))}
function render(){hideHover();const other=choice==='theHeist'?'embracingPower':'theHeist';legend(choice,'player');legend(other,'opponent');
 const my=root.querySelector('.player-hand .hand-placeholder'),rival=root.querySelector('.opponent-hand .placeholder-label');
 if(!my||!rival)return;my.replaceChildren();rival.replaceChildren();my.classList.add('preview-card-rail');rival.classList.add('preview-card-rail');
 for(const n of hand)my.append(card(choice,n));for(let i=0;i<6;i++)rival.append(card(other,'',true));
 $('battleSelectedDeck').textContent='玩家：'+decks[choice].name;$('battleOpponentDeck').textContent='對手：'+decks[other].name;
 for(const side of ['player','opponent']){const v=root.querySelector('.'+side+'-deck .deck-pile');if(v){v.replaceChildren(document.createTextNode('34'));const lbl=document.createElement('span');lbl.textContent='DECK';v.append(lbl)}}
 $('toggleBattleLegends').textContent=showLegends?'收起傳奇角色預覽':'預覽我的傳奇角色';
 $('battlePreviewStatus').textContent='顯示 '+decks[choice].name+' 的 6 張真實卡圖與 3 張傳奇角色。對手手牌與傳奇角色保持蓋牌。此為示意抽牌，不是正式對局。';
}
select.onchange=()=>{if(!decks[select.value])return;choice=select.value;showLegends=false;hand=shuffle(choice);try{localStorage.setItem('nct-preview-deck',choice)}catch{}render()};
$('redrawBattleHand').onclick=()=>{hand=shuffle(choice);render()};
$('toggleBattleLegends').onclick=()=>{showLegends=!showLegends;render()};
$('closeBattleCard').onclick=()=>$('battleCardDialog')?.close();
$('battleCardDialog').addEventListener('click',event=>{if(event.target.id==='battleCardDialog')event.target.close()});
hand=shuffle(choice);render();
})();