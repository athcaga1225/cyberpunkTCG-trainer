# 兩套起始牌組能力盤點（2026-11-17）

盤點基準：正式版 `ddde8b3f943abb96f69b98177856cec558010efd`。範圍是 The Heist 與 Embracing Power，各 17 種主牌與 3 種傳奇，共 **40 種卡牌**，兩套合計 86 張實體牌。已重新讀取 40 張官方頁面的現行英文文字，並核對費用與戰力；40 張數值均一致，官方文字與 11 月 10 日保留的快照相同。

## 結果與數量

| 分類 | 種數 | 意義 |
| --- | ---: | --- |
| 完全未接入或明確暫緩 | 0 | 沒有 `unimplementedEffect`／`deferredEffect` 為真的預設卡；傳奇均有對應處理。這不等於全部規則已正確。 |
| 受控起始牌組場景可重現缺口 | 7 | 涉及 A1–A3 三類問題，Over the Edge 同時列在 A1、A3，卡牌數只算一次。 |
| 觸發機制需強化 | 3 | A4 的隔離程式探針顯示時機不一致；未宣稱已找到會改變這兩套牌組對局結果的合法連動。 |
| 本次未重現額外缺口 | 30 | 有基本處理及代表／邊界測試；不是所有排列與連動都已窮舉。 |

本次是盤點與重現紀錄，**尚未修正以下能力問題**，也沒有改動桌面樣式或教學頁。先前「還有未支援卡牌要補」的進度描述不夠精確；目前待辦主要是已接入能力的規則完整性。

## 建議修正順序

### 1. A1：Over the Edge 的多顆 d20 判斷

