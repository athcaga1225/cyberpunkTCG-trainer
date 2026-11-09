'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1280,height:720},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(6000);
 // Test-only observers record command results; every game action still comes from a real UI control.
 await page.route('**/v3/turn-practice.js?*',async route=>{const src=fs.readFileSync(path.join(__dirname,'../v3/turn-practice.js'),'utf8');await route.fulfill({contentType:'application/javascript',body:src+`;(()=>{const P=window.NCTV3TurnPractice;window.__matchAudit={state:null,commands:[]};for(const k of Object.keys(P)){if(typeof P[k]!=='function')continue;const f=P[k];P[k]=(...args)=>{const r=f(...args);if(r?.ok&&r.state){window.__matchAudit.state=r.state;window.__matchAudit.commands.push(k);}return r;};}})();`});});
 await page.route('**/v3/heist-practice.js?*',async route=>{const src=fs.readFileSync(path.join(__dirname,'../v3/heist-practice.js'),'utf8');await route.fulfill({contentType:'application/javascript',body:src+`;(()=>{const H=window.NCTV3Heist,f=H.fresh;H.fresh=(...args)=>{const s=f(...args);window.__matchAudit.state=s;return s;};})();`});});
 const board=page.locator('#battleTour'),url=(process.env.V3_TEST_URL||'http://127.0.0.1:8030/v3/')+'#battle';
 await page.addInitScript(()=>{let n=Number(new URL(location.href).searchParams.get('match-seed'))||1;Math.random=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};});
 const state=()=>page.evaluate(()=>window.__matchAudit.state),click=n=>page.getByRole('button',{name:n,exact:true}).click();
 const hand=async id=>{const target=board.locator('.hand-card[data-card-id="'+id+'"]');await target.focus();await page.keyboard.press('Enter');};
 function invariant(s){
  const dice=[];for(const who of ['player','ai']){const p=s[who],cards=[...p.hand,...p.deck,...(p.trash||[]),...(p.removed||[]),...p.units,...p.legends];for(const c of [...p.units,...p.legends])cards.push(...(c.gear||[]));const normal=cards.filter(c=>c.type!=='Legend').map(c=>c.id).concat(p.eddies.map(c=>c.id.replace(/^eddie-/,'')));assert.equal(normal.length,40,'all 40 original main-deck cards remain accounted for');assert.equal(new Set(normal).size,40,'no duplicated cards across zones');assert.equal(cards.filter(c=>c.type==='Legend').length,3,'all three Legends remain accounted for');for(const g of p.gigs){assert(g.value>=1&&g.value<=g.sides);dice.push(g.sides);}dice.push(...p.fixer);}
  assert.equal(dice.length,12,'dice are transferred, never created or lost');for(const d of [4,6,8,10,12,20])assert.equal(dice.filter(x=>x===d).length,2);if(s.finished){assert.equal(s.phase,'finished');assert(!s.pendingAttack);assert.equal(s.pendingEffects.length,0);}
 }
 async function effects(s){const e=s.pendingEffects[0],buttons=board.locator('#v3CardActions');
  if(e.type==='order')await buttons.getByRole('button',{name:/^先結算：/}).first().click();
  else if(e.type==='search')await click('確認搜尋（選取 0 / 2）');
  else if(e.type==='rippler')await click('保留在牌庫頂');
  else if(e.type==='peekResult')await click('看完，繼續');
  else if(e.type==='peekOne')await buttons.getByRole('button',{name:/^查看傳奇位置 /}).first().click();
  else if(e.type==='freeCall')await click('不呼叫，繼續');
  else if(e.type==='discard')await buttons.getByRole('button',{name:/^棄置：/}).first().click();
  else if(e.type==='shatteredDraw')await click('不抽牌，繼續');
  else if(e.type==='swapGigs')await click('不交換，繼續');
  else if(e.type==='radioport')await click('不查看，繼續');
  else if(e.type==='defeatUnit')await buttons.getByRole('button',{name:/^擊敗：/}).first().click();
  else if(e.type==='spendUnit')await buttons.getByRole('button',{name:/^橫置：/}).first().click();
  else if(e.type==='adjust')await click('確認委託骰調整');
  else if(e.type==='readyEddies'){const n=Math.min(e.count,s.player.eddies.filter(c=>!c.ready).length);for(let i=0;i<n;i++)await buttons.getByRole('button',{name:/^Eddie /}).nth(i).click();await click('確認重置');}
  else throw Error('unhandled effect '+e.type);
 }
 async function run(seed,first,mulligan,active){
  const target=new URL(url);target.searchParams.set('match-seed',seed);await page.goto('about:blank');await page.goto(target.href);if(process.env.V3_TEST_DECK==='embracingPower')await page.getByRole('combobox',{name:'選擇實戰牌組',exact:true}).selectOption('embracingPower');
  // Both dice still roll through the UI; seed controls the whole random opening and later turns.
  if(process.env.V3_TEST_DECK==='embracingPower')await page.evaluate(()=>{const next=Math.random;let rolls=[.95,.1];Math.random=()=>rolls.length?rolls.shift():next();});
  await click('雙方擲 d20 決定選擇權');let s=await state();while(!s.opening.winner){await click('雙方擲 d20 決定選擇權');s=await state();}
  if(s.opening.winner==='player')await click(first==='player'?'我方選擇先攻':'我方選擇後攻');else await click('對手選擇先攻');
  await click(mulligan?'整手重抽一次':'保留這六張');await click('開始對戰');if(await board.getByRole('button',{name:'關閉桌面引導',exact:true}).count())await click('關閉桌面引導');
  let actions=0,maxRound=1;
  while(actions++<600){s=await state();invariant(s);maxRound=Math.max(maxRound,s.round);if(s.finished)break;
   if(s.pendingEffects?.length){await effects(s);continue;}
   if(s.phase==='react'&&s.pendingAttack?.defendingSide==='player'){await click('結束反應並結算');continue;}
   if(s.turn==='ai'){await page.waitForFunction(()=>{const s=window.__matchAudit.state;return s.finished||s.turn==='player'||s.pendingEffects?.length||s.phase==='react';},{},{timeout:6000});continue;}
   if(s.phase==='start'){await click({ready:'重置資源',draw:'抽 1 張',roll:'擲骰'}[s.step]);continue;}
   assert.equal(s.phase,'main','every nonterminal state exposes a legal continuation');
   if(active&&!s.player.soldThisTurn){const sale=s.player.hand.find(c=>c.sellTag);if(sale){await hand(sale.id);await click('變賣');continue;}}
   if(active){
    const sources=[...s.player.eddies.filter(c=>c.ready).map(c=>({kind:'eddie',id:c.id})),...s.player.legends.filter(c=>c.ready&&(!c.faceUp||c.sellTag)).map(c=>({kind:'legend',id:c.id}))];
    const unit=s.player.hand.filter(c=>c.type==='Unit'&&c.cost<=sources.length).sort((a,b)=>(b.power||0)-(a.power||0))[0];
    if(unit){await hand(unit.id);for(const r of sources.slice(0,unit.cost))await board.locator('[data-payment-kind="'+r.kind+'"][data-payment-id="'+r.id+'"]:visible').click();await click('打出單位');continue;}
    const attack=await page.evaluate(()=>{const s=window.__matchAudit.state,C=window.NCTV3Combat;for(const u of s.player.units){const t=C.targets(s,'player',u.id);if(t.gigs&&C.power(u)>0)return {id:u.id,gig:true};const d=s.ai.units.find(d=>t.units.includes(d.id)&&C.power(u)>=C.power(d)&&C.power(u)>0);if(d)return {id:u.id,defenderId:d.id};}return null;});
    if(attack){await board.locator('.player-field .v3-played-card').nth(s.player.units.findIndex(u=>u.id===attack.id)).click();if(attack.gig)await click('攻擊委託區');else await board.locator('.opponent-field .v3-played-card').nth(s.ai.units.findIndex(u=>u.id===attack.defenderId)).click();continue;}
   }
   await click('結束回合');
  }
  s=await state();assert.equal(s.opening.first,first,'both first-player orders are exercised');assert(s.finished,'match terminates within the bounded action budget');invariant(s);assert(maxRound>=3,'test spans multiple complete rounds');const result=board.locator('.v3-result-reason');assert(await result.isVisible());assert.equal(await board.getByRole('button',{name:'結束回合',exact:true}).count(),0);assert.equal(await board.locator('#v3RollControl').isDisabled(),true);const commands=await page.evaluate(()=>window.__matchAudit.commands);if(active){assert(commands.includes('sell'));assert(commands.includes('play'));assert(commands.includes('reactAttack'));}assert.equal(s.opening.mulliganUsed.player,mulligan);await page.mouse.move(2,2);await page.screenshot({path:'/tmp/v3-full-match-'+seed+'.png'});
  console.log('PASS natural seeded match',JSON.stringify({seed,first:s.opening.first,mulligan,active,round:s.round,winner:s.winner,reason:s.outcome.reason,actions,commands:commands.length}));
  await click('重新開局');s=await state();assert.equal(s.phase,'pregame');assert.equal(s.finished,false);assert.equal(s.round,1);assert(!s.outcome&&!s.overtime&&!s.pendingAttack);assert.equal(s.player.eddies.length,0);assert.equal(s.player.units.length,0);assert.equal(s.player.gigs.length,0);assert.equal(await page.locator('#v3OpeningSetup').isVisible(),true);assert.equal(await board.locator('.v3-result-reason').count(),0);assert.equal(await board.locator('.v3-history-list article').count(),0,'restart clears the old match history');assert.equal(await board.locator('.v3-eddie-token').count(),0);console.log('PASS clean restart after completed match');
 }
 await run(19,'player',true,true);await run(42,'ai',false,false);assert.deepEqual(errors,[]);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
