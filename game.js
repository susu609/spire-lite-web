/* Spire Lite: no dependencies, no remote assets. Edit CARDS and ENEMIES to customize. */
'use strict';
const CARDS = {
 strike:{name:'Strike',cost:1,type:'attack',text:'Deal 6 damage.',damage:6},
 defend:{name:'Defend',cost:1,type:'skill',text:'Gain 5 Block.',block:5},
 bash:{name:'Bash',cost:2,type:'attack',text:'Deal 8 damage. Apply 2 Vulnerable.',damage:8,vulnerable:2},
 anger:{name:'Anger',cost:0,type:'attack',text:'Deal 6 damage. Add a copy to your discard pile.',damage:6,copyDiscard:true},
 armaments:{name:'Armaments',cost:1,type:'skill',text:'Gain 5 Block. Upgrade a card in hand.',block:5,upgradeHand:true},
 body_slam:{name:'Body Slam',cost:1,type:'attack',text:'Deal damage equal to your Block.',bodySlam:true},
 iron_wave:{name:'Iron Wave',cost:1,type:'attack',text:'Gain 5 Block. Deal 5 damage.',damage:5,block:5},
 pommel_strike:{name:'Pommel Strike',cost:1,type:'attack',text:'Deal 9 damage. Draw 1 card.',damage:9,draw:1},
 shrug_it_off:{name:'Shrug It Off',cost:1,type:'skill',text:'Gain 8 Block. Draw 1 card.',block:8,draw:1},
 twin_strike:{name:'Twin Strike',cost:1,type:'attack',text:'Deal 5 damage twice.',damage:5,hits:2},
 thunderclap:{name:'Thunderclap',cost:1,type:'attack',text:'Deal 4 damage. Apply 1 Vulnerable to all enemies.',damage:4,vulnerable:1},
 inflame:{name:'Inflame',cost:1,type:'power',text:'Gain 2 Strength.',strength:2}
};
const RARITY={
 strike:'starter',defend:'starter',bash:'starter',
 anger:'common',armaments:'common',body_slam:'common',iron_wave:'common',
 pommel_strike:'common',shrug_it_off:'common',twin_strike:'common',thunderclap:'common',
 inflame:'uncommon'
};
const UPGRADES={
 strike:{damage:9},defend:{block:8},bash:{damage:10,vulnerable:3},
 anger:{damage:8},armaments:{block:5,upgradeAllHand:true},
 body_slam:{cost:0},iron_wave:{damage:7,block:7},
 pommel_strike:{damage:10,draw:2},shrug_it_off:{block:11},
 twin_strike:{damage:7},thunderclap:{damage:7},inflame:{strength:3}
};
// Legacy-only card definitions keep older Step 2/3 saves playable; never enter Ironclad rewards.
const LEGACY_CARDS={
 quick:{name:'Đột Kích (cũ)',cost:0,type:'attack',text:'Gây 4 sát thương.',damage:4},
 brace:{name:'Tư Thế (cũ)',cost:1,type:'skill',text:'Nhận 8 giáp.',block:8},
 focus:{name:'Tập Trung (cũ)',cost:1,type:'skill',text:'Rút 2 lá.',draw:2},
 heavy:{name:'Trọng Kích (cũ)',cost:2,type:'attack',text:'Gây 15 sát thương.',damage:15},
 heal:{name:'Hồi Sức (cũ)',cost:1,type:'skill',text:'Hồi 5 HP.',heal:5},
 fury:{name:'Cuồng Nộ (cũ)',cost:2,type:'power',text:'Nhận 2 Sức Mạnh.',strength:2},
 poison:{name:'Độc Châm (cũ)',cost:1,type:'skill',text:'Đặt 4 Độc.',poison:4},
 weaken:{name:'Áp Chế (cũ)',cost:1,type:'attack',text:'Gây 5 sát thương và 2 Suy Yếu.',damage:5,weak:2},
 cleanse:{name:'Thanh Lọc (cũ)',cost:1,type:'skill',text:'Nhận 4 giáp và thanh lọc.',block:4,cleanse:true}
};
function cardBase(id){return typeof id==='string'?id.replace(/\+$/,''):''}
function cardInfo(id){
 const base=cardBase(id),original=CARDS[base]||LEGACY_CARDS[base];if(!original)return null;
 const upgraded=id.endsWith('+'),c={...original,...(upgraded?UPGRADES[base]:{})};
 c.rarity=RARITY[base]||'legacy';c.name=original.name+(upgraded?' +':'');
 if(upgraded){
  const desc=[c.bodySlam&&'Deal damage equal to your Block',
   c.damage&&`Deal ${c.damage} damage${c.hits?` ${c.hits} times`:''}`,
   c.block&&`Gain ${c.block} Block`,c.vulnerable&&`Apply ${c.vulnerable} Vulnerable`,
   c.weak&&`Apply ${c.weak} Weak`,c.poison&&`Apply ${c.poison} Poison`,
   c.heal&&`Heal ${c.heal} HP`,c.strength&&`Gain ${c.strength} Strength`,
   c.draw&&`Draw ${c.draw}`,c.copyDiscard&&'Copy to discard',
   c.upgradeAllHand?'Upgrade all cards in hand':c.upgradeHand&&'Upgrade a card in hand',
   c.cleanse&&'Cleanse'].filter(Boolean);
  if(desc.length)c.text=desc.join('. ')+'.';
 }
 return c;
}
function rollOffers(count=3){
 const pool=Object.keys(RARITY).filter(x=>RARITY[x]!=='starter');
 const weighted=pool.flatMap(x=>Array(RARITY[x]==='rare'?1:RARITY[x]==='uncommon'?3:6).fill(x));
 const offers=[];
 while(offers.length<count&&offers.length<pool.length){const id=weighted[Math.floor(Math.random()*weighted.length)];if(!offers.includes(id))offers.push(id)}
 return offers;
}
function openDeck(){const box=$('deckview');if(!box)return;box.classList.toggle('hidden');renderDeck()}
function renderDeck(){
 const box=$('deckview');if(!box||box.classList.contains('hidden')||!state)return;
 box.replaceChildren();const h=document.createElement('h2');h.textContent='Ironclad — Deck';box.append(h);
 const list=document.createElement('div');list.className='deck-list';
 state.deck.forEach((id,i)=>{const c=cardInfo(id);if(!c)return;const d=document.createElement('div');d.className='deck-entry rarity-'+c.rarity;d.textContent=`${i+1}. ${c.name} · ${c.cost}⚡ · ${c.rarity} — ${c.text}`;list.append(d)});
 box.append(list);
}
function chooseUpgrade(index){
 if(state.scene!=='upgrade'||!Number.isInteger(index)||index<0||index>=state.deck.length)return;
 const id=state.deck[index];if(!cardInfo(id)||id.endsWith('+'))return;
 state.deck[index]=id+'+';state.log=`Upgraded ${cardInfo(id).name}.`;advance();
}