- 目前以 `.find()` 取得第一顆友方 d20，再用它的值限制擊敗目標。
- 受控場景：友方同時控制值 2 與 18 的 d20，對手有戰力 6 的 Chrome Fang。兩顆骰的陣列順序為 `[2,18]` 時沒有目標，改為 `[18,2]` 時才可選 Chrome Fang。
- 官方要求是依「一顆友方 d20」的值判斷，不應因資料排列而禁止本來符合條件的目標。
- 修正方向：讓玩家選定友方 d20，或以存在可滿足條件的友方 d20 判斷合法目標；補雙 d20、反序、單顆與無 d20 的回歸。
- 來源：[官方卡文](https://cyberpunktcg.com/cards/over-the-edge)、[實作](../v3/battle-actions.js)。

### 2. A2：三張 The Heist 登場效果缺少待結算順序

涉及 **Dexter DeShawn、Heywood Ripperdoc、Offduty Malfini**。其登場效果在 `playUnit()` 內立即執行，沒有與支付時觸發的效果一同進入待結算佇列。官方規則 10.12、10.16.2 允許自己的多個待結算效果自行排序。

| 受控重現 | 目前 | 應能選擇的結果 |
| --- | --- | --- |
| Dexter 以裝有 Faceplate 的傳奇付款；友方骰值為 `[1,1,3,3,3]` | Dexter 先調第一顆至 2，之後 Faceplate 調第二顆至 2，沒有抽牌 | 可先讓 Faceplate 調第二顆至 2，形成三種不同值而抽 1，再讓 Dexter 調第一顆至 2；最後骰值相同但手牌結果不同 |
| Heywood 以 Faceplate 傳奇付款；友方骰全為 1；欲擊敗費用 2 的裝備 | 裝備已先被擊敗，抽牌條件未成立；之後才有 Faceplate 選擇 | 可先將友方骰調到 2，再結算 Heywood，符合條件而抽 1 |
| Offduty 以 Faceplate 傳奇付款 | 選擇待結算能力前，Offduty 與對手單位已被橫置 | Offduty 的登場效果應與付款觸發一起等待，依選定順序處理 |

重現場景保留每方 40 張主牌數與兩套共 12 顆骰，使用真實起始牌組的卡名、費用與能力；這是受控能力場景，不代表由天然起手完整走出的對局。

修正方向：統一將 Play 效果排入佇列，於結算時選擇目標與檢查條件，並保留原有付款驗證、AI 接續與 UI 操作。

### 3. A3：四張 Embracing Power 程式卡過早進入棄牌區

涉及 **Industrial Assembly、Over the Edge、Shattered Memories、Corporate Surveillance**。目前程式自己的效果仍待選擇時，該卡已在 `trash`，桌面棄牌區也會提前計數。

官方規則 **4.14.2** 指出，支付後到效果完成前，程式不屬於手牌、場地、棄牌或其他遊戲區域；效果完成後才進入棄牌。此處已確認狀態／顯示不符，尚未宣稱它已改變現有兩套牌組的最終勝負。

修正方向：增加明確的結算中卡牌記錄，完成整張程式後才移至棄牌；同步更新卡牌守恆檢查、公開棄牌檢視、抽空牌庫與中途結束對局的處理。

### 4. A4：三張 EP 登場能力的觸發機制強化

涉及 **Field Operator、Minotaur、Chrome Fang**：前兩者過早檢查條件，Chrome Fang 直接套用效果。現行官方規則 10.16.1.1 與 10.15.1 區分觸發與結算條件。

- Field Operator：隔離探針在觸發時給奇數聲望、結算前改為偶數，仍不抽牌。
- Minotaur：隔離探針在觸發時給較高聲望、結算前降為較低，仍保留擊敗選擇。
- Chrome Fang：`onPlay()` 返回前已套用保護，沒有等待登場效果結算。

這些探針直接模擬觸發／結算階段，**不是完整合法對局重播**。尚未找到目前兩套預設牌組中、可合法改變該間隔條件並改變結果的組合，因此與 A1–A3 分開列示。建議在統一 Play 佇列時一併處理，暫不稱為三張牌完全不能用。

## 逐卡清單

「未重現缺口」只代表本次範圍內未找到問題。卡名連結指向官方現行英文卡文；下表摘要不是完整翻譯。

驗證代號：HP = `v3-heist-practice.test.js`；HE = `v3-heist-effects.test.js`；SE = `v3-spend-effects.test.js`；MC = `v3-mirror-combat.test.js`；EP = `v3-embracing.test.js`；CR = `v3-starter-match.test.js`；REF = `v3-card-reference.test.js`。檔案均位於 [tests](../tests/)。

### The Heist（20 種）

| 卡牌 | 能力摘要 | 本次結果 | 既有驗證 |
| --- | --- | --- | --- |
| [Dexter DeShawn: One Last Chance](https://cyberpunktcg.com/cards/dexter-deshawn-one-last-chance) | 登場／攻擊調骰；被擊敗時依聲望差抽牌 | 待修 A2 | HP, HE |
| [Heywood Ripperdoc](https://cyberpunktcg.com/cards/heywood-ripperdoc) | 可擊敗裝備；對應友方骰值時抽牌 | 待修 A2 | HP, CR |
| [Offduty Malfini](https://cyberpunktcg.com/cards/offduty-malfini) | 登場橫置自己與對手單位 | 待修 A2 | HP, SE |
| [Secondhand Bombus](https://cyberpunktcg.com/cards/secondhand-bombus) | 攔截；零戰力不搶骰 | 已接入；未重現缺口 | MC, HE |
| [T-Bug: Amateur Philosopher](https://cyberpunktcg.com/cards/t-bug-amateur-philosopher) | 被擊敗後私看傳奇並可免費呼叫 | 已接入；未重現缺口 | HE, CR |
| [Kiroshi Optics](https://cyberpunktcg.com/cards/kiroshi-optics) | 攻擊時私看友方蓋牌傳奇 | 已接入；未重現缺口 | HE |
| [Mandibular Upgrade](https://cyberpunktcg.com/cards/mandibular-upgrade) | 提供戰力與 Blocker | 已接入；未重現缺口 | HP, MC |
| [Zetatech Faceplate](https://cyberpunktcg.com/cards/zetatech-faceplate) | 宿主橫置後調骰；三種不同點數時抽牌 | 已接入；未重現缺口 | SE |
| [Afterparty at Lizzie's](https://cyberpunktcg.com/cards/afterparty-at-lizzie-s) | 調整任一方委託骰；依不同點數抽牌 | 已接入；未重現缺口 | HP |
| [Delamain Cab](https://cyberpunktcg.com/cards/delamain-cab) | 自己回合結束，曾搶骰才重置 Eddie | 已接入；未重現缺口 | HE |
| [Evelyn Parker: Scheming Siren](https://cyberpunktcg.com/cards/evelyn-parker-scheming-siren) | 攻擊抽牌，再依聲望決定棄牌 | 已接入；未重現缺口 | HE |
| [MT0D12 Flathead](https://cyberpunktcg.com/cards/mt0d12-flathead) | 聲望較低時不能被攔截 | 已接入；未重現缺口 | MC, HE |
| [Psycho Squad](https://cyberpunktcg.com/cards/psycho-squad) | 基礎戰力；沒有額外文字能力 | 已接入；未重現缺口 | REF, HP |
| [Dying Night: V's Pistol](https://cyberpunktcg.com/cards/dying-night-v-s-pistol) | 攻擊降骰；V 宿主回合末重置 Eddies | 已接入；未重現缺口 | HE |
| [Tetratronic Rippler](https://cyberpunktcg.com/cards/tetratronic-rippler) | 宿主橫置後私看牌庫頂，可棄置 | 已接入；未重現缺口 | SE |
| [Floor It](https://cyberpunktcg.com/cards/floor-it) | 主階段／Quick 降低對手戰力並抽牌 | 已接入；未重現缺口 | HP, MC |
| [Reboot Optics](https://cyberpunktcg.com/cards/reboot-optics) | 主階段／Quick 保護下次交戰的友方單位 | 已接入；未重現缺口 | MC, EP |
| [Viktor Vektor: Sit Down and Relax](https://cyberpunktcg.com/cards/viktor-vektor-sit-down-and-relax) | 頂五找至多兩張低費裝備，其餘洗到底 | 已接入；未重現缺口 | HE, CR |
| [V: Corporate Exile](https://cyberpunktcg.com/cards/v-corporate-exile) | 付費 Go Solo；保留裝備並可當回合攻擊 | 已接入；未重現缺口 | HE, CR |
| [Jackie Welles: Pour One Out For Me](https://cyberpunktcg.com/cards/jackie-welles-pour-one-out-for-me) | 首次藍色出牌後可降友方骰，降至最小值抽牌 | 已接入；未重現缺口 | HE |

### Embracing Power（20 種）

| 卡牌 | 能力摘要 | 本次結果 | 既有驗證 |
| --- | --- | --- | --- |
| [Chrome Fang](https://cyberpunktcg.com/cards/chrome-fang) | 限制對手搶高於攻擊戰力的友方骰，至下次己方回合 | 機制強化 A4 | EP |
| [Minotaur](https://cyberpunktcg.com/cards/minotaur) | 登場時聲望較高則擊敗低戰力對手單位 | 機制強化 A4 | EP, CR |
| [Ruthless Lowlife](https://cyberpunktcg.com/cards/ruthless-lowlife) | 只能攻擊對手單位 | 已接入；未重現缺口 | EP |
| [Swordwise Huscle](https://cyberpunktcg.com/cards/swordwise-huscle) | 攻擊時依當前戰力門檻抽牌 | 已接入；未重現缺口 | EP |
| [Emergency Atlus](https://cyberpunktcg.com/cards/emergency-atlus) | 基礎戰力；沒有額外文字能力 | 已接入；未重現缺口 | EP, REF |
| [Field Operator](https://cyberpunktcg.com/cards/field-operator) | 登場時數值聲望為偶數才抽牌 | 機制強化 A4 | EP |
| [Goro Takemura: Losing His Way](https://cyberpunktcg.com/cards/goro-takemura-losing-his-way) | 攻擊時若友方傳奇皆正面，本回合加戰力 | 已接入；未重現缺口 | EP |
| [MaxTac AV](https://cyberpunktcg.com/cards/maxtac-av) | 可交換雙方委託骰，保留原值與身份 | 已接入；未重現缺口 | EP, CR |
| [Arasaka Emergency Radioport](https://cyberpunktcg.com/cards/arasaka-emergency-radioport) | 宿主橫置後可私看傳奇，符合條件可免費呼叫 | 已接入；未重現缺口 | EP, CR |
| [Mantis Blades](https://cyberpunktcg.com/cards/mantis-blades) | 裝備加戰力；沒有額外觸發能力 | 已接入；未重現缺口 | EP, REF |
| [Satori: Sword of Saburo](https://cyberpunktcg.com/cards/satori-sword-of-saburo) | 宿主贏得單位交戰後抽牌 | 已接入；未重現缺口 | EP, CR |
| [Industrial Assembly](https://cyberpunktcg.com/cards/industrial-assembly) | 增加任一方骰值，再檢查友方高骰抽牌 | 待修 A3 | EP |
| [Over the Edge](https://cyberpunktcg.com/cards/over-the-edge) | 按友方 d20 數值選擇可擊敗單位 | 待修 A1, A3 | EP, CR |
| [Shattered Memories](https://cyberpunktcg.com/cards/shattered-memories) | 雙方棄手牌並各自決定抽五，再檢查額外抽牌 | 待修 A3 | EP |
| [Corpo Security](https://cyberpunktcg.com/cards/corpo-security) | 不能攻擊，但可攔截 | 已接入；未重現缺口 | EP |
| [Sandevistan](https://cyberpunktcg.com/cards/sandevistan) | 己方回合末重置宿主單位或傳奇 | 已接入；未重現缺口 | EP |
| [Corporate Surveillance](https://cyberpunktcg.com/cards/corporate-surveillance) | 按費用篩選對手單位並橫置 | 待修 A3 | EP, CR |
| [Goro Takemura: Hands Unclean](https://cyberpunktcg.com/cards/goro-takemura-hands-unclean) | Go Solo、當回合可攻擊、攔截與離場移除 | 已接入；未重現缺口 | EP, CR |
| [Yorinobu Arasaka: Embracing Destruction](https://cyberpunktcg.com/cards/yorinobu-arasaka-embracing-destruction) | 每回合首次友方 ARASAKA 攻擊抽牌，再依聲望棄牌 | 已接入；未重現缺口 | EP, CR |
| [Saburo Arasaka: Stubborn Patriarch](https://cyberpunktcg.com/cards/saburo-arasaka-stubborn-patriarch) | 友方 ARASAKA 攻擊期間加戰力，含中途呼叫 | 已接入；未重現缺口 | EP, CR |

## 重現與使用限制

- 執行：`node scripts/audit-v3-starter-abilities.cjs`。輸出每個案例的觀察值、期望值與範圍，不修改遊戲檔案。
- 加上 `--check` 時，只要仍有落差就回傳非零。這是已知問題的診斷入口，**沒有加入要求全綠的 CI**；修正時應將對應案例轉成正式回歸測試，並依新的結算 API 更新操作步驟。
- [機器可讀盤點與本次觀察值](card-ability-inventory-2026-11-17.json) 收錄 40 張的來源、英文文字雜湊、數值比對、狀態與診斷輸出，不收錄整批官方英文全文。
- 本次重跑 HP、HE、SE、MC、EP、CR、REF 七組既有測試。既有測試通過不會抹除新增邊界案例揭露的缺口。
- 不把對手策略不足算成卡牌能力未實作；不涵蓋自訂牌組、整個官方卡池、手機與平板。
- 官方規則：[Comprehensive Rules](https://cyberpunktcg.com/comprehensive-rules)，本次重新核對 4.14.2、10.12、10.15.1、10.16.1.1。
