'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:Number(process.env.V3_TEST_WIDTH)||1440,height:Number(process.env.V3_TEST_HEIGHT)||900},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto((process.env.V3_TEST_URL||'http://127.0.0.1:8004/v3/')+'#battle');await page.getByRole('combobox',{name:'選擇開局方式',exact:true}).selectOption('basic');await page.evaluate(()=>{let r=[.95,.1];Math.random=()=>r.length?r.shift():.5});
  await page.getByRole('button',{name:'雙方擲 d20 決定選擇權',exact:true}).click();await page.getByRole('button',{name:'我方選擇先攻',exact:true}).click();await page.getByRole('button',{name:'略過說明，直接操作',exact:true}).click();
  const ctl=page.locator('#battleTour');
  const prep=async()=>{for(const name of ['重置資源','抽 1 張','擲骰'])await ctl.getByRole('button',{name,exact:true}).click()};
  const hand=async name=>{await page.locator('.player-hand [data-card-name="'+name+'"]').first().focus();await page.keyboard.press('Enter')};
  await prep();await hand('Kiroshi Optics');await ctl.getByRole('button',{name:'變賣',exact:true}).click();await hand('Secondhand Bombus');
  await ctl.locator('.v3-eddie-token:not(:disabled)').click();await ctl.locator('.player-legends .v3-legend-card.is-payment-available').first().click();await ctl.getByRole('button',{name:'打出單位',exact:true}).click();await ctl.getByRole('button',{name:'結束回合',exact:true}).click();
  await ctl.getByRole('button',{name:'重置資源',exact:true}).waitFor();await prep();await ctl.getByRole('button',{name:'結束回合',exact:true}).click();
  const end=ctl.getByRole('button',{name:'結束反應並結算',exact:true});await end.waitFor();
  assert.equal(await page.locator('#v3TableGuide').getAttribute('data-step'),'defense');assert.equal(await page.locator('.v3-combat-attacker').count(),1);assert.equal(await page.locator('.player-gigs.v3-combat-target').count(),1);
  await page.getByRole('button',{name:'關閉桌面引導',exact:true}).click();await page.waitForTimeout(1100);assert.equal(await end.count(),1,'closing guide does not skip defense or restart AI');
  await hand('Reboot Optics');const quick=ctl.getByRole('button',{name:'使用 Quick：Reboot Optics',exact:true});assert.equal(await quick.isDisabled(),true);
  await ctl.locator('.v3-eddie-token.is-payment-available').click();await ctl.locator('.player-legends .v3-legend-card.is-payment-available').first().click();await quick.click();assert.equal(await end.count(),1,'Quick keeps reaction open');
  await page.locator('.player-field .v3-played-card').click();assert.equal(await page.locator('.player-field .v3-combat-target').count(),1,'Blocker redirects target');
  await page.screenshot({path:'/tmp/v3-defense.png'});await end.click();await ctl.getByRole('button',{name:'重置資源',exact:true}).waitFor();
  assert.equal(await page.locator('.player-field .v3-played-card').count(),1,'Reboot protects Blocker');assert.match(await page.locator('.player-field .v3-played-card').innerText(),/SPENT/);assert.match(await page.locator('.player-gigs [data-practice-indicator]').innerText(),/2 顆/);assert.match(await ctl.innerText(),/Reboot Optics 保護已套用/);assert.equal(await page.locator('.v3-combat-attacker').count(),0);
  assert.deepEqual(errors,[]);console.log('PASS real mirror second-turn attack, stable defense pause, guide close, exact Quick payment, Blocker redirection, protection and automatic handoff');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
