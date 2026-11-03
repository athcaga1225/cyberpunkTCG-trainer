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
  if(!Array.isArray(sources)||sources.length!==cost||new Set(sources.map(x=>x.kind+":"+x.id)).size!==cost)return fail("請指定與費用相等且不重複的支付資源");
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
 function playUnit(state,who,cardId,sources){
  const p=player(state,who);if(!p)return fail("玩家資料不完整");
  if(state.turn!==who||state.phase!=="main")return fail("只能在自己的主要階段打出一般單位");
  const c=p.hand.find(x=>x.id===cardId);
  if(!c||c.type!=="Unit")return fail("找不到可從手牌打出的單位卡");
  if(!Number.isSafeInteger(c.cost)||c.cost<0)return fail("單位費用資料無效");
  if(c.requiresTarget||c.playRestriction||c.unimplementedEffect)return fail("這張卡有尚未支援的額外出牌條件或能力，不能自動結算");
  const payment=pay(state,who,c.cost,sources);if(!payment.ok)return payment;
  const s=payment.state,q=s[who],i=q.hand.findIndex(x=>x.id===cardId);
  q.hand.splice(i,1);
  q.units.push({...c,ready:true,lag:true,gear:[]});
  return success(s,[...payment.events,"打出 "+c.name+"（Ready，帶有 Lag）"]);
 }
 return {sell,pay,playUnit};
});
