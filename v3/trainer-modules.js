/* Interactive teaching exercises powered by a verified subset of official rules.
   Scenarios intentionally bypass full payment/quick-reaction systems. */
(()=>{'use strict';const $=id=>document.getElementById(id),R=window.NCTRules,L=window.NCTLocale;
const unit=(id,name,power,ready=true,extras={})=>({id,name,power,ready,lag:false,gear:[],...extras});
const dice=(id,sides,value)=>({id,sides,value});
const state=(p={},a={})=>({player:{units:[],gigs:[],fixer:[],deck:[],hand:[],...p},ai:{units:[],gigs:[],fixer:[],deck:[],hand:[],...a}});
const basics=[
 {title:'01 / 事前準備與開局',staticQuiz:true,instruction:'一般構築賽開始前，每位玩家要自己準備哪些卡牌和骰子？開局的先後手、傳奇卡與起始手牌又如何處理？',setup:()=>state(),
  options:()=>[
   {label:'3 張不同名傳奇卡＋40～50 張主牌組＋6 顆不同面數的委託骰；先決定先後手，再洗牌、蓋放傳奇與抽 6 張',run:()=>({ok:true,state:state(),events:['事前準備正確：40～50 張主牌組不包含傳奇卡；主牌組還須符合最多三張同名同副標題及 RAM 限制。先手最左兩張傳奇卡開局為已使用，第一回合不能重置。']}),done:()=>true},
   {label:'只要帶 40 張手牌；開局再從中挑 3 張傳奇卡',run:()=>({ok:false,reason:'手牌不是整副牌組：每人另備 3 張傳奇卡與 40～50 張主牌組，開局才從主牌組抽取 6 張手牌。'}),done:()=>false}
  ]},
 {title:'02 / 回合流程',staticQuiz:true,instruction:'你的新回合開始了，以下操作順序何者正確？',setup:()=>state(),
  options:()=>[
   {label:'重置已使用的卡 → 抽 1 張 → 從合事佬區擲出 1 顆委託骰 → 主要階段',run:()=>({ok:true,state:state(),events:['準備階段順序正確。一般勝利條件在回合開始時檢查，不必等到擲骰。']}),done:()=>true},
   {label:'先賣一張牌 → 擲骰 → 重置卡牌 → 抽牌',run:()=>({ok:false,reason:'變賣是主要階段的行動；準備階段先重置、再抽牌、再取得委託骰。'}),done:()=>false}
  ]},
 {title:'03 / 變賣與支付',staticQuiz:true,instruction:'你想支付 2 €$ 打出一張卡牌。哪種敘述正確？',setup:()=>state(),
  options:()=>[
   {label:'橫置 2 個可用的歐元；也可用傳奇卡支付，每張算 1 €$',run:()=>({ok:true,state:state(),events:['支付正確。傳奇卡不論正面或背面，在傳奇區都可作為 1 €$ 支付，但傳奇卡本身不會因此變成歐元。']}),done:()=>true},
   {label:'任何一張手牌都能直接當作 2 €$ 支付',run:()=>({ok:false,reason:'主要階段每回合通常只能變賣 1 張有變賣標籤的手牌，每張賣出後成為 1 個歐元。'}),done:()=>false}
  ]},
 {title:'04 / 呼叫傳奇與 CALL',staticQuiz:true,instruction:'你支付 1 €$「呼叫傳奇」。接下來實際上會發生什麼事？',setup:()=>state(),
  options:()=>[
   {label:'翻開一張隨機蓋放的傳奇卡；若有 CALL 能力則處理該效果',run:()=>({ok:true,state:state(),events:['CALL 指透過呼叫傳奇而翻開這張卡時的觸發效果。呼叫傳奇每回合限一次，也可以在對手攻擊的反應時機進行。']}),done:()=>true},
   {label:'把傳奇卡從手牌召喚到戰場，立刻發動攻擊',run:()=>({ok:false,reason:'呼叫傳奇是翻開傳奇區內的蓋牌，不是從手牌召喚單位。獨武俠（GO SOLO）是不同的機制。'}),done:()=>false}
  ]}
];
const stages=[
 ...basics,
 {title:'05 / 從合事佬區擲骰',instruction:'回合開始抽牌後，從「合事佬區（Fixer Area）」挑一顆骰子擲出，放進自己的委託區。二十面骰（d20）必須最後才擲。你現在可以選哪一顆？',setup:()=>state({fixer:[4,6,20]}),
  options:s=>s.player.fixer.map(side=>({label:'擲出 '+L.dieLabel(side),run:()=>R.rollIn(s,'player',side,Math.min(side,3)),done:r=>r.ok}))},
 {title:'06 / 哪些角色可以被攻擊？',instruction:'狠毒混混（Ruthless Lowlife）只能攻擊對手的角色，不能攻擊委託區搶骰子。而一般角色只能主動攻擊對手「已使用（Spent）」的角色。請選出合法目標。',setup:()=>state({units:[unit('r','Ruthless Lowlife',4)]},{units:[unit('ready','Field Operator',2),unit('spent','Field Operator',2,false)],gigs:[dice('g',4,3)]}),
  options:s=>[{label:'攻擊對手就緒的角色（不合法）',run:()=>R.attack(s,'player','r',{kind:'unit',id:'ready'}),done:()=>false},{label:'攻擊對手已使用的角色',run:()=>R.attack(s,'player','r',{kind:'unit',id:'spent'}),done:()=>true},{label:'攻擊對手委託區（這張卡不允許）',run:()=>R.attack(s,'player','r',{kind:'gig'}),done:()=>false}]},
 {title:'07 / 搶走委託骰',instruction:'外勤幹員（Field Operator）有 2 點戰力（Power）。攻擊對手的委託區，就可以從中搶走 1 顆委託骰。選擇你要搶哪顆。',setup:()=>state({units:[unit('f','Field Operator',2)]},{gigs:[dice('g1',4,1),dice('g2',6,6)]}),
  options:s=>s.ai.gigs.map(d=>({label:'搶走 '+L.dieLabel(d.sides)+'（'+d.value+' 點）',run:()=>R.attack(s,'player','f',{kind:'gig'},{dieIds:[d.id]}),done:()=>true}))},
 {title:'08 / 裝備提高戰力',instruction:'牛頭怪（Minotaur）原本有 9 點戰力；裝上螳螂刀（Mantis Blades）增加 2 點，變成 11 點戰力。戰力達 10，可在一次攻擊中搶走兩顆委託骰。',setup:()=>state({units:[unit('m','Minotaur',9,true,{gear:[{name:'Mantis Blades',power:2}]})]},{gigs:[dice('g1',4,1),dice('g2',6,2),dice('g3',8,3)]}),
  options:s=>[{label:'搶走四面骰（d4）與六面骰（d6）',run:()=>R.attack(s,'player','m',{kind:'gig'},{dieIds:['g1','g2']}),done:()=>true},{label:'只搶八面骰（d8）',run:()=>R.attack(s,'player','m',{kind:'gig'},{dieIds:['g3']}),done:()=>false}]},
 {title:'09 / 攔截對手的攻擊',instruction:'對手有一張就緒（直立）的二手蜂型機器人（Secondhand Bombus），具備攔截（Blocker）能力。對手可以把它橫置，使攻擊轉向它，改成角色交戰（Fight），這次便搶不到委託骰。',setup:()=>state({units:[unit('f','Field Operator',2)]},{units:[unit('b','Secondhand Bombus',0,true,{blocker:true})],gigs:[dice('g1',4,4)]}),
  options:s=>[{label:'對手使用攔截能力',run:()=>R.attack(s,'player','f',{kind:'gig'},{blockWithId:'b'}),done:r=>r.ok&&r.state.player.gigs.length===0&&r.state.ai.gigs.some(d=>d.id==='g1')&&!r.state.ai.units.some(u=>u.id==='b'&&u.ready)},{label:'對手選擇不攔截',run:()=>R.attack(s,'player','f',{kind:'gig'}),done:()=>false}]},
 {title:'10 / 正確判定勝負',instruction:'一般情況下，剛搶到第 7 顆委託骰並不會立刻獲勝。必須等到自己的下一個回合開始時，還持有至少 7 顆才算贏。加時賽規則不同。',setup:()=>state({gigs:[1,2,3,4,5,6,7].map(n=>dice('g'+n,20,n))}),
  options:s=>[{label:'等到自己的下一回合開始再檢查',run:()=>({ok:R.startWin(s,'player'),state:s,events:['回合開始時持有 7 顆委託骰，符合勝利條件']}),done:()=>true},{label:'剛搶到第 7 顆就立即宣布勝利',run:()=>({ok:false,reason:'一般回合必須等到你的下一個回合開始才檢查；只有加時賽才可能立刻獲勝'}),done:()=>false}]},
 {title:'11 / 卡牌登場能力',instruction:'外勤幹員（Field Operator）登場時，如果街頭聲望是偶數，就抽 1 張牌。你有兩顆委託骰，點數是 2 和 4，所以街頭聲望是 6，屬於偶數。',setup:()=>state({gigs:[dice('g1',4,2),dice('g2',6,4)],hand:[],deck:[{name:'測試抽到的卡'}]}),
  options:s=>[{label:'使用外勤幹員的登場能力，抽 1 張牌',run:()=>R.playTrigger(s,'player',{name:'Field Operator'}),done:r=>r.ok&&r.state.player.hand.length===1},{label:'街頭聲望是偶數，所以不能抽牌',run:()=>({ok:false,reason:'官方卡牌效果指定偶數時抽牌，6 是偶數'}),done:()=>false}]}
];
const lessonInfo=[
 {title:'先準備牌組，才能開始對戰',text:'每人準備 3 張不同名傳奇卡、40～50 張主牌組與 6 顆委託骰。傳奇卡決定組牌顏色與 RAM 限制；開局先決定先後手，洗牌、蓋放傳奇卡並抽 6 張起始手牌。詳細配置可在本課下方的「組牌與開局細節」展開查看。'},
 {title:'先準備，再行動',text:'每回合先進入準備階段：重置已使用的卡牌 → 抽 1 張 → 從合事佬區擲出 1 顆委託骰。接著進入主要階段，才能變賣、出牌、呼叫傳奇或攻擊。'},
 {title:'歐元與傳奇卡都能支付',text:'歐元（Eddies／€$）是出牌資源：每回合在主要階段可變賣一張有變賣標籤的手牌，面朝下放到歐元區，成為 1 €$。傳奇區內的傳奇卡不論翻開與否，也可橫置支付 1 €$，但不算真正的歐元。'},
 {title:'呼叫傳奇，就是翻開蓋牌',text:'每回合最多呼叫傳奇一次：支付 1 €$，翻開傳奇區內一張隨機蓋放、尚未翻開的傳奇卡。若卡牌具有 CALL 能力，則在透過呼叫傳奇將其翻開時觸發。呼叫也可以在對手攻擊的反應時機進行。'},

 {title:'委託骰從哪裡來？',text:'每回合開始時，從合事佬區（Fixer Area）選一顆骰子擲出，放進自己的委託區。骰子名稱 d4、d6 等代表面數；二十面骰（d20）必須留到最後。'},
 {title:'就緒與已使用',text:'直立的角色叫「就緒（Ready）」，橫置的角色叫「已使用（Spent）」。一般主動攻擊只能選對手已使用的角色。特定卡牌還有自己的攻擊限制。'},
 {title:'怎麼搶委託骰？',text:'可以攻擊對手的委託區，把骰子搶到自己這邊。能搶幾顆取決於戰力（Power）；戰力 1～9 通常搶 1 顆。'},
 {title:'裝備讓戰力變高',text:'裝備（Gear）可以提高角色戰力。戰力達到 10，就能在單次攻擊時搶走 2 顆骰子；有更多戰力還可能搶更多。'},
 {title:'對手可以攔截',text:'具有「攔截（Blocker）」的就緒角色可以橫置自己，讓攻擊改為與它交戰；因此原本要搶委託骰的攻擊會被攔下。'},
 {title:'什麼時候才算贏？',text:'正常情況下，要在自己的回合開始時持有至少 7 顆委託骰才獲勝。注意：看的是骰子數量，而不是點數總和。'},
 {title:'街頭聲望能觸發卡牌能力',text:'街頭聲望（Street Cred）是自己委託骰的點數總和，不是骰子數量。有些角色會依聲望條件發動登場能力。'}
];
const progressKey='nct-integrated-lessons-v3';
const toProgress=x=>Math.max(0,Math.min(stages.length,Number.isFinite(Number(x))?Number(x):0));
const completedLessons=new Set();
try{
 const saved=localStorage.getItem(progressKey);
 if(saved!==null){
  const ids=JSON.parse(saved);
  if(Array.isArray(ids))ids.forEach(i=>{if(Number.isInteger(i)&&i>=0&&i<stages.length)completedLessons.add(i)});
 }else{
  const old=localStorage.getItem('nct-integrated-lessons-v2');
  const previous=localStorage.getItem('nct-integrated-lessons-v1');
  const count=toProgress(old!==null?old:(previous!==null?Number(previous)+basics.length:0));
  for(let i=0;i<count;i++)completedLessons.add(i);
 }
}catch{}
let stage=0,game=null,notice='',passed=false,replaying=false;
const add=(parent,tag,text,cls)=>{const e=document.createElement(tag);e.textContent=text||'';if(cls)e.className=cls;parent.append(e);return e};
function save(){try{localStorage.setItem(progressKey,JSON.stringify([...completedLessons].sort((a,b)=>a-b)))}catch{}}
function load(i,practiceAgain=false){if(i<0||i>=stages.length)return;stage=i;game=stages[i].setup();notice='';passed=false;replaying=practiceAgain;render()}
function navChapters(){const root=$('chapterNav');if(!root)return;root.replaceChildren();stages.forEach((s,i)=>{const b=add(root,'button',String(i+1).padStart(2,'0'));b.type='button';b.title=lessonInfo[i].title;b.setAttribute('aria-label','第 '+(i+1)+' 課：'+lessonInfo[i].title);if(i===stage)b.setAttribute('aria-current','step');if(completedLessons.has(i))b.classList.add('completed');b.onclick=()=>load(i)})}

function render(){const st=stages[stage],container=$('labStage');if(!container)return;
navChapters();container.replaceChildren();
const header=add(container,'div','','chapter-progress');add(header,'strong','LESSON '+String(stage+1).padStart(2,'0')+' / '+String(stages.length).padStart(2,'0'),'number');add(header,'span','已完成 '+completedLessons.size+' / '+stages.length+' 課','muted');
const track=add(container,'div','','progress');const fill=add(track,'span','');fill.style.width=(((stage+1)/stages.length)*100)+'%';track.setAttribute('role','progressbar');track.setAttribute('aria-label','目前教學步驟');track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax',String(stages.length));track.setAttribute('aria-valuenow',String(stage+1));
add(container,'h2',lessonInfo[stage].title);
const explain=add(container,'div','','chapter-learning');add(explain,'h3','本課重點');add(explain,'p',lessonInfo[stage].text);
if(stage===0){
 const colors=add(container,'section','','lesson-colors');
 add(colors,'h3','四種顏色的玩法特色','lesson-colors-label');
 const row=add(colors,'div','','lesson-colors-row');
 const details=add(colors,'div','','lesson-colors-details');
 const items=[
  {name:'紅色',en:'RED',tone:'#f8504a',heading:'強攻與高點數',body:'偏好高戰力、正面擊敗對手，以及提高委託骰點數或搶走高點數骰子。'},
  {name:'綠色',en:'GREEN',tone:'#55b980',heading:'組合與快速攻擊',body:'重視委託骰的點數組合、街頭聲望的奇偶條件，以及讓角色迅速展開攻擊。'},
  {name:'藍色',en:'BLUE',tone:'#42acda',heading:'速駭與干擾',body:'擅長使用程式與幻舞干擾對手，也會運用較低的委託骰點數與街頭聲望。'},
  {name:'黃色',en:'YELLOW',tone:'#e3ba52',heading:'裝備與資源再利用',body:'擅長使用裝備，運用不同點數的委託骰，並透過犧牲與回收資源取得優勢。'}
 ];
 const panels=[];
 const buttons=[];
 items.forEach((item,i)=>{
  const button=add(row,'button',item.name);button.type='button';button.style.borderTopColor=item.tone;
  button.setAttribute('aria-pressed',String(i===0));button.setAttribute('aria-controls','lessonColorDescription'+i);
  buttons.push(button);
  const panel=add(details,'div','','lesson-color-detail');
  panel.id='lessonColorDescription'+i;
  panel.setAttribute('role','region');panel.setAttribute('aria-label',item.name+'玩法說明');
  panel.style.borderLeftColor=item.tone;
  panel.style.display=i===0?'block':'none';
  add(panel,'strong',item.name+' / '+item.en+' — '+item.heading,'lesson-color-title');
  add(panel,'p',item.body,'lesson-color-description');
  panels.push(panel);
  button.onclick=()=>{
   buttons.forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));
   panels.forEach((p,j)=>{p.style.display=i===j?'block':'none'});
  };
 });
}

const question=add(container,'div','','chapter-quiz');add(question,'div','現在試著操作','number');add(question,'p',st.instruction);
const scoreboard=st.staticQuiz?null:add(container,'div','','arena');
const panel=(label,who)=>{const div=add(scoreboard,'div','','zone');add(div,'div',label,'number');const p=game[who];add(div,'p','委託骰 '+p.gigs.length+' 顆 · 街頭聲望 '+(R.cred(p.gigs)??'尚無'));add(div,'p','角色：'+(p.units.length?p.units.map(u=>L.cardTitle(u.name)+'（'+R.power(u)+' 戰力 / '+(u.ready?'就緒':'已使用')+(u.lag?'，新登場限制':'')+'）').join('、'):'無'));if(p.gigs.length)add(div,'p',p.gigs.map(d=>L.dieLabel(d.sides)+'：'+d.value+' 點').join(' · '));if(p.fixer.length)add(div,'p','合事佬區：'+p.fixer.map(x=>L.dieLabel(x)).join(' · '));};if(!st.staticQuiz){panel('PLAYER / 你的區域','player');panel('RIVAL / 對手區域','ai');}
const actions=add(container,'div','','actions');const isDone=passed||(!replaying&&completedLessons.has(stage));
if(!isDone){for(const o of st.options(game)){const b=add(actions,'button',o.label,'btn');b.onclick=()=>{const result=o.run();if(!result.ok){notice=result.reason||'這個操作不符合目前規則，請再試一次。';render();return}
game=result.state;
if(o.done(result)){passed=true;completedLessons.add(stage);save();notice=(result.events||[]).join('；')+'。答對了，已記錄本課完成進度。'}
else notice='這個動作可以執行，但不是這一題要你練習的選擇。請重新開始本課，試試其他操作。';
render()}}}
else{add(actions,'strong','✓ '+(passed?'已完成本課':'本課已通過'),'muted');if(stage<stages.length-1){const next=add(actions,'button','下一課 →','btn primary');next.onclick=()=>load(stage+1)}else add(actions,'strong',completedLessons.size===stages.length?'恭喜完成全部 11 課！':'已完成第 11 課，可自由選擇其他課程。')}
const feedback=add(container,'div',notice||'先閱讀上方解說，再選一個操作。','notice');feedback.setAttribute('role','status');
const bottom=add(container,'div','','chapter-actions');if(stage>0){const prev=add(bottom,'button','← 上一課','btn');prev.onclick=()=>load(stage-1)}const retry=add(bottom,'button','重新練習這一課','btn');retry.onclick=()=>load(stage,true);if(completedLessons.size>=stages.length){const reset=add(bottom,'button','重設教學進度','btn');reset.onclick=()=>{completedLessons.clear();save();load(0)}}
add(container,'p','這些是官方規則的局部操作示範，尚未支援完整付費流程、快速反應（Quick）或完整 AI 對局。','muted');
}
function cards(){const root=$('verifiedCardList');if(!root)return;root.replaceChildren();for(const card of window.NCT_OFFICIAL_CARDS){const div=add(root,'div','','panel');add(div,'h3',L.cardTitle(card.name)).style.color='#29ffff';add(div,'p',(card.type==='Unit'?'角色單位':card.type==='Gear'?'裝備':card.type)+' · 費用 '+card.cost+' · 戰力 '+card.power+' · RAM '+card.ram);add(div,'p',card.summary);add(div,'small',card.implemented.length?'已支援部分卡牌能力':'卡牌效果尚未加入對戰引擎');const link=add(div,'a','查看官方英文卡牌 ↗');link.href=card.source;link.target='_blank';link.rel='noopener noreferrer';}}
cards();load(0);
})();