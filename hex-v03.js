(function(root){
  'use strict';

  const QUALITY_ORDER=['ROLE','STARTER','STAR','ALL_NBA','LEGEND'];
  const QUALITY_LABELS={ROLE:'角色球员',STARTER:'优质首发',STAR:'全明星',ALL_NBA:'联盟顶级',LEGEND:'传奇'};
  const QUALITY_COUNTS={ROLE:8,STARTER:13,STAR:10,ALL_NBA:8,LEGEND:2};
  const QUALITY_COST={ROLE:1,STARTER:2,STAR:4,ALL_NBA:5,LEGEND:7};
  const QUALITY_PROBABILITY=[['ROLE',.32],['STARTER',.34],['STAR',.22],['ALL_NBA',.10],['LEGEND',.02]];
  const POTENTIAL_LABELS=['D','C','B','A','S'];
  const TRAINING_PATHS={
    SHOOTING:{name:'射术训练',description:'三分 +3，中投 +1；射手额外强化',attributes:{three:3,mid:1},tagBonus:{tag:'shooting',attributes:{three:1}}},
    DEFENSE:{name:'防守训练',description:'外防 +2，内防 +2；防守者额外强化',attributes:{perimeterDefense:2,interiorDefense:2},tagBonus:{tag:'defense',attributes:{perimeterDefense:1}}},
    PLAYMAKING:{name:'组织训练',description:'传球 +3，阵容适配提升',attributes:{pass:3},hidden:{fit:.35}},
    ATHLETIC:{name:'身体训练',description:'运动能力 +3，终结 +1',attributes:{athleticism:3,fin:1}},
    REBOUND:{name:'篮板训练',description:'篮板 +4，内防 +1',attributes:{rebound:4,interiorDefense:1}},
    OFFBALL:{name:'无球训练',description:'无球与适配提升，降低球权冲突',hidden:{offball:.65,fit:.35,usage:-.15}}
  };
  const POTENTIAL_MULTIPLIER={D:.85,C:.92,B:1,A:1.10,S:1.20};
  const QUALITY_NEXT={ROLE:'STARTER',STARTER:'STAR',STAR:'ALL_NBA'};
  const PLAYER_ADDITIONS=[{id:'jrue21',name:'朱·霍勒迪',season:2021,age:30,positions:['PG','SG'],tier:'STARTER',attributes:{fin:82,mid:80,three:79,pass:88,perimeterDefense:97,interiorDefense:70,rebound:72,athleticism:88},hidden:{usage:3,offball:5,fit:5,clutch:4,consistency:5,size:3},tags:['defense','playmaker','offball']}];
  const PLAYER_HEXES={
    focus_training:{name:'重点培养',quality:'SILVER',description:'+1成长，并强化最符合标签的属性'},
    shooting_camp:{name:'射术特训',quality:'SILVER',description:'三分+5，低于80时额外+2'},
    defense_expert:{name:'防守专家',quality:'SILVER',description:'外防+4、内防+2，低球权球员额外适配'},
    ballhandling_rebuild:{name:'控球改造',quality:'SILVER',description:'传球+5并成为第二组织点'},
    championship_piece:{name:'冠军拼图',quality:'GOLD',description:'角色球员的适配、无球和Boss稳定性提升'},
    evolution:{name:'进化',quality:'GOLD',description:'ROLE/STARTER品质提升一级并+1成长'},
    late_bloomer:{name:'大器晚成',quality:'GOLD',description:'A/S潜力普通卡核心属性强化并+2成长'},
    mortal_to_god:{name:'凡人登神',quality:'PRISMATIC',description:'ROLE/STARTER进化为ALL_NBA★★★'}
  };
  const AWAKENINGS={
    klay16:{id:'klay_light',name:'佛光普照',description:'Boss战可能进入三分爆发状态'},
    iguodala15:{id:'iggy_playoffs',name:'季后赛专家',description:'低球权时加强对Boss第一核心的限制'},
    rodman96:{id:'rodman_rebound',name:'篮板疯子',description:'显著提高团队篮板并压低二次进攻'},
    manu05:{id:'manu_sixth',name:'超级第六人',description:'替补阶段进攻效率提升'},
    draymond16:{id:'draymond_command',name:'防守指挥官',description:'强化换防、协防与防守化学'},
    jrue21:{id:'jrue_lock',name:'外线枷锁',description:'可重点限制一名后卫或锋卫核心'}
  };
  const ROUTES=[
    ['RECRUIT','TRAINING','MATCH'],
    ['MATCH','ELITE_MATCH','TRAINING'],
    ['RECRUIT','HEX','TRAINING'],
    ['ELITE_MATCH','HEX','MATCH']
  ];
  const NODE_LABELS={RECRUIT:'招募球员',TRAINING:'专项训练',MATCH:'关键比赛',ELITE_MATCH:'挑战强敌',HEX:'获取海克斯'};
  const NODE_DESCRIPTIONS={RECRUIT:'三张球员卡中选择一张，必须考虑阵容预算。',TRAINING:'选择一个方向，培养一名具体球员。',MATCH:'完成一场关键比赛，胜利获得2训练点。',ELITE_MATCH:'对手更强，获胜可获得3训练点。',HEX:'三选一获得一次球队强化。'};

  const clonePlayer=p=>({...p,positions:[...p.positions],attributes:{...p.attributes},hidden:{...p.hidden},tags:[...p.tags],training:[...(p.training||[])],upgradeHistory:[...(p.upgradeHistory||[])],awakenings:[...(p.awakenings||[])],playerHexes:[...(p.playerHexes||[])]});
  const playerPool=H=>[...H.players,...PLAYER_ADDITIONS];
  function runtimePlayer(p){const next=clonePlayer(p);next.stars=Math.max(1,Math.min(3,next.stars||1));next.starXp=Math.max(0,next.starXp??next.growth??0);next.growth=next.starXp;next.upgradeHistory=next.upgradeHistory||[];next.awakenings=next.awakenings||[];next.playerHexes=next.playerHexes||[];next.training=next.training||[];return next}
  const score=(H,p)=>H.playerOff(p)*.42+H.playerDef(p)*.25+H.playerCreate(p)*.13+H.playerSpace(p)*.10+p.attributes.rebound*.10;
  const hashNumber=(V,text)=>V.hash(String(text))>>>0;

  function createProfiles(H,V){
    const pool=playerPool(H),ranked=[...pool].sort((a,b)=>score(H,b)-score(H,a)||a.id.localeCompare(b.id));
    const qualityById={},ascending=[...ranked].reverse();let cursor=0;
    for(const quality of QUALITY_ORDER){
      const count=QUALITY_COUNTS[quality];
      ascending.slice(cursor,cursor+count).forEach(p=>qualityById[p.id]=quality);
      cursor+=count;
    }
    return Object.fromEntries(pool.map(p=>{
      const quality=qualityById[p.id]||'ROLE',roll=hashNumber(V,`${p.id}|potential`)%100;
      const potential=roll<8?'S':roll<28?'A':roll<58?'B':roll<84?'C':'D';
      return[p.id,{quality,cost:QUALITY_COST[quality],potential,currentRating:Math.round(score(H,p))}];
    }));
  }

  function cardFrom(H,V,p,profiles=createProfiles(H,V)){
    const profile=profiles[p.id],card=runtimePlayer(p);
    card.baseTier=p.tier;card.tier=profile.quality;card.cardQuality=profile.quality;
    card.cost=profile.cost;card.potential=profile.potential;card.currentRating=profile.currentRating;
    card.stars=1;card.starXp=0;card.growth=0;card.training=[];card.upgradeHistory=[];card.awakenings=[];card.playerHexes=[];
    return card;
  }

  function rollQuality(rng){const roll=rng();let cursor=0;for(const [quality,chance] of QUALITY_PROBABILITY){cursor+=chance;if(roll<cursor)return quality}return'ROLE'}
  const fitsRequirement=(p,requirement)=>!requirement||(requirement==='handler'&&p.positions.some(x=>x==='PG'))||(requirement==='wing'&&p.positions.some(x=>x==='SG'||x==='SF'))||(requirement==='big'&&p.positions.some(x=>x==='PF'||x==='C'));

  function initialPack(H,V,seed){
    const profiles=createProfiles(H,V),rng=V.rngFor(seed,'v03_initial_pack',0),qualities=Array.from({length:5},()=>rollQuality(rng));
    if(qualities.every(q=>q==='ROLE'))qualities[Math.floor(rng()*qualities.length)]='STARTER';
    const remaining=[...qualities],chosen=[],requirements=['handler','wing','big',null,null];
    for(const requirement of requirements){
      const pool=playerPool(H);let qualityIndex=remaining.findIndex(q=>pool.some(p=>profiles[p.id].quality===q&&!chosen.includes(p.id)&&fitsRequirement(p,requirement)));
      if(qualityIndex<0)qualityIndex=0;
      const quality=remaining.splice(qualityIndex,1)[0],eligible=pool.filter(p=>profiles[p.id].quality===quality&&!chosen.includes(p.id)&&fitsRequirement(p,requirement));
      const fallback=pool.filter(p=>profiles[p.id].quality===quality&&!chosen.includes(p.id));
      const source=eligible.length?eligible:fallback,p=source[Math.floor(rng()*source.length)];
      if(p)chosen.push(p.id);
    }
    const pool=playerPool(H);return chosen.map(id=>cardFrom(H,V,pool.find(p=>p.id===id),profiles));
  }

  function recruitOffer(H,V,seed,nodeIndex,roster){
    const profiles=createProfiles(H,V),chosen=new Set(roster.map(p=>p.id)),rng=V.rngFor(seed,'v03_recruit',nodeIndex),pool=playerPool(H).filter(p=>!chosen.has(p.id));
    return H.sample(pool,Math.min(3,pool.length),rng).map(p=>cardFrom(H,V,p,profiles));
  }

  function routeOptions(seed,nodeIndex,V){
    const rows=(ROUTES[nodeIndex]||ROUTES[ROUTES.length-1]).map((type,i)=>({id:`${nodeIndex}_${type}`,type,label:NODE_LABELS[type],description:NODE_DESCRIPTIONS[type],difficulty:type==='ELITE_MATCH'?5:type==='MATCH'?3:0,reward:type==='ELITE_MATCH'?'3训练点':type==='MATCH'?'2训练点':type==='RECRUIT'?'球员三选一':type==='TRAINING'?'培养一名球员':'海克斯三选一'}));
    return HShuffle(rows,V.rngFor(seed,'v03_route',nodeIndex));
  }
  function HShuffle(rows,rng){const out=[...rows];for(let i=out.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}

  function applyDelta(next,attributes={},hidden={},multiplier=1){const gains={};for(const [key,value] of Object.entries(attributes)){const before=next.attributes[key],gain=Math.max(1,Math.round(value*multiplier));next.attributes[key]=Math.min(99,before+gain);gains[key]=next.attributes[key]-before}for(const [key,value] of Object.entries(hidden)){const before=next.hidden[key],gain=Math.round(value*multiplier*10)/10;next.hidden[key]=Math.max(1,Math.min(5,Math.round((before+gain)*10)/10));gains[key]=Math.round((next.hidden[key]-before)*10)/10}return gains}
  function starUpgrade(H,player,newStars,source){const next=runtimePlayer(player),tags=new Set(next.tags),scale=newStars===3?1.35:1,attributes={},hidden={};if(tags.has('shooting')){attributes.three=3*scale;hidden.offball=.35*scale}if(tags.has('defense')){attributes.perimeterDefense=(attributes.perimeterDefense||0)+2*scale;attributes.interiorDefense=(attributes.interiorDefense||0)+1*scale}if(tags.has('rebound')){attributes.rebound=(attributes.rebound||0)+3*scale;attributes.interiorDefense=(attributes.interiorDefense||0)+1*scale}if(tags.has('playmaker')){attributes.pass=(attributes.pass||0)+3*scale;hidden.fit=.3*scale}if(tags.has('offball'))hidden.offball=(hidden.offball||0)+.4*scale;if(tags.has('creator')||tags.has('slasher')){attributes.fin=(attributes.fin||0)+2*scale;attributes.athleticism=(attributes.athleticism||0)+1*scale}if(!Object.keys(attributes).length&&!Object.keys(hidden).length){attributes.fin=2*scale;attributes.perimeterDefense=1*scale}const gains=applyDelta(next,attributes,hidden,1);next.stars=newStars;next.currentRating=Math.min(99,Math.round(score(H,next)));next.upgradeHistory.push({type:'STAR_UP',source,stars:newStars,gains});return next}
  function addStarXp(H,player,amount=1,source='成长'){let next=runtimePlayer(player);if(next.stars>=3)return next;next.starXp+=amount;next.growth=next.starXp;while(next.stars<3){const need=next.stars===1?2:3;if(next.starXp<need)break;next.starXp-=need;next.growth=next.starXp;next=starUpgrade(H,next,next.stars+1,source)}return next}
  function trainingPreview(player,path){const config=TRAINING_PATHS[path];if(!config)return null;const multiplier=POTENTIAL_MULTIPLIER[player.potential]||1,attributes={...config.attributes},hidden={...config.hidden};if(config.tagBonus&&player.tags.includes(config.tagBonus.tag))for(const [key,value] of Object.entries(config.tagBonus.attributes||{}))attributes[key]=(attributes[key]||0)+value;return{path,name:config.name,description:config.description,multiplier,attributes,hidden,starXp:1}}
  function trainPlayer(player,path,H=null,rng=null){const preview=trainingPreview(player,path);if(!preview)return player;let next=runtimePlayer(player);const gains=applyDelta(next,preview.attributes,preview.hidden,preview.multiplier);next.training.push({path,gains});next.upgradeHistory.push({type:'TRAINING',path,gains});if(H)next=addStarXp(H,next,1,path);else{next.starXp++;next.growth=next.starXp}if(H&&rng&&['A','S'].includes(next.potential)&&rng()<(next.potential==='S'?.35:.2))next=addStarXp(H,next,1,'潜力爆发');if(H)next.currentRating=Math.min(99,Math.round(score(H,next)));return next}
  function duplicateKey(p){return`${p.id}|${p.season}`}
  function isDuplicate(roster,card){return roster.some(p=>duplicateKey(p)===duplicateKey(card))}
  function resolveDuplicate(H,player,choice){const next=runtimePlayer(player);if(next.stars>=3||choice==='training')return{player:next,trainingPoints:2,converted:'training'};return{player:addStarXp(H,next,1,'重复卡'),trainingPoints:0,converted:'growth'}}
  function applyPlayerHex(H,player,hexId){const hex=PLAYER_HEXES[hexId];if(!hex)return{player,status:'invalid'};let next=runtimePlayer(player),status='applied';const quality=next.cardQuality||next.tier;if(hexId==='focus_training'){next=addStarXp(H,next,1,hex.name);const key=next.tags.includes('shooting')?'three':next.tags.includes('defense')?'perimeterDefense':next.tags.includes('rebound')?'rebound':next.tags.includes('playmaker')?'pass':'fin';applyDelta(next,{[key]:2})}else if(hexId==='shooting_camp')applyDelta(next,{three:next.attributes.three<80?7:5});else if(hexId==='defense_expert'){applyDelta(next,{perimeterDefense:4,interiorDefense:2},next.hidden.usage<=2?{fit:1}:{})}else if(hexId==='ballhandling_rebuild'){applyDelta(next,{pass:5});if(!next.tags.includes('playmaker'))next.tags.push('playmaker');next.secondaryCreator=true}else if(hexId==='championship_piece'){if(!['ROLE','STARTER'].includes(quality))return{player:next,status:'ineligible'};applyDelta(next,{}, {fit:1,offball:.8,consistency:.4})}else if(hexId==='evolution'){if(!['ROLE','STARTER'].includes(quality)||next.evolved)return{player:next,status:'ineligible'};next.cardQuality=QUALITY_NEXT[quality];next.tier=next.cardQuality;next.cost=QUALITY_COST[next.cardQuality];next.evolved=true;next=addStarXp(H,next,1,hex.name)}else if(hexId==='late_bloomer'){if(!['A','S'].includes(next.potential)||!['ROLE','STARTER'].includes(quality))return{player:next,status:'ineligible'};const keys=next.tags.includes('shooting')?{three:6,mid:3}:next.tags.includes('defense')?{perimeterDefense:5,interiorDefense:4}:next.tags.includes('rebound')?{rebound:6,interiorDefense:3}:{pass:5,fin:4};applyDelta(next,keys);next=addStarXp(H,next,2,hex.name)}else if(hexId==='mortal_to_god'){if(!['ROLE','STARTER'].includes(quality))return{player:next,status:'ineligible'};next.cardQuality='ALL_NBA';next.tier='ALL_NBA';next.cost=QUALITY_COST.ALL_NBA;next=addStarXp(H,next,5,hex.name);const key=next.tags.includes('shooting')?'three':next.tags.includes('defense')?'perimeterDefense':next.tags.includes('rebound')?'rebound':'pass';applyDelta(next,{[key]:5})}next.playerHexes.push(hexId);next.currentRating=Math.min(99,Math.round(score(H,next)));next.upgradeHistory.push({type:'PLAYER_HEX',hexId});return{player:next,status}}
  function checkAwakening(player,{starterIds=[],buildTags=[]}={}){const next=runtimePlayer(player),config=AWAKENINGS[next.id];if(!config||next.awakenings.includes(config.id))return{player:next,awakened:null};const has=tag=>buildTags.includes(tag)||next.tags.includes(tag);let active=false;if(next.id==='klay16')active=next.stars>=2&&next.attributes.three>=96&&has('shooting');if(next.id==='iguodala15')active=next.stars>=3&&has('defense');if(next.id==='rodman96')active=next.attributes.rebound>=99&&(has('defense')||has('rebound'));if(next.id==='manu05')active=next.stars>=2&&!starterIds.includes(next.id);if(next.id==='draymond16')active=next.stars>=2&&(has('defense')||has('multi'));if(next.id==='jrue21')active=next.stars>=3&&next.attributes.perimeterDefense>=96;if(active){next.awakenings.push(config.id);next.upgradeHistory.push({type:'AWAKENING',id:config.id});return{player:next,awakened:config}}return{player:next,awakened:null}}

  const budgetUsed=roster=>roster.reduce((sum,p)=>sum+(p.cost||0),0);
  const canAdd=(roster,card,budget=30)=>roster.length<8&&budgetUsed(roster)+(card.cost||0)<=budget;
  const stars=p=>'★'.repeat(p.stars||1)+'☆'.repeat(3-(p.stars||1));

  root.HexV03={VERSION:'0.3-phase2',QUALITY_LABELS,QUALITY_PROBABILITY,QUALITY_COST,TRAINING_PATHS,POTENTIAL_MULTIPLIER,PLAYER_HEXES,AWAKENINGS,PLAYER_ADDITIONS,NODE_LABELS,NODE_DESCRIPTIONS,playerPool,runtimePlayer,createProfiles,cardFrom,initialPack,recruitOffer,routeOptions,trainingPreview,trainPlayer,addStarXp,duplicateKey,isDuplicate,resolveDuplicate,applyPlayerHex,checkAwakening,budgetUsed,canAdd,stars};
})(typeof globalThis!=='undefined'?globalThis:window);
