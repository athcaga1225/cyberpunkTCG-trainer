# NIGHT CITY TRAINING V3｜Beta 卡牌能力對照稽核
日期：2026-11-03

## 範圍與驗收標準

- **範圍：** Beta 172 個 B 編號印刷條目（含 B005A／B005B），Box Topper T001–T006，共 **178** 筆。
- **完成的工作：** 逐條對照資料庫中 178 筆英文能力與繁中能力，檢查觸發標示、費用與效果數值、友方／對手對象、選擇／條件、優先順序、可選擇性、每回合次數，以及與其他印刷條目相同效果的翻譯一致性；確定的誤解已於 V3 顯示層修正。
- **版本差異：** 共有 **146** 段不同的英文能力；相同英文效果的所有條目，其共用資料繁中內容均一致。資料中帶有獨立 Retail 英文記錄的 8 筆相符，其餘不能當作逐張驗證完成。
- **重要限制：** 下表的「已對照」表示對照儲存庫內既有**英文來源文字**，**不代表逐張比對了官方最新卡牌印刷頁或實體卡面**。官方勘誤依 https://cyberpunktcg.com/errata ；每張卡仍應以其官方卡牌頁當前內容為準。
- **翻譯保存：** 變更只在 V3 的 `v3/beta-gallery.js`；`beta-cards.json` 和 V2 不修改，原本卡名與卡圖不修改。

## 已確認的必要修正／勘誤

| 卡號 | 卡名 | 處理 |
|---|---|---|
| B014 | Meredith Stout: Stone Cold Corpo | 明確說明「對手調整／交換對手自己控制的委託骰」，避免「友方」指涉不清 |
| B070 | The Heist | 先選擇裝備；費用符合時可「改為」免費打出，與加入手牌為替代選項 |
| B134 | Nocturne OP55 N1 | 「可以使用」Go Solo 的可選擇性與最低費用 |
| B135 | Pyramid Song | 條件成立時兩項效果都執行 |
| B138／B167 | Towerfall | 條件成立時兩項效果都執行 |
| B139 | Trust No One | 先調整委託骰，然後檢查最低點數條件 |
| B159 | Johnny Silverhand: Never Stop Fighting | 官方 Beta Iconic 的 Sell 標記誤印；只對此印刷版本顯示提示 |
| B061 | Kiroshi Optics | 官方已統一裝備對象提示，目前的英文參考與中文一致 |

## 逐張核對清單

「已對照」為同一版現存英文資料與繁中語意的校對，不表示獨立官方來源核實。