const RELICS={
 burning_blood:{name:'Burning Blood',description:'Hồi 6 HP sau mỗi trận thắng.',price:0},
 red_skull:{name:'Red Skull',description:'Khi HP còn tối đa một nửa, nhận 3 Strength khi vào trận.',price:170}
};
const POTIONS={
 blood_potion:{name:'Blood Potion',description:'Hồi 20% HP tối đa.',price:50},
 strength_potion:{name:'Strength Potion',description:'Nhận 2 Strength trong trận.',price:50}
};
function initInventory(){
 if(!Array.isArray(state.relics))state.relics=['burning_blood'];
 if(!Array.isArray(state.potions))state.potions=[];
 if(!Number.isFinite(state.removeCount))state.removeCount=0;
}
function heal(amount){const before=state.hp;state.hp=Math.min(state.maxHp,state.hp+Math.max(0,amount));return state.hp-before}
function shopOffers(){
 const cards=rollOffers(3).map(id=>({type:'card',id,price:RARITY[id]==='uncommon'?75:50}));
 const relics=Object.keys(RELICS).filter(id=>id!=='burning_blood'&&!state.relics.includes(id)).map(id=>({type:'relic',id,price:RELICS[id].price}));
 const potions=Object.keys(POTIONS).map(id=>({type:'potion',id,price:POTIONS[id].price}));
 return [...cards,...relics,...potions].map((offer,i)=>({...offer,key:i,sold:false}));
}
function shopBuy(key){
 if(state.scene!=='shop')return;
 const offer=state.shop?.find(x=>x.key===key);
 if(!offer||offer.sold||state.gold<offer.price)return;
 if(offer.type==='potion'&&state.potions.length>=3)return;
 state.gold-=offer.price;offer.sold=true;
 if(offer.type==='card')state.deck.push(offer.id);
 if(offer.type==='relic')state.relics.push(offer.id);
 if(offer.type==='potion')state.potions.push(offer.id);
 state.log='Đã mua '+(CARDS[offer.id]?.name||RELICS[offer.id]?.name||POTIONS[offer.id]?.name);save();render();
}
function shopRemove(index){
 if(state.scene!=='remove'||!Number.isInteger(index)||index<0||index>=state.deck.length)return;
 const cost=75+state.removeCount*25;if(state.gold<cost)return;
 state.deck.splice(index,1);state.gold-=cost;state.removeCount++;
 state.shopRemovalDone=true;state.scene='shop';state.log='Đã loại bỏ một lá bài.';save();render();
}
function usePotion(index){
 if(state.scene!=='combat'||!Number.isInteger(index)||index<0||index>=state.potions.length)return;
 const id=state.potions[index],b=state.battle;if(!POTIONS[id]||!b)return;
 if(id==='blood_potion')heal(Math.floor(state.maxHp*.2));
 else if(id==='strength_potion')b.strength+=2;
 else return;
 state.potions.splice(index,1);state.log='Đã dùng '+POTIONS[id].name;save();render();
}
function renderInventory(){
 const box=$('inventory');if(!box)return;box.replaceChildren();
 const r=document.createElement('span');r.textContent='Relic: '+state.relics.map(id=>RELICS[id]?.name||id).join(', ');box.append(r);
 const pot=document.createElement('span');pot.textContent=' | Potion: ';box.append(pot);
 state.potions.forEach((id,i)=>{const b=btn(POTIONS[id]?.name||id,()=>usePotion(i));b.disabled=state.scene!=='combat';box.append(b)});
 box.append(document.createTextNode(` (${state.potions.length}/3)`));
}

