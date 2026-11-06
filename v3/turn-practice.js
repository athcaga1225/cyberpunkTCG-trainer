/* V3 only: bounded two-player turn sequence for a BASIC PRACTICE, not official full-game play.
 * Official rules: https://cyberpunktcg.com/comprehensive-rules 7.7-7.9, 8.1-8.11.
 * Supports a bounded mirror opponent and explicit Quick/Blocker reactions.
 * Known The Heist Legend/Attack/Defeated/end-turn effects use explicit choices.
 * Opening follows 7.5–7.9; Overtime and outcomes follow 1.10–1.17 and 8.17.
 */
(function(root,factory){'use strict';const deps=(typeof module!=='undefined'&&module.exports)?require('./battle-actions.js'):root.NCTV3Actions;const combat=(typeof module!=='undefined'&&module.exports)?require('./mirror-combat.js'):root.NCTV3Combat;const effects=(typeof module!=='undefined'&&module.exports)?require('./heist-effects.js'):root.NCTV3Effects;const api=factory(deps,combat,effects);if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.NCTV3TurnPractice=api;})(typeof globalThis!=='undefined'?globalThis:this,function(actions,combat,effects){'use strict';
 const copy=x=>JSON.parse(JSON.stringify(x));
 const fail=reason=>({ok:false,reason});
 const ok=(state,message)=>({ok:true,state,message});
 const sides=[4,6,8,10,12,20];
 const unit=()=>({id:'practice-unit',name:'練習單位',type:'Unit',cost:2,power:2});
 const sale=()=>({id:'practice-sell',name:'練習資源卡',type:'Program',sellTag:true});
 const addCard=(deck,n)=>Array.from({length:n},(_,i)=>({...deck(),id:deck().id+'-'+i}));
 function fresh(){
  return {turn:'player',phase:'start',step:'ready',round:1,finished:false,
   player:{hand:[sale(),unit()],deck:addCard(sale,14),eddies:[{id:'opening-eddie',ready:true}],legends:[{id:'legend-1',ready:false,faceUp:false},{id:'legend-2',ready:false,faceUp:false},{id:'legend-3',ready:true,faceUp:false}],units:[],gigs:[],fixer:[...sides],soldThisTurn:false},
   ai:{hand:[],deck:[],eddies:[],legends:[],units:[],gigs:[],fixer:[],soldThisTurn:false}};
 }
 // Rule 7.5: a randomized winner chooses whether to play first or second.
 // Mirror games execute the initial opponent turn; fixed script targets skip it.
 function rollForOrder(state,playerRoll,rivalRoll){
  if(state.phase!=='pregame'||state.opening?.resolved||state.opening?.orderChosen)return fail('先後攻已決定');
  if(!Number.isInteger(playerRoll)||playerRoll<1||playerRoll>20||
     !Number.isInteger(rivalRoll)||rivalRoll<1||rivalRoll>20)return fail('d20 點數必須為 1 到 20');
  const s=copy(state);
  if(playerRoll===rivalRoll)return ok(s,'雙方 d20 同點，請重新擲骰');
  s.opening={resolved:false,playerRoll,rivalRoll,winner:playerRoll>rivalRoll?'player':'ai'};
  return ok(s,'先後攻擲骰：我方 '+playerRoll+'、對手 '+rivalRoll+'；'+(s.opening.winner==='player'?'由我方選先後攻。':'由腳本對手決定先後攻。'));
 }
 function chooseOrder(state,firstPlayer,random=Math.random){
  if(state.phase!=='pregame'||state.opening?.resolved||state.opening?.orderChosen||!state.opening?.winner)return fail('請先擲骰決定選擇權');
  if(firstPlayer!=='player'&&firstPlayer!=='ai')return fail('先攻選擇無效');
  // No opponent decision engine exists: the scripted defender always picks first.
  if(state.opening.winner==='ai'&&firstPlayer!=='ai')return fail('本練習的腳本對手取得選擇權後固定選擇先攻');
  const s=copy(state);
  if(s.setupKind==='random'){
   if(!effects.active(s))return fail('隨機開局需使用鏡像實戰');
   for(const who of ['player','ai']){
    const p=s[who];p.deck=effects.shuffled([...p.deck,...p.hand],random);p.hand=[];
    p.legends=effects.shuffled(p.legends,random);
    p.legends.forEach((l,i)=>{l.ready=who!==firstPlayer||i>=2;l.faceUp=false;delete l.knownToOwner;});
    for(let i=0;i<6;i++)p.hand.push(p.deck.pop());
   }
   Object.assign(s.opening,{first:firstPlayer,orderChosen:true,handDecisions:{player:null,ai:firstPlayer==='ai'?'keep':null},mulliganUsed:{player:false,ai:false}});
   s.step='mulligan';
   return ok(s,'雙方已洗牌並抽取六張起手。'+(firstPlayer==='ai'?'對手先攻並選擇保留；現在輪到我方。':'我方先攻，請先決定保留或重抽。'));
  }
  return startMatch(s,firstPlayer);
 }
 function openingHand(state,choice,random=Math.random){
  if(state.setupKind!=='random'||state.phase!=='pregame'||!state.opening?.orderChosen||state.opening.resolved||state.opening.handDecisions.player!==null)return fail('目前不是我方起手決定時機，每局只能決定一次');
  if(!['keep','mulligan'].includes(choice))return fail('請選擇保留或整手重抽');
  const s=copy(state),p=s.player;
  if(choice==='mulligan'){
   if(p.hand.length!==6||p.deck.length!==34)return fail('起手資料不完整，不能重抽');
   p.deck=effects.shuffled([...p.deck,...p.hand],random);p.hand=[];
   for(let i=0;i<6;i++)p.hand.push(p.deck.pop());
   s.opening.mulliganUsed.player=true;
  }
  s.opening.handDecisions.player=choice;
  // Conservative, explicit bot policy: always keep; never reads the human hand.
  s.opening.handDecisions.ai='keep';s.step='confirm-opening';
  return ok(s,(choice==='mulligan'?'已將整手洗回牌庫並重抽六張；本局不能再次重抽。':'我方保留六張起手。')+'對手保留起手；確認後開始對戰。');
 }
 function beginOpening(state){
  if(state.setupKind!=='random'||state.phase!=='pregame'||!state.opening?.orderChosen||state.opening.resolved||!state.opening.handDecisions?.player||!state.opening.handDecisions?.ai)return fail('請先完成雙方起手決定');
  return startMatch(copy(state),state.opening.first);
 }
 function startMatch(s,firstPlayer){
  s.opening.resolved=true;s.opening.first=firstPlayer;
  const mirror=Boolean(s.ai.practiceBot?.kind==='mirror-the-heist');
  s.opening.scriptedOpponentTurnSkipped=!mirror&&firstPlayer==='ai';
  s.turn=mirror&&firstPlayer==='ai'?'ai':'player';
  s.phase=mirror&&firstPlayer==='ai'?'opponent':'start';
  s.step=mirror&&firstPlayer==='ai'?'pendingBot':'ready';
  s.round=1;
  for(const [index,legend] of s.player.legends.entries())legend.ready=firstPlayer!=='player'||index>=2;
  if(mirror)for(const [index,legend] of s.ai.legends.entries())legend.ready=firstPlayer!=='ai'||index>=2;
  effects.beginTurn(s,s.turn);
  if(mirror&&firstPlayer==='ai')return ok(s,'鏡像對手先攻：先執行其首回合，再由我方開始第一回合。');
  if(mirror)return ok(s,firstPlayer==='player'?'我方先攻：兩張傳奇卡已使用；完成後交給鏡像對手。':'我方後攻：鏡像對手須先完成首回合。');
  return ok(s,firstPlayer==='player'?'我方先攻：左側兩張傳奇卡已使用，第一回合不能重置。':'腳本對手先攻：目前沒有 AI 回合，已明確略過對手第一回合；我方後攻，三張傳奇卡保持就緒。');
 }
 function ready(state){
  if(effects.pending(state))return fail('請先處理待結算能力');
  if(state.turn!=='player'||state.phase!=='start'||state.step!=='ready')return fail('目前不是重置階段');
  const s=copy(state),p=s.player,events=[];
  if(!s.turnStart||s.turnStart.who!=='player')effects.beginTurn(s,'player',events);
  if(effects.checkVictory(s,'player',events))return ok(s,events.join('；'));
  if(s.round>1){for(const zone of ['eddies','legends','units'])for(const c of p[zone])c.ready=true;for(const u of p.units)u.lag=false;}
  s.step='draw';return ok(s,'準備階段：重置完成。');
 }
 function draw(state){
  if(effects.pending(state))return fail('請先處理待結算能力');
  if(state.turn!=='player'||state.phase!=='start'||state.step!=='draw')return fail('必須先完成重置');
  const s=copy(state),p=s.player;
  const events=[];effects.draw(s,'player',1,events);if(s.finished)return ok(s,events.join('；'));
  if(!p.fixer.length){s.phase='main';s.step='actions';return ok(s,'抽取 1 張手牌；合事佬區已空，略過擲骰並進入主要階段。');}
  s.step='roll';return ok(s,'抽取 1 張練習手牌。');
 }
 function roll(state,side,value){
  if(effects.pending(state))return fail('請先處理待結算能力');
  if(state.turn!=='player'||state.phase!=='start'||state.step!=='roll')return fail('必須先完成抽牌');
  const s=copy(state),p=s.player;
  if(!p.fixer.includes(side))return fail('這顆骰子不在合事佬區');
  if(side===20&&p.fixer.length>1)return fail('d20 必須最後擲出');
  if(!Number.isInteger(value)||value<1||value>side)return fail('無效骰子點數');
  p.fixer.splice(p.fixer.indexOf(side),1);p.gigs.push({id:'gig-'+s.round,sides:side,value});s.phase='main';s.step='actions';
  return ok(s,'擲出 d'+side+'，點數 '+value+'；進入主要階段。');
 }
 function sell(state,id){
  if(effects.pending(state))return fail('請先處理待結算能力');
  if(!actions)return fail('支付模組未載入');
  const r=actions.sell(state,'player',id);
  return r.ok?ok(r.state,r.events.join('；')):r;
 }
 function play(state,id,payment,opts={}){
  if(effects.pending(state))return fail('請先處理待結算能力');
  if(!actions)return fail('支付模組未載入');
  const r=actions.playUnit(state,'player',id,payment,opts);
  if(r.ok&&effects.active(state)){effects.onPlay(r.state,'player',state.player.hand.find(c=>c.id===id));return progress(r.state,r.events);}
  return r.ok?ok(r.state,r.events.join('；')):r;
 }
 function gear(state,id,payment,targetId){
  if(effects.pending(state))return fail('請先處理待結算能力');
  if(!actions)return fail('支付模組未載入');
  const r=actions.playGear(state,'player',id,payment,targetId);
  if(r.ok&&effects.active(state)){effects.onPlay(r.state,'player',state.player.hand.find(c=>c.id===id));return progress(r.state,r.events);}
  return r.ok?ok(r.state,r.events.join('；')):r;
 }
 function program(state,id,payment,opts){
  if(effects.pending(state))return fail('請先處理待結算能力');
  if(!actions)return fail('支付模組未載入');
  const r=actions.playProgram(state,'player',id,payment,opts);
  return r.ok&&effects.active(state)?progress(r.state,r.events):r.ok?ok(r.state,r.events.join('；')):r;
 }
 function pass(state){
  if(effects.pending(state))return fail('請先處理待結算能力');
  if(state.turn!=='player'||state.phase!=='main'||state.finished)return fail('只能在自己的主要階段結束回合');
  const s=copy(state);if(effects.active(s)){effects.endTurn(s,'player');s.afterEffects='pass';s.phase='end';return progress(s,['進入回合結束效果']);}
  return finishPass(s);
 }
 function finishPass(state){
  const s=copy(state),events=[];effects.resetTurn(s);for(const unit of s.player.units)unit.lag=false;
  for(const side of ['player','ai']){for(const unit of s[side].units)unit.tempPowerModifier=0;s[side].pendingRebootOptics=0;}
  effects.completeTurn(s,events);if(s.finished)return ok(s,events.join('；'));
  s.turn='ai';s.phase='opponent';s.step=s.ai.practiceBot?.kind==='mirror-the-heist'?'pendingBot':'paused';
  effects.beginTurn(s,'ai',events);
  if(!s.finished)events.push(s.step==='pendingBot'?'我方回合結束；輪到鏡像對手執行回合。':'本回合結束；所有己方單位失去 Lag，對手行動尚未實作。');
  return ok(s,events.join('；'));
 }
 // One bounded automated opponent turn; uses real pay/sell/playUnit validators.
 // Attacks pause in the defender React Step; never bypass the human response.
 function opponentTurn(state,dieValue){
  if(state.finished||state.turn!=='ai'||state.phase!=='opponent'||state.step!=='pendingBot')
   return fail('目前不是對手回合');
  if(state.ai?.practiceBot?.kind!=='mirror-the-heist')return fail('此模式沒有自動測試對手');
  const s=copy(state),p=s.ai,notes=[];
  if(!s.turnStart||s.turnStart.who!=='ai')effects.beginTurn(s,'ai',notes);
  if(effects.checkVictory(s,'ai',notes))return ok(s,notes.join('；'));
  if(p.practiceBot.turnsTaken>0){
   for(const zone of ['eddies','legends','units'])for(const card of p[zone])card.ready=true;
  }
  for(const unit of p.units)unit.lag=false;
  notes.push('對手重置可重置的卡牌');
  effects.draw(s,'ai',1,notes);if(s.finished)return ok(s,notes.join('；'));
  const side=p.fixer.find(d=>d!==20)??p.fixer[0];
  if(side!==undefined){
   if(!Number.isInteger(dieValue)||dieValue<1||dieValue>side)return fail('對手委託骰點數無效');
   p.fixer.splice(p.fixer.indexOf(side),1);
   p.gigs.push({id:'mirror-gig-'+p.practiceBot.turnsTaken,sides:side,value:dieValue});
   notes.push('擲出 d'+side+'（'+dieValue+'）');
  }
  s.phase='main';s.step='actions';
  const sale=p.hand.filter(c=>c.sellTag&&c.id!=='training-quick-floor-it').sort((a,b)=>p.practiceBot.strategy==='active'?Number(a.type!=='Program')-Number(b.type!=='Program'):0)[0];
  if(sale){
   const sold=actions.sell(s,'ai',sale.id);
   if(sold.ok){Object.assign(s,sold.state);notes.push(...sold.events)}
  }
  if(p.practiceBot.strategy==='active'){s.opponentMainStep='call';s.opponentNotes=notes;return continueOpponent(s);}
  const q=s.ai;
  const available=[...q.eddies.filter(x=>x.ready).map(x=>({kind:'eddie',id:x.id})),
    ...q.legends.filter(x=>x.ready&&(!x.faceUp||x.sellTag)).map(x=>({kind:'legend',id:x.id}))];
  // Only vanilla units with verified base deployment; no invented target decisions.
  const unit=q.hand.filter(c=>c.type==='Unit'&&!c.unimplementedEffect&&!c.requiresTarget&&
   !c.onPlaySpendRival&&!c.onPlayDefeatGear&&!c.onPlayGigAdjust&&!c.deferredEffect&&
   c.cost<=available.length).sort((a,b)=>b.cost-a.cost)[0];
  if(unit){
   const sources=available.slice(0,unit.cost);
   const played=actions.playUnit(s,'ai',unit.id,sources);
   if(played.ok){Object.assign(s,played.state);effects.onPlay(s,'ai',unit);effects.pump(s,notes);notes.push(...played.events)}
  }
  s.opponentNotes=notes;
  return continueOpponent(s);
 }
 // Only own hand and public battlefield data inform these bounded decisions.
 function botSources(s,cost){
  const p=s.ai;
  return [...p.eddies.filter(c=>c.ready).map(c=>({kind:'eddie',id:c.id})),...p.legends.filter(c=>c.ready&&(!c.faceUp||c.sellTag)).map(c=>({kind:'legend',id:c.id}))].slice(0,cost);
 }
 function botUnitOptions(s,card){
  const opts={delta:0};
  if(card.onPlayGigAdjust){const g=s.ai.gigs.find(g=>g.value<g.sides);if(g)Object.assign(opts,{side:'ai',gigId:g.id,delta:1});}
  if(card.onPlaySpendRival){const u=s.player.units.filter(u=>u.ready&&!(u.gear||[]).some(g=>g.deferredEffect||g.unimplementedEffect)).sort((a,b)=>combat.power(b)-combat.power(a))[0];if(u)opts.rivalUnitId=u.id;}
  if(card.onPlayDefeatGear){const g=s.player.units.concat(s.player.legends.filter(l=>l.faceUp)).flatMap(u=>u.gear||[]).sort((a,b)=>(b.power||0)-(a.power||0))[0];if(g)Object.assign(opts,{gearSide:'player',gearTargetId:g.id});}
  return opts;
 }
 function botProgramChoices(s){
  const choices=[];
  for(const card of s.ai.hand.filter(c=>c.type==='Program'&&!c.unimplementedEffect&&!c.deferredEffect&&botSources(s,c.cost).length===c.cost)){
   if(card.name==='Floor It'&&s.ai.deck.length){
    const targets=s.player.units.filter(u=>!u.deferredEffect&&!u.unimplementedEffect);if(!targets.length)continue;
    const target=targets.sort((a,b)=>combat.power(b)-combat.power(a))[0];
    choices.push({card,opts:{rivalUnitId:target.id},rank:4});
   }else if(card.name==="Afterparty at Lizzie's"){
    const opts={delta:0},own=s.ai.gigs.find(g=>g.value<g.sides),rival=s.player.gigs.find(g=>g.value>1);
    if(own)Object.assign(opts,{side:'ai',gigId:own.id,delta:1});else if(rival)Object.assign(opts,{side:'player',gigId:rival.id,delta:-1});
    const values=s.ai.gigs.map(g=>g.value+(opts.side==='ai'&&g.id===opts.gigId?opts.delta:0)),draw=new Set(values).size>=2;
    if((!draw||s.ai.deck.length)&&(draw||opts.delta!==0))choices.push({card,opts,rank:draw?5:1});
   }else if(card.name==='Reboot Optics'&&!s.ai.pendingRebootOptics){
    const tie=s.ai.units.some(u=>{const legal=combat.targets(s,'ai',u.id);return combat.power(u)>0&&s.player.units.some(d=>legal.units.includes(d.id)&&combat.power(d)===combat.power(u));});
    if(tie)choices.push({card,opts:{},rank:6});
   }
  }
  return choices.sort((a,b)=>b.rank-a.rank);
 }
 function advanceOpponentMain(state,notes){
  let s=state;
  const steps=['call','solo','unit','gear','program','attack'];
  while(!s.finished&&!effects.pending(s)&&s.opponentMainStep!=='attack'){
   const stage=s.opponentMainStep;s.opponentMainStep=steps[steps.indexOf(stage)+1]||'attack';
   let r=null;
   if(stage==='call'&&!s.ai.calledThisTurn){
    // The first face-down position is chosen blindly, never by its hidden name.
    const l=s.ai.legends.find(l=>!l.faceUp),sources=botSources(s,1);
    if(l&&sources.length===1&&effects.knownLegend(l)){
     r=actions.pay(s,'ai',1,sources);
     if(r.ok){effects.reveal(r.state,'ai',l.id,r.events);r.events.unshift('對手呼叫傳奇');}
    }
   }else if(stage==='solo'){
    const l=s.ai.legends.find(l=>l.faceUp&&l.goSolo&&effects.knownLegend(l)&&!(l.gear||[]).some(g=>g.deferredEffect||g.unimplementedEffect));
    if(l&&botSources(s,l.cost).length===l.cost)r=soloAction(s,'ai',l.id,botSources(s,l.cost));
   }else if(stage==='unit'){
    const candidates=s.ai.hand.filter(c=>c.type==='Unit'&&!c.deferredEffect&&!c.unimplementedEffect&&!c.requiresTarget&&!c.playRestriction&&botSources(s,c.cost).length===c.cost).sort((a,b)=>b.cost-a.cost);
    for(const c of candidates){r=actions.playUnit(s,'ai',c.id,botSources(s,c.cost),botUnitOptions(s,c));if(r.ok){effects.onPlay(r.state,'ai',c);break;}}
   }else if(stage==='gear'){
    const host=s.ai.units.filter(u=>!u.unimplementedEffect).sort((a,b)=>combat.power(b)-combat.power(a))[0]||s.ai.legends.find(l=>l.faceUp&&effects.knownLegend(l));
    if(host){
     const rank=c=>(c.power||0)+(c.blocker?2:0)+(c.spendEffect||c.attackEffect?1:0)-c.cost*.2;
     const cards=s.ai.hand.filter(c=>c.type==='Gear'&&!c.deferredEffect&&!c.unimplementedEffect&&!c.requiresTarget&&!c.playRestriction&&botSources(s,c.cost).length===c.cost).sort((a,b)=>rank(b)-rank(a));
     for(const c of cards){r=actions.playGear(s,'ai',c.id,botSources(s,c.cost),host.id);if(r.ok){effects.onPlay(r.state,'ai',c);break;}}
    }
   }else if(stage==='program'){
    for(const c of botProgramChoices(s)){r=actions.playProgram(s,'ai',c.card.id,botSources(s,c.card.cost),c.opts);if(r.ok){r.events.unshift('對手使用程式：'+c.card.name);break;}}
   }
   if(r?.ok){s=r.state;notes.push(...r.events);}
   if(!s.finished)s.opponentNotes=notes;
   effects.pump(s,notes);
  }
  return s;
 }
 function continueOpponent(state){
  let s=copy(state);const notes=s.opponentNotes||[];
  if(s.finished)return ok(s,notes.join('；'));
  if(s.ai.practiceBot.strategy==='active'&&s.opponentMainStep&&s.opponentMainStep!=='attack'){
   s=advanceOpponentMain(s,notes);
   if(s.finished||effects.pending(s))return ok(s,notes.join('；'));
  }
  const planned=combat.plan(s,'ai');
  if(planned){
   const attack=combat.begin(s,'ai',planned.attackerId,planned.target);
   if(attack.ok)return progress(attack.state,[...notes,...attack.events]);
  }
  const limitation=combat.restriction(s);if(limitation)notes.push(limitation);
  effects.endTurn(s,'ai');s.afterEffects='ai-end';s.phase='end';return progress(s,notes);
 }
 function finishOpponent(state,notes=[]){
  const s=copy(state);effects.resetTurn(s);
  delete s.opponentNotes;delete s.opponentMainStep;
  for(const zone of ['player','ai']){for(const unit of s[zone].units)unit.tempPowerModifier=0;s[zone].pendingRebootOptics=0;}
  for(const unit of s.ai.units)unit.lag=false;
  s.ai.practiceBot.turnsTaken++;
  s.ai.soldThisTurn=false;
  effects.completeTurn(s,notes);if(s.finished)return ok(s,notes.join('；'));
  s.turn='player';s.phase='start';s.step='ready';s.player.soldThisTurn=false;
  if(!(s.opening?.first==='ai'&&s.ai.practiceBot.turnsTaken===1))s.round++;
  effects.beginTurn(s,'player',notes);
  return ok(s,'鏡像對手完成回合：'+notes.join('；'));
 }
 function next(state){
  if(state.pendingAttack||effects.pending(state))return fail('請先完成防守反應與能力選擇');
  if(state.turn!=='ai'||state.phase!=='opponent')return fail('必須先結束我方回合');
  const s=copy(state);s.turn='player';s.phase='start';s.step='ready';s.round+=1;s.player.soldThisTurn=false;for(const u of s.ai.units)if(u.trainingTarget)u.ready=true;
  const events=[];effects.beginTurn(s,'player',events);if(s.finished)return ok(s,events.join('；'));
  return ok(s,'開始下一個我方回合（對手行動在此練習中略過）。');
 }
 function prepareTrainingTarget(state,targetId){
  if(effects.pending(state))return fail('請先處理待結算能力');
  if(state.finished||state.turn!=='player'||state.phase!=='main'||state.practiceKind!=='the-heist')
   return fail('只能在 The Heist 主要階段設定練習目標');
  const target=state.ai?.units?.find(u=>u.id===targetId&&u.trainingTarget);
  if(!target)return fail('找不到練習單位');
  const s=copy(state);s.ai.units.find(u=>u.id===targetId).ready=false;
  return ok(s,'練習設定：對手 '+target.name+' 改為已使用（非 AI 行動）');
 }
 function fight(state,attackerId,defenderId){
  if(effects.pending(state))return fail('請先處理待結算能力');
  if(!actions)return fail('對戰模組未載入');
  const r=actions.fightSpentUnit(state,'player',attackerId,defenderId);
  return r.ok?ok(r.state,r.events.join('；')):r;
 }
 function steal(state,attackerId,gigIds){
  if(effects.pending(state))return fail('請先處理待結算能力');
  if(!actions)return fail('對戰模組未載入');
  const r=actions.stealTrainingGigs(state,'player',attackerId,gigIds);
  return r.ok?ok(r.state,r.events.join('；')):r;
 }
 function addTrainingBlocker(state){
  if(effects.pending(state))return fail('請先處理待結算能力');
  if(state.practiceKind!=='the-heist'||state.phase!=='main'||state.turn!=='player'||state.finished)
   return fail('只能在 The Heist 主要階段加入攔截練習');
  if(state.ai.units.some(u=>u.trainingBlocker))return fail('已有攔截練習單位');
  const s=copy(state);
  s.ai.units.push({id:'training-blocker-bombus',name:'Secondhand Bombus',type:'Unit',power:0,ready:true,lag:false,blocker:true,trainingTarget:true,trainingBlocker:true,gear:[]});
  return ok(s,'已加入腳本 Blocker：防守反應可選擇攔截或不攔截（非 AI 行動）');
 }
 function addTrainingQuick(state){
  if(effects.pending(state))return fail('請先處理待結算能力');
  if(state.practiceKind!=='the-heist'||state.phase!=='main'||state.turn!=='player'||state.finished)
   return fail('只能在 The Heist 主要階段加入 Quick 練習');
  if(state.ai.quickExercise?.enabled)return fail('已有 Quick 練習');
  const s=copy(state);
  s.ai.quickExercise={enabled:true};
  s.ai.hand.push({id:'training-quick-floor-it',name:'Floor It',type:'Program',cost:1,sellTag:true});
  s.ai.eddies.push(...Array.from({length:1},(_,i)=>({id:'training-quick-eddie-'+i,ready:true})));
  s.ai.deck.push({id:'training-quick-draw',name:'練習抽牌',type:'Unit'});
  return ok(s,'已配置對手 Floor It 與 1 €$；可在 React Step 選擇使用（非 AI）');
 }
 function reactAttack(state,attackerId,attack,reaction){
  if(state.ai?.practiceBot?.kind==='mirror-the-heist'){
   const declared=combat.begin(state,'player',attackerId,attack);if(!declared.ok)return declared;
   return progress(declared.state,declared.events);
  }
  if(!actions)return fail('對戰模組未載入');
  const r=actions.resolveTrainingReaction(state,'player',attackerId,attack,reaction);
  return r.ok?ok(r.state,r.events.join('；')):r;
 }
 function defend(state,action){
  const result=action?.kind==='end'?combat.end(state,'player'):combat.react(state,'player',action);
  if(!result.ok)return result;
  if(result.state.finished)return ok(result.state,result.events.join('；'));
  return progress(result.state,result.events);
 }
 function progress(state,events=[]){
  effects.pump(state,events);
  if(state.finished||effects.pending(state))return ok(state,events.join('；'));
  if(state.afterEffects){
   const next=copy(state),mode=next.afterEffects;delete next.afterEffects;
   const result=mode==='pass'?finishPass(next):finishOpponent(next,events);
   if(mode==='pass'&&result.ok)result.message=[...events,result.message].join('；');return result;
  }
  if(state.pendingAttack?.defendingSide==='ai'){
   const defended=combat.autoDefense(state,state.pendingAttack.preferredGigIds);return defended.ok?progress(defended.state,[...events,...defended.events]):defended;
  }
  if(!state.pendingAttack&&state.turn==='ai'&&state.phase==='main'&&state.opponentNotes){state.opponentNotes=[...events];return continueOpponent(state);}
  return ok(state,events.join('；'));
 }
 function concede(state){
  if(state.finished||state.phase==='pregame')return fail('本局尚未開始或已結束');
  const s=copy(state),events=[];effects.finish(s,'ai','concede',events);return ok(s,events.join('；'));
 }
 function resolveEffect(state,choice){const r=effects.resolve(state,'player',choice);return r.ok?progress(r.state,r.events):r;}
 function callLegend(state,id,sources){
  if(!effects.active(state)||state.finished||effects.pending(state))return fail('請先完成目前能力，並使用鏡像實戰模式');
  if(!((state.turn==='player'&&state.phase==='main')||(state.phase==='react'&&state.pendingAttack?.defendingSide==='player')))return fail('只能在主要階段或防守反應時呼叫傳奇');
  const l=state.player.legends.find(l=>l.id===id&&!l.faceUp);
  if(!l||state.player.calledThisTurn||!effects.knownLegend(l))return fail('每回合只能呼叫一次，且必須選擇蓋牌傳奇');
  const paid=actions.pay(state,'player',1,sources);if(!paid.ok)return paid;
  effects.reveal(paid.state,'player',id,paid.events);return progress(paid.state,paid.events);
 }
 function soloAction(state,who,id,sources){
  if(!effects.active(state)||state.finished||effects.pending(state)||state.turn!==who||state.phase!=='main')return fail('Go Solo 必須在自己的主要階段使用，且先處理能力');
  const l=state[who].legends.find(l=>l.id===id&&l.faceUp&&l.goSolo);
  if(!l||!effects.knownLegend(l))return fail('請先呼叫具有 Go Solo 的已驗證傳奇');
  if((l.gear||[]).some(g=>g.deferredEffect||g.unimplementedEffect))return fail('此傳奇裝有尚未支援的能力');
  const paid=actions.pay(state,who,l.cost,sources);if(!paid.ok)return paid;
  const p=paid.state[who],index=p.legends.findIndex(c=>c.id===id),[legend]=p.legends.splice(index,1);
  const entered={...legend,ready:true,lag:true,goSolo:true,faceUp:true,gear:legend.gear||[]};p.units.push(entered);effects.onPlay(paid.state,who,entered);
  return {ok:true,state:paid.state,events:[...paid.events,(who==='ai'?'對手 ':'')+'Go Solo：'+legend.name+' 以就緒單位登場，本回合可攻擊']};
 }
 function goSolo(state,id,sources){const r=soloAction(state,'player',id,sources);return r.ok?progress(r.state,r.events):r;}

 return {concede,fresh,rollForOrder,chooseOrder,openingHand,beginOpening,ready,draw,roll,sell,play,gear,program,prepareTrainingTarget,fight,steal,addTrainingBlocker,addTrainingQuick,reactAttack,opponentTurn,defend,callLegend,goSolo,resolveEffect,legendSpecs:effects.legendSpecs,shuffleLegends:effects.shuffled,pass,next};
});
