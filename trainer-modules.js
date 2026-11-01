/* Interactive teaching exercises powered by a verified subset of official rules.
   Scenarios intentionally bypass full payment/quick-reaction systems. */
(()=>{'use strict';const $=id=>document.getElementById(id),R=window.NCTRules;
const unit=(id,name,power,ready=true,extras={})=>({id,name,power,ready,lag:false,gear:[],...extras});
const dice=(id,sides,value)=>({id,sides,value});
const state=(p={},a={})=>({player:{units:[],gigs:[],fixer:[],deck:[],hand:[],...p},ai:{units:[],gigs:[],fixer:[],deck:[],hand:[],...a}});
const stages=[
 {title:'01 / FIXER 與骰子',instruction:'每回合開始要從 Fixer 區 Roll in 一顆 Gig。d20 不可以先拿。試著選一顆合法的骰子。',setup:()=>state({fixer:[4,6,20]}),
  options:s=>s.player.fixer.map(side=>({label:'選擇 d'+side,run:()=>R.rollIn(s,'player',side,Math.min(side,3)),done:side=>side!==20}))},
 {title:'02 / 哪些單位可以被攻擊？',instruction:'Ruthless Lowlife 只能攻擊敵方單位，而且一般只能主動攻擊已消耗（Spent）的敵方單位。找出合法目標。',setup:()=>state({units:[unit('r','Ruthless Lowlife',4)]},{units:[unit('ready','Field Operator',2),unit('spent','Field Operator',2,false)],gigs:[dice('g',4,3)]}),
  options:s=>[{label:'攻擊敵方 Ready 單位',run:()=>R.attack(s,'player','r',{kind:'unit',id:'ready'}),done:()=>false},{label:'攻擊敵方 Spent 單位',run:()=>R.attack(s,'player','r',{kind:'unit',id:'spent'}),done:()=>true},{label:'攻擊敵方 Gig 區',run:()=>R.attack(s,'player','r',{kind:'gig'}),done:()=>false}]},
 {title:'03 / 搶奪 Gig',instruction:'Field Operator 有 2 Power；攻擊有 Gig 的敵方區域可以搶一顆骰子。你可以選擇搶哪顆。',setup:()=>state({units:[unit('f','Field Operator',2)]},{gigs:[dice('g1',4,1),dice('g2',6,6)]}),
  options:s=>s.ai.gigs.map(d=>({label:'搶奪 d'+d.sides+'（'+d.value+' 點）',run:()=>R.attack(s,'player','f',{kind:'gig'},{dieIds:[d.id]}),done:()=>true}))},
 {title:'04 / 裝備提高 Power',instruction:'Minotaur 的 Power 為 9；裝上 Mantis Blades（+2 Power）變成 11，單次攻擊可搶兩顆 Gig。',setup:()=>state({units:[unit('m','Minotaur',9,true,{gear:[{name:'Mantis Blades',power:2}]})]},{gigs:[dice('g1',4,1),dice('g2',6,2),dice('g3',8,3)]}),
  options:s=>[{label:'搶奪 d4 與 d6',run:()=>R.attack(s,'player','m',{kind:'gig'},{dieIds:['g1','g2']}),done:()=>true},{label:'只搶 d8',run:()=>R.attack(s,'player','m',{kind:'gig'},{dieIds:['g3']}),done:()=>false}]},
 {title:'05 / BLOCKER 攔截',instruction:'敵方有一張 Ready 的 Secondhand Bombus（Blocker）。如果對手選擇用它攔截，就改為 Fight，這次不會搶到 Gig。',setup:()=>state({units:[unit('f','Field Operator',2)]},{units:[unit('b','Secondhand Bombus',0,true,{blocker:true})],gigs:[dice('g1',4,4)]}),
  options:s=>[{label:'對手選擇 Blocker 攔截',run:()=>R.attack(s,'player','f',{kind:'gig'},{blockWithId:'b'}),done:r=>r.ok&&r.state.player.gigs.length===0},{label:'對手選擇不攔截',run:()=>R.attack(s,'player','f',{kind:'gig'}),done:()=>false}]},
 {title:'06 / 真正的勝利條件',instruction:'普通回合不是搶到第 7 顆就立即獲勝，而是在自己回合開始時檢查是否已控制至少 7 顆 Gig（加時賽除外）。',setup:()=>state({gigs:[1,2,3,4,5,6,7].map(n=>dice('g'+n,20,n))}),
  options:s=>[{label:'進入下一個自己的回合，檢查 Gig',run:()=>({ok:R.startWin(s,'player'),state:s,events:['回合開始時有 7 顆 Gig：符合勝利條件']}),done:()=>true},{label:'宣告剛搶到第七顆就立刻獲勝',run:()=>({ok:false,reason:'一般回合必須等到你的下一個回合開始才檢查；只有 Overtime 才即時獲勝'}),done:()=>false}]},
 {title:'07 / 真實卡牌的登場能力',instruction:'Field Operator 登場時，如果你的 Street Cred 是偶數，就抽 1 張牌。現在你的 Gig 點數是 2 + 4 = 6。',setup:()=>state({gigs:[dice('g1',4,2),dice('g2',6,4)],hand:[],deck:[{name:'測試抽到的卡'}]}),
  options:s=>[{label:'觸發 Field Operator 的 Play 能力',run:()=>R.playTrigger(s,'player',{name:'Field Operator'}),done:r=>r.ok&&r.state.player.hand.length===1},{label:'偶數 Street Cred 不能抽牌',run:()=>({ok:false,reason:'官方卡牌效果指定偶數時抽牌，6 是偶數'}),done:()=>false}]}
];
const saved='nct-rule-lab-v2';let completed=0;try{completed=Math.max(0,Math.min(stages.length,Number(localStorage.getItem(saved))||0))}catch{}
let stage=Math.min(completed,stages.length-1),game=null,notice='';let passed=false;
const add=(parent,tag,text,cls)=>{const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;parent.append(e);return e};
function load(i){stage=i;game=stages[i].setup();notice='';passed=false;render()}
function render(){const st=stages[stage],container=$('labStage');if(!container)return;container.replaceChildren();const top=add(container,'div','LAB '+(stage+1)+' / '+stages.length,'number');const track=add(container,'div','','progress');const filled=add(track,'span','');filled.style.width=(((Math.max(completed,stage)+1)/stages.length)*100)+'%';add(container,'h2',st.title);add(container,'p',st.instruction);
 const scoreboard=add(container,'div','','arena');
 const panel=(label,who)=>{const div=add(scoreboard,'div','','zone');add(div,'div',label,'number');const p=game[who];add(div,'p','GIG '+p.gigs.length+' 顆 · Street Cred '+(R.cred(p.gigs)??'Null'));add(div,'p','單位：'+(p.units.length?p.units.map(u=>u.name+'（'+R.power(u)+' Power / '+(u.ready?'Ready':'Spent')+(u.lag?', Lag':'')+'）').join('、'):'無'));if(p.gigs.length)add(div,'p',p.gigs.map(d=>'d'+d.sides+'：'+d.value).join(' · '));if(p.fixer.length)add(div,'p','FIXER：'+p.fixer.map(x=>'d'+x).join(' · '));};panel('PLAYER / 你的區域','player');panel('RIVAL / 對手區域','ai');
 add(container,'div','選擇操作','number');const actions=add(container,'div','','actions');if(!passed){for(const o of st.options(game)){const b=add(actions,'button',o.label,'btn');b.addEventListener('click',()=>{const result=o.run();if(!result.ok){notice=result.reason;render();return}game=result.state;notice=result.events.join('；');if(o.done(result)){passed=true;completed=Math.max(completed,stage+1);try{localStorage.setItem(saved,String(completed))}catch{}}render()})}}else{add(actions,'strong','✓ 已通過這一關');if(stage<stages.length-1){const b=add(actions,'button','下一關 →','btn primary');b.addEventListener('click',()=>load(stage+1))}else add(actions,'strong','全部 7 關完成！')}
 const feedback=add(container,'div',notice||'請選擇一個操作。','notice');feedback.setAttribute('role','status');const nav=add(container,'div','','actions');if(stage>0){const prev=add(nav,'button','← 前一關','btn');prev.onclick=()=>load(stage-1)}const retry=add(nav,'button','重試本關','btn');retry.onclick=()=>load(stage);if(completed>=stages.length){const reset=add(nav,'button','重新開始整套練習','btn');reset.onclick=()=>{completed=0;try{localStorage.setItem(saved,'0')}catch{}load(0)}}add(container,'p','這是官方規則子集的互動練習，不是完整對局；未涵蓋完整支付、Quick 反應與所有卡牌效果。','muted');}
function cards(){const root=$('verifiedCardList');if(!root)return;root.replaceChildren();for(const card of window.NCT_OFFICIAL_CARDS){const div=add(root,'div','','panel');const title=add(div,'h3',card.name);title.style.color='#29ffff';add(div,'p',card.type+' · COST '+card.cost+' · PWR '+card.power+' · RAM '+card.ram);add(div,'p',card.summary);add(div,'small',card.implemented.length?'部分能力已建立測試':'尚未實作能力');const link=add(div,'a','查閱官方英文卡牌 ↗');link.href=card.source;link.target='_blank';link.rel='noopener noreferrer';}}
function decks(){const sel=$('deckSelect');if(!sel)return;const keys=Object.keys(window.NCT_STARTER_DECKS);for(const key of keys){const opt=document.createElement('option');opt.value=key;opt.textContent=window.NCT_STARTER_DECKS[key].name;sel.append(opt)}
 const key=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[‘’]/g,"'").replace(/[^a-z0-9]+/g,' ').trim();
 const cards=()=>{try{return JSON.parse(localStorage.getItem('nct-imported-cards-v1')||'[]')}catch{return []}};
 function update(){const d=window.NCT_STARTER_DECKS[sel.value];const list=$('deckRows');list.replaceChildren();const imported=cards();const lookup=new Map();for(const c of imported){const k=key(c.name);lookup.set(k,(lookup.get(k)||0)+1)}
 const combined=[...d.legends.map(c=>({...c,kind:'LEGEND'})),...d.main.map(c=>({...c,kind:'MAIN'}))];
 const total=d.main.reduce((a,c)=>a+c.qty,0),matches=combined.filter(c=>lookup.get(key(c.name))===1).length;
 $('deckSummary').textContent='3 Legend / '+total+' 張主牌組 · '+combined.length+' 種卡牌 · 本機匯入資料精確匹配 '+matches+'/'+combined.length+' 種 · 真正卡牌效果尚未全部實作';
 for(const c of combined){const div=add(list,'div','','panel');add(div,'div',c.kind+' / '+c.qty+' ×','number');add(div,'strong',c.name);add(div,'p',lookup.get(key(c.name))===1?'本機資料：已匹配':lookup.get(key(c.name))>1?'本機資料：同名多筆':'本機資料：未匹配');const known=window.NCT_OFFICIAL_CARDS.find(x=>key(x.name)===key(c.name));if(known){add(div,'small',known.summary);const a=add(div,'a','官方卡牌 ↗');a.href=known.source;a.target='_blank';a.rel='noopener noreferrer';}}}
 sel.addEventListener('change',update);$('auditDeck')?.addEventListener('click',update);update();}
cards();decks();load(stage);
})();