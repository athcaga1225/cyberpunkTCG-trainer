'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1280,height:720},reducedMotion:'no-preference'}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(10000);
 // Observe real commands and animations; do not replace Math.random or manufacture hands.
 await page.route('**/v3/turn-practice.js?*',async route=>{const src=fs.readFileSync(path.join(__dirname,'../v3/turn-practice.js'),'utf8');await route.fulfill({contentType:'application/javascript',body:src+`;(()=>{const P=window.NCTV3TurnPractice;window.__openingCommands=[];for(const k of ['rollForOrder','chooseOrder','openingHand','beginOpening','opponentTurn','concede']){const f=P[k];P[k]=(...args)=>{const r=f(...args);if(r.ok){window.__openingState=r.state;window.__openingCommands.push(k);}return r;};}})();`});});
 await page.route('**/v3/starter-match.js?*',async route=>{const src=fs.readFileSync(path.join(__dirname,'../v3/starter-match.js'),'utf8');await route.fulfill({contentType:'application/javascript',body:src+`;(()=>{const M=window.NCTV3StarterMatch,f=M.fresh;M.fresh=(...args)=>{const s=f(...args);window.__openingState=s;return s;};})();`});});
 await page.addInitScript(()=>{window.__flights=[];const animate=Element.prototype.animate;Element.prototype.animate=function(frames,opts){if(this.classList.contains('nct-deal-card'))window.__flights.push({side:this.closest('[data-v3-deal-side]').dataset.v3DealSide,src:this.querySelector('img')?.getAttribute('src')});return animate.call(this,frames,opts);};});
 const board=page.locator('#battleTour'),opening=page.locator('#v3OpeningSetup'),click=n=>page.getByRole('button',{name:n,exact:true}).click(),state=()=>page.evaluate(()=>window.__openingState);
 const ids=p=>[...p.hand,...p.deck].map(c=>c.id).sort(),hands=new Set();
 async function deal(choice){
  let s=await state();assert.equal(s.setupKind,'random');assert.equal(s.player.hand.length+s.ai.hand.length,0);assert.equal(s.player.deck.length+s.ai.deck.length,80);assert.equal(s.opening.winner,null);assert.equal(s.ai.practiceBot.turnsTaken,0);
  const before={player:ids(s.player),ai:ids(s.ai)};
  do{await click('雙方擲 d20 決定選擇權');s=await state();}while(!s.opening.winner);
  await click(s.opening.winner==='ai'?'對手選擇先攻':choice==='keep'?'我方選擇先攻':'我方選擇後攻');s=await state();
  for(const w of ['player','ai']){assert.equal(s[w].hand.length,6);assert.equal(s[w].deck.length,34);assert.deepEqual(ids(s[w]),before[w]);}
  assert.match(await opening.innerText(),/隨機起手 \/ 確認六張手牌/);assert.match(await opening.innerText(),/可能抽回原牌/);const signature=s.player.hand.map(c=>c.id).join();assert(!hands.has(signature),'a fresh unseeded deal is not the previous fixed hand');hands.add(signature);
  assert.deepEqual(await opening.locator('.v3-opening-card').evaluateAll(es=>es.map(e=>e.dataset.cardId)),s.player.hand.map(c=>c.id));assert.equal(await page.locator('.opponent-hand img').count(),0,'no rival faces are rendered in setup');
  const openingState=JSON.stringify(s);await page.waitForTimeout(1050);assert.equal(JSON.stringify(await state()),openingState,'no AI draw/roll/action before human confirmation');assert.equal(await page.locator('[data-v3-deal-layer]').count(),0);
  const rivalBefore=JSON.stringify(s.ai),myHand=JSON.stringify(s.player.hand),myDeck=JSON.stringify(s.player.deck);
  await click(choice==='keep'?'保留這六張':'整手重抽一次');s=await state();assert.equal(JSON.stringify(s.ai),rivalBefore);assert.deepEqual(ids(s.player),before.player);assert.equal(s.opening.mulliganUsed.player,choice==='mulligan');
  if(choice==='keep'){assert.equal(JSON.stringify(s.player.hand),myHand);assert.equal(JSON.stringify(s.player.deck),myDeck);}
  assert.equal(await opening.getByRole('button',{name:'整手重抽一次',exact:true}).count(),0);assert.equal(s.phase,'pregame');assert.equal(s.ai.practiceBot.turnsTaken,0);
  await page.evaluate(()=>window.__flights=[]);await click('開始對戰');await page.waitForFunction(()=>window.__openingCommands.includes('beginOpening'));
  if(choice==='keep'){await page.waitForFunction(()=>window.__flights.length===12);const flights=await page.evaluate(()=>window.__flights);for(const side of ['player','opponent'])assert.equal(flights.filter(f=>f.side===side).length,6);assert(flights.filter(f=>f.side==='opponent').every(f=>f.src==='v3/assets/card-backs/normal.png'));}else assert.equal(await page.evaluate(()=>window.__flights.length),0,'reduced motion skips flights');
  if(s.opening.first==='ai'){await page.waitForFunction(()=>window.__openingState.turn==='player');assert.equal((await state()).ai.practiceBot.turnsTaken,1);}else{assert.equal((await state()).turn,'player');assert.equal((await state()).ai.practiceBot.turnsTaken,0);}
  await page.waitForFunction(()=>!document.querySelector('[data-v3-deal-layer]'));assert.equal(await page.locator('.player-hand .hand-card').count(),6);assert.equal(await page.locator('.opponent-hand img:not([src*="card-backs/normal.png"])').count(),0);
  const rivalDOM=await page.locator('.opponent-hand .preview-card-rail').innerHTML();for(const c of (await state()).ai.hand)assert(!rivalDOM.includes(c.name),'rival card names are never put in the hand DOM');
  if(await board.getByRole('button',{name:'關閉桌面引導',exact:true}).isVisible())await click('關閉桌面引導');
 }
 for(const own of ['theHeist','embracingPower'])for(const rival of ['theHeist','embracingPower']){
  await page.goto('about:blank');await page.goto((process.env.V3_TEST_URL||'http://127.0.0.1:8043/v3/')+'#battle');await page.getByRole('combobox',{name:'選擇實戰牌組',exact:true}).selectOption(own);await page.getByRole('combobox',{name:'選擇對手牌組',exact:true}).selectOption(rival);assert.equal(await page.getByRole('combobox',{name:'選擇開局方式',exact:true}).inputValue(),'random');
  await page.emulateMedia({reducedMotion:'no-preference'});await deal('keep');await click('認輸');await page.getByRole('button',{name:'確認認輸',exact:true}).click();await click('重新開局');let s=await state();assert.equal(s.deckKey,own);assert.equal(s.opponentDeckKey,rival);assert.equal(s.finished,false);assert(s.pendingAttack==null);assert.equal(s.pendingEffects?.length||0,0);assert.equal(s.opening.mulliganUsed,undefined);assert.equal(await page.locator('.player-field .v3-played-card').count(),0);assert.equal(await page.locator('.v3-history-list article').count(),0);await page.waitForTimeout(1050);assert.equal((await state()).ai.practiceBot.turnsTaken,0,'no stale opponent timer after restart');
  await page.emulateMedia({reducedMotion:'reduce'});await deal('mulligan');console.log('PASS live unseeded opening and clean restart: '+own+' / '+rival);
 }
 assert.deepEqual(errors,[]);console.log('PASS 8 real UI openings across all four matchups: native randomness, both owner inventories, keep/Mulligan, confirmation gating, private rival hand, both-side flight and reduced-motion behavior, clean restart with no stale bot state.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
