/* The Heist verified effects, based on official card text and rules 4.4, 4.12,
 * 9.5-9.6, 10, 11.11, 11.25. Deck TOP is the array's last element.
 * Verified spend transitions enqueue effects; searches never count as draws.
 */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.NCTV3Effects=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 'use strict';
 const copy=s=>JSON.parse(JSON.stringify(s)),other=w=>w==='player'?'ai':'player';
 const fail=reason=>({ok:false,reason}),ok=(state,events)=>({ok:true,state,events});
 const legendSpecs={
  viktor:{name:'Viktor Vektor: Sit Down and Relax',type:'Legend',color:'Yellow',cost:null,power:null,sellTag:true,legendEffect:'viktor'},
  v:{name:'V: Corporate Exile',type:'Legend',color:'Blue',cost:5,power:8,sellTag:true,legendEffect:'v',goSolo:true},
  jackie:{name:'Jackie Welles: Pour One Out For Me',type:'Legend',color:'Blue',cost:null,power:null,sellTag:true,legendEffect:'jackie'}
 };
 Object.assign(legendSpecs,{
 goro:{name:'Goro Takemura: Hands Unclean',type:'Legend',color:'Green',cost:5,power:7,sellTag:true,legendEffect:'goro-legend',goSolo:true,blocker:true,tags:['ARASAKA','CORPO']},
 yorinobu:{name:'Yorinobu Arasaka: Embracing Destruction',type:'Legend',color:'Red',cost:null,power:null,sellTag:true,legendEffect:'yorinobu',tags:['ARASAKA','CORPO']},
 saburo:{name:'Saburo Arasaka: Stubborn Patriarch',type:'Legend',color:'Green',cost:null,power:null,sellTag:true,legendEffect:'saburo',tags:['ARASAKA','CORPO']}
 });
 const active=s=>s.ai?.practiceBot?.kind==='mirror-the-heist';
 const pending=s=>s.pendingEffects?.[0]||null;
 const cred=(s,w)=>s[w].gigs.length?s[w].gigs.reduce((n,g)=>n+g.value,0):-Infinity;
 const knownLegend=l=>Object.values(legendSpecs).some(spec=>spec.name===l.name&&spec.legendEffect===l.legendEffect);
 const resultReasons={
  'seven-at-start':'回合開始時持有至少 7 顆委託骰',
  'overtime-seven':'Overtime 中持有至少 7 顆委託骰',
  'empty-deck':'必須抽牌時牌庫已空',
  'concede':'玩家認輸'
 };
 function resultSummary(s){
  const winner=s.winner??(s.loser?other(s.loser):null);
  return {title:s.outcome?.kind==='draw'?'平手':winner==='player'?'我方獲勝':winner==='ai'?'對手獲勝':'本局已結束',reason:resultReasons[s.outcome?.reason]||'練習已結束'};
 }
 function finish(s,winner,reason,events=[]){
  if(s.finished)return s;
  s.finished=true;s.winner=winner;s.loser=winner?other(winner):null;
  s.outcome={kind:winner?'win':'draw',winner:s.winner,loser:s.loser,reason};
  s.phase='finished';s.step='result';s.pendingEffects=[];s.pendingAttack=null;for(const who of ['player','ai'])for(const u of s[who].units)delete u.attackPowerModifier;
  delete s.effectsOwner;delete s.afterEffects;delete s.opponentNotes;delete s.opponentMainStep;
  const info=resultSummary(s);events.push(info.title+'：'+info.reason);return s;
 }
 function checkVictory(s,startSide=null,events=[]){
  if(s.finished)return true;
  if(s.phase==='pregame')return false;
  const overtime=active(s)&&s.overtime;
  const winners=(overtime?['player','ai']:startSide?[startSide]:[]).filter(w=>s[w].gigs.length>=7);
  if(winners.length)finish(s,winners.length===2?null:winners[0],overtime?'overtime-seven':'seven-at-start',events);
  return s.finished;
 }
 function beginTurn(s,who,events=[]){
  if(s.finished)return;
  delete s[who].chromeProtection;
  s.turnStart={who,bothFixersEmpty:['player','ai'].every(w=>s[w].fixer.length===0),completed:false};
  checkVictory(s,who,events);
 }
 function completeTurn(s,events=[]){
  const began=s.turnStart;
  if(!active(s)||s.finished||!began||began.completed||began.who!==s.turn)return;
  began.completed=true;
  s.emptyStartStreak=began.bothFixersEmpty?(s.emptyStartStreak||0)+1:0;
  if(!s.overtime&&s.emptyStartStreak>=2){s.overtime=true;events.push('連續兩個回合開始時雙方合事佬區皆為空；Overtime 開始，持有 7 顆骰立即獲勝');}
  checkVictory(s,null,events);
 }
 function queue(s,who,type,detail={}){if(s.finished)return;s.effectSeq=(s.effectSeq||0)+1;(s.pendingEffects??=[]).push({id:'effect-'+s.effectSeq,who,type,...detail});}
 function draw(s,who,n,events){
  for(let i=0;i<n&&!s.finished;i++){
   if(!s[who].deck.length){finish(s,other(who),'empty-deck',events);break;}
   s[who].hand.push(s[who].deck.pop());events.push((who==='player'?'我方':'對手')+'抽 1 張');
  }
 }
 function reveal(s,who,id,events){
  const l=s[who].legends.find(l=>l.id===id&&!l.faceUp);
  if(!l||s[who].calledThisTurn||!knownLegend(l))return false;
  l.faceUp=true;l.knownToOwner=true;s[who].calledThisTurn=true;events.push('呼叫傳奇：'+l.name+'（保留原就緒／橫置狀態）');
  if(l.legendEffect==='saburo'&&s.pendingAttack?.attackingSide===who){const attacker=s[who].units.find(u=>u.id===s.pendingAttack.attackerId);if((attacker?.tags||[]).includes('ARASAKA'))attacker.attackPowerModifier=(attacker.attackPowerModifier||0)+1;}
  if(l.legendEffect==='viktor')queue(s,who,'search',{source:l.name});
  return true;
 }
 function onPlay(s,who,card){
  if(!active(s))return;
  if(card.entryEffect==='chrome')s[who].chromeProtection=true;
  if(card.entryEffect==='even-draw'&&Number.isFinite(cred(s,who))&&cred(s,who)%2===0)queue(s,who,'draw',{source:card.name,count:1});
  if(card.entryEffect==='minotaur'&&cred(s,who)>cred(s,other(who)))queue(s,who,'defeatUnit',{source:card.name,powerMax:5,targetSides:[other(who)]});
  if(card.entryEffect==='swap')queue(s,who,'swapGigs',{source:card.name});
  if(card.color!=='Blue'||!['Unit','Gear','Legend'].includes(card.type))return;
  const first=!s[who].bluePlayedThisTurn;s[who].bluePlayedThisTurn=true;
  if(first&&s[who].legends.some(l=>l.faceUp&&l.legendEffect==='jackie'))queue(s,who,'adjust',{source:'Jackie Welles',min:-2,max:0,friendlyOnly:true,drawOnMin:true});
 }
 function spend(s,who,u){
  if(!u.ready)return false;
  u.ready=false;
  if(active(s))for(const g of u.gear||[]){
   if(g.spendEffect==='faceplate')queue(s,who,'adjust',{source:g.name,min:-1,max:1,drawOnDistinct:3});
   if(g.spendEffect==='rippler')queue(s,who,'rippler',{source:g.name});
   if(g.spendEffect==='radioport')queue(s,who,'radioport',{source:g.name});
  }
  return true;
 }
 function attack(s,who,u){
  if(!active(s))return;
  if((u.tags||[]).includes('ARASAKA')){const first=!s[who].arasakaAttackedThisTurn;s[who].arasakaAttackedThisTurn=true;if(first&&s[who].legends.some(l=>l.faceUp&&l.legendEffect==='yorinobu'))queue(s,who,'yorinobu',{source:'Yorinobu Arasaka'});}
  if(u.attackEffect==='goro')queue(s,who,'goroAttack',{source:u.name,unitId:u.id});
  if(u.attackEffect==='swordwise')queue(s,who,'swordwise',{source:u.name,unitId:u.id});
  if(u.attackEffect==='evelyn')queue(s,who,'evelyn',{source:u.name});
  if(u.attackEffect==='dexter')queue(s,who,'adjust',{source:u.name,min:-1,max:1});
  for(const g of u.gear||[]){
   if(g.attackEffect==='kiroshi')queue(s,who,'peekOne',{source:g.name});
   if(g.attackEffect==='dying-night')queue(s,who,'adjust',{source:g.name,min:-2,max:0});
  }
 }
 function defeated(s,who,u){
  if(!active(s))return;
  if(u.defeatEffect==='tbug')queue(s,who,'tbug',{source:u.name});
  if(u.defeatEffect==='dexter')queue(s,who,'dexterDefeat',{source:u.name});
 }
 function endTurn(s,who){
  for(const host of [...s[who].units,...s[who].legends.filter(l=>l.faceUp)])for(const g of host.gear||[])if(g.endReadyHost)queue(s,who,'readyHost',{source:g.name,unitId:host.id});
  for(const u of s[who].units){
   if(u.endReadyEddie&&u.stoleGigThisTurn)queue(s,who,'readyEddies',{source:u.name,count:1});
   if((u.name==='V'||u.name.startsWith('V: ')))for(const g of u.gear||[])if(g.attackEffect==='dying-night')queue(s,who,'readyEddies',{source:g.name,count:2});
  }
 }
 function resetTurn(s){for(const who of ['player','ai']){s[who].calledThisTurn=false;s[who].bluePlayedThisTurn=false;s[who].arasakaAttackedThisTurn=false;for(const u of s[who].units)u.stoleGigThisTurn=false;}}
 function cardPower(u){return Math.max(0,(u.power||0)+(u.tempPowerModifier||0)+(u.attackPowerModifier||0)+(u.gear||[]).reduce((n,g)=>n+(g.power||0),0));}
 function defeatUnit(s,who,id,events=[]){const p=s[who],u=p.units.find(u=>u.id===id);if(!u)return false;p.units=p.units.filter(c=>c.id!==id);p.trash??=[];if(u.type==='Legend'){(p.removed??=[]).push({...u,gear:[]});p.trash.push(...(u.gear||[]));}else p.trash.push({...u,gear:[]},...(u.gear||[]));defeated(s,who,u);events.push('擊敗 '+u.name);return true;}
 function wonFight(s,who,u){const gears=(u.gear||[]).filter(g=>g.fightWinDraw);if(gears.length)queue(s,who,'draw',{source:gears[0].name,count:gears.length});}
 function options(s,e){
  const p=s[e.who];
  if(e.type==='order')return s.pendingEffects.filter(c=>c.who===e.who&&c.type!=='order');
  if(e.type==='search')return p.deck.slice(-5).reverse();
  if(e.type==='rippler')return p.deck.slice(-1);
  if(['peekOne','tbug','freeCall','radioport'].includes(e.type))return p.legends.filter(l=>!l.faceUp&&(!e.allowedLegendIds||e.allowedLegendIds.includes(l.id)));
  if(e.type==='defeatUnit')return (e.targetSides||['player','ai']).flatMap(side=>s[side].units.filter(u=>cardPower(u)<=e.powerMax).map(u=>({...u,side})));
  if(e.type==='spendUnit')return s[other(e.who)].units.filter(u=>Number.isFinite(u.cost)&&u.cost<=e.costMax);
  if(e.type==='swapGigs')return ['player','ai'].flatMap(side=>s[side].gigs.map(g=>({...g,side})));
  if(e.type==='discard')return p.hand;
  if(e.type==='readyEddies')return p.eddies.filter(c=>!c.ready);
  if(e.type==='adjust')return ['player','ai'].filter(w=>!e.friendlyOnly||w===e.who).flatMap(w=>s[w].gigs.map(g=>({...g,side:w})));
  return [];
 }
 function shuffled(cards,random=Math.random){const next=cards.slice();for(let i=next.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[next[i],next[j]]=[next[j],next[i]];}return next;}
 function apply(s,e,choice,events){
  const p=s[e.who],cards=options(s,e);
  if(e.type==='radioport'){
   if(choice.skip)return null;const l=cards.find(l=>l.id===choice.legendId);if(!l)return '請選擇友方蓋牌傳奇或不查看';l.knownToOwner=true;
   const eligible=(l.tags||[]).includes('ARASAKA')||l.goSolo;
   if(e.who==='player')s.pendingEffects.splice(1,0,{id:e.id+'-view',who:e.who,type:'peekResult',source:e.source,resolving:true,thenFreeCall:Boolean(eligible&&!p.calledThisTurn),allowedLegendIds:[l.id],cards:[{id:l.id,name:l.name,position:p.legends.indexOf(l)+1}]});
   else if(eligible&&!p.calledThisTurn)reveal(s,e.who,l.id,events);
   events.push('Radioport 私下查看一張友方傳奇');
  }else if(e.type==='defeatUnit'){
   const u=cards.find(u=>u.id===choice.unitId&&u.side===choice.side);if(!u)return '請選擇合法的單位';defeatUnit(s,u.side,u.id,events);
  }else if(e.type==='spendUnit'){
   const u=cards.find(u=>u.id===choice.unitId);if(!u)return '請選擇費用符合條件的對手單位';spend(s,other(e.who),s[other(e.who)].units.find(c=>c.id===u.id));events.push('橫置 '+u.name);
  }else if(e.type==='swapGigs'){
   if(choice.skip)return null;const own=p.gigs.find(g=>g.id===choice.friendlyGigId),q=s[other(e.who)],rival=q.gigs.find(g=>g.id===choice.rivalGigId);if(!own||!rival)return '請選擇雙方各一顆委託骰';p.gigs=p.gigs.filter(g=>g!==own);q.gigs=q.gigs.filter(g=>g!==rival);p.gigs.push(rival);q.gigs.push(own);events.push('交換雙方委託骰，保留原點數');
  }else if(e.type==='shatteredDraw'){
   if(typeof choice.draw!=='boolean')return '請選擇是否抽 5 張';if(choice.draw)draw(s,e.who,5,events);else events.push('選擇不抽 5 張');
  }else if(e.type==='search'){
   const ids=choice.cardIds||[];
   if(!Array.isArray(ids)||ids.length>2||new Set(ids).size!==ids.length||ids.some(id=>!cards.some(c=>c.id===id&&c.type==='Gear'&&c.cost<=2)))return '只能選擇最多兩張費用 2 以下的裝備';
   const selected=cards.filter(c=>ids.includes(c.id)),rest=cards.filter(c=>!ids.includes(c.id));
   p.deck.splice(Math.max(0,p.deck.length-5));p.hand.push(...selected);p.deck=shuffled(rest,choice.random).concat(p.deck);
   events.push('Viktor 揭示並加入 '+selected.length+' 張裝備'+(selected.length?'：'+selected.map(c=>c.name).join('、'):'')+'；其餘隨機放回牌庫底');
  }else if(e.type==='rippler'){
   if(typeof choice.trash!=='boolean')return '請選擇保留牌庫頂或棄置';
   if(choice.trash){(p.trash??=[]).push(p.deck.pop());events.push('Tetratronic Rippler：棄置牌庫頂 '+cards[0].name);}
   else events.push('Tetratronic Rippler：保留牌庫頂（不公開卡名）');
  }else if(e.type==='peekOne'){
   const l=cards.find(l=>l.id===choice.legendId);if(!l)return '請選擇一張友方蓋牌傳奇';
   l.knownToOwner=true;
   if(e.who==='player')s.pendingEffects.splice(1,0,{id:e.id+'-view',who:e.who,type:'peekResult',source:e.source,resolving:true,cards:[{id:l.id,name:l.name,position:p.legends.indexOf(l)+1}]});
   events.push('查看一張友方蓋牌傳奇（不向對手公開）');
  }else if(e.type==='peekResult'){
   if(choice.kind!=='ack')return '請確認已看完傳奇資訊';
  }else if(e.type==='freeCall'){
   if(choice.legendId){if(!cards.some(l=>l.id===choice.legendId)||!reveal(s,e.who,choice.legendId,events))return '本回合已呼叫過，或傳奇目標不合法';}
   else events.push('選擇不免費呼叫傳奇');
  }else if(e.type==='discard'){
   const index=p.hand.findIndex(c=>c.id===choice.cardId);if(index<0)return '請從目前手牌選擇一張棄牌';
   const [card]=p.hand.splice(index,1);(p.trash??=[]).push(card);events.push('Evelyn 棄置 '+card.name);
  }else if(e.type==='readyEddies'){
   const ids=choice.eddieIds||[],count=Math.min(e.count,cards.length);
   if(!Array.isArray(ids)||ids.length!==count||new Set(ids).size!==count||ids.some(id=>!cards.some(c=>c.id===id)))return '請選擇 '+count+' 張已使用的 Eddie';
   for(const id of ids)p.eddies.find(c=>c.id===id).ready=true;events.push(e.source+' 重置 '+count+' 張 Eddie');
  }else if(e.type==='adjust'){
   const delta=choice.delta??0;
   if(!Number.isInteger(delta)||delta<e.min||delta>e.max)return '委託骰調整值不合法';
   if(delta!==0){
    const g=cards.find(g=>g.id===choice.gigId&&g.side===choice.side);if(!g||g.value+delta<1||g.value+delta>g.sides)return '請選擇合法的委託骰與點數';
    const actual=s[g.side].gigs.find(c=>c.id===g.id),before=actual.value;actual.value+=delta;
    events.push(e.source+' 調整 '+(g.side===e.who?'友方':'對手')+' d'+g.sides+'：'+before+' → '+actual.value);
    if(e.drawOnMin&&before>1&&actual.value===1)draw(s,e.who,1,events);
   }else events.push(e.source+'：不調整委託骰');
   if(e.drawOnDistinct&&new Set(p.gigs.map(g=>g.value)).size>=e.drawOnDistinct)draw(s,e.who,1,events);
   if(e.drawOnAtLeast&&p.gigs.some(g=>g.value>=e.drawOnAtLeast))draw(s,e.who,1,events);
  }else return '此效果選項尚未支援';
  return null;
 }
 function pump(s,events=[]){
  checkVictory(s,null,events);
  while(!s.finished&&pending(s)){
   if(pending(s).type==='order')break;
   if(!pending(s).resolving){
    const owners=s.pendingEffects.map(e=>e.who);
    const owner=owners.includes(s.effectsOwner)?s.effectsOwner:owners.includes(s.turn)?s.turn:owners[0];s.effectsOwner=owner;
    const own=s.pendingEffects.filter(e=>e.who===owner);
    if(owner==='player'&&own.length>1){s.pendingEffects.unshift({id:'order-'+own[0].id,who:owner,type:'order',source:'多個待結算能力：選擇順序'});break;}
    const index=s.pendingEffects.findIndex(e=>e.who===owner),[chosen]=s.pendingEffects.splice(index,1);chosen.resolving=true;s.pendingEffects.unshift(chosen);
   }
   const e=pending(s),p=s[e.who],cards=options(s,e);
   if(e.type==='readyHost'){s.pendingEffects.shift();const host=[...p.units,...p.legends].find(u=>u.id===e.unitId);if(host){host.ready=true;events.push(e.source+' 重置 '+host.name);}continue;}
   if(e.type==='goroAttack'){s.pendingEffects.shift();const u=p.units.find(u=>u.id===e.unitId);if(u&&p.legends.every(l=>l.faceUp)){u.tempPowerModifier=(u.tempPowerModifier||0)+5;events.push(e.source+' 本回合戰力 +5');}continue;}
   if(e.type==='swordwise'){s.pendingEffects.shift();const u=p.units.find(u=>u.id===e.unitId);if(u&&cardPower(u)>=5)draw(s,e.who,1,events);continue;}
   if(e.type==='yorinobu'){s.pendingEffects.shift();draw(s,e.who,1,events);if(!s.finished&&cred(s,e.who)<20)s.pendingEffects.unshift({...e,type:'discard',source:'Yorinobu Arasaka'});continue;}
   if(e.type==='dexterDefeat'){s.pendingEffects.shift();if(Number.isFinite(cred(s,e.who))&&Number.isFinite(cred(s,other(e.who)))&&Math.abs(cred(s,e.who)-cred(s,other(e.who)))>=10)draw(s,e.who,2,events);else events.push('Dexter：數值街頭聲望差距未達 10，未抽牌');continue;}
   if(e.type==='draw'){s.pendingEffects.shift();draw(s,e.who,e.count,events);continue;}
   if(e.type==='evelyn'){s.pendingEffects.shift();draw(s,e.who,1,events);if(!s.finished&&cred(s,e.who)>cred(s,other(e.who)))s.pendingEffects.unshift({...e,type:'discard'});continue;}
   if(e.type==='tbug'){
    for(const l of cards)l.knownToOwner=true;
    s.pendingEffects[0]=e.who==='player'&&cards.length?{...e,type:'peekResult',thenFreeCall:true,cards:cards.map(l=>({id:l.id,name:l.name,position:p.legends.indexOf(l)+1}))}:{...e,type:'freeCall'};
    events.push('T-Bug 查看全部友方蓋牌傳奇（不公開卡名）');continue;
   }
   if((['search','rippler','peekOne','radioport','defeatUnit','spendUnit','discard','readyEddies','adjust'].includes(e.type)&&!cards.length)||(e.type==='freeCall'&&(p.calledThisTurn||!cards.length))){s.pendingEffects.shift();continue;}
   if(e.type==='swapGigs'&&(!p.gigs.length||!s[other(e.who)].gigs.length)){s.pendingEffects.shift();continue;}
   if(e.who==='player')break;
   let choice=e.type==='rippler'?{trash:false}:e.type==='search'?{cardIds:cards.filter(c=>c.type==='Gear'&&c.cost<=2).slice(0,2).map(c=>c.id)}:e.type==='peekOne'||e.type==='freeCall'?{legendId:cards[0]?.id}:e.type==='discard'?{cardId:cards[0]?.id}:e.type==='readyEddies'?{eddieIds:cards.slice(0,e.count).map(c=>c.id)}:{delta:0};
   if(e.type==='radioport')choice={legendId:cards[0]?.id};
   if(e.type==='defeatUnit'){const u=cards.sort((a,b)=>Number(a.side===e.who)-Number(b.side===e.who)||cardPower(b)-cardPower(a))[0];choice={unitId:u.id,side:u.side};}
   if(e.type==='spendUnit')choice={unitId:cards.find(c=>c.ready)?.id||cards[0].id};
   if(e.type==='swapGigs'){const own=p.gigs.slice().sort((a,b)=>a.value-b.value)[0],rival=s[other(e.who)].gigs.slice().sort((a,b)=>b.value-a.value)[0];choice=rival.value>own.value?{friendlyGigId:own.id,rivalGigId:rival.id}:{skip:true};}
   if(e.type==='shatteredDraw')choice={draw:p.deck.length>=5};
   if(e.type==='adjust'&&e.drawOnAtLeast){const g=p.gigs.find(g=>g.value<g.sides);choice=g?{side:e.who,gigId:g.id,delta:Math.min(e.max,g.sides-g.value)}:{delta:0};}
   const error=apply(s,e,choice,events);if(error)throw Error(error);s.pendingEffects.shift();
  }
  if(!pending(s))delete s.effectsOwner;
  return s;
 }
 function resolve(s,who,choice){
  const e=pending(s);if(s.finished||!e||e.who!==who)return fail('目前沒有需要你選擇的效果');
  const next=copy(s),events=[];
  if(e.type==='order'){
   const index=next.pendingEffects.findIndex(c=>c.id===choice?.effectId&&c.who===e.who&&c.type!=='order');if(index<1)return fail('請選擇目前待結算的能力');
   const [selected]=next.pendingEffects.splice(index,1);next.pendingEffects.shift();selected.resolving=true;next.pendingEffects.unshift(selected);pump(next,events);return ok(next,events);
  }
  if(e.type==='peekResult'&&e.thenFreeCall){
   if(choice?.kind!=='ack')return fail('請確認已看完傳奇資訊');
   next.pendingEffects[0]={...pending(next),id:e.id+'-call',type:'freeCall',thenFreeCall:false};pump(next,events);return ok(next,events);
  }
  const error=apply(next,pending(next),choice||{},events);if(error)return fail(error);
  if(!next.finished)next.pendingEffects.shift();pump(next,events);return ok(next,events);
 }
 return {cardPower,defeatUnit,wonFight,finish,checkVictory,beginTurn,completeTurn,resultSummary,legendSpecs,knownLegend,active,pending,queue,draw,reveal,onPlay,spend,attack,defeated,endTurn,resetTurn,options,shuffled,pump,resolve,cred};
});
