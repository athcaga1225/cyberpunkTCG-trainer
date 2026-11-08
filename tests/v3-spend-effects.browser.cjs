'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:Number(process.env.V3_TEST_WIDTH)||1440,height:Number(process.env.V3_TEST_HEIGHT)||900},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>Math.random=()=>.999999);
  const url=(process.env.V3_TEST_URL||'http://127.0.0.1:8007/v3/')+'#battle',ctl=page.locator('#battleTour');
  const click=name=>ctl.getByRole('button',{name,exact:true}).click();
  async function hand(name){await page.locator('.player-hand [data-card-name="'+name+'"]').first().focus();await page.keyboard.press('Enter')}
  async function prep(){for(const name of ['重置資源','抽 1 張','擲骰'])await click(name)}
  for(const trash of [false,true]){
   await page.goto('about:blank');await page.goto(url);await page.getByRole('combobox',{name:'選擇開局方式',exact:true}).selectOption('basic');await page.evaluate(()=>{let r=[.95,.1];Math.random=()=>r.length?r.shift():.5});
   await page.getByRole('button',{name:'雙方擲 d20 決定選擇權',exact:true}).click();await page.getByRole('button',{name:'我方選擇先攻',exact:true}).click();await page.getByRole('button',{name:'略過說明，直接操作',exact:true}).click();await prep();
   await page.locator('.player-legends [data-legend-id="legend-viktor"]').click();await click('呼叫傳奇（1 €$）');await page.locator('.player-legends .v3-legend-card').nth(2).click();await click('確認呼叫傳奇（1 €$）');await click('Tetratronic Rippler · 1 €$');await click('確認搜尋（選取 1 / 2）');
   await hand('Kiroshi Optics');await click('變賣');await click('結束回合');await ctl.getByRole('button',{name:'重置資源',exact:true}).waitFor();await prep();
   await hand('Tetratronic Rippler');await page.locator('.player-eddies .v3-eddie-token').click();await click('選擇裝備目標');await page.locator('.player-legends [data-legend-id="legend-viktor"]').click();
   await page.locator('.player-legends [data-legend-id="legend-v"]').click();await click('呼叫傳奇（1 €$）');await page.locator('.player-legends [data-legend-id="legend-viktor"]').click();await click('確認呼叫傳奇（1 €$）');
   assert.match(await ctl.innerText(),/待結算：Tetratronic Rippler/);assert.match(await ctl.innerText(),/牌庫頂：/);assert.equal(await ctl.getByRole('button',{name:'結束回合',exact:true}).count(),0);
   // Guide can close independently while the real ability choices remain available.
   const close=page.locator('#v3TableGuide').getByRole('button',{name:/關閉/});await close.click();assert.equal(await page.locator('#v3TableGuide').isVisible(),false);
   await page.screenshot({path:'/tmp/v3-rippler-choice.png'});await click(trash?'棄置牌庫頂':'保留在牌庫頂');assert.doesNotMatch(await ctl.innerText(),/牌庫頂：/);assert.equal(await ctl.getByRole('button',{name:'結束回合',exact:true}).count(),1);
   assert.match(await page.locator('.player-legends [data-legend-id="legend-viktor"]').innerText(),/SPENT/);
   assert.equal(await page.locator('.player-legends button[aria-label="V: Corporate Exile"]').count(),1);
   await page.screenshot({path:'/tmp/v3-rippler-'+(trash?'trash':'keep')+'.png'});
   console.log('PASS actual Viktor search, Rippler equip, Legend resource payment and private '+(trash?'trash':'keep')+' choice');
  }
  // Explicit mid-game fixture: use real deck cards and the unchanged UI/engine.
  // Only the initial layout is controlled, so the attack and choice use real handlers.
  await page.route('**/v3/heist-practice.js?*',async route=>{
   const response=await route.fetch(),source=await response.text();
   await route.fulfill({response,body:source+`;(()=>{const H=window.NCTV3Heist,original=H.fresh;H.fresh=(...args)=>{const s=original(...args),take=name=>s.player.deck.splice(s.player.deck.findIndex(c=>c.name===name),1)[0];s.player.units=[{...take('Psycho Squad'),ready:true,lag:false,gear:[take('Zetatech Faceplate')]}];s.player.gigs=[{id:'fixture1',sides:4,value:1},{id:'fixture2',sides:6,value:2},{id:'fixture3',sides:8,value:2}];s.player.fixer=[10,12,20];s.ai.gigs=[{id:'rival',sides:4,value:2}];s.ai.units=[];s.ai.hand=[];return s;};})();`});
  });
  await page.goto('about:blank');await page.goto(url);await page.getByRole('combobox',{name:'選擇開局方式',exact:true}).selectOption('basic');await page.evaluate(()=>{let r=[.95,.1];Math.random=()=>r.length?r.shift():.5});
  await page.getByRole('button',{name:'雙方擲 d20 決定選擇權',exact:true}).click();await page.getByRole('button',{name:'我方選擇先攻',exact:true}).click();await page.getByRole('button',{name:'略過說明，直接操作',exact:true}).click();await prep();
  const handBefore=await page.locator('.player-hand [data-card-name]').count();
  await page.locator('.player-field .v3-played-card').click();await click('攻擊委託區');assert.match(await ctl.innerText(),/待結算：Zetatech Faceplate/);
  await ctl.getByLabel('能力指定委託骰').selectOption('player:fixture3');await ctl.getByLabel('能力調整點數').selectOption('1');await page.screenshot({path:'/tmp/v3-faceplate-choice.png'});await click('確認委託骰調整');
  assert.equal(await page.locator('.player-hand [data-card-name]').count(),handBefore+1);assert.equal(await page.locator('.opponent-gigs strong').innerText(),'0 / 7');assert.equal(await page.locator('.player-gigs strong').innerText(),'5 / 7');
  console.log('PASS controlled mid-game Faceplate attack, Gig adjustment, conditional draw and resumed steal through actual UI handlers');
  assert.deepEqual(errors,[]);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
