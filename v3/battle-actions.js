/* V3 only: verified basic actions. Not full gameplay. Sources: https://cyberpunktcg.com/comprehensive-rules (3.12, 4.6-4.7, 5.7-5.8, 8.11, 11.8-11.9). */
(function(root,factory){'use strict';const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.NCTV3Actions=api;})(typeof globalThis!=='undefined'?globalThis:this,function engine(){
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
  const p=player(state,who);if(!p)return fail("玩家資料不完整");
  if(!Number.isSafeInteger(cost)||cost<0)return fail("費用必須是非負整數");
  if(!Array.isArray(sources)||sources.length!==cost||sources.some(x=>!x||typeof x!=="object"||typeof x.id!=="string")||new Set(sources.map(x=>x.kind+":"+x.id)).size!==cost)return fail("請指定與費用相等且不重複的支付資源");
  for(const src of sources){
   if(!src||!["eddie","legend"].includes(src.kind))return fail("無效的支付資源");
   const pool=src.kind==="eddie"?p.eddies:p.legends;
   const item=pool.find(x=>x.id===src.id);
   if(!item||item.ready!==true)return fail("支付資源不存在或已使用");
   if(src.kind==="legend"&&item.faceUp===true&&!item.sellTag)return fail("已翻開且沒有變賣標記的傳奇卡不能支付");
  }
  const s=clone(state),q=s[who];for(const src of sources)(src.kind==="eddie"?q.eddies:q.legends).find(x=>x.id===src.id).ready=false;
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
   if(rivalTarget){const rivalSide=who==="player"?"ai":"player";s[rivalSide].units.find(u=>u.id===rivalTarget.id).ready=false;events.push("橫置對手單位 "+rivalTarget.name);}
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
    if(!q.deck.length){s.finished=true;s.loser=who;events.push("抽牌失敗，遊戲結束");}
    else{q.hand.push(q.deck.pop());events.push("符合委託骰點數：抽 1 張");}
   }
  }
  return success(s,events);
 }

 // Read-only derived stats: equipment modifies Power, and Blocker is inherited.
 function unitStats(unit){
  if(!unit||typeof unit!=="object")return {power:0,blocker:false};
  const gear=Array.isArray(unit.gear)?unit.gear:[];
  return {power:(Number.isFinite(unit.power)?unit.power:0)+gear.reduce((n,g)=>n+(Number.isFinite(g.power)?g.power:0),0),
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
  if(card.name!=="Afterparty at Lizzie's"||card.unimplementedEffect)return fail("此程式的效果尚未支援");
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
  if(distinct.size>=2){
   if(!q.deck.length){next.finished=true;next.loser=who}
   else q.hand.push(q.deck.pop());
  }
  const index=q.hand.findIndex(c=>c.id===cardId);
  q.hand.splice(index,1);
  if(!Array.isArray(q.trash))q.trash=[];
  q.trash.push(card);
  return success(next,[...paid.events,"結算 "+card.name+"（委託骰 "+(delta>=0?"+":"")+delta+"）"+(distinct.size>=2?"，抽 1 張牌":""),"程式移至棄牌區"]);
 }
 return {sell,pay,playUnit,playGear,playProgram,unitStats};
});