| 卡號 | 英文卡名 | 對照結果／備註 |
|---|---|---|
| B001 | Adam Smasher: Ender of Legends | 已對照；同效果印刷版本一致 |
| B002 | Dexter DeShawn: Off the Grid | 已對照；同效果印刷版本一致 |
| B003 | Johnny Silverhand: Rocking Renegade | 已對照；同效果印刷版本一致 |
| B004 | Royce: Psycho on the Edge | 已對照；同效果印刷版本一致 |
| B005A | V: Streetkid | 已對照；同效果印刷版本一致 |
| B005B | V: Streetkid | 已對照；同效果印刷版本一致 |
| B006 | 6th Street Recruits | 已對照 |
| B007 | Animals Wrecker | 已對照 |
| B008 | Chrome Fang | 已對照 |
| B009 | El Sombrerón: La Venganza Lenta | 已對照 |
| B010 | Japantown Jonin | 已對照 |
| B011 | Johnny Silverhand: Never Stop Fighting | 已對照；同效果印刷版本一致 |
| B012 | Kerry Eurodyne: The Last Rockerboy | 已對照 |
| B013 | La Llorona: Ghost of the Past | 已對照 |
| B014 | Meredith Stout: Stone Cold Corpo | 已釐清對手控制的委託骰 |
| B015 | Octant | 已對照 |
| B016 | Royce: Don't Call Me Simon | 已對照 |
| B017 | Ruthless Lowlife | 已對照 |
| B018 | Screw: Lovelorn Fool | 已對照 |
| B019 | Swordwise Huscle | 已對照 |
| B020 | V: Roamer of the Badlands | 已對照 |
| B021 | Valentino Guerrera | 已對照 |
| B022 | Yorinobu Arasaka: Steel Dragon | 已對照 |
| B023 | Arasaka Emergency Radioport | 已對照 |
| B024 | Deadman Transmitter | 已對照 |
| B025 | Mantis Blades | 已對照 |
| B026 | Satori: Sword of Saburo | 已對照 |
| B027 | All is Lost | 已對照 |
| B028 | Appetite for Destruction | 已對照 |
| B029 | Bonnie and Clyde | 已對照 |
| B030 | Carnage at the Colosseum | 已對照 |
| B031 | Detonate | 已對照 |
| B032 | Gunpoint Diplomacy | 雙效果與對手選擇條件已覆核 |
| B033 | Industrial Assembly | 已對照 |
| B034 | Over the Edge | 已對照 |
| B035 | Shattered Memories | 已對照 |
| B036 | Dum Dum: Maelstrom Triggerman | 已對照；同效果印刷版本一致 |
| B037 | Kerry Eurodyne: Axe, Attitude, Audience | 已對照；同效果印刷版本一致 |
| B038 | Muamar Reyes: El Capitán | 已對照；同效果印刷版本一致 |
| B039 | River Ward: Detective on the Hunt | 已對照；同效果印刷版本一致 |
| B040 | Rogue Amendiares: Preem Solo | 已對照；同效果印刷版本一致 |
| B041 | Adam Smasher: Metal Over Meat | 已對照；同效果印刷版本一致 |
| B042 | Alt Cunningham: Mother of Daemons | 已對照；同效果印刷版本一致 |
| B043 | Augmented Negotiators | 已對照 |
| B044 | Caliber: Totentanz's Top Dog | 已對照 |
| B045 | Gilded Matón | 已對照 |
| B046 | Hanako Arasaka: In a Gilded Cage | 已對照；同效果印刷版本一致 |
| B047 | Heywood Ripperdoc | 已對照 |
| B048 | Jackie Welles: Ride or Die Choom | 已對照 |
| B049 | Maelstrom Goons | 已對照 |
| B050 | MaxTac Suppression Team | 已對照 |
| B051 | Offduty Malfini | 已對照 |
| B052 | Rockn' Rockerboy | 已對照 |
| B053 | Secondhand Bombus | 已對照 |
| B054 | Sketchy Ripper | 已對照 |
| B055 | T-Bug: Amateur Philosopher | 已對照 |
| B056 | Trauma Team Operatives | 已對照 |
| B057 | Viktor Vektor: Drop Your Illusions | 已對照 |
| B058 | Viktor Vektor: You Might Feel a Little Pinch | 已對照 |
| B059 | Adrenaline Converter | 已對照 |
| B060 | Gorilla Arms | 已對照 |
| B061 | Kiroshi Optics | 官方裝備對象勘誤已核對 |
| B062 | Mandibular Upgrade | 已對照 |
| B063 | The Relic: Experimental Biochip | 已對照；同效果印刷版本一致 |
| B064 | Zetatech Faceplate | 已對照 |
| B065 | Afterparty at Lizzie's | 已對照 |
| B066 | Bootleg Black Sapphire Show | 已對照 |
| B067 | Cyberpsychosis | 已對照 |
| B068 | Live with the Aftermath | 已對照 |
| B069 | Safety Override | 已對照 |
| B070 | The Heist | 已釐清加入手牌／免費打出的替代關係 |
| B071 | Goro Takemura: Vengeful Bodyguard | 已對照；同效果印刷版本一致 |
| B072 | Hanako Arasaka: Daughter of the Emperor | 已對照；同效果印刷版本一致 |
| B073 | Jackie Welles: Mama's Favorite | 已對照；同效果印刷版本一致 |
| B074 | Padre: Man of the Cross | 已對照；同效果印刷版本一致 |
| B075 | Panam Palmer: Nomad Cavalry | 已對照；同效果印刷版本一致 |
| B076 | Corpo Security | 已對照 |
| B077 | Emergency Atlus | 已對照 |
| B078 | Field Operator | 已對照 |
| B079 | Maelstrom Zealots | 已對照 |
| B080 | MaxTac AV | 已對照 |
| B081 | MaxTac Heavy | 已對照 |
| B082 | MaxTac Squadron | 已對照 |
| B083 | Nadia: Fighting Through Grief | 已對照 |
| B084 | Pacifica Netrunner | 已對照 |
| B085 | Panam Palmer: Strength Through Family | 已對照；同效果印刷版本一致 |
| B086 | Pepe Najarro: Working Doubles | 已對照 |
| B087 | Riding Nomad | 已對照 |
| B088 | Sandayu Oda: Hanako's Guardian | 已對照；同效果印刷版本一致 |
| B089 | Saul Bright: Stormrider | 已對照 |
| B090 | Tyger's Whisper | 已對照 |
| B091 | Valentino Street Racer | 已對照 |
| B092 | Wraith Marauders | 已對照 |
| B093 | Overwatch: Panam's Gift | 已對照；同效果印刷版本一致 |
| B094 | Riot Shield | 已對照 |
| B095 | Sandevistan | 已對照 |
| B096 | Zetatech Berserk | 已對照 |
| B097 | Corporate Surveillance | 已對照 |
| B098 | (Don't Fear) The Reaper | 已對照 |
| B099 | Fool on the Hill | 已對照 |
| B100 | Memory Relapse | 已對照 |
| B101 | Peace Offering | 已對照 |
| B102 | Synapse Burnout | 已對照 |
| B103 | Take Control | 已對照 |
| B104 | We Gotta Live Together | 已對照 |
| B105 | Wild in the Streets | 已對照 |
| B106 | Alt Cunningham: Soulkiller Architect | 已對照；同效果印刷版本一致 |
| B107 | Evelyn Parker: Beautiful Enigma | 已對照；同效果印刷版本一致 |
| B108 | Judy Álvarez: Braindance Maestro | 已對照；同效果印刷版本一致 |
| B109 | Sasha Yakovleva: Won't Let You Down | 已對照；同效果印刷版本一致 |
| B110 | Wakako Okada: Peace and Harmony | 已對照；同效果印刷版本一致 |
| B111 | Delamain: Rideshare AI | 已對照 |
| B112 | Delamain Cab | 已對照 |
| B113 | Evelyn Parker: Scheming Siren | 已對照 |
| B114 | Hacked Corpo | 已對照 |
| B115 | Jacked-In Voodoo Boy | 已對照 |
| B116 | Judy Álvarez: Nothing to Doubt | 已對照；同效果印刷版本一致 |
| B117 | Lizzy Wizzy: Delicate Weapon | 已對照 |
| B118 | Maman Brigitte: Spirit of Death | 已對照 |
| B119 | Misty Olszewski: Mender of Broken Spirits | 已對照 |
| B120 | Modded Kusanagi | 已對照 |
| B121 | Modded Muramasa | 已對照 |
| B122 | Mox Inciters | 已對照 |
| B123 | Placide: Voodoo Sentinel | 已對照 |
| B124 | Psycho Squad | 已對照 |
| B125 | Rita Wheeler: No Stupid Questions | 已對照 |
| B126 | Rogue Amendiares: Queen of the Afterlife | 已對照；同效果印刷版本一致 |
| B127 | Westbrook Netrunner | 已對照 |
| B128 | Dying Night: V's Pistol | 已對照 |
| B129 | NetWatch Netdriver | 已對照 |
| B130 | Tetratronic Rippler | 已對照 |
| B131 | Chrome Reverie | 已對照 |
| B132 | Floor It | 已對照 |
| B133 | Les Élémens | 已對照 |
| B134 | Nocturne OP55 N1 | 已修正可選擇使用獨武俠 |
| B135 | Pyramid Song | 已修正兩項效果同時執行 |
| B136 | Reboot Optics | 已對照 |
| B137 | Three Mouths, One Desire | 已對照 |
| B138 | Towerfall | 已修正兩項效果同時執行 |
| B139 | Trust No One | 已補上先後結算順序 |
| B140 | Unlikely Bond | 已對照 |
| B141 | Adam Smasher: Ender of Legends | 已對照；同效果印刷版本一致 |
| B142 | Dexter DeShawn: Off the Grid | 已對照；同效果印刷版本一致 |
| B143 | Royce: Psycho on the Edge | 已對照；同效果印刷版本一致 |
| B144 | V: Streetkid | 已對照；同效果印刷版本一致 |
| B145 | Dum Dum: Maelstrom Triggerman | 已對照；同效果印刷版本一致 |
| B146 | Kerry Eurodyne: Axe, Attitude, Audience | 已對照；同效果印刷版本一致 |
| B147 | Muamar Reyes: El Capitán | 已對照；同效果印刷版本一致 |
| B148 | River Ward: Detective on the Hunt | 已對照；同效果印刷版本一致 |
| B149 | Rogue Amendiares: Preem Solo | 已對照；同效果印刷版本一致 |
| B150 | Goro Takemura: Vengeful Bodyguard | 已對照；同效果印刷版本一致 |
| B151 | Hanako Arasaka: Daughter of the Emperor | 已對照；同效果印刷版本一致 |
| B152 | Jackie Welles: Mama's Favorite | 已對照；同效果印刷版本一致 |
| B153 | Padre: Man of the Cross | 已對照；同效果印刷版本一致 |
| B154 | Panam Palmer: Nomad Cavalry | 已對照；同效果印刷版本一致 |
| B155 | Alt Cunningham: Soulkiller Architect | 已對照；同效果印刷版本一致 |
| B156 | Evelyn Parker: Beautiful Enigma | 已對照；同效果印刷版本一致 |
| B157 | Judy Álvarez: Braindance Maestro | 已對照；同效果印刷版本一致 |
| B158 | Wakako Okada: Peace and Harmony | 已對照；同效果印刷版本一致 |
| B159 | Johnny Silverhand: Never Stop Fighting | 另附官方 Beta Iconic 可變賣誤印勘誤 |
| B160 | Adam Smasher: Metal Over Meat | 已對照；同效果印刷版本一致 |
| B161 | Alt Cunningham: Mother of Daemons | 已對照；同效果印刷版本一致 |
| B162 | Hanako Arasaka: In a Gilded Cage | 已對照；同效果印刷版本一致 |
| B163 | The Relic: Experimental Biochip | 已對照；同效果印刷版本一致 |
| B164 | Sandayu Oda: Hanako's Guardian | 已對照；同效果印刷版本一致 |
| B165 | Overwatch: Panam's Gift | 已對照；同效果印刷版本一致 |
| B166 | Rogue Amendiares: Queen of the Afterlife | 已對照；同效果印刷版本一致 |
| B167 | Towerfall | 與 B138 保持一致 |
| B168 | Johnny Silverhand: Rocking Renegade | 已對照；同效果印刷版本一致 |
| B169 | Sasha Yakovleva: Won't Let You Down | 已對照；同效果印刷版本一致 |
| B170 | Panam Palmer: Strength Through Family | 已對照；同效果印刷版本一致 |
| B171 | Judy Álvarez: Nothing to Doubt | 已對照；同效果印刷版本一致 |
| T001 | Yorinobu Arasaka: Embracing Destruction | 已對照 |
| T002 | Viktor Vektor: Sit Down and Relax | 已對照 |
| T003 | Goro Takemura: Hands Unclean | 已對照 |
| T004 | Saburo Arasaka: Stubborn Patriarch | 已對照 |
| T005 | Jackie Welles: Pour One Out For Me | 已對照 |
| T006 | V: Corporate Exile | 已對照 |

## 下一個驗證門檻

1. 如需標示「官方最新文本逐張已核實」，必須逐張讀取官方指定印刷版本的當前英文全文，不能只依賴本地原始資料；確認後才可改變驗收狀態。
2. Retail 非同一印刷版，不能僅憑卡名相同或 Beta 翻譯相同就宣告 172 張全部獨立核實。
3. 遊戲規則引擎尚未支援每張卡片能力，翻譯完成不代表所有能力已可實戰結算。
