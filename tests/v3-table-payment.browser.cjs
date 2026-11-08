'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:Number(process.env.V3_TEST_WIDTH)||1440,height:Number(process.env.V3_TEST_HEIGHT)||900},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>Math.random=()=>.999999);
  const url=(process.env.V3_TEST_URL||'http://127.0.0.1:8018/v3/')+'#battle',board=page.locator('#battleTour'),actions=page.locator('#v3CardActions'),legends=page.locator('.player-legends .cardbacks');
  const click=name=>board.getByRole('button',{name,exact:true}).click();
  const legend=id=>legends.locator('[data-legend-id="'+id+'"]');
  async function hand(name){await board.locator('.hand-card[data-card-name="'+name+'"]').first().focus();await page.keyboard.press('Enter')}
  async function start(){await page.goto('about:blank');await page.goto(url);await page.getByRole('combobox',{name:'選擇開局方式',exact:true}).selectOption('basic');await page.evaluate(()=>{let r=[.95,.1];Math.random=()=>r.length?r.shift():.5});await page.getByRole('button',{name:'雙方擲 d20 決定選擇權',exact:true}).click();await page.getByRole('button',{name:'我方選擇後攻',exact:true}).click();await click('關閉桌面引導');await board.getByRole('button',{name:'重置資源',exact:true}).waitFor();for(const n of ['重置資源','抽 1 張','擲骰'])await click(n)}
  await start();await hand('Kiroshi Optics');await click('變賣');const eddie=page.locator('.player-eddies .v3-eddie-token');
  await legend('legend-viktor').click();assert.equal(await eddie.isDisabled(),true,'choosing a Call target has not entered payment');await click('呼叫傳奇（1 €$）');
  assert.equal(await page.locator('.player-eddies .v3-resource-choice,.player-eddies .v3-payment-card').count(),0,'Eddies contains no duplicate Legend controls');
  await legend('legend-v').click();assert.equal(await legend('legend-viktor').evaluate(e=>e.classList.contains('is-call-target')),true,'payment clicks keep the original Call target');assert.equal(await legend('legend-v').getAttribute('aria-pressed'),'true');assert.equal(await legend('legend-v').locator('.v3-legend-state').innerText(),'READY');
  await legend('legend-v').click();assert.equal(await actions.locator('.v3-payment-total').innerText(),'付款 0 / 1 €$');assert.equal(await actions.getByRole('button',{name:'確認呼叫傳奇（1 €$）',exact:true}).isDisabled(),true);
  await eddie.click();await click('取消付款');assert.equal(await eddie.getAttribute('aria-pressed'),'false');assert.equal(await eddie.isDisabled(),true);assert.equal(await legend('legend-viktor').locator('.v3-legend-state').innerText(),'READY','cancellation does not spend or reveal the target');
  await click('呼叫傳奇（1 €$）');await eddie.click();await legend('legend-v').click();assert.equal(await actions.getByRole('button',{name:'確認呼叫傳奇（1 €$）',exact:true}).isDisabled(),true,'overpayment cannot confirm');await legend('legend-v').click();
  const bounds=await eddie.evaluate(e=>({button:e.getBoundingClientRect().bottom,pool:e.parentElement.getBoundingClientRect().bottom,zone:e.closest('.player-eddies').getBoundingClientRect().bottom}));assert(bounds.button<=bounds.pool+1&&bounds.button<=bounds.zone-1,'Eddie payment cards stay fully visible');await page.screenshot({path:'/tmp/v3-direct-call-payment.png'});await click('確認呼叫傳奇（1 €$）');assert.equal(await legend('legend-viktor').evaluate(e=>e.classList.contains('face-down')),false);assert.equal(await eddie.evaluate(e=>e.classList.contains('is-spent')),true);await click('確認搜尋（選取 0 / 2）');
  await hand('Mandibular Upgrade');await legend('legend-v').click();assert.equal(await legend('legend-v').getAttribute('aria-pressed'),'true');assert.equal(await actions.getByRole('button',{name:'選擇裝備目標',exact:true}).isEnabled(),true);assert.equal(await eddie.isDisabled(),true,'spent Eddie is unavailable');
  await click('選擇裝備目標');assert.equal(await legend('legend-viktor').evaluate(e=>e.classList.contains('is-gear-target')),true);assert.equal(await legend('legend-v').evaluate(e=>e.classList.contains('is-gear-target')),false,'face-down Legends are not Gear targets');await click('重新選擇付款');assert.equal(await legend('legend-v').getAttribute('aria-pressed'),'true','returning from target selection retains payment');await click('選擇裝備目標');await legend('legend-viktor').click();
  assert.equal(await board.locator('.hand-card[data-card-name="Mandibular Upgrade"]').count(),0);assert.equal(await legend('legend-v').locator('.v3-legend-state').innerText(),'SPENT');
  console.log('PASS actual Call target/payment separation, direct source toggle, exact cost, cancellation without spending, real Eddie payment, and separate Gear payment/Legend targeting');
  // A controlled defensive window exercises the same source handlers with the real combat engine.
  await page.route('**/v3/heist-practice.js?*',async route=>{
   const src=fs.readFileSync(path.join(__dirname,'../v3/heist-practice.js'),'utf8');
   await route.fulfill({contentType:'application/javascript',body:src+`;(()=>{const H=window.NCTV3Heist,f=H.fresh;H.fresh=(...args)=>{const s=f(...args);s.player.eddies=[{id:'defense-cash',ready:true}];s.player.hand.push({...H.byName.get('Floor It'),id:'defense-floor'});s.ai.hand=[];s.ai.units=[{...H.byName.get('Psycho Squad'),id:'attacker',ready:true,lag:false,gear:[]}];s.ai.gigs=[{id:'ai-gig',sides:4,value:1}];s.ai.deck=Array.from({length:10},(_,i)=>({...H.byName.get('Psycho Squad'),id:'draw'+i}));return s;};})();`});
  });
  await start();await click('結束回合');await board.getByRole('button',{name:'結束反應並結算',exact:true}).waitFor();await hand('Floor It');await eddie.click();assert.equal(await actions.getByRole('button',{name:'使用 Quick：Floor It',exact:true}).isEnabled(),true);await click('使用 Quick：Floor It');assert.equal(await eddie.evaluate(e=>e.classList.contains('is-spent')),true);assert.equal(await actions.getByRole('button',{name:'結束反應並結算',exact:true}).isVisible(),true);
  await legend('legend-v').click();await click('呼叫傳奇（1 €$）');await legend('legend-v').click();assert.equal(await legend('legend-v').getAttribute('aria-pressed'),'true','a legal Call may use its own ready Legend as payment');await click('確認呼叫傳奇（1 €$）');assert.equal(await legend('legend-v').evaluate(e=>e.classList.contains('face-down')),false);assert.equal(await legend('legend-v').locator('.v3-legend-state').innerText(),'SPENT');await click('結束反應並結算');assert.deepEqual(errors,[]);
  console.log('PASS direct Eddie Quick payment and self-paid Call during a real defensive reaction, followed by combat resolution');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
