'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:Number(process.env.V3_TEST_WIDTH)||1440,height:Number(process.env.V3_TEST_HEIGHT)||900},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  // Identity shuffle is only for repeatable tests; the app randomizes both legend rows.
  await page.addInitScript(()=>Math.random=()=>.999999);
  const url=(process.env.V3_TEST_URL||'http://127.0.0.1:8006/v3/')+'#battle';
  async function open(){await page.goto('about:blank');await page.goto(url);await page.getByRole('combobox',{name:'選擇開局方式',exact:true}).selectOption('basic');await page.evaluate(()=>{let r=[.95,.1];Math.random=()=>r.length?r.shift():.5});await page.getByRole('button',{name:'雙方擲 d20 決定選擇權',exact:true}).click();await page.getByRole('button',{name:'我方選擇先攻',exact:true}).click();await page.getByRole('button',{name:'略過說明，直接操作',exact:true}).click()}
  const ctl=page.locator('#battleTour');
  async function prep(){for(const name of ['重置資源','抽 1 張','擲骰'])await ctl.getByRole('button',{name,exact:true}).click()}
  async function hand(name){await page.locator('.player-hand [data-card-name="'+name+'"]').first().focus();await page.keyboard.press('Enter')}
  async function pay(n){for(let i=0;i<n;i++)await ctl.locator('.v3-eddie-token:not(:disabled),.v3-board-payments .v3-resource-choice').nth(i).click()}
  await open();await prep();
  assert.equal(await page.locator('.player-legends button[aria-label*="Viktor"]').count(),0,'face-down legend names stay hidden');
  await page.locator('.player-legends [data-legend-id="legend-viktor"]').click();await pay(1);await ctl.getByRole('button',{name:'呼叫傳奇（1 €$）',exact:true}).click();
  assert.match(await ctl.innerText(),/搜尋牌庫頂/);assert.equal(await ctl.getByRole('button',{name:'結束回合',exact:true}).count(),0,'pending search blocks unrelated actions');
  await ctl.getByRole('button',{name:'Tetratronic Rippler · 1 €$',exact:true}).click();await ctl.getByRole('button',{name:'確認搜尋（選取 1 / 2）',exact:true}).click();
  assert.equal(await page.locator('.player-legends button[aria-label="Viktor Vektor: Sit Down and Relax"]').count(),1);assert.match(await page.locator('.player-legends [data-legend-id="legend-viktor"]').innerText(),/SPENT/);
  await hand('Kiroshi Optics');await ctl.getByRole('button',{name:'變賣',exact:true}).click();await ctl.getByRole('button',{name:'結束回合',exact:true}).click();await ctl.getByRole('button',{name:'重置資源',exact:true}).waitFor();await prep();
  await page.locator('.player-legends [data-legend-id="legend-v"]').click();await pay(1);await ctl.getByRole('button',{name:'呼叫傳奇（1 €$）',exact:true}).click();assert.equal(await ctl.getByRole('button',{name:'Go Solo（5 €$）',exact:true}).isDisabled(),true);
  await hand('Mandibular Upgrade');await ctl.getByRole('button',{name:'變賣',exact:true}).click();await ctl.getByRole('button',{name:'結束回合',exact:true}).click();await ctl.getByRole('button',{name:'結束反應並結算',exact:true}).waitFor();await ctl.getByRole('button',{name:'結束反應並結算',exact:true}).click();await ctl.getByRole('button',{name:'重置資源',exact:true}).waitFor();await prep();
  await page.locator('.player-legends [data-legend-id="legend-v"]').click();await pay(5);await ctl.getByRole('button',{name:'Go Solo（5 €$）',exact:true}).click();
  assert.equal(await page.locator('.player-legends [data-legend-id="legend-v"]').count(),0);assert.equal(await page.locator('.player-field .v3-played-card').count(),1);assert.match(await page.locator('.player-field .v3-played-card').innerText(),/READY/);
  await page.locator('.player-field .v3-played-card').click();assert.equal(await ctl.getByRole('button',{name:'攻擊委託區',exact:true}).count(),1);await page.screenshot({path:'/tmp/v3-go-solo.png'});
  console.log('PASS real paid Call, Viktor choices, retained orientation, per-turn Call, face-up V and exact Go Solo deployment/attack permission');
  // A second actual game exercises attack-trigger order, private peeks and discard.
  await open();await prep();await hand('Mandibular Upgrade');await ctl.getByRole('button',{name:'變賣',exact:true}).click();await hand('Evelyn Parker: Scheming Siren');await pay(2);await ctl.getByRole('button',{name:'打出單位',exact:true}).click();await ctl.getByRole('button',{name:'結束回合',exact:true}).click();await ctl.getByRole('button',{name:'重置資源',exact:true}).waitFor();await prep();
  await hand('Kiroshi Optics');await pay(1);await page.locator('.player-field .v3-played-card').click();await page.locator('.player-field .v3-played-card').click();await ctl.getByRole('button',{name:'攻擊委託區',exact:true}).click();
  await ctl.getByRole('button',{name:'先結算：Kiroshi Optics',exact:true}).click();await ctl.getByRole('button',{name:'查看傳奇位置 2',exact:true}).click();assert.match(await ctl.innerText(),/位置 2：V: Corporate Exile/);assert.equal(await page.locator('.player-legends button[aria-label*="Corporate Exile"]').count(),0);
  await ctl.getByRole('button',{name:'看完，繼續',exact:true}).click();assert.match(await ctl.innerText(),/必須棄置/);await ctl.getByRole('button',{name:/^棄置：/}).first().click();
  assert.equal(await page.locator('.opponent-gigs strong').innerText(),'0 / 7');assert.equal(await page.locator('.player-gigs strong').innerText(),'3 / 7');assert.match(await page.locator('.player-legends [data-legend-id="legend-v"]').getAttribute('aria-label'),/已查看過/);assert.doesNotMatch(await ctl.innerText(),/位置 2：V/);
  assert.deepEqual(errors,[]);console.log('PASS real Evelyn + Kiroshi attack, owner-selected trigger order, private legend viewing, mandatory discard and resumed Gig steal');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
