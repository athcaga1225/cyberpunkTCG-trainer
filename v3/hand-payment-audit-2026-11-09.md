# 桌面手牌與付款操作整理

## 行為

- 手牌滑過時只抬高牌面，不加外光暈。滑鼠點選後保留高度，選取框內使用固定 SVG 勾號；移除手牌的原生卡名 title，保留 ARIA 名稱與卡片預覽。
- 選牌付款時，Eddies 區及可付款傳奇標出黃色框線。提示明列尚需選取的資源數，資源不足時顯示可用數與費用。付款仍完全由玩家選取，確認才消耗，取消不消耗。
- 付款面板內的 select 限制寬度，保留箭頭空間，長目標名稱不再把箭頭擠出面板。
- 網站加入原創 N 字 favicon，提供 SVG、32px PNG/ICO 與 180px Apple touch icon。
- 桌面樣式維持 battle-wide 範圍與既有六種字級，不新增 CSS priority flags；教學網站樣式保持獨立。

## 接續策略改善

對手攻擊已使用單位時，從合法且可擊敗的目標中優先選較高戰力的單位，不再依場上陣列順序選第一張。Chrome 保護下沒有可搶委託骰時，不浪費一次攻擊。只使用公開場面，不讀對方隱藏手牌、牌庫或蓋牌傳奇身份；這是有限的決定性策略，不代表完成勝率最佳化。

## 驗證

- `v3-hand-payment.browser.cjs`：hover/選取高度、無光暈與原生 title、SVG 勾號、逐步付款、取消不消耗、資源不足提示、實際出牌、長選項箭頭與 favicon。
- `v3-readable-controls.browser.cjs`、`v3-table-refinement.browser.cjs`、`v3-eddie-orientation.browser.cjs`：控制項、疊牌命中、資源固定位置與方向。
- `v3-style-isolation.browser.cjs`：教學頁與遊戲往返後維持相同樣式。
- `v3-mirror-combat.test.js`：威脅優先、受保護委託骰、唯讀規劃及隱藏資訊獨立性。
- 原有 17 組原生測試與四組各 100 場固定種子完整對局通過。
