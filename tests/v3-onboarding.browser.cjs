'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:Number(process.env.V3_TEST_WIDTH)||1440,height:Number(process.env.V3_TEST_HEIGHT)||900},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto((process.env.V3_TEST_URL||'http://127.0.0.1:8003/v3/')+'#battle');
  assert.equal(await page.locator('.v3-start-guide').count(),0,'no pre-match instruction wall');
  await page.evaluate(()=>{let r=[.95,.1];Math.random=()=>r.length?r.shift():.5});
  await page.getByRole('button',{name:'雙方擲 d20 決定選擇權',exact:true}).click();
  await page.getByRole('button',{name:'我方選擇先攻',exact:true}).click();
  const coach=page.locator('#v3TableGuide'),ctl=page.locator('#v3TableControls');
  assert.equal(await coach.isVisible(),true);assert.equal(await coach.getAttribute('data-mode'),'tour');
  assert.equal(await page.locator('.player-fixer.v3-guide-active').count(),1);
  await page.screenshot({path:'/tmp/v3-table-coach.png'});
  for(const zone of ['.player-hand','.player-eddies','#v3TableControls']){
   await coach.getByRole('button',{name:'下一步 →',exact:true}).click();
   assert.equal(await page.locator(zone+'.v3-guide-active').count(),1);
   const bounds=await page.evaluate(()=>{const r=document.getElementById('v3TableGuide').getBoundingClientRect();return {right:r.right,bottom:r.bottom,left:r.left,top:r.top,w:innerWidth,h:innerHeight}});
   assert(bounds.left>=0&&bounds.top>=0&&bounds.right<=bounds.w&&bounds.bottom<=bounds.h,'coach remains inside viewport');
  }
  await coach.getByRole('button',{name:'開始實戰',exact:true}).click();assert.equal(await coach.getAttribute('data-mode'),'live');
  assert.equal(await coach.getAttribute('data-step'),'ready');
  await ctl.getByRole('button',{name:'重置資源',exact:true}).click();assert.equal(await coach.getAttribute('data-step'),'draw');
  await coach.getByRole('button',{name:'關閉桌面引導',exact:true}).click();assert.equal(await coach.isHidden(),true);assert.equal(await page.locator('.v3-guide-active').count(),0);
  await ctl.getByRole('button',{name:'抽 1 張',exact:true}).click();
  await ctl.getByRole('button',{name:'開啟桌面引導',exact:true}).click();
  await coach.getByRole('button',{name:'略過說明，直接操作',exact:true}).click();assert.equal(await coach.getAttribute('data-step'),'roll');
  await page.setViewportSize({width:1280,height:720});await page.waitForTimeout(100);
  const collisions=await page.evaluate(()=>{const r=document.getElementById('v3TableGuide').getBoundingClientRect();return [...document.querySelectorAll('.player-hand,.player-legends,.opponent-legends,#v3TableControls,.v3-played-card')].some(el=>{const b=el.getBoundingClientRect();return r.left<b.right&&r.right>b.left&&r.top<b.bottom&&r.bottom>b.top})});
  assert.equal(collisions,false,'coach avoids cards and tabletop action controls');
  await coach.getByRole('button',{name:'關閉桌面引導',exact:true}).click();await ctl.getByRole('button',{name:'擲骰',exact:true}).click();assert.match(await ctl.innerText(),/主要階段/);
  assert.deepEqual(errors,[]);console.log('PASS tabletop tour, colored frames, next, close, free actions, reopen, real-state progression, resize and card/control clearance');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
