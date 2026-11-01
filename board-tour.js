/* A visual zone walkthrough; does not make the tabletop a playable official game. */
(()=>{'use strict';
const steps=[
 {zone:'player-fixer',title:'合事佬區 / FIXER',description:'還沒擲出的任務骰先放在這裡。每回合開始時，選一顆骰子擲出，移到自己的任務區。二十面骰必須最後才擲。',action:'看黃色標示的「我的合事佬區」，記住六種骰子的位置。',detail:'四面骰（d4）、六面骰（d6）、八面骰（d8）、十面骰（d10）、十二面骰（d12）與二十面骰（d20）。'},
 {zone:'player-field',title:'我的場地 / FIELD',description:'角色單位登場後放在場地上；可裝備的裝備卡也會跟隨對應角色。部分傳奇角色使用 GO SOLO 後，也會進入場地。',action:'留意三個角色與裝備的位置：正式版本會在這裡顯示卡圖與可選取的目標。',detail:'目前是靜態槽位，還不能在此正式部署、攻擊或裝備。'},
 {zone:'player-eddies',title:'我的資源區 / EDDIES',description:'可以將一張具備賣牌標記的手牌面朝下放到資源區，成為 1 個 Eddies。支付費用時消耗資源。',action:'找到右下方「我的資源區」。這裡未來會顯示已就緒及已使用的資源。',detail:'Eddies 與任務骰不同；前者用來出牌，後者與勝負條件有關。'},
 {zone:'player-gigs',title:'我的任務區 / GIG',description:'擲出或搶來的任務骰會放在此區。一般情況下，在你的回合開始時有至少 7 顆任務骰就能贏。',action:'注意右側的 0 / 7：看的是骰子「數量」，不是骰子的點數。',detail:'街頭聲望（Street Cred）是任務區骰子點數的合計，部分卡牌能力會用到。'},
 {zone:'player-legends',title:'我的傳奇角色 / LEGENDS',description:'開局有 3 張蓋牌的傳奇角色。它們是牌組的核心，也可能提供支付費用的資源或其他能力。',action:'玩家的三張傳奇角色預設蓋牌。可使用上方的「預覽我的傳奇角色」按鈕查看對應的真實卡面。',detail:'真正的對局會使用兩套官方初始牌組的對應傳奇角色。'},
 {zone:'player-hand',title:'我的手牌 / HAND',description:'你能看見自己手上的卡，依照時機與費用決定出牌，或把有賣牌標記的卡賣成 Eddies。',action:'找到左下的手牌區。現在會顯示六張來自官方初始牌組的 Beta 卡面；點擊可放大。正式出牌操作仍未實作。',detail:'對手手牌內容不會直接公開，避免透露原本隱藏的資訊。'},
 {zone:'opponent-field',title:'對手的場地 / RIVAL',description:'對手的角色與裝備會顯示在上半部。攻擊目標和 Blocker 攔截，都需要依照卡牌狀態與官方規則判斷。',action:'觀察對手在上方，自己的場地在下方，雙方位置互相對應。',detail:'這裡是場地配置示意，並沒有啟動真正的對手 AI。'},
 {zone:'turn-info',title:'回合與操作提示 / PHASE',description:'正式遊戲需要依序處理回合開始、主要階段、卡牌效果與回合結束等事項。遊戲會在這裡提示目前輪到誰、可以做什麼。',action:'桌面導覽已完成。接下來可回「新手教學」操作既有的七個規則練習。',detail:'現有 12 生命值測試引擎已移到下方收合區，不會被當成正式玩法。'}
];
const byId=id=>document.getElementById(id);
const wrap=byId('battleTour'),tip=wrap?.querySelector('.tour-coach');
if(!wrap||!tip)return;
let cursor=0;
function show(i){
 cursor=Math.max(0,Math.min(steps.length-1,i));
 const step=steps[cursor];
 wrap.classList.add('has-spotlight');
 tip.hidden=false;
 wrap.querySelectorAll('[data-tour-zone]').forEach(el=>{
  if(el.dataset.tourZone===step.zone)el.setAttribute('data-tour-highlight','');else el.removeAttribute('data-tour-highlight');
 });
 byId('tourCounter').textContent='AREA '+String(cursor+1).padStart(2,'0')+' / '+String(steps.length).padStart(2,'0');
 byId('tourTitle').textContent=step.title;
 byId('tourDescription').textContent=step.description;
 byId('tourAction').textContent=step.action;
 byId('tourDetail').textContent=step.detail;
 byId('tourPrevious').disabled=cursor===0;
 byId('tourContinue').textContent=cursor===steps.length-1?'結束桌面導覽 ✓':'下一步 →';
 if(window.matchMedia?.('(max-width:840px)').matches)tip.scrollIntoView({block:'nearest',behavior:'auto'});
}
function close(){tip.hidden=true;wrap.classList.remove('has-spotlight');wrap.querySelectorAll('[data-tour-zone]').forEach(e=>e.removeAttribute('data-tour-highlight'))}
byId('startBoardTour').addEventListener('click',()=>show(0));
byId('closeBoardTour').addEventListener('click',close);
byId('tourPrevious').addEventListener('click',()=>show(cursor-1));
byId('tourContinue').addEventListener('click',()=>cursor===steps.length-1?close():show(cursor+1));
byId('jumpToLessons').addEventListener('click',()=>document.querySelector('button[data-page="learn"]')?.click());
wrap.querySelectorAll('[data-tour-zone]').forEach(el=>{
  el.addEventListener('click',()=>{const i=steps.findIndex(x=>x.zone===el.dataset.tourZone);if(i>=0)show(i)});
  el.style.cursor=steps.some(x=>x.zone===el.dataset.tourZone)?'pointer':'default';
});
show(0);
})();