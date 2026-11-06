'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:Number(process.env.V3_TEST_WIDTH)||1440,height:Number(process.env.V3_TEST_HEIGHT)||900},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto((process.env.V3_TEST_URL||'http://127.0.0.1:8005/v3/')+'#battle');
  const selectCSS=await page.locator('#v3OpeningSetup select').first().evaluate(el=>{const s=getComputedStyle(el);return {appearance:s.appearance,position:s.backgroundPosition,padding:s.paddingRight}});
  assert.equal(selectCSS.appearance,'none');assert.match(selectCSS.position,/16px/);assert(parseFloat(selectCSS.padding)>=40);
  const roll=page.getByRole('button',{name:'雙方擲 d20 決定選擇權',exact:true});
  const style=await roll.evaluate(el=>{const s=getComputedStyle(el);return {display:s.display,align:s.alignItems,justify:s.justifyContent,shrink:s.flexShrink,bg:s.backgroundImage,border:s.borderBottomWidth}});
  assert.equal(style.display,'flex');assert.equal(style.align,'center');assert.equal(style.justify,'center');assert.equal(style.shrink,'0');assert.match(style.bg,/linear-gradient/);assert.equal(style.border,'3px');
  await page.screenshot({path:'/tmp/v3-opening-controls.png'});
  await page.evaluate(()=>{let r=[.95,.1];Math.random=()=>r.length?r.shift():.5});await roll.click();
  for(const name of ['我方選擇先攻','我方選擇後攻'])assert.equal(await page.getByRole('button',{name,exact:true}).evaluate(el=>getComputedStyle(el).alignItems),'center');
  await page.screenshot({path:'/tmp/v3-order-buttons.png'});
  await page.getByRole('button',{name:'我方選擇先攻',exact:true}).click();
  assert.match(await page.locator('#v3TableGuide').innerText(),/先重置、抽牌/);
  await page.getByRole('button',{name:'關閉桌面引導',exact:true}).click();
  const ctl=page.locator('#v3TableControls'),d6=page.getByRole('button',{name:'選擇 d6 委託骰',exact:true});
  await d6.click();assert.match(await ctl.innerText(),/先按右側「重置資源」/);assert.equal(await page.locator('.player-gigs strong').innerText(),'0 / 7');
  await ctl.getByRole('button',{name:'重置資源',exact:true}).click();await d6.click();assert.match(await ctl.innerText(),/先按右側「抽 1 張」/);
  await ctl.getByRole('button',{name:'抽 1 張',exact:true}).click();
  assert.equal(await page.getByRole('button',{name:'選擇 d20 委託骰',exact:true}).isDisabled(),true);
  await d6.click();assert.equal(await d6.getAttribute('aria-pressed'),'true');assert.equal(await ctl.getByRole('combobox',{name:'選擇合事佬骰子'}).inputValue(),'6');
  await ctl.getByRole('combobox',{name:'選擇合事佬骰子'}).selectOption('8');assert.equal(await page.getByRole('button',{name:'選擇 d8 委託骰',exact:true}).getAttribute('aria-pressed'),'true');
  await d6.click();await page.screenshot({path:'/tmp/v3-dice-choice.png'});await ctl.getByRole('button',{name:'擲骰',exact:true}).click();
  assert.match(await page.locator('.player-gigs .v3-gig-values').innerText(),/d6 = 4/);assert.equal(await d6.isDisabled(),true);assert.deepEqual(errors,[]);
  console.log('PASS inset select arrows, raised/centered opening buttons, preparation order feedback, direct die selection, select synchronization, d20 restriction and committed d6 roll');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
