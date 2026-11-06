/* Visualizes committed roll values. Animation never generates game randomness. */
(()=>{'use strict';
 const tray=document.createElement('section');
 tray.id='v3DiceAnimation';tray.hidden=true;tray.setAttribute('aria-label','擲骰結果');
 const status=document.createElement('p');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const dice=document.createElement('div');dice.className='v3-dice-row';dice.setAttribute('aria-hidden','true');
 tray.append(dice,status);document.body.append(tray);
 let dismiss=null;
 function cancel(){
  clearTimeout(dismiss);dismiss=null;tray.hidden=true;
 }
 function show(rolls){
  cancel();
  if(!rolls.length)return;
  dice.replaceChildren();
  rolls.forEach(roll=>{
   const item=document.createElement('div');item.className='v3-die-item';
   const label=document.createElement('span');label.textContent=roll.label+' · d'+roll.sides;
   const die=document.createElement('div');die.className='v3-die v3-die-d'+roll.sides;
   die.dataset.sides=String(roll.sides);die.dataset.result=String(roll.value);
   const face=document.createElement('b');face.textContent=String(roll.value);die.append(face);item.append(die,label);dice.append(item);
  });
  // Keep the dice still: show the committed result without spins, hops or flashing numbers.
  tray.hidden=false;tray.dataset.phase='result';
  status.textContent=rolls.map(r=>r.label+' d'+r.sides+'：'+r.value).join(' ／ ');
  dismiss=setTimeout(cancel,1400);
 }
 function transition(before,after){
  const rolls=[];
  for(const [side,label] of [['player','我方'],['ai','對手']]){
   const previous=new Set((before[side]?.gigs||[]).map(g=>g.id));
   for(const g of after[side]?.gigs||[])if(!previous.has(g.id)&&!(before[side==='player'?'ai':'player']?.gigs||[]).some(old=>old.id===g.id))rolls.push({label,sides:g.sides,value:g.value});
  }
  if(rolls.length)show(rolls);
 }
 window.NCTV3Dice={show,transition,cancel,get rolling(){return false}};
})();