const ENEMIES = {
 slime:{name:'Leaf Slime',icon:'◉',hp:30,damage:6},
 wriggler:{name:'Wriggler',icon:'❋',hp:20,damage:6},
 nibbit:{name:'Nibbit',icon:'♟',hp:34,damage:7},
 beetle:{name:'Shrinker Beetle',icon:'◈',hp:42,damage:8},
 wurm:{name:'Fuzzy Wurm Crawler',icon:'≋',hp:39,damage:7},
 phrog:{name:'Phrog Parasite',icon:'♣',hp:70,damage:10},
 byrdonis:{name:'Byrdonis',icon:'♠',hp:75,damage:11},
 effigy:{name:'Bygone Effigy',icon:'◆',hp:82,damage:10},
 ceremonial:{name:'Ceremonial Beast',icon:'♛',hp:135,damage:14},
 kin:{name:'The Kin',icon:'♛',hp:128,damage:15},
 vantom:{name:'Vantom',icon:'♛',hp:145,damage:13},
 scout:{name:'Kẻ Trinh Sát',icon:'♞',hp:35,damage:7},
 guardian:{name:'Vệ Binh',icon:'♜',hp:44,damage:8},
 boss:{name:'Kẻ Canh Tháp',icon:'♛',hp:95,damage:12}
};
const STORAGE='spire_lite_save_v2';
const LEGACY_STORAGE='spire_lite_save_v1';
const ROOM_TYPES=['fight','elite','rest','treasure','shop'];
const $=id=>document.getElementById(id);
let state;
const clone = obj=>JSON.parse(JSON.stringify(obj));
const max=(a,b)=>Math.max(a,b);
function shuffle(arr){for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr}
// 5 hàng phòng, ba nhánh. Mỗi phòng có ít nhất một đường đến và một đường đi tiếp.
function makeMap(){
 const rows=[];
 for(let floor=1;floor<=5;floor++){
  if(floor===5){rows.push([{id:'5-1',floor,col:1,kind:'boss',next:[]}]);continue}
  const kinds=floor===1?['fight','fight','fight']:
   floor===4?['rest','fight','elite']:
   floor===2?['fight','elite','event']:['fight','rest','shop'];
  rows.push(shuffle(kinds).map((kind,col)=>({id:`${floor}-${col}`,floor,col,kind,next:[]})));
 }
 for(let r=0;r<4;r++){
  const parents=rows[r],children=rows[r+1];
  for(const node of parents){
   const possible=children.filter(x=>Math.abs(node.col-x.col)<=1);
   node.next.push(possible[Math.floor(Math.random()*possible.length)].id);
  }
  for(const child of children){
   if(!parents.some(n=>n.next.includes(child.id))){
    const possible=parents.filter(n=>Math.abs(n.col-child.col)<=1);
    possible[Math.floor(Math.random()*possible.length)].next.push(child.id);
   }
  }
 }
 return rows;
}
function newGame(){state={version:2,scene:'map',floor:1,maxHp:80,hp:80,gold:0,relics:['burning_blood'],potions:[],removeCount:0,deck:['strike','strike','strike','strike','strike','defend','defend','defend','defend','bash'],graphics:'ultra',battle:null,mapRows:makeMap(),currentNode:null,visited:[],log:'Chọn một phòng ở hàng đầu tiên.'};save();render()}
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(state))}catch(e){console.warn('Không lưu được:',e)}}
function validMap(s){return Array.isArray(s.mapRows)&&s.mapRows.length===5&&s.mapRows.every((row,i)=>Array.isArray(row)&&row.length===(i===4?1:3)&&row.every(n=>n.floor===i+1&&typeof n.id==='string'&&Array.isArray(n.next)))}
function load(){try{
 const s=JSON.parse(localStorage.getItem(STORAGE));
 if(s&&s.version===2&&validMap(s)&&Array.isArray(s.deck)&&s.hp>=0&&s.floor>=1&&s.floor<=5&&['map','combat','rewards','upgrade','shop','remove','event','win','lose'].includes(s.scene)){state=s;initInventory();if(state.scene==='combat'){if(!state.battle||!state.battle.enemy){state.scene='map';state.battle=null}else normalizeBattle(state.battle)}if(state.scene==='rewards'){state.offers=(state.offers||[]).filter(id=>RARITY[id]&&RARITY[id]!=='starter');if(!state.offers.length)state.offers=rollOffers(3)}return}
 // Chuyển bản lưu cũ sang bản đồ mới, giữ HP, vàng, bộ bài và trận đang diễn ra.
 const old=JSON.parse(localStorage.getItem(LEGACY_STORAGE));
 if(old&&old.version===1&&Array.isArray(old.deck)&&old.floor>=1&&old.floor<=5&&old.hp>=0){
  const rows=makeMap(),visited=[];let current=null;
  for(let i=0;i<old.floor-1;i++){
   const choices=i===0?rows[i]:rows[i].filter(n=>rows[i-1].find(p=>p.id===current)?.next.includes(n.id));
   const chosen=choices[0];if(!chosen)break;current=chosen.id;visited.push(current);
  }
  state={...old,version:2,mapRows:rows,currentNode:current,visited};initInventory();save();return;
 }
}catch(e){console.warn('Bản lưu không hợp lệ:',e)}newGame()}
function reachableNodes(){
 const row=state.mapRows[state.floor-1]||[];
 return state.floor===1?row:row.filter(n=>state.mapRows[state.floor-2].find(p=>p.id===state.currentNode)?.next.includes(n.id));
}
function chooseNode(id){
 if(state.scene!=='map')return;
 const node=reachableNodes().find(n=>n.id===id);if(!node)return;
 state.currentNode=node.id;state.visited.push(id);
 enterRoom(node.kind);
}
// Intents are chosen at the start of the player's turn, never rerolled during card play.
function enemyIntent(b){
 const n=b.turn,e=b.enemy,base=e.damage+(n>=4?2:0);
 // Lightweight original AI patterns for wiki-listed enemies; not exact STS2 move tables.
 if(b.enemyType==='ceremonial'&&n%3===2)return {name:'Ceremony',kind:'buff',damage:0,block:0,strength:3};
 if(b.enemyType==='kin'&&n%3===0)return {name:'Guard Kin',kind:'defend',damage:0,block:14};
 if(b.enemyType==='vantom'&&n%4===0)return {name:'Shadow Drain',kind:'debuff',damage:0,block:0,weak:2};
 if(b.enemyType==='phrog'&&n%3===2)return {name:'Parasite Shield',kind:'defend',damage:0,block:10};
 if(n%5===0)return {name:'Đe dọa',kind:'debuff',damage:0,block:0,weak:2};
 if(n%4===0)return {name:'Dồn sức',kind:'buff',damage:0,block:0,strength:2};
 if(n%3===2)return {name:'Thủ thế',kind:'defend',block:8,damage:0};
 return {name:'Tấn công',kind:'attack',block:0,damage:base};
}
function normalizeBattle(b){
 if(!b||!b.enemy)return;
 for(const key of ['strength','weak','vulnerable'])if(!Number.isFinite(b[key]))b[key]=0;
 for(const key of ['strength','weak','vulnerable','poison'])if(!Number.isFinite(b.enemy[key]))b.enemy[key]=0;
 if(!b.intent)b.intent=enemyIntent(b);
}
function tickPoison(target){
 const p=Math.max(0,target.poison||0);
 if(!p)return 0;
 // Poison bypasses block and loses one stack each turn.
 const before=target.hp;
 target.hp=Math.max(0,target.hp-p);
 target.poison=p-1;
 return before-target.hp;
}
function enterRoom(kind){if(state.scene!=='map')return;if(kind==='rest'){state.scene='upgrade';state.log='Nghỉ chân: hồi 18 HP hoặc nâng cấp một lá bài.';save();render();return}if(kind==='treasure'){state.gold+=25;state.log='Nhặt được 25 vàng.';advance();return}if(kind==='event'){state.scene='event';state.eventId='dense_vegetation';state.log='Dense Vegetation: một lối mòn bị cây cỏ che phủ.';save();render();return}if(kind==='shop'){state.shop=shopOffers();state.shopRemovalDone=false;state.scene='shop';save();render();return}const type=kind==='wriggler'?'wriggler':kind==='boss'||state.floor===5?['ceremonial','kin','vantom'][Math.floor(Math.random()*3)]:kind==='elite'?['phrog','byrdonis','effigy'][Math.floor(Math.random()*3)]:['slime','nibbit','beetle','wurm'][Math.floor(Math.random()*4)];const def=ENEMIES[type];const hp=def.hp+(['ceremonial','kin','vantom','wriggler'].includes(type)?0:(state.floor-1)*5);state.battle={enemy:{...clone(def),hp,maxHp:hp,block:0,vulnerable:0,weak:0,poison:0,strength:0},turn:1,enemyType:type,elite:kind==='elite',energy:3,block:0,strength:0,weak:0,vulnerable:0,draw:shuffle([...state.deck]),discard:[],hand:[],intent:null};state.scene='combat';if(state.relics.includes('red_skull')&&state.hp<=state.maxHp/2)state.battle.strength+=3;state.log=`${def.name} xuất hiện.`;startTurn();}
function drawCards(amount){const b=state.battle;for(let i=0;i<amount;i++){if(!b.draw.length){if(!b.discard.length)break;b.draw=shuffle(b.discard.splice(0))}b.hand.push(b.draw.pop())}}
function startTurn(){
 const b=state.battle;normalizeBattle(b);
 b.energy=3;b.block=0;b.intent=enemyIntent(b);
 const poisonDamage=tickPoison(b.enemy);
 if(poisonDamage)state.log=`Độc gây ${poisonDamage} sát thương lên địch.`;
 if(b.enemy.hp<=0){winBattle();return}
 drawCards(5);save();render();
}
function hurtEnemy(amount){const e=state.battle.enemy;const b=state.battle;const modified=Math.max(0,Math.floor(Math.max(0,amount)*(b.weak>0?.75:1)*(e.vulnerable>0?1.5:1)));const blocked=Math.min(e.block,modified);e.block-=blocked;e.hp=Math.max(0,e.hp-(modified-blocked));return modified-blocked}
function playerDamage(amount){const b=state.battle;amount=Math.max(0,Math.floor(amount*(b.vulnerable>0?1.5:1)));const absorbed=Math.min(b.block,amount);b.block-=absorbed;state.hp=Math.max(0,state.hp-(amount-absorbed));return amount-absorbed}
function playCard(index){if(state.scene!=='combat')return;const b=state.battle;const id=b.hand[index];if(!id)return;const c=cardInfo(id);if(!c||b.energy<c.cost)return;b.energy-=c.cost;b.hand.splice(index,1);if(c.type==='power')b.exhaust=(b.exhaust||[]).concat(id);else b.discard.push(id);const notes=[];if(c.damage||c.bodySlam){
 const hits=c.hits||1;let total=0;
 for(let n=0;n<hits;n++){if(b.enemy.hp===0)break;total+=hurtEnemy((c.bodySlam?b.block:c.damage)+b.strength)}
 notes.push(`gây ${total} sát thương (${hits} hit)`);
}if(c.block){b.block+=c.block;notes.push(`+${c.block} giáp`)}if(c.vulnerable){b.enemy.vulnerable+=c.vulnerable;notes.push(`+${c.vulnerable} Dễ Tổn Thương`)}if(c.weak){b.enemy.weak+=c.weak;notes.push(`+${c.weak} Suy Yếu`)}if(c.poison){b.enemy.poison+=c.poison;notes.push(`+${c.poison} Độc`)}if(c.cleanse){b.weak=0;b.vulnerable=0;notes.push('thanh lọc hiệu ứng')}if(c.heal){const before=state.hp;state.hp=Math.min(state.maxHp,state.hp+c.heal);notes.push(`hồi ${state.hp-before} HP`)}if(c.strength){b.strength+=c.strength;notes.push(`+${c.strength} sức mạnh`)}if(c.draw){drawCards(c.draw);notes.push(`rút ${c.draw} lá`)}
 if(c.copyDiscard){b.discard.push(id);notes.push('sao chép vào chồng bỏ')}
 if(c.upgradeHand||c.upgradeAllHand){
  const eligible=b.hand.map((entry,i)=>({entry,i})).filter(x=>!x.entry.endsWith('+')&&CARDS[cardBase(x.entry)]);
  const chosen=c.upgradeAllHand?eligible:eligible.slice(0,1);
  for(const x of chosen)b.hand[x.i]=x.entry+'+';
  if(chosen.length)notes.push(`nâng cấp ${chosen.length} bài trên tay`);
 }
 state.log=`${c.name}: ${notes.join(', ')}.`;if(b.enemy.hp===0){winBattle();return}save();render()}
