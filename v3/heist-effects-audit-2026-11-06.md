# V3 傳奇與 The Heist 能力驗證（2026-11-06）

本輪依官方 Comprehensive Rules 與官方卡牌頁實作。卡牌屬性另外核對官方網站前端使用的公開 NetDeck API（`https://api.netdeck.gg/api/cards/cyberpunk/{slug}`），包含三張傳奇皆有 Sell Tag；翻開後仍可支付資源。

## 已接入鏡像實戰

| 卡牌 | 本輪處理 | 官方卡牌頁 |
|---|---|---|
| Viktor Vektor: Sit Down and Relax | 呼叫後搜尋牌庫頂最多五張，玩家選最多兩張費用不超過二的裝備；其餘隨機放回牌庫底，搜尋本身不算抽牌。 | https://cyberpunktcg.com/cards/viktor-vektor-sit-down-and-relax |
| V: Corporate Exile | 翻開後可支付五資源 Go Solo，保留裝備、作為就緒單位進場並可立即攻擊；離場的傳奇移出遊戲，擊敗時附加裝備留在棄牌區。 | https://cyberpunktcg.com/cards/v-corporate-exile |
| Jackie Welles: Pour One Out For Me | 記錄每回合第一次藍色單位／裝備，包括翻開 Jackie 前的出牌；可降低友方骰最多二，確實從非最低降到最低才抽牌。Go Solo 進場也屬於打出藍色單位。 | https://cyberpunktcg.com/cards/jackie-welles-pour-one-out-for-me |
| Evelyn Parker: Scheming Siren | 攻擊時抽一；比較當時街頭聲望，較高時由玩家選一張手牌棄置。先處理攻擊觸發，再進入對手防守。 | https://cyberpunktcg.com/cards/evelyn-parker-scheming-siren |
| Kiroshi Optics | 攻擊時選一張友方蓋牌傳奇私下查看；不翻開、也不永久顯示卡名，只保留已知位置標記。 | https://cyberpunktcg.com/cards/kiroshi-optics |
| T-Bug: Amateur Philosopher | 擊敗後查看全部友方蓋牌傳奇，再提供可略過的免費呼叫；仍受每回合一次限制。 | https://cyberpunktcg.com/cards/t-bug-amateur-philosopher |
| Dexter DeShawn: One Last Chance | 保留原登場調骰；新增攻擊調骰、擊敗時數值街頭聲望差距至少十的抽二。Null 不參與數值差距運算。 | https://cyberpunktcg.com/cards/dexter-deshawn-one-last-chance |
| MT0D12 Flathead | 友方街頭聲望較低時禁止攔截，包含 Null 與數字的比較。 | https://cyberpunktcg.com/cards/mt0d12-flathead |
| Delamain Cab | 記錄實際搶骰，自己回合結束時讓玩家選 Eddie 重置；處理完才交接。 | https://cyberpunktcg.com/cards/delamain-cab |
| Dying Night: V's Pistol | 攻擊時可降低任一方委託骰最多二；裝備於場上的 V 時，自己回合結束可重置兩張 Eddie。 | https://cyberpunktcg.com/cards/dying-night-v-s-pistol |

## 時機與操作

- 呼叫可在我方主要階段或防守 React Step 進行，每一個玩家回合各計一次，包含免費呼叫。
- 呼叫支付不會重置傳奇，翻開保留支付後的就緒／橫置狀態。
- 桌面傳奇依開局隨機排列，蓋牌 UI 使用位置，不提供卡名預選。
- 攻擊能力需要選擇時，先等該玩家選擇，再交給防守方；同一方有多個待結算能力時可選順序；先完成目前效果，再依回合玩家優先的順序處理雙方能力（10.12–10.14）。
- 待結算能力期間禁止出新牌、交接或提前結束反應。關閉引導不會略過選擇。
- Go Solo 的 Lag 仍存在，但保留本回合可攻擊的權限。
- 規則參考：https://cyberpunktcg.com/comprehensive-rules （2.10、4.4、4.12、9.5–9.6、10、11.11、11.25）。

## 仍未支援

Zetatech Faceplate 與 Tetratronic Rippler 的橫置觸發尚未接入，保留 deferred 標記。其場上單位會限制鏡像戰鬥；若裝在傳奇上，支付該傳奇或使對手單位橫置的動作會拒絕，不會跳過觸發。舊固定腳本不支援本輪新增的攻擊／擊敗能力，會拒絕相應結算。鏡像對手仍為有限策略，尚未建立主動呼叫／Go Solo 的決策策略；其既有觸發選擇由系統處理。正式洗牌、Mulligan 與 Overtime 不在本輪範圍。

## 測試

`tests/v3-heist-effects.test.js` 覆蓋合法／非法支付、搜尋與牌庫底、空牌庫搜尋、每回合次數、Go Solo 立即攻擊與離場、私下查看、Jackie 首次藍牌時機、同時攻擊觸發順序、棄牌、免費呼叫、低聲望不可攔截、擊敗抽牌、回合結束重置，以及觸發抽牌失敗。

`tests/v3-legends.browser.cjs` 從實際開局操作付費呼叫、Viktor 選牌、V 的 Go Solo，以及 Evelyn 與 Kiroshi 的攻擊觸發、私下查看、棄牌與搶骰。既有回歸另行執行，不能據此宣稱全部卡牌與完整對局已驗證。
