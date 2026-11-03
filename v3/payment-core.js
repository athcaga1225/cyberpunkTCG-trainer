/* V3-only rule foundation: paying costs with ready Eddies and/or Legends.
   Official reference: https://cyberpunktcg.com/comprehensive-rules (11.8)
   This module does not yet implement playing cards or Quick windows. */
(function(root,factory){'use strict';
 const api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.NCTV3Payment=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
 const fail=reason=>({ok:false,reason});
 const validIds=ids=>Array.isArray(ids)&&ids.every(id=>typeof id==='string'&&id.length>0)&&new Set(ids).size===ids.length;
 function pay(state,who,cost,selection){
  if(!state||!['player','ai'].includes(who))return fail('玩家資料不完整');
  if(!Number.isInteger(cost)||cost<0)return fail('費用必須是非負整數');
  if(!selection||!validIds(selection.eddieIds)||!validIds(selection.legendIds))return fail('請明確選擇不重複的支付卡牌');
  const owner=state[who];
  if(!owner||!Array.isArray(owner.eddies)||!Array.isArray(owner.legends))return fail('支付區域資料不完整');
  const selectedEddies=selection.eddieIds.map(id=>owner.eddies.find(card=>card.id===id));
  const selectedLegends=selection.legendIds.map(id=>owner.legends.find(card=>card.id===id));
  if([...selectedEddies,...selectedLegends].some(card=>!card))return fail('選擇的支付卡牌不在對應區域');
  if([...selectedEddies,...selectedLegends].some(card=>card.ready===false))return fail('已使用的卡牌不能再次支付');
  if(selectedEddies.length+selectedLegends.length!==cost)return fail('所選 Eddies 與傳奇卡數量必須等於支付費用');
  const next=JSON.parse(JSON.stringify(state));
  const eddies=new Set(selection.eddieIds),legends=new Set(selection.legendIds);
  next[who].eddies.forEach(card=>{if(eddies.has(card.id))card.ready=false});
  next[who].legends.forEach(card=>{if(legends.has(card.id))card.ready=false});
  return {ok:true,state:next,events:['支付 '+cost+' €$（Eddies '+eddies.size+'、傳奇卡 '+legends.size+'）']};
 }
 return {pay};
});