function endTurn(){
 if(state.scene!=='combat')return;
 const b=state.battle,e=b.enemy,action=b.intent||enemyIntent(b);
 b.discard.push(...b.hand.splice(0));
 // Statuses applied during the player's turn remain active until this action completes.
 const enemyWeak=e.weak>0,playerWeak=b.weak>0,enemyVulnerable=e.vulnerable>0,playerVulnerable=b.vulnerable>0;
 e.block=0;
 if(action.kind==='defend'||action.block){
  e.block+=action.block;state.log=`Địch nhận ${action.block} giáp.`;
 }else if(action.kind==='buff'){
  e.strength+=(action.strength||0);state.log=`Địch nhận ${action.strength} Sức Mạnh.`;
 }else if(action.kind==='debuff'){
  b.weak+=(action.weak||0);state.log=`Bạn nhận ${action.weak} Suy Yếu.`;
 }else{
  const raw=Math.max(0,(action.damage||0)+(e.strength||0));
  const effective=Math.floor(raw*(enemyWeak?.75:1));
  const taken=playerDamage(effective);
  state.log=`Địch tấn công ${effective}, bạn mất ${taken} HP.`;
 }
 if(enemyWeak)e.weak--;if(enemyVulnerable)e.vulnerable--;
 if(playerWeak)b.weak--;if(playerVulnerable)b.vulnerable--;
 if(state.hp===0){state.scene='lose';save();render();return}
 b.turn++;startTurn();
}
function winBattle(){const boss=state.floor===5,elite=!!state.battle?.elite;state.battle=null;if(state.relics.includes('burning_blood'))heal(6);if(elite){const candidates=Object.keys(RELICS).filter(id=>!state.relics.includes(id));if(candidates.length){const found=candidates[Math.floor(Math.random()*candidates.length)];state.relics.push(found)}}if(boss){state.scene='win';state.log='Bạn đã đánh bại kẻ canh tháp!';save();render();return}state.gold+=elite?40:15;state.scene='rewards';state.offers=rollOffers(3);state.log=`Chiến thắng! +${elite?40:15} vàng. Chọn một lá hoặc bỏ qua.`;save();render()}
function pickReward(id){if(state.scene!=='rewards')return;if(id&&state.offers.includes(id))state.deck.push(id);delete state.offers;advance()}
function advance(){state.floor++;state.scene=state.floor>5?'win':'map';state.log=state.scene==='map'?`Chọn phòng tầng ${state.floor}.`:state.log;save();render()}
function chooseEvent(option){
 if(state.scene!=='event')return;
 if(option==='trudge'){state.hp=Math.max(0,state.hp-8);state.gold+=75;state.log='Bạn nhận 75 Gold và mất 8 HP.'}
 else if(option==='rest'){heal(15);delete state.eventId;state.scene='map';enterRoom('wriggler');return}
 else return;
 delete state.eventId;
 if(state.hp<=0){state.scene='lose';save();render();return}
 advance();
}
function pct(a,b){return b>0?Math.max(0,Math.min(100,Math.round((a/b)*100))):0}
function hpBar(a,b){return `<div class="hpbar"><div style="width:${pct(a,b)}%"></div></div>`}
function btn(label,handler,cls=''){const button=document.createElement('button');button.textContent=label;button.className=cls;button.addEventListener('click',handler);return button}
function drawMapLines(graph,svg){
 if(!graph.isConnected)return;
 const rect=graph.getBoundingClientRect();if(!rect.width||!rect.height)return;
 svg.setAttribute('viewBox',`0 0 ${rect.width} ${rect.height}`);svg.replaceChildren();
 const nodes=new Map([...graph.querySelectorAll('[data-node]')].map(el=>[el.dataset.node,el]));
 for(const row of state.mapRows)for(const parent of row)for(const childId of parent.next){
  const from=nodes.get(parent.id),to=nodes.get(childId);if(!from||!to)continue;
  const a=from.getBoundingClientRect(),b=to.getBoundingClientRect();
  const line=document.createElementNS('http://www.w3.org/2000/svg','line');
  for(const [key,value] of Object.entries({x1:a.left+a.width/2-rect.left,y1:a.bottom-rect.top,x2:b.left+b.width/2-rect.left,y2:b.top-rect.top}))line.setAttribute(key,value);
  line.setAttribute('class',state.visited.includes(parent.id)&&state.visited.includes(childId)?'route-line':'');svg.append(line);
 }
}
window.addEventListener('resize',()=>{if(state?.scene==='map'){const graph=document.querySelector('.map-graph');if(graph)drawMapLines(graph,graph.querySelector('svg'))}});
function render(){if(!state)return;renderDeck();renderInventory();document.body.classList.toggle('ultra',state.graphics==='ultra');$('graphics').textContent=`Đồ họa: ${state.graphics==='ultra'?'THẤP':'THƯỜNG'}`;$('status').textContent=`Tầng ${state.floor}/5   ♥ ${state.hp}/${state.maxHp} HP   ◈ ${state.gold} vàng   ▤ ${state.deck.length} lá`;for(const id of ['map','combat','rewards','upgrade','shop','remove','event','result'])$(id).classList.add('hidden');$('log').textContent=state.log||'';
if(state.scene==='map'){
 const box=$('map');box.classList.remove('hidden');box.replaceChildren();
 const h=document.createElement('h2');h.textContent=`Bản đồ hành trình • Tầng ${state.floor}/5`;box.append(h);
 const p=document.createElement('p');p.className='muted';p.textContent='Chỉ chọn được phòng có đường nối từ vị trí đã đi qua. Đường đã chọn không thể quay lại.';box.append(p);
 const graph=document.createElement('div');graph.className='map-graph';
 const available=new Set(reachableNodes().map(n=>n.id));
 const symbols={fight:'⚔',elite:'♜',rest:'✚',treasure:'◆',shop:'¤',event:'?',boss:'♛'};
 const names={fight:'Chiến đấu',elite:'Tinh anh',rest:'Nghỉ ngơi',treasure:'Kho báu',shop:'Shop',event:'Sự kiện',boss:'Boss'};
 for(const row of state.mapRows){
  const line=document.createElement('div');line.className='map-floor';
  const caption=document.createElement('span');caption.className='floor-caption';caption.textContent=`${row[0].floor}`;line.append(caption);
  const slots=document.createElement('div');slots.className='map-slots';
  for(let col=0;col<3;col++){
   const node=row.find(n=>n.col===col);
   const slot=document.createElement('div');slot.className='map-slot';
   if(node){
    const selected=state.visited.includes(node.id);
    const item=btn(`${symbols[node.kind]} ${names[node.kind]}`,()=>chooseNode(node.id),`map-node ${selected?'visited':''} ${available.has(node.id)?'reachable':''}`);
    item.disabled=!available.has(node.id)||state.scene!=='map';
    item.dataset.node=node.id;
    item.title=`Tầng ${node.floor} • ${names[node.kind]}`;
    slot.append(item);
   }slots.append(slot);
  }line.append(slots);graph.append(line);
 }
 const wires=document.createElementNS('http://www.w3.org/2000/svg','svg');wires.classList.add('map-wires');wires.setAttribute('aria-hidden','true');graph.prepend(wires);box.append(graph);
 // Kẻ đường nối bằng SVG tĩnh, không dùng canvas hay vòng lặp animation.
 requestAnimationFrame(()=>drawMapLines(graph,wires));
}
if(state.scene==='combat'){const b=state.battle;if(!b){state.scene='map';save();render();return}$('combat').classList.remove('hidden');const e=b.enemy;$('enemy').innerHTML=`<div class="portrait">${e.icon}</div><div class="enemy-title">${e.name}</div>${hpBar(e.hp,e.maxHp)}<div>♥ ${e.hp}/${e.maxHp} <span class="block">▣ ${e.block}</span></div><div class="intent">Ý định: ${b.intent.kind==='buff'?`+${b.intent.strength} Sức Mạnh`:b.intent.kind==='debuff'?`+${b.intent.weak} Suy Yếu`:b.intent.block?`+${b.intent.block} giáp`:`⚔ ${b.intent.damage+(e.strength||0)} sát thương`}</div><small>Địch: Dễ Tổn Thương ${e.vulnerable||0} · Suy Yếu ${e.weak||0} · Độc ${e.poison||0} · Sức Mạnh ${e.strength||0}</small>`;$('hero').innerHTML=`<div class="portrait">♟</div><div class="enemy-title">Lữ khách</div>${hpBar(state.hp,state.maxHp)}<div>♥ ${state.hp}/${state.maxHp} <span class="block">▣ ${b.block}</span></div><div>⚡ Năng lượng: ${b.energy}/3</div><small>Sức mạnh: ${b.strength} · Suy Yếu: ${b.weak||0} · Dễ Tổn Thương: ${b.vulnerable||0} · Lượt ${b.turn}</small>`;$('deckinfo').textContent=`Rút: ${b.draw.length} | Bỏ: ${b.discard.length} | Tay: ${b.hand.length}`;const hand=$('hand');hand.replaceChildren();b.hand.forEach((id,i)=>{const c=cardInfo(id);if(!c)return;const el=btn('',()=>playCard(i),`card ${c.type} rarity-${c.rarity} ${id.endsWith('+')?'upgraded':''}`);el.disabled=b.energy<c.cost;el.innerHTML=`<span class="cost">${c.cost}</span><b>${c.name}</b><span class="desc">${c.text}</span><span class="type">${c.type.toUpperCase()}</span>`;hand.append(el)})}
if(state.scene==='rewards'){const box=$('rewards');box.classList.remove('hidden');box.replaceChildren();const h=document.createElement('h2');h.textContent='Chiến thắng — chọn phần thưởng';box.append(h);const choices=document.createElement('div');choices.className='choices';(state.offers||[]).forEach(id=>{const c=cardInfo(id);if(!c||c.rarity==='legacy')return;choices.append(btn(`[${c.rarity}] ${c.name} (${c.cost}⚡) — ${c.text}`,()=>pickReward(id),`rarity-${c.rarity}`))});choices.append(btn('Bỏ qua →',()=>pickReward(null)));box.append(choices)}
if(state.scene==='upgrade'){
 const box=$('upgrade');box.classList.remove('hidden');box.replaceChildren();
 const h=document.createElement('h2');h.textContent='Điểm nghỉ — chọn một hành động';box.append(h);
 box.append(btn('Nghỉ ngơi · hồi 18 HP',()=>{state.hp=Math.min(state.maxHp,state.hp+18);state.log='Đã hồi 18 HP.';advance()},'primary'));
 const p=document.createElement('p');p.textContent='Hoặc nâng cấp vĩnh viễn một lá bài (chỉ một lần mỗi lá):';box.append(p);
 const choices=document.createElement('div');choices.className='choices';
 let count=0;state.deck.forEach((id,i)=>{const c=cardInfo(id);if(!c||id.endsWith('+'))return;count++;const improved=cardInfo(id+'+');choices.append(btn(`${c.name} → ${improved.name}: ${improved.text}`,()=>chooseUpgrade(i)))});
 if(!count){const p=document.createElement('p');p.textContent='Tất cả bài đã được nâng cấp.';box.append(p)}
 box.append(choices);
}
if(state.scene==='shop'){
 const box=$('shop');box.classList.remove('hidden');box.replaceChildren();
 const h=document.createElement('h2');h.textContent='Merchant · '+state.gold+' Gold';box.append(h);
 const items=document.createElement('div');items.className='choices';
 (state.shop||[]).forEach(o=>{const item=o.type==='card'?cardInfo(o.id):o.type==='relic'?RELICS[o.id]:POTIONS[o.id];
  if(!item)return;const price=o.price;const b=btn(`${item.name} — ${price} Gold · ${item.description||item.text||''}`,()=>shopBuy(o.key));b.disabled=o.sold||state.gold<price||(o.type==='potion'&&state.potions.length>=3);if(o.sold)b.textContent='Đã bán · '+item.name;items.append(b)});
 box.append(items);
 const cost=75+(state.removeCount||0)*25;
 const remove=btn('Loại bỏ 1 bài · '+cost+' Gold',()=>{state.scene='remove';save();render()});
 remove.disabled=state.shopRemovalDone||state.gold<cost||!state.deck.length;box.append(remove);
 box.append(btn('Rời cửa hàng →',()=>{delete state.shop;advance()},'primary'));
}
if(state.scene==='remove'){
 const box=$('remove');box.classList.remove('hidden');box.replaceChildren();
 const h=document.createElement('h2');h.textContent='Chọn lá để loại bỏ';box.append(h);
 const list=document.createElement('div');list.className='choices';
 state.deck.forEach((id,i)=>{const c=cardInfo(id);if(c)list.append(btn(c.name+' — '+c.text,()=>shopRemove(i)))});
 box.append(list,btn('Quay lại shop',()=>{state.scene='shop';save();render()}));
}
if(state.scene==='event'){
 const box=$('event');box.classList.remove('hidden');box.replaceChildren();
 const heading=document.createElement('h2');heading.textContent='Dense Vegetation · Overgrowth';box.append(heading);
 const desc=document.createElement('p');desc.textContent='Bạn lạc trong khu rừng. Hãy chọn cách tìm lối thoát. (Sự kiện được đơn giản hóa cho bản HTML5.)';box.append(desc);
 const choices=document.createElement('div');choices.className='choices';
 choices.append(btn('Tiếp tục: +75 Gold, -8 HP',()=>chooseEvent('trudge')));
 choices.append(btn('Nghỉ: hồi 15 HP, rồi chiến đấu với Wriggler (bản rút gọn)',()=>chooseEvent('rest')));
 box.append(choices);
}
if(state.scene==='win'||state.scene==='lose'){const box=$('result');box.classList.remove('hidden');box.replaceChildren();const h=document.createElement('h2');h.textContent=state.scene==='win'?'CHIẾN THẮNG!':'THẤT BẠI';const p=document.createElement('p');p.textContent=`Kết thúc ở tầng ${state.floor}. Bộ bài: ${state.deck.length} lá.`;box.append(h,p,btn('Bắt đầu hành trình mới',newGame,'primary'))}}
$('endturn').addEventListener('click',endTurn);$('restart').addEventListener('click',()=>{if(confirm('Xóa lượt chơi đang lưu và bắt đầu lại?'))newGame()});$('graphics').addEventListener('click',()=>{state.graphics=state.graphics==='ultra'?'normal':'ultra';save();render()});$('deckbutton').addEventListener('click',openDeck);load();render();
