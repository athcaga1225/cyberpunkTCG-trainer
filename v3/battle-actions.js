/* V3 only: verified basic actions. Not full gameplay. Sources: https://cyberpunktcg.com/comprehensive-rules (3.12, 4.6-4.7, 5.7-5.8, 8.11, 11.8-11.9). */
(function(root,factory){'use strict';const api=factory(typeof module!=='undefined'&&module.exports?require('./heist-effects.js'):root.NCTV3Effects);if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.NCTV3Actions=api;})(typeof globalThis!=='undefined'?globalThis:this,function engine(E){
 "use strict";
 const clone=x=>JSON.parse(JSON.stringify(x));
 const fail=reason=>({ok:false,reason});
 const success=(state,events)=>({ok:true,state,events});
 function player(state,who){return state&&state[who]&&Array.isArray(state[who].hand)&&Array.isArray(state[who].eddies)&&Array.isArray(state[who].legends)&&Array.isArray(state[who].units)?state[who]:null}
 function sell(state,who,cardId){
  const p=player(state,who);if(!p)return fail("玩家資料不完整");
  if(state.turn!==who||state.phase!=="main")return fail("只能在自己的主要階段變賣");
  if(p.soldThisTurn)return fail("主要階段每回合只能執行一次變賣行動");
  const c=p.hand.find(x=>x.id===cardId);if(!c||!c.sellTag)return fail("手牌不存在或沒有變賣標記");
  const s=clone(state),q=s[who],i=q.hand.findIndex(x=>x.id===cardId);
  q.hand.splice(i,1);q.eddies.push({id:"eddie-"+cardId,ready:true,faceUp:false});q.soldThisTurn=true;
  return success(s,["變賣 "+c.name+"，獲得 1 個就緒 Eddie"]);
 }
 function pay(state,who,cost,sources){
  if(state?.finished)return fail("本局已結束");
  const p=player(state,who);if(!p)return fail("玩家資料不完整");
  if(!Number.isSafeInteger(cost)||cost<0)return fail("費用必須是非負整數");
  if(!Array.isArray(sources)||sources.length!==cost||sources.some(x=>!x||typeof x!=="object"||typeof x.id!=="string")||new Set(sources.map(x=>x.kind+":"+x.id)).size!==cost)return fail("請指定與費用相等且不重複的支付資源");
  for(const src of sources){
   if(!src||!["eddie","legend"].includes(src.kind))return fail("無效的支付資源");
   const pool=src.kind==="eddie"?p.eddies:p.legends;
   const item=pool.find(x=>x.id===src.id);
   if(!item||item.ready!==true)return fail("支付資源不存在或已使用");
   if(src.kind==="legend"&&item.faceUp===true&&!item.sellTag)return fail("已翻開且沒有變賣標記的傳奇卡不能支付");
   if(src.kind==="legend"&&(item.gear||[]).some(g=>g.deferredEffect||g.unimplementedEffect||(!E.active(state)&&g.spendEffect)))return fail("此傳奇裝有尚未支援的橫置觸發，不能略過結算");
  }
  const s=clone(state),q=s[who];for(const src of sources){const item=(src.kind==="eddie"?q.eddies:q.legends).find(x=>x.id===src.id);if(src.kind==="legend")E.spend(s,who,item);else item.ready=false;}
  return success(s,["支付 "+cost+" €$（Eddies／傳奇卡）"]);
 }
 function playUnit(state,who,cardId,sources,opts={}){
  const p=player(state,who);if(!p)return fail("玩家資料不完整");
  if(state.turn!==who||state.phase!=="main")return fail("只能在自己的主要階段打出一般單位");
  const c=p.hand.find(x=>x.id===cardId);
  if(!c||c.type!=="Unit")return fail("找不到可從手牌打出的單位卡");
  if(!Number.isSafeInteger(c.cost)||c.cost<0)return fail("單位費用資料無效");
  if(c.requiresTarget||c.playRestriction||c.unimplementedEffect)return fail("這張卡有尚未支援的額外出牌條件或能力，不能自動結算");
  let gigTarget=null,side=who,delta=0;
  if(c.onPlayGigAdjust){
   if(!opts||typeof opts!=="object"||!Number.isInteger(opts.delta??0)||Math.abs(opts.delta??0)>1)return fail("請選擇有效的委託骰調整值");
   delta=opts.delta??0;side=opts.side||who;
   if(delta!==0){
    if(![who,who==="player"?"ai":"player"].includes(side))return fail("委託骰控制者無效");
    const pool=state[side]?.gigs;
    gigTarget=Array.isArray(pool)?pool.find(g=>g.id===opts.gigId):null;
    if(!gigTarget||!Number.isInteger(gigTarget.value)||!Number.isInteger(gigTarget.sides)||gigTarget.value+delta<1||gigTarget.value+delta>gigTarget.sides)return fail("無效的委託骰目標或調整點數");
   }
  }
  // All optional/required Play targets are validated BEFORE spending any Eddies.
  let gearTarget=null;
  if(c.onPlayDefeatGear&&opts?.gearTargetId){
   const gearSide=opts.gearSide||who;
   if(![who,who==="player"?"ai":"player"].includes(gearSide))return fail("裝備控制者無效");
   const owner=state[gearSide];
   if(!owner)return fail("找不到裝備控制者");
   const carriers=[...(owner.units||[]),...(owner.legends||[])];
   const host=carriers.find(x=>Array.isArray(x.gear)&&x.gear.some(g=>g.id===opts.gearTargetId));
   if(!host)return fail("找不到場上指定的裝備卡");
   gearTarget={side:gearSide,hostId:host.id,gearId:opts.gearTargetId};
  }
  let rivalTarget=null;
  if(c.onPlaySpendRival){
   const rivalSide=who==="player"?"ai":"player";
   const candidates=(state[rivalSide]?.units||[]).filter(x=>x.ready===true);
   if(candidates.length){
    rivalTarget=candidates.find(x=>x.id===opts?.rivalUnitId);
    if(!rivalTarget)return fail("必須選擇一張可橫置的對手單位");
    if((rivalTarget.gear||[]).some(g=>g.deferredEffect||g.unimplementedEffect||(!E.active(state)&&g.spendEffect)))return fail("對手單位有尚未支援的橫置觸發，不能略過結算");
   }else if(opts?.rivalUnitId)return fail("沒有可橫置的對手單位");
  }
  const payment=pay(state,who,c.cost,sources);if(!payment.ok)return payment;
  const s=payment.state,q=s[who],i=q.hand.findIndex(x=>x.id===cardId);
  q.hand.splice(i,1);
  const entered={...c,ready:!c.onPlaySpendRival,lag:true,gear:[]};
  if(!c.onPlaySpendRival)entered.ready=true;
  q.units.push(entered);
  const events=[...payment.events,"打出 "+c.name+"（"+(entered.ready?"Ready":"Spent")+"，帶有 Lag）"];
  if(gigTarget){s[side].gigs.find(g=>g.id===opts.gigId).value+=delta;events.push("登場調整委託骰 "+(delta>0?"+":"")+delta);}
  if(c.onPlaySpendRival){
   if(rivalTarget){const rivalSide=who==="player"?"ai":"player";E.spend(s,rivalSide,s[rivalSide].units.find(u=>u.id===rivalTarget.id));events.push("橫置對手單位 "+rivalTarget.name);}
   else events.push("場上沒有可橫置的對手單位");
  }
  if(gearTarget){
   const owner=s[gearTarget.side],hosts=[...(owner.units||[]),...(owner.legends||[])];
   const carrier=hosts.find(h=>h.id===gearTarget.hostId);
   const index=carrier.gear.findIndex(g=>g.id===gearTarget.gearId);
   const [defeated]=carrier.gear.splice(index,1);
   if(!Array.isArray(owner.trash))owner.trash=[];
   owner.trash.push(defeated);
   events.push("擊敗裝備 "+defeated.name);
   if(q.gigs?.some(g=>g.value===defeated.cost)){
    E.draw(s,who,1,events);
   }
  }
  return success(s,events);
 }

 // Read-only derived stats: equipment modifies Power, and Blocker is inherited.
 function unitStats(unit){
  if(!unit||typeof unit!=="object")return {power:0,blocker:false};
  const gear=Array.isArray(unit.gear)?unit.gear:[];
  return {power:(Number.isFinite(unit.power)?unit.power:0)+(Number.isFinite(unit.tempPowerModifier)?unit.tempPowerModifier:0)+gear.reduce((n,g)=>n+(Number.isFinite(g.power)?g.power:0),0),
   blocker:unit.blocker===true||gear.some(g=>g.blocker===true),
   cannotBeBlockedIfLowerCred:unit.cannotBeBlockedIfLowerCred===true};
 }
 function playGear(state,who,cardId,sources,targetId){
  const p=player(state,who);if(!p)return fail("玩家資料不完整");
  if(state.turn!==who||state.phase!=="main")return fail("只能在自己的主要階段裝備");
  const card=p.hand.find(c=>c.id===cardId);
  if(!card||card.type!=="Gear")return fail("找不到裝備卡");
  if(card.unimplementedEffect||card.requiresTarget||card.playRestriction)return fail("這張裝備的能力尚未完成驗證");
  const unit=p.units.find(u=>u.id===targetId);
  const legend=p.legends.find(l=>l.id===targetId&&l.faceUp===true);
  if(!unit&&!legend)return fail("裝備必須附加在友方單位或已翻開的傳奇卡");
  const paid=pay(state,who,card.cost,sources);if(!paid.ok)return paid;
  const next=paid.state,q=next[who],gear=q.hand.find(c=>c.id===cardId);
  q.hand.splice(q.hand.indexOf(gear),1);
  const dest=q.units.find(u=>u.id===targetId)||q.legends.find(l=>l.id===targetId);
  if(!Array.isArray(dest.gear))dest.gear=[];
  dest.gear.push(gear);
  return success(next,[...paid.events,"裝備 "+card.name+" → "+dest.name]);
 }
 function playProgram(state,who,cardId,sources,opts={}){
  const p=player(state,who);if(!p)return fail("玩家資料不完整");
  if(state.turn!==who||state.phase!=="main")return fail("目前不是可打出程式卡的主要階段");
  const card=p.hand.find(c=>c.id===cardId);
  if(!card||card.type!=="Program")return fail("找不到程式卡");
  if(card.unimplementedEffect)return fail("此程式的效果尚未支援");
  if(card.name==='Reboot Optics'){
   // The effect is recorded for the NEXT rival Unit fight this turn.
   // No fight exists in the bounded practice yet, so no combat resolution is claimed.
   const paid=pay(state,who,card.cost,sources);if(!paid.ok)return paid;
   const next=paid.state,q=next[who];
   const index=q.hand.findIndex(x=>x.id===cardId);
   q.hand.splice(index,1);
   if(!Array.isArray(q.trash))q.trash=[];
   q.trash.push(card);
   q.pendingRebootOptics=(q.pendingRebootOptics||0)+1;
   return success(next,[...paid.events,'打出 Reboot Optics：本回合下次對手單位交戰時，保護對應友方單位']);
  }
  if(card.name==='Floor It'){
   // Quick is also playable in the controller's open Main Phase (rules 11.26.2).
   const rivalSide=who==='player'?'ai':'player';
   const rivals=state[rivalSide]?.units||[];
   const target=rivals.find(x=>x.id===opts?.rivalUnitId);
   if(rivals.length&&!target)return fail("請選擇一張對手單位作為 Floor It 目標");
   const paid=pay(state,who,card.cost,sources);if(!paid.ok)return paid;
   const next=paid.state,q=next[who];
   if(target){
    const unit=next[rivalSide].units.find(x=>x.id===target.id);
    unit.tempPowerModifier=(unit.tempPowerModifier||0)-1;
   }
   const index=q.hand.findIndex(x=>x.id===cardId);
   q.hand.splice(index,1);
   if(!Array.isArray(q.trash))q.trash=[];
   q.trash.push(card);
   const drawEvents=[];E.draw(next,who,1,drawEvents);
   return success(next,[...paid.events,...drawEvents,'執行 Floor It：'+(target?'對手 '+target.name+' 本回合戰力 -1':'無可選單位')+'；抽 1 張',...(next.finished?['牌庫已空，遊戲結束']:[])]);
  }
  if(card.name!=="Afterparty at Lizzie's")return fail("此程式的效果尚未支援");
  if(!opts||typeof opts!=="object")return fail("程式效果選項無效");
  const delta=opts.delta;
  if(!Number.isInteger(delta)||Math.abs(delta)>1)return fail("請選擇 -1、0 或 +1");
  // The target's controller is explicit; both players can have gigs named gig-1.
  const targetSide=opts.side||who;
  if(delta!==0&&![who,who==="player"?"ai":"player"].includes(targetSide))return fail("無效的委託骰控制者");
  const targetPool=state[targetSide]?.gigs;
  const gig=delta===0?null:(Array.isArray(targetPool)?targetPool.find(g=>g.id===opts.gigId):null);
  if(delta!==0&&(!gig||!Number.isInteger(gig.value)||!Number.isInteger(gig.sides)||gig.value+delta<1||gig.value+delta>gig.sides))return fail("委託骰目標或點數調整無效");
  const paid=pay(state,who,card.cost,sources);if(!paid.ok)return paid;
  const next=paid.state,q=next[who];
  if(delta!==0){const target=next[targetSide].gigs.find(g=>g.id===opts.gigId);target.value+=delta;}
  const distinct=new Set(q.gigs.map(g=>g.value));
  const index=q.hand.findIndex(c=>c.id===cardId);
  q.hand.splice(index,1);
  if(!Array.isArray(q.trash))q.trash=[];
  q.trash.push(card);
  const drawEvents=[];if(distinct.size>=2)E.draw(next,who,1,drawEvents);
  return success(next,[...paid.events,...drawEvents,"結算 "+card.name+"（委託骰 "+(delta>=0?"+":"")+delta+"）"+(distinct.size>=2?"，抽 1 張牌":""),"程式移至棄牌區"]);
 }
 function fightSpentUnit(state,who,attackerId,defenderId,opts={}){
  const p=player(state,who),rivalSide=who==='player'?'ai':'player',rival=player(state,rivalSide);
  if(!p||!rival)return fail('對戰資料不完整');
  if(state.finished||state.turn!==who||state.phase!=='main')return fail('只能在自己的主要階段攻擊');
  const attacker=p.units.find(u=>u.id===attackerId),defender=rival.units.find(u=>u.id===defenderId);
  if(!attacker||!defender)return fail('找不到攻擊或防守單位');
  if(attacker.ready!==true||attacker.lag===true)return fail('攻擊單位必須就緒，且沒有 Lag');
  if(defender.ready!==false)return fail('只能直接攻擊已使用的對手單位');
  if(!opts.reactionResolved&&rival.units.some(u=>u.ready===true&&unitStats(u).blocker))return fail('防守方尚未決定 Blocker 反應');
  // This bounded trainer deliberately rejects unresolved attack/defeat abilities.
  if(attacker.deferredEffect||defender.deferredEffect||attacker.attackEffect||attacker.defeatEffect||attacker.endReadyEddie||attacker.cannotBeBlockedIfLowerCred||defender.defeatEffect||(attacker.gear||[]).some(g=>g.attackEffect||g.spendEffect)||attacker.goSolo||defender.goSolo||attacker.unimplementedEffect||defender.unimplementedEffect)
   return fail('此單位涉及尚未驗證的攻擊或擊敗能力，暫不結算');
  if(p.pendingRebootOptics||rival.pendingRebootOptics)return fail('Quick 戰鬥保護尚未實作，不能跳過結算');
  const s=clone(state),a=s[who].units.find(u=>u.id===attackerId),d=s[rivalSide].units.find(u=>u.id===defenderId);
  const attackPower=unitStats(a).power,defendPower=unitStats(d).power;
  a.ready=false;
  if(!Array.isArray(s[who].trash))s[who].trash=[];
  if(!Array.isArray(s[rivalSide].trash))s[rivalSide].trash=[];
  const defeated=[];
  if(attackPower<=defendPower&&defendPower>0){s[who].units=s[who].units.filter(u=>u.id!==a.id);s[who].trash.push(a,...(a.gear||[]));defeated.push(a.name)}
  if(defendPower<=attackPower&&attackPower>0){s[rivalSide].units=s[rivalSide].units.filter(u=>u.id!==d.id);s[rivalSide].trash.push(d,...(d.gear||[]));defeated.push(d.name)}
  return success(s,['單位交戰：'+a.name+' '+attackPower+' PWR vs '+d.name+' '+defendPower+' PWR','擊敗：'+defeated.join('、')]);
 }
 function stealTrainingGigs(state,who,attackerId,gigIds,opts={}){
  const p=player(state,who),rivalSide=who==='player'?'ai':'player',rival=player(state,rivalSide);
  if(!p||!rival)return fail('對戰資料不完整');
  if(state.finished||state.phase!=='main'||state.turn!==who)return fail('只能在自己的主要階段攻擊');
  const attacker=p.units.find(u=>u.id===attackerId);
  if(!attacker||attacker.ready!==true||attacker.lag===true)return fail('攻擊單位必須就緒，且沒有 Lag');
  if(attacker.deferredEffect||attacker.attackEffect||attacker.defeatEffect||attacker.endReadyEddie||attacker.cannotBeBlockedIfLowerCred||(attacker.gear||[]).some(g=>g.attackEffect||g.spendEffect)||attacker.goSolo||attacker.unimplementedEffect||p.pendingRebootOptics||rival.pendingRebootOptics)
   return fail('攻擊或 Quick 相關效果尚未驗證，不可略過');
  if(!Array.isArray(rival.gigs)||!rival.gigs.length)return fail('對手委託區沒有委託骰');
  if(!opts.reactionResolved&&rival.units.some(u=>u.ready===true&&unitStats(u).blocker))return fail('防守方尚未決定 Blocker 反應');
  // No automatic bypass of Blocker/Quick in a real match. This action is limited to a
  // clearly labeled scripted practice target with no opponent reaction controller.
  if(!state.practiceKind||!rival.gigs.every(g=>g.trainingTarget))
   return fail('目前僅支援預設練習骰，正式對手反應尚未實作');
  const power=unitStats(attacker).power;
  const count=power<=0?0:Math.min(rival.gigs.length,Math.floor(power/10)+1);
  if(!Array.isArray(gigIds)||gigIds.length!==count||new Set(gigIds).size!==count)
   return fail('請指定正確數量且不重複的委託骰');
  if(gigIds.some(id=>!rival.gigs.some(g=>g.id===id)))return fail('委託骰目標不存在');
  const next=clone(state),a=next[who].units.find(u=>u.id===attackerId);
  a.ready=false;
  const selected=next[rivalSide].gigs.filter(g=>gigIds.includes(g.id));
  next[rivalSide].gigs=next[rivalSide].gigs.filter(g=>!gigIds.includes(g.id));
  next[who].gigs.push(...selected.map(g=>({...g,trainingTarget:false})));
  return success(next,['攻擊對手委託區：'+attacker.name+'（'+power+' PWR）','搶得 '+selected.length+' 顆委託骰']);
 }
 function resolveTrainingReaction(state,who,attackerId,attack,reaction){
  const p=player(state,who),opposite=who==='player'?'ai':'player',rival=player(state,opposite);
  if(!p||!rival||state.practiceKind!=='the-heist')return fail('僅適用 The Heist 腳本練習');
  if(state.finished||state.phase!=='main'||state.turn!==who)return fail('只能在主要階段宣告攻擊');
  const attacker=p.units.find(u=>u.id===attackerId);
  if(!attacker||!attacker.ready||attacker.lag)return fail('攻擊者必須就緒且沒有 Lag');
  if(attacker.deferredEffect||attacker.attackEffect||attacker.defeatEffect||attacker.endReadyEddie||attacker.cannotBeBlockedIfLowerCred||(attacker.gear||[]).some(g=>g.attackEffect||g.spendEffect)||attacker.goSolo||attacker.unimplementedEffect||p.pendingRebootOptics||rival.pendingRebootOptics)
   return fail('尚未支援的攻擊、Quick 或觸發效果不可跳過');
  if(!attack||!['gig','unit'].includes(attack.kind))return fail('必須指定攻擊目標');
  if(attack.kind==='gig'&&(!rival.gigs?.length||!rival.gigs.every(g=>g.trainingTarget)))
   return fail('只支援公開的練習委託骰');
  if(attack.kind==='unit'&&!rival.units.some(u=>u.id===attack.defenderId&&u.ready===false))
   return fail('只能宣告攻擊已使用的對手單位');
  const blockers=rival.units.filter(u=>u.ready===true&&unitStats(u).blocker);
  if(blockers.some(u=>(u.gear||[]).some(g=>g.spendEffect)))return fail('橫置裝備能力請使用鏡像實戰模式');
  if(blockers.length&&(!reaction||!['pass','block'].includes(reaction.kind)))
   return fail('防守方必須先決定是否使用 Blocker');
  if(reaction&&reaction.kind!=='pass'&&reaction.kind!=='block')return fail('反應選擇無效');
  const quickAvailable=rival.quickExercise?.enabled&&rival.hand.some(c=>c.id==='training-quick-floor-it');
  if(quickAvailable&&(!reaction||typeof reaction.quick!=='boolean'))
   return fail('防守方必須先決定是否使用 Floor It');
  const staged=clone(state),events=[];
  if(reaction?.quick){
   if(!quickAvailable)return fail('對手沒有可用的 Floor It');
   const quick=staged[opposite].hand.find(c=>c.id==='training-quick-floor-it');
   const sources=staged[opposite].eddies.filter(e=>e.ready===true).slice(0,quick.cost).map(e=>({kind:'eddie',id:e.id}));
   const payment=pay(staged,opposite,quick.cost,sources);
   if(!payment.ok)return fail('對手 Floor It 資源不足：'+payment.reason);
   const q=payment.state[opposite];
   q.hand.splice(q.hand.findIndex(c=>c.id===quick.id),1);
   if(!Array.isArray(q.trash))q.trash=[];
   q.trash.push(quick);
   const target=payment.state[who].units.find(u=>u.id===attackerId);
   target.tempPowerModifier=(target.tempPowerModifier||0)-1;
   if(!q.deck.length)return fail('腳本對手抽牌牌庫已空，無法完成 Quick');
   q.hand.push(q.deck.pop());
   Object.assign(staged,payment.state);
   events.push('防守方 Quick：支付 1 €$，打出 Floor It；攻擊者戰力 -1，對手抽 1 張');
  }
  if(reaction?.kind==='block'){
   const blocker=staged[opposite].units.find(u=>u.id===reaction.blockerId&&u.ready===true&&unitStats(u).blocker);
   if(!blocker)return fail('Blocker 必須是就緒的防守方單位');
   if(blocker.deferredEffect||blocker.unimplementedEffect)return fail('Blocker 特殊效果尚未驗證');
   blocker.ready=false;
   const result=fightSpentUnit(staged,who,attackerId,blocker.id,{reactionResolved:true});
   if(!result.ok)return result;
   return success(result.state,[...events,'防守方使用 Blocker：'+blocker.name+'，轉移攻擊目標',...result.events]);
  }
  if(attack.kind==='unit'){
   const result=fightSpentUnit(staged,who,attackerId,attack.defenderId,{reactionResolved:true});
   return result.ok?success(result.state,[...events,...result.events]):result;
  }
  const result=stealTrainingGigs(staged,who,attackerId,attack.gigIds,{reactionResolved:true});
  return result.ok?success(result.state,[...events,...result.events]):result;
 }
 return {sell,pay,playUnit,playGear,playProgram,unitStats,fightSpentUnit,stealTrainingGigs,resolveTrainingReaction};
});
