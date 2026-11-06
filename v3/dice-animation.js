/* Visualizes committed roll values. Animation never generates game randomness. */
(()=>{'use strict';
 const tray=document.createElement('section');
 tray.id='v3DiceAnimation';tray.hidden=true;tray.setAttribute('aria-label','擲骰結果');
 const status=document.createElement('p');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const dice=document.createElement('div');dice.className='v3-dice-row';dice.setAttribute('aria-hidden','true');
 tray.append(dice,status);document.body.append(tray);
 let tick=null,settle=null,dismiss=null,rolling=false;
 function cancel(){
  clearInterval(tick);clearTimeout(settle);clearTimeout(dismiss);
  tick=settle=dismiss=null;rolling=false;tray.hidden=true;tray.classList.remove('is-rolling');
 }
 function show(rolls){
  cancel();
  if(!rolls.length)return;
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  dice.replaceChildren();
  const faces=rolls.map(roll=>{
   const item=document.createElement('div');item.className='v3-die-item';
   const label=document.createElement('span');label.textContent=roll.label+' · d'+roll.sides;
   const die=document.createElement('div');die.className='v3-die v3-die-d'+roll.sides;
   die.dataset.sides=String(roll.sides);die.dataset.result=String(roll.value);
   const face=document.createElement('b');face.textContent=String(roll.value);die.append(face);item.append(die,label);dice.append(item);
   return face;
  });
  const finish=()=>{
   clearInterval(tick);tick=null;rolling=false;tray.classList.remove('is-rolling');
   faces.forEach((face,i)=>face.textContent=String(rolls[i].value));
   tray.dataset.phase='result';
   status.textContent=rolls.map(r=>r.label+' d'+r.sides+'：'+r.value).join(' ／ ');
   dismiss=setTimeout(cancel,1300);
  };
  tray.hidden=false;tray.dataset.phase=reduced?'result':'rolling';
  if(reduced){finish();return;}
  rolling=true;tray.classList.add('is-rolling');status.textContent='擲骰中…';
  let frame=0;
  tick=setInterval(()=>{frame++;faces.forEach((face,i)=>face.textContent=String((frame*7+i*3)%rolls[i].sides+1));},65);
  settle=setTimeout(finish,850);
 }
 function transition(before,after){
  const rolls=[];
  for(const [side,label] of [['player','我方'],['ai','對手']]){
   const previous=new Set((before[side]?.gigs||[]).map(g=>g.id));
   for(const g of after[side]?.gigs||[])if(!previous.has(g.id)&&!(before[side==='player'?'ai':'player']?.gigs||[]).some(old=>old.id===g.id))rolls.push({label,sides:g.sides,value:g.value});
  }
  if(rolls.length)show(rolls);
 }
 window.NCTV3Dice={show,transition,cancel,get rolling(){return rolling}};
})();
