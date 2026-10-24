/* Spire Lite: no dependencies, no remote assets. Edit CARDS and ENEMIES to customize. */
'use strict';
const CARDS = {
 strike:{name:'Chém',cost:1,type:'attack',text:'Gây 6 sát thương.',damage:6},
 defend:{name:'Thủ',cost:1,type:'skill',text:'Nhận 5 giáp.',block:5},
 bash:{name:'Phá Giáp',cost:2,type:'attack',text:'Gây 8 sát thương. Đặt 2 Yếu Ớt.',damage:8,vulnerable:2},
 quick:{name:'Đột Kích',cost:0,type:'attack',text:'Gây 4 sát thương.',damage:4},
 brace:{name:'Tư Thế',cost:1,type:'skill',text:'Nhận 8 giáp.',block:8},
 focus:{name:'Tập Trung',cost:1,type:'skill',text:'Rút 2 lá.',draw:2},
 heavy:{name:'Trọng Kích',cost:2,type:'attack',text:'Gây 15 sát thương.',damage:15},
 heal:{name:'Hồi Sức',cost:1,type:'skill',text:'Hồi 5 HP trong trận.',heal:5},
 fury:{name:'Cuồng Nộ',cost:2,type:'power',text:'Nhận 2 Sức Mạnh vĩnh viễn trong trận.',strength:2},
 poison:{name:'Độc Châm',cost:1,type:'skill',text:'Đặt 4 Độc lên địch.',poison:4},
 weaken:{name:'Áp Chế',cost:1,type:'attack',text:'Gây 5 sát thương, đặt 2 Suy Yếu.',damage:5,weak:2},
 cleanse:{name:'Thanh Lọc',cost:1,type:'skill',text:'Nhận 4 giáp, xóa Suy Yếu và Dễ Tổn Thương.',block:4,cleanse:true}
};
const ENEMIES = {
 slime:{name:'Thạch Nhỏ',icon:'◉',hp:30,damage:6},
 scout:{name:'Kẻ Trinh Sát',icon:'♞',hp:35,damage:7},
 guardian:{name:'Vệ Binh',icon:'♜',hp:44,damage:8},
 boss:{name:'Kẻ Canh Tháp',icon:'♛',hp:95,damage:12}
};
const STORAGE='spire_lite_save_v2';
const LEGACY_STORAGE='spire_lite_save_v1';
const ROOM_TYPES=['fight','elite','rest','treasure'];
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
   floor===2?['fight','elite','treasure']:['fight','rest','treasure'];
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
function newGame(){state={version:2,scene:'map',floor:1,maxHp:75,hp:75,gold:0,deck:['strike','strike','strike','strike','strike','defend','defend','defend','defend','bash'],graphics:'ultra',battle:null,mapRows:makeMap(),currentNode:null,visited:[],log:'Chọn một phòng ở hàng đầu tiên.'};save();render()}
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(state))}catch(e){console.warn('Không lưu được:',e)}}
function validMap(s){return Array.isArray(s.mapRows)&&s.mapRows.length===5&&s.mapRows.every((row,i)=>Array.isArray(row)&&row.length===(i===4?1:3)&&row.every(n=>n.floor===i+1&&typeof n.id==='string'&&Array.isArray(n.next)))}
function load(){try{
 const s=JSON.parse(localStorage.getItem(STORAGE));
 if(s&&s.version===2&&validMap(s)&&Array.isArray(s.deck)&&s.hp>=0&&s.floor>=1&&s.floor<=5&&['map','combat','rewards','win','lose'].includes(s.scene)){state=s;if(state.scene==='combat')normalizeBattle(state.battle);return}
 // Chuyển bản lưu cũ sang bản đồ mới, giữ HP, vàng, bộ bài và trận đang diễn ra.
 const old=JSON.parse(localStorage.getItem(LEGACY_STORAGE));
 if(old&&old.version===1&&Array.isArray(old.deck)&&old.floor>=1&&old.floor<=5&&old.hp>=0){
  const rows=makeMap(),visited=[];let current=null;
  for(let i=0;i<old.floor-1;i++){
   const choices=i===0?rows[i]:rows[i].filter(n=>rows[i-1].find(p=>p.id===current)?.next.includes(n.id));
   const chosen=choices[0];if(!chosen)break;current=chosen.id;visited.push(current);
  }
  state={...old,version:2,mapRows:rows,currentNode:current,visited};save();return;
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
function enterRoom(kind){if(state.scene!=='map')return;if(kind==='rest'){state.hp=Math.min(state.maxHp,state.hp+18);state.log='Bạn nghỉ chân và hồi 18 HP.';advance();return}if(kind==='treasure'){state.gold+=25;state.log='Nhặt được 25 vàng.';advance();return}const type=state.floor===5?'boss':kind==='elite'?'guardian':state.floor%2?'slime':'scout';const def=ENEMIES[type];const hp=def.hp+(type==='boss'?0:(state.floor-1)*5);state.battle={enemy:{...clone(def),hp,maxHp:hp,block:0,vulnerable:0,weak:0,poison:0,strength:0},turn:1,energy:3,block:0,strength:0,weak:0,vulnerable:0,draw:shuffle([...state.deck]),discard:[],hand:[],intent:null};state.scene='combat';state.log=`${def.name} xuất hiện.`;startTurn();}
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
function playCard(index){if(state.scene!=='combat')return;const b=state.battle;const id=b.hand[index];if(!id)return;const c=CARDS[id];if(!c||b.energy<c.cost)return;b.energy-=c.cost;b.hand.splice(index,1);b.discard.push(id);const notes=[];if(c.damage)notes.push(`gây ${hurtEnemy(c.damage+b.strength)} sát thương`);if(c.block){b.block+=c.block;notes.push(`+${c.block} giáp`)}if(c.vulnerable){b.enemy.vulnerable+=c.vulnerable;notes.push(`+${c.vulnerable} Dễ Tổn Thương`)}if(c.weak){b.enemy.weak+=c.weak;notes.push(`+${c.weak} Suy Yếu`)}if(c.poison){b.enemy.poison+=c.poison;notes.push(`+${c.poison} Độc`)}if(c.cleanse){b.weak=0;b.vulnerable=0;notes.push('thanh lọc hiệu ứng')}if(c.heal){const before=state.hp;state.hp=Math.min(state.maxHp,state.hp+c.heal);notes.push(`hồi ${state.hp-before} HP`)}if(c.strength){b.strength+=c.strength;notes.push(`+${c.strength} sức mạnh`)}if(c.draw){drawCards(c.draw);notes.push(`rút ${c.draw} lá`)}state.log=`${c.name}: ${notes.join(', ')}.`;if(b.enemy.hp===0){winBattle();return}save();render()}
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
function winBattle(){const boss=state.floor===5;state.battle=null;if(boss){state.scene='win';state.log='Bạn đã đánh bại kẻ canh tháp!';save();render();return}state.gold+=15;state.scene='rewards';state.offers=shuffle(Object.keys(CARDS).filter(x=>!['strike','defend'].includes(x))).slice(0,3);state.log='Chiến thắng! +15 vàng. Chọn một lá hoặc bỏ qua.';save();render()}
function pickReward(id){if(state.scene!=='rewards')return;if(id&&state.offers.includes(id))state.deck.push(id);delete state.offers;advance()}
function advance(){state.floor++;state.scene=state.floor>5?'win':'map';save();render()}
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
  line.setAttribute('class',state.visited.includes(parent.id)&&parent.next.includes(childId)?'route-line':'');svg.append(line);
 }
}
window.addEventListener('resize',()=>{if(state?.scene==='map'){const graph=document.querySelector('.map-graph');if(graph)drawMapLines(graph,graph.querySelector('svg'))}});
function render(){if(!state)return;document.body.classList.toggle('ultra',state.graphics==='ultra');$('graphics').textContent=`Đồ họa: ${state.graphics==='ultra'?'THẤP':'THƯỜNG'}`;$('status').textContent=`Tầng ${state.floor}/5   ♥ ${state.hp}/${state.maxHp} HP   ◈ ${state.gold} vàng   ▤ ${state.deck.length} lá`;for(const id of ['map','combat','rewards','result'])$(id).classList.add('hidden');$('log').textContent=state.log||'';
if(state.scene==='map'){
 const box=$('map');box.classList.remove('hidden');box.replaceChildren();
 const h=document.createElement('h2');h.textContent=`Bản đồ hành trình • Tầng ${state.floor}/5`;box.append(h);
 const p=document.createElement('p');p.className='muted';p.textContent='Chỉ chọn được phòng có đường nối từ vị trí đã đi qua. Đường đã chọn không thể quay lại.';box.append(p);
 const graph=document.createElement('div');graph.className='map-graph';
 const available=new Set(reachableNodes().map(n=>n.id));
 const symbols={fight:'⚔',elite:'♜',rest:'✚',treasure:'◆',boss:'♛'};
 const names={fight:'Chiến đấu',elite:'Tinh anh',rest:'Nghỉ ngơi',treasure:'Kho báu',boss:'Boss'};
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
if(state.scene==='combat'){const b=state.battle;if(!b){state.scene='map';save();render();return}$('combat').classList.remove('hidden');const e=b.enemy;$('enemy').innerHTML=`<div class="portrait">${e.icon}</div><div class="enemy-title">${e.name}</div>${hpBar(e.hp,e.maxHp)}<div>♥ ${e.hp}/${e.maxHp} <span class="block">▣ ${e.block}</span></div><div class="intent">Ý định: ${b.intent.kind==='buff'?`+${b.intent.strength} Sức Mạnh`:b.intent.kind==='debuff'?`+${b.intent.weak} Suy Yếu`:b.intent.block?`+${b.intent.block} giáp`:`⚔ ${b.intent.damage+(e.strength||0)} sát thương`}</div><small>Địch: Dễ Tổn Thương ${e.vulnerable||0} · Suy Yếu ${e.weak||0} · Độc ${e.poison||0} · Sức Mạnh ${e.strength||0}</small>`;$('hero').innerHTML=`<div class="portrait">♟</div><div class="enemy-title">Lữ khách</div>${hpBar(state.hp,state.maxHp)}<div>♥ ${state.hp}/${state.maxHp} <span class="block">▣ ${b.block}</span></div><div>⚡ Năng lượng: ${b.energy}/3</div><small>Sức mạnh: ${b.strength} · Suy Yếu: ${b.weak||0} · Dễ Tổn Thương: ${b.vulnerable||0} · Lượt ${b.turn}</small>`;$('deckinfo').textContent=`Rút: ${b.draw.length} | Bỏ: ${b.discard.length} | Tay: ${b.hand.length}`;const hand=$('hand');hand.replaceChildren();b.hand.forEach((id,i)=>{const c=CARDS[id];const el=btn('',()=>playCard(i),`card ${c.type}`);el.disabled=b.energy<c.cost;el.innerHTML=`<span class="cost">${c.cost}</span><b>${c.name}</b><span class="desc">${c.text}</span><span class="type">${c.type.toUpperCase()}</span>`;hand.append(el)})}
if(state.scene==='rewards'){const box=$('rewards');box.classList.remove('hidden');box.replaceChildren();const h=document.createElement('h2');h.textContent='Chiến thắng — chọn phần thưởng';box.append(h);const choices=document.createElement('div');choices.className='choices';(state.offers||[]).forEach(id=>{const c=CARDS[id];choices.append(btn(`${c.name} (${c.cost}⚡) — ${c.text}`,()=>pickReward(id)))});choices.append(btn('Bỏ qua →',()=>pickReward(null)));box.append(choices)}
if(state.scene==='win'||state.scene==='lose'){const box=$('result');box.classList.remove('hidden');box.replaceChildren();const h=document.createElement('h2');h.textContent=state.scene==='win'?'CHIẾN THẮNG!':'THẤT BẠI';const p=document.createElement('p');p.textContent=`Kết thúc ở tầng ${state.floor}. Bộ bài: ${state.deck.length} lá.`;box.append(h,p,btn('Bắt đầu hành trình mới',newGame,'primary'))}}
$('endturn').addEventListener('click',endTurn);$('restart').addEventListener('click',()=>{if(confirm('Xóa lượt chơi đang lưu và bắt đầu lại?'))newGame()});$('graphics').addEventListener('click',()=>{state.graphics=state.graphics==='ultra'?'normal':'ultra';save();render()});load();render();
