'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:720},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto((process.env.V3_TEST_URL||'http://127.0.0.1:8002/v3/')+'#battle');
  assert.match(await page.locator('#v3OpeningSetup').innerText(),/第一次玩/);
  assert.equal(await page.locator('#v3OpeningSetup select').count(),0,'start with instructions before settings');
  await page.screenshot({path:'/tmp/v3-onboarding.png'});
  await page.getByRole('button',{name:'略過引導，直接開局',exact:true}).click();
  assert.equal(await page.locator('#v3OpeningSetup .v3-opening-help p').count(),0);
  assert.equal(await page.locator('.v3-guide-active').count(),0);
  await page.evaluate(()=>{let r=[.95,.1];Math.random=()=>r.length?r.shift():.5});
  await page.getByRole('button',{name:'雙方擲 d20 決定選擇權',exact:true}).click();
  await page.getByRole('button',{name:'我方選擇先攻',exact:true}).click();
  assert.equal(await page.locator('.v3-live-guide p').count(),0);
  const ctl=page.locator('#v3TableControls');
  await ctl.getByRole('button',{name:'重置資源',exact:true}).click();
  await ctl.getByRole('button',{name:'開啟實戰引導',exact:true}).click();
  assert.equal(await page.locator('.v3-live-guide').getAttribute('data-step'),'draw');
  await ctl.getByRole('button',{name:'抽 1 張',exact:true}).click();
  assert.equal(await page.locator('.v3-live-guide').getAttribute('data-step'),'roll');
  console.log('PASS skip intro, play freely, resume guide at current real step');
  await page.reload();await page.getByRole('button',{name:'開始操作引導',exact:true}).click();
  assert.match(await page.locator('.v3-opening-help').innerText(),/往下按高亮/);
  assert.equal(await page.locator('#v3OpeningSetup button.v3-guide-active').innerText(),'雙方擲 d20 決定選擇權');
  await page.getByRole('button',{name:'略過引導',exact:true}).click();assert.equal(await page.locator('.v3-guide-active').count(),0);
  assert.deepEqual(errors,[]);console.log('PASS guided opening highlights real action and remains skippable');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
