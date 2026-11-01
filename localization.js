/* Fan-made learning translations, not official localization. */
(function(root){
'use strict';
const cardNames={"V: Corporate Exile":"V：企業流亡者","Viktor Vektor: Sit Down and Relax":"維克・威科特：坐下來放輕鬆","Jackie Welles: Pour One Out For Me":"阿傑・威爾斯：為我倒一杯","Dexter DeShawn: One Last Chance":"德克斯特・德尚：最後一次機會","Heywood Ripperdoc":"黑伍德神機醫","Offduty Malfini":"下班的馬爾菲尼","Secondhand Bombus":"二手蜂型機器人","T-Bug: Amateur Philosopher":"T-Bug：業餘哲學家","Kiroshi Optics":"喜呂志光學義眼","Mandibular Upgrade":"下顎升級組件","Zetatech Faceplate":"ZETA科技面罩","Afterparty at Lizzie's":"莉姿酒吧的續攤派對","Delamain Cab":"德拉曼計程車","Evelyn Parker: Scheming Siren":"伊芙琳・帕克：心機魅影","MT0D12 Flathead":"MT0D12 扁頭機器人","Psycho Squad":"瘋狂小隊","Dying Night: V's Pistol":"垂死之夜：V 的手槍","Tetratronic Rippler":"四度漣漪","Tetratonic Rippler":"四度漣漪","Floor It":"油門踩到底","Reboot Optics":"重啟義眼","Goro Takemura: Hands Unclean":"武村吾郎：雙手沾汙","Yorinobu Arasaka: Embracing Destruction":"荒坂賴宣：擁抱毀滅","Saburo Arasaka: Stubborn Patriarch":"荒坂三郎：頑固家主","Chrome Fang":"鍍鉻獠牙","Minotaur":"牛頭怪","Ruthless Lowlife":"狠毒混混","Swordwise Huscle":"精通刀劍的壯漢","Emergency Atlus":"緊急用阿特拉斯","Field Operator":"外勤幹員","Goro Takemura: Losing His Way":"武村吾郎：迷失方向","MaxTac AV":"鎮靜特勤組飛行載具","Arasaka Emergency Radioport":"荒坂緊急無線傳送站","Mantis Blades":"螳螂刀","Satori: Sword of Saburo":"覺：三郎之劍","Industrial Assembly":"工業裝配","Over the Edge":"瀕臨失控","Shattered Memories":"破碎的記憶","Corpo Security":"企業保全","Sandevistan":"沙德威斯坦","Corporate Surveillance":"企業監視系統"};
const diceNames={4:"四面骰",6:"六面骰",8:"八面骰",10:"十面骰",12:"十二面骰",20:"二十面骰"};
const cardName=name=>cardNames[name]||name;
const cardTitle=name=>cardNames[name]?cardNames[name]+"（"+name+"）":name;
const dieName=sides=>diceNames[Number(sides)]||String(sides)+"面骰";
const dieLabel=sides=>dieName(sides)+"（d"+sides+"）";
root.NCTLocale=Object.freeze({cardNames,diceNames,cardName,cardTitle,dieName,dieLabel});
})(typeof window!=="undefined"?window:globalThis);