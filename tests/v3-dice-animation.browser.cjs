// Requires Playwright and a static server. V3_TEST_URL may target GitHub Pages.
'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto((process.env.V3_TEST_URL||'http://127.0.0.1:8001/v3/')+'#battle');
  await page.evaluate(()=>{const rolls=[.95,.1];Math.random=()=>rolls.length?rolls.shift():.5});
  const dice=page.locator('#v3DiceAnimation'),controls=page.locator('#v3TableControls');
  await page.getByRole('button',{name:'雙方擲 d20 決定選擇權',exact:true}).click();
  assert.equal(await dice.getAttribute('data-phase'),'result');
  assert.deepEqual(await dice.locator('.v3-die').evaluateAll(nodes=>nodes.map(n=>n.dataset.result)),['20','3']);
  assert.equal(await page.evaluate(()=>window.NCTV3Dice.rolling),false);
  assert.equal(await dice.locator('.v3-die').first().evaluate(el=>getComputedStyle(el).animationName),'none');
  await page.waitForTimeout(900);
  assert.equal(await dice.getAttribute('data-phase'),'result');
  assert.deepEqual(await dice.locator('.v3-die b').allTextContents(),['20','3']);
  await page.screenshot({path:process.env.V3_DICE_SCREENSHOT||'/tmp/v3-dice-result.png'});
  await page.getByRole('button',{name:'我方選擇先攻',exact:true}).click();
  await controls.getByRole('button',{name:'重置資源',exact:true}).click();
  await controls.getByRole('button',{name:'抽 1 張',exact:true}).click();
  await controls.getByRole('button',{name:'擲骰',exact:true}).click();
  assert.equal(await dice.getAttribute('data-phase'),'result');
  await page.waitForTimeout(900);
  assert.match(await dice.locator('[role=status]').innerText(),/我方 d4：3/);
  assert.match(await controls.innerText(),/擲出 d4，點數 3/);
  await controls.getByRole('button',{name:'結束回合',exact:true}).click();
  await page.waitForTimeout(950);assert.equal(await dice.getAttribute('data-phase'),'result');
  await page.waitForTimeout(900);assert.match(await dice.locator('[role=status]').innerText(),/對手 d4：3/);
  assert.match(await controls.innerText(),/鏡像對手完成回合/);
  console.log('PASS still dice, immediate committed results and automatic mirror roll');
  // Tie rolls also animate and leave the opening unresolved.
  await page.reload();await page.evaluate(()=>Math.random=()=>.5);
  await page.getByRole('button',{name:'雙方擲 d20 決定選擇權',exact:true}).click();
  await page.waitForTimeout(900);assert.deepEqual(await dice.locator('.v3-die b').allTextContents(),['11','11']);
  assert.equal(await page.getByRole('button',{name:'雙方擲 d20 決定選擇權',exact:true}).count(),1);
  // All supported dice settle on supplied values without consuming randomness.
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const sides of [4,6,8,10,12,20]){
   await page.evaluate(sides=>{Math.random=()=>{throw Error('animation consumed game randomness')};window.NCTV3Dice.show([{label:'我方',sides,value:sides}])},sides);
   assert.equal(await dice.getAttribute('data-phase'),'result');assert.equal(await dice.locator('.v3-die b').innerText(),String(sides));
   assert.equal(await page.evaluate(()=>window.NCTV3Dice.rolling),false);
  }
  await page.evaluate(()=>window.NCTV3Dice.cancel());assert.equal(await dice.isHidden(),true);
  assert.deepEqual(errors,[]);console.log('PASS ties, six die types, reduced motion, cancellation and independent animation randomness');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
