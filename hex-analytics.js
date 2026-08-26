(function(root){
  'use strict';
  const KEY='nba_hex_analytics_v1',VERSION=1;
  function empty(){return{version:VERSION,events:[],flags:{onboardingComplete:false}};}
  const LocalAnalyticsProvider={load(){try{const raw=JSON.parse(localStorage.getItem(KEY)||'null'),data=raw&&typeof raw==='object'?raw:empty();data.events=Array.isArray(data.events)?data.events:[];data.flags=Object.assign(empty().flags,data.flags||{});return data;}catch{return empty();}},save(data){try{localStorage.setItem(KEY,JSON.stringify(data));}catch{}},track(name,payload={}){const data=this.load();data.events.push({name,timestamp:Date.now(),...payload});data.events=data.events.slice(-1000);this.save(data);return data;},setFlag(name,value){const data=this.load();data.flags[name]=value;this.save(data);},getFlag(name){return this.load().flags[name];}};
  let provider=LocalAnalyticsProvider;
  function setProvider(next){if(next&&typeof next.track==='function')provider=next;}
  function trackEvent(name,payload={}){try{return provider.track(name,payload);}catch{return null;}}
  function getFlag(name){try{return provider.getFlag(name);}catch{return false;}}
  function setFlag(name,value){try{provider.setFlag(name,value);}catch{}}
  function events(){return provider.load().events;}
  function summary(){const all=events(),starts=all.filter(e=>e.name==='hex_game_start'),completes=all.filter(e=>e.name==='hex_game_complete'),champions=completes.filter(e=>e.champion),copies=all.filter(e=>e.name==='challenge_code_copy'),shares=all.filter(e=>e.name==='share_card_open'),daily=all.filter(e=>e.name==='daily_start'),seed=all.filter(e=>e.name==='seed_challenge_start'),normal=starts.filter(e=>e.mode==='NORMAL'),builds={},endings={};for(const e of completes){const name=e.mainBuild?.name||e.mainBuild||'无主流派';const b=builds[name]||(builds[name]={games:0,titles:0,wins:0});b.games++;b.titles+=e.champion?1:0;b.wins+=Number(e.wins)||0;for(const id of e.rareEndings||[])endings[id]=(endings[id]||0)+1;}return{starts:starts.length,completes:completes.length,completionRate:starts.length?completes.length/starts.length:0,secondGameStarted:starts.length>=2,secondGameStartRate:completes.length&&starts.length>=2?1:0,averageCompletedGames:completes.length,normalStarts:normal.length,seedStarts:seed.length,dailyStarts:daily.length,championRate:completes.length?champions.length/completes.length:0,averageWins:completes.length?completes.reduce((s,e)=>s+(Number(e.wins)||0),0)/completes.length:0,challengeCopies:copies.length,shareOpens:shares.length,challengeCopyRate:completes.length?copies.length/completes.length:0,builds,endings};}
  root.HexAnalytics={KEY,LocalAnalyticsProvider,setProvider,trackEvent,getFlag,setFlag,events,summary};
})(typeof globalThis!=='undefined'?globalThis:window);
