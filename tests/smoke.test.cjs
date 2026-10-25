'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('game.js','utf8').replace(/\$\('endturn'\)\.addEventListener[\s\S]*$/,'');
const elements=new Map();
const element=id=>{
 if(!elements.has(id))elements.set(id,{textContent:'',innerHTML:'',classList:{add(){},remove(){},toggle(){},contains(){return false}},replaceChildren(){},append(){},addEventListener(){},querySelectorAll(){return[]},querySelector(){return element('svg')},setAttribute(){},getBoundingClientRect(){return {width:300,height:300,left:0,top:0}},isConnected:true});
 return elements.get(id);
};
const store=new Map();
const ctx={console,Math,JSON,Number,Map,Set,document:{body:{classList:{toggle(){}}},getElementById:element,querySelector:()=>null,createElement:()=>({...element('temporary'),dataset:{},addEventListener(){},append(){},replaceChildren(){},classList:{add(){},remove(){},contains(){return false}},setAttribute(){}}),createElementNS:()=>({...element('svg'),classList:{add(){}}}),createTextNode:(v)=>v},window:{addEventListener(){}},requestAnimationFrame() {},confirm(){return true},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)}};
vm.createContext(ctx);vm.runInContext(src,ctx);
const run=x=>vm.runInContext(x,ctx);
for(let i=0;i<100;i++){
 run('newGame()');
 assert.equal(run('state.mapRows.length'),5);
 assert.equal(run('reachableNodes().length'),3);
 const ok=run('state.mapRows.every((row,r)=>r===4||row.every(n=>n.next.length>0 && n.next.every(id=>state.mapRows[r+1].some(c=>c.id===id))))');
 assert.equal(ok,true);
}
run('newGame()');assert.equal(run('state.relics.includes("burning_blood")'),true);
run('state.gold=500;state.scene="shop";state.shop=shopOffers()');
assert.equal(run('state.shop.length>0'),true);
run('shopBuy(state.shop.find(x=>x.type==="potion").key)');
assert.equal(run('state.potions.length'),1);
run('state.scene="map";enterRoom("fight")');
assert.equal(run('state.scene'),'combat');
run('usePotion(0)');assert.equal(run('state.potions.length'),0);
run('state.battle.enemy.hp=1;winBattle()');
assert.equal(run('state.scene'),'rewards');assert.equal(run('state.hp<=state.maxHp'),true);
run('pickReward(null)');assert.equal(run('state.scene'),'map');
run('state.scene="event";state.hp=40;chooseEvent("rest")');assert.equal(run('state.scene'),'combat');
run('state.scene="combat";state.battle.enemy.hp=0;winBattle()');assert.equal(run('state.scene'),'rewards');
run('state.scene="shop";state.shop=shopOffers();state.gold=500;shopBuy(state.shop.find(x=>x.type==="card").key)');
assert.equal(run('state.deck.length>=10'),true);
console.log('PASS: 100 maps, starting relic, shop, potion, combat, rewards, event and card purchase');
