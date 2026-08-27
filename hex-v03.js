(function(root){
  'use strict';

  const QUALITY_ORDER=['ROLE','STARTER','STAR','ALL_NBA','LEGEND'];
  const QUALITY_LABELS={ROLE:'角色球员',STARTER:'优质首发',STAR:'全明星',ALL_NBA:'联盟顶级',LEGEND:'传奇'};
  const QUALITY_COUNTS={ROLE:8,STARTER:12,STAR:10,ALL_NBA:8,LEGEND:2};
  const QUALITY_COST={ROLE:1,STARTER:2,STAR:4,ALL_NBA:5,LEGEND:7};
  const QUALITY_PROBABILITY=[['ROLE',.32],['STARTER',.34],['STAR',.22],['ALL_NBA',.10],['LEGEND',.02]];
  const POTENTIAL_LABELS=['D','C','B','A','S'];
  const TRAINING_PATHS={
    SHOOTING:{name:'射术训练',description:'三分与中距离提升',attributes:{three:4,mid:2}},
    DEFENSE:{name:'防守训练',description:'外线与内线防守提升',attributes:{perimeterDefense:3,interiorDefense:3}},
    PLAYMAKING:{name:'组织训练',description:'传球与阵容适配提升',attributes:{pass:4},hidden:{fit:1}},
    ATHLETIC:{name:'身体训练',description:'运动能力与终结提升',attributes:{athleticism:3,fin:3}},
    REBOUND:{name:'篮板训练',description:'篮板与内线防守提升',attributes:{rebound:4,interiorDefense:2}}
  };
  const ROUTES=[
    ['RECRUIT','TRAINING','MATCH'],
    ['MATCH','ELITE_MATCH','TRAINING'],
    ['RECRUIT','HEX','TRAINING'],
    ['ELITE_MATCH','HEX','MATCH']
  ];
  const NODE_LABELS={RECRUIT:'招募球员',TRAINING:'专项训练',MATCH:'关键比赛',ELITE_MATCH:'挑战强敌',HEX:'获取海克斯'};
  const NODE_DESCRIPTIONS={RECRUIT:'三张球员卡中选择一张，必须考虑阵容预算。',TRAINING:'选择一个方向，培养一名具体球员。',MATCH:'完成一场关键比赛，胜利获得2训练点。',ELITE_MATCH:'对手更强，获胜可获得3训练点。',HEX:'三选一获得一次球队强化。'};

  const clonePlayer=p=>({...p,positions:[...p.positions],attributes:{...p.attributes},hidden:{...p.hidden},tags:[...p.tags]});
  const score=(H,p)=>H.playerOff(p)*.42+H.playerDef(p)*.25+H.playerCreate(p)*.13+H.playerSpace(p)*.10+p.attributes.rebound*.10;
  const hashNumber=(V,text)=>V.hash(String(text))>>>0;

  function createProfiles(H,V){
    const ranked=[...H.players].sort((a,b)=>score(H,b)-score(H,a)||a.id.localeCompare(b.id));
    const qualityById={},ascending=[...ranked].reverse();let cursor=0;
    for(const quality of QUALITY_ORDER){
      const count=QUALITY_COUNTS[quality];
      ascending.slice(cursor,cursor+count).forEach(p=>qualityById[p.id]=quality);
      cursor+=count;
    }
    return Object.fromEntries(H.players.map(p=>{
      const quality=qualityById[p.id]||'ROLE',roll=hashNumber(V,`${p.id}|potential`)%100;
      const potential=roll<8?'S':roll<28?'A':roll<58?'B':roll<84?'C':'D';
      return[p.id,{quality,cost:QUALITY_COST[quality],potential,currentRating:Math.round(score(H,p))}];
    }));
  }

  function cardFrom(H,V,p,profiles=createProfiles(H,V)){
    const profile=profiles[p.id],card=clonePlayer(p);
    card.baseTier=p.tier;card.tier=profile.quality;card.cardQuality=profile.quality;
    card.cost=profile.cost;card.potential=profile.potential;card.currentRating=profile.currentRating;
    card.stars=1;card.growth=0;card.training=[];
    return card;
  }

  function rollQuality(rng){const roll=rng();let cursor=0;for(const [quality,chance] of QUALITY_PROBABILITY){cursor+=chance;if(roll<cursor)return quality}return'ROLE'}
  const fitsRequirement=(p,requirement)=>!requirement||(requirement==='handler'&&p.positions.some(x=>x==='PG'))||(requirement==='wing'&&p.positions.some(x=>x==='SG'||x==='SF'))||(requirement==='big'&&p.positions.some(x=>x==='PF'||x==='C'));

  function initialPack(H,V,seed){
    const profiles=createProfiles(H,V),rng=V.rngFor(seed,'v03_initial_pack',0),qualities=Array.from({length:5},()=>rollQuality(rng));
    if(qualities.every(q=>q==='ROLE'))qualities[Math.floor(rng()*qualities.length)]='STARTER';
    const remaining=[...qualities],chosen=[],requirements=['handler','wing','big',null,null];
    for(const requirement of requirements){
      let qualityIndex=remaining.findIndex(q=>H.players.some(p=>profiles[p.id].quality===q&&!chosen.includes(p.id)&&fitsRequirement(p,requirement)));
      if(qualityIndex<0)qualityIndex=0;
      const quality=remaining.splice(qualityIndex,1)[0],pool=H.players.filter(p=>profiles[p.id].quality===quality&&!chosen.includes(p.id)&&fitsRequirement(p,requirement));
      const fallback=H.players.filter(p=>profiles[p.id].quality===quality&&!chosen.includes(p.id));
      const source=pool.length?pool:fallback,p=source[Math.floor(rng()*source.length)];
      if(p)chosen.push(p.id);
    }
    return chosen.map(id=>cardFrom(H,V,H.players.find(p=>p.id===id),profiles));
  }

  function recruitOffer(H,V,seed,nodeIndex,roster){
    const profiles=createProfiles(H,V),chosen=new Set(roster.map(p=>p.id)),rng=V.rngFor(seed,'v03_recruit',nodeIndex),pool=H.players.filter(p=>!chosen.has(p.id));
    return H.sample(pool,Math.min(3,pool.length),rng).map(p=>cardFrom(H,V,p,profiles));
  }

  function routeOptions(seed,nodeIndex,V){
    const rows=(ROUTES[nodeIndex]||ROUTES[ROUTES.length-1]).map((type,i)=>({id:`${nodeIndex}_${type}`,type,label:NODE_LABELS[type],description:NODE_DESCRIPTIONS[type],difficulty:type==='ELITE_MATCH'?5:type==='MATCH'?3:0,reward:type==='ELITE_MATCH'?'3训练点':type==='MATCH'?'2训练点':type==='RECRUIT'?'球员三选一':type==='TRAINING'?'培养一名球员':'海克斯三选一'}));
    return HShuffle(rows,V.rngFor(seed,'v03_route',nodeIndex));
  }
  function HShuffle(rows,rng){const out=[...rows];for(let i=out.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}

  function trainPlayer(player,path){
    const config=TRAINING_PATHS[path];if(!config)return player;
    const next=clonePlayer(player),potentialBoost={D:.75,C:.9,B:1,A:1.2,S:1.4}[next.potential]||1;
    for(const [key,value] of Object.entries(config.attributes||{}))next.attributes[key]=Math.min(99,Math.round(next.attributes[key]+value*potentialBoost));
    for(const [key,value] of Object.entries(config.hidden||{}))next.hidden[key]=Math.min(5,Math.round((next.hidden[key]+value)*10)/10);
    next.training=[...(next.training||[]),path];next.growth=(next.growth||0)+1;next.currentRating=Math.min(99,(next.currentRating||70)+2);
    if(next.growth>=2&&next.stars<3){next.stars++;next.growth=0;next.cost=Math.min(7,next.cost+1)}
    return next;
  }

  const budgetUsed=roster=>roster.reduce((sum,p)=>sum+(p.cost||0),0);
  const canAdd=(roster,card,budget=30)=>roster.length<8&&budgetUsed(roster)+(card.cost||0)<=budget;
  const stars=p=>'★'.repeat(p.stars||1)+'☆'.repeat(3-(p.stars||1));

  root.HexV03={VERSION:'0.3-prototype',QUALITY_LABELS,QUALITY_PROBABILITY,TRAINING_PATHS,NODE_LABELS,NODE_DESCRIPTIONS,createProfiles,cardFrom,initialPack,recruitOffer,routeOptions,trainPlayer,budgetUsed,canAdd,stars};
})(typeof globalThis!=='undefined'?globalThis:window);
