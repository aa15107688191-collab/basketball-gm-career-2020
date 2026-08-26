(function (root) {
  'use strict';

  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const avg=(rows,key)=>rows.length?rows.reduce((sum,row)=>sum+(typeof key==='function'?key(row):row[key]),0)/rows.length:0;
  const mulberry32=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  const pick=(rows,rng=Math.random)=>rows[Math.floor(rng()*rows.length)];
  const sample=(rows,count,rng=Math.random)=>{const pool=[...rows],result=[];while(pool.length&&result.length<count)result.push(pool.splice(Math.floor(rng()*pool.length),1)[0]);return result;};

  const rows=[
    ['curry16','Stephen Curry','2016',['PG'],'LEGEND',93,91,99,91,82,58,62,90,5,5,4,5,5,2,'shooting,creator,offball'],
    ['magic87','Magic Johnson','1987',['PG','SF'],'LEGEND',95,84,72,99,82,78,88,91,5,4,5,5,5,5,'playmaker,size,multi'],
    ['paul08','Chris Paul','2008',['PG'],'ALL_NBA',88,90,82,98,94,58,70,88,4,4,5,5,5,2,'playmaker,defense,leader'],
    ['nash07','Steve Nash','2007',['PG'],'ALL_NBA',86,93,94,99,72,50,58,83,4,5,5,4,5,2,'shooting,playmaker,offball'],
    ['kidd03','Jason Kidd','2003',['PG'],'ALL_NBA',82,76,74,97,94,71,88,87,3,4,5,4,5,3,'playmaker,defense,rebound'],
    ['iverson01','Allen Iverson','2001',['PG','SG'],'LEGEND',96,91,82,82,80,48,58,97,5,2,2,5,4,2,'creator,slasher,clutch'],
    ['harden18','James Harden','2018',['PG','SG'],'LEGEND',95,88,94,94,78,55,70,88,5,2,3,5,4,3,'creator,shooting,playmaker'],
    ['wade09','Dwyane Wade','2009',['SG','PG'],'LEGEND',98,87,77,88,91,71,72,98,5,3,4,5,5,3,'slasher,defense,clutch'],
    ['kyrie16','Kyrie Irving','2016',['PG','SG'],'ALL_NBA',94,92,92,86,76,48,54,91,5,3,3,5,4,2,'creator,shooting,clutch'],
    ['rose11','Derrick Rose','2011',['PG'],'ALL_NBA',97,88,79,87,79,50,61,99,5,2,3,4,4,2,'slasher,creator,athletic'],
    ['luka24','Luka Doncic','2024',['PG','SF'],'LEGEND',96,92,92,97,78,62,86,82,5,2,3,5,5,4,'creator,playmaker,size'],
    ['jordan91','Michael Jordan','1991',['SG','SF'],'LEGEND',99,97,84,89,97,79,78,99,5,4,5,5,5,4,'creator,defense,clutch'],
    ['kobe06','Kobe Bryant','2006',['SG','SF'],'LEGEND',96,96,87,86,93,70,72,96,5,3,3,5,4,4,'creator,defense,clutch'],
    ['durant17','Kevin Durant','2017',['SF','PF'],'LEGEND',96,98,95,87,90,82,83,92,5,5,5,5,5,5,'shooting,offball,size'],
    ['lebron13','LeBron James','2013',['SF','PG','PF'],'LEGEND',99,91,87,96,94,86,88,99,5,4,4,5,5,5,'playmaker,slasher,multi'],
    ['bird86','Larry Bird','1986',['SF','PF'],'LEGEND',93,97,93,95,88,76,91,82,4,5,5,5,5,4,'shooting,playmaker,rebound'],
    ['kawhi19','Kawhi Leonard','2019',['SF','SG'],'ALL_NBA',92,94,88,80,99,83,79,91,4,4,5,5,5,4,'defense,creator,clutch'],
    ['pippen96','Scottie Pippen','1996',['SF','PG'],'ALL_NBA',88,84,78,91,99,86,84,94,3,4,5,4,5,4,'defense,playmaker,multi'],
    ['tmac03','Tracy McGrady','2003',['SG','SF'],'LEGEND',97,94,89,88,85,65,77,96,5,3,3,5,4,4,'creator,athletic,clutch'],
    ['klay16','Klay Thompson','2016',['SG','SF'],'STAR',85,89,97,76,96,66,67,86,3,5,5,5,5,3,'shooting,defense,offball'],
    ['ray01','Ray Allen','2001',['SG'],'ALL_NBA',89,91,96,78,83,57,66,91,4,5,4,4,5,3,'shooting,offball,athletic'],
    ['manu05','Manu Ginobili','2005',['SG','PG'],'STAR',90,84,89,88,88,62,64,88,4,4,5,5,4,3,'creator,playmaker,bench'],
    ['iguodala15','Andre Iguodala','2015',['SF','SG'],'ROLE',78,76,74,85,97,78,76,91,2,5,5,5,5,4,'defense,multi,bench'],
    ['duncan03','Tim Duncan','2003',['PF','C'],'LEGEND',96,94,32,82,86,99,98,89,4,4,5,5,5,5,'rim,rebound,post'],
    ['garnett04','Kevin Garnett','2004',['PF','C'],'LEGEND',94,95,72,89,93,98,97,96,4,5,5,5,5,5,'defense,rebound,multi'],
    ['giannis21','Giannis Antetokounmpo','2021',['PF','C','PG'],'LEGEND',99,79,70,89,91,96,96,99,5,3,4,5,5,5,'slasher,rim,multi'],
    ['dirk11','Dirk Nowitzki','2011',['PF','C'],'LEGEND',91,99,92,81,72,75,85,76,4,5,5,5,5,5,'shooting,post,clutch'],
    ['barkley90','Charles Barkley','1990',['PF','SF'],'LEGEND',99,89,70,84,82,78,99,97,5,3,4,5,4,4,'slasher,rebound,athletic'],
    ['malone97','Karl Malone','1997',['PF'],'LEGEND',98,94,58,81,87,86,94,94,5,4,4,4,5,5,'post,rebound,athletic'],
    ['davis20','Anthony Davis','2020',['PF','C'],'ALL_NBA',94,88,79,78,91,99,96,94,4,4,5,5,4,5,'rim,defense,offball'],
    ['draymond16','Draymond Green','2016',['PF','C','PG'],'STAR',76,75,81,94,98,96,91,88,2,5,5,4,5,4,'defense,playmaker,multi'],
    ['rodman96','Dennis Rodman','1996',['PF','C'],'ROLE',73,53,42,70,96,93,99,91,1,5,5,5,5,4,'rebound,defense,offball'],
    ['shaq00','Shaquille O’Neal','2000',['C'],'LEGEND',99,82,30,76,73,96,99,99,5,1,2,5,5,5,'post,rim,rebound'],
    ['hakeem94','Hakeem Olajuwon','1994',['C'],'LEGEND',97,93,36,82,91,99,98,96,4,4,5,5,5,5,'post,rim,defense'],
    ['jokic23','Nikola Jokic','2023',['C','PG'],'LEGEND',95,96,89,99,75,86,98,75,5,5,5,5,5,5,'playmaker,post,rebound'],
    ['kareem71','Kareem Abdul-Jabbar','1971',['C'],'LEGEND',99,97,30,78,79,98,97,94,5,4,4,5,5,5,'post,rim,rebound'],
    ['wilt67','Wilt Chamberlain','1967',['C'],'LEGEND',99,84,30,85,82,98,99,99,5,3,3,4,5,5,'post,rim,athletic'],
    ['russell65','Bill Russell','1965',['C'],'LEGEND',84,70,30,84,91,99,99,98,2,5,5,5,5,5,'rim,defense,rebound'],
    ['dwight11','Dwight Howard','2011',['C'],'ALL_NBA',93,64,30,65,80,99,99,98,4,3,4,4,4,5,'rim,rebound,athletic'],
    ['gobert21','Rudy Gobert','2021',['C'],'STAR',88,48,30,61,77,99,98,87,2,5,5,3,5,5,'rim,rebound,offball']
  ];

  const ages={curry16:27,magic87:27,paul08:22,nash07:32,kidd03:29,iverson01:25,harden18:28,wade09:27,kyrie16:23,rose11:22,luka24:24,jordan91:27,kobe06:27,durant17:28,lebron13:28,bird86:29,kawhi19:27,pippen96:30,tmac03:23,klay16:25,ray01:25,manu05:27,iguodala15:31,duncan03:26,garnett04:27,giannis21:26,dirk11:32,barkley90:26,malone97:33,davis20:26,draymond16:25,rodman96:34,shaq00:27,hakeem94:31,jokic23:27,kareem71:23,wilt67:30,russell65:30,dwight11:25,gobert21:28};
  const players=rows.map(row=>{const[id,name,season,positions,tier,fin,mid,three,pass,perimeterDefense,interiorDefense,rebound,athleticism,usage,offball,fit,clutch,consistency,size,tags]=row;return{id,name,season,age:ages[id],positions,tier,attributes:{fin,mid,three,pass,perimeterDefense,interiorDefense,rebound,athleticism},hidden:{usage,offball,fit,clutch,consistency,size},tags:tags.split(',')};});

  const hexes=[
    ['three_rain','三分雨','SILVER','全队三分能力＋4'],['paint_bully','禁区暴徒','SILVER','终结＋5，空间－2'],['youth','青春风暴','SILVER','年轻球员进攻与运动能力提升'],['veterans','老兵不死','SILVER','老将稳定性提升'],['bench_mob','板凳匪徒','SILVER','替补模拟权重＋15%'],['transition','防守反击','SILVER','外防优秀时进攻＋2'],['second_chance','二次进攻','SILVER','篮板收益＋15%'],['share_ball','人人有球打','SILVER','球权冲突降低40%'],['iron_defense','铁血防守','SILVER','防守＋4，疲劳风险提升'],['fourth_quarter','第四节先生','SILVER','关键比赛能力提升'],['endless_energy','无限体力','SILVER','主力权重提升，伤病风险增加'],['hot_hand','手感来了','SILVER','爆发表现概率提升'],
    ['one_star_four_shooters','一星四射','GOLD','明确核心与四射手触发强力空间'],['twin_towers','双塔时代','GOLD','双塔强化篮板与防守'],['death_lineup','死亡五小','GOLD','无传统中锋时强化空间和换防'],['switch_everything','无限换防','GOLD','四名多位置防守者触发'],['defense_titles','防守赢得总冠军','GOLD','季后赛防守大幅提升'],['run_gun','跑轰时代','GOLD','进攻＋4、防守－2'],['superstar_ball','巨星篮球','GOLD','三名传奇时缓解球权冲突'],['all_soldiers','全民皆兵','GOLD','无传奇阵容获得全面加成'],
    ['cosmic','宇宙篮球','PRISMATIC','空间达到92时进攻和组织爆发'],['absolute_core','绝对核心','PRISMATIC','第一核心获得更高数据权重'],['five_as_one','五个人一个人','PRISMATIC','化学达到90时POWER＋5%'],['gods','众神之队','PRISMATIC','四名传奇大幅缓解球权冲突']
  ].map(([id,name,quality,description])=>({id,name,quality,description}));

  const playerOff=p=>p.attributes.fin*.25+p.attributes.mid*.15+p.attributes.three*.25+p.attributes.pass*.20+p.attributes.athleticism*.15;
  const playerDef=p=>p.attributes.perimeterDefense*.40+p.attributes.interiorDefense*.35+p.attributes.athleticism*.15+p.attributes.rebound*.10;
  const playerSpace=p=>clamp(p.attributes.three*.60+p.attributes.mid*.15+p.hidden.offball*5,40,100);
  const playerCreate=p=>p.attributes.pass*.55+p.attributes.fin*.15+p.attributes.mid*.10+p.attributes.three*.10+p.attributes.athleticism*.10;
  const effectiveUsage=p=>p.hidden.usage-(p.hidden.offball-3)*.35-(p.hidden.fit-3)*.2;
  const usageMultiplier=usage=>usage<=14?1.01:usage<=15.5?1:usage<=17?.985:usage<=18.5?.965:usage<=20?.935:.90;
  const tierRank={ROLE:1,STAR:2,ALL_NBA:3,LEGEND:4};

  function calculateTeam(roster,starterIds,coreIds=[],hexIds=[],playoffs=false){
    const starters=starterIds.map(id=>roster.find(p=>p.id===id)).filter(Boolean).slice(0,5);
    while(starters.length<5){const extra=roster.find(p=>!starters.includes(p));if(!extra)break;starters.push(extra);}
    const bench=roster.filter(p=>!starters.includes(p));
    const selectedHexes=new Set(hexIds);
    const coreWeights=[.30,.24,.19],remainingWeight=(1-coreWeights.reduce((a,b)=>a+b,0))/Math.max(1,5-coreIds.length);
    const weights=starters.map(p=>{const index=coreIds.indexOf(p.id);return index>=0?coreWeights[index]:remainingWeight;});
    const totalWeight=weights.reduce((a,b)=>a+b,0)||1;
    let offense=starters.reduce((sum,p,i)=>sum+playerOff(p)*weights[i],0)/totalWeight;
    let defense=avg(starters,playerDef),space=avg(starters,playerSpace);
    let rebound=avg(starters,p=>p.attributes.rebound)*.8+avg(bench,p=>p.attributes.rebound)*.2;
    let playmaking=avg(starters,playerCreate);
    const usage=starters.reduce((sum,p)=>sum+effectiveUsage(p),0);
    let usageMult=usageMultiplier(usage);
    if(selectedHexes.has('share_ball'))usageMult=1-(1-usageMult)*.6;
    if(selectedHexes.has('superstar_ball')&&starters.filter(p=>p.tier==='LEGEND').length>=3)usageMult=1-(1-usageMult)*.5;
    if(selectedHexes.has('gods')&&starters.filter(p=>p.tier==='LEGEND').length>=4)usageMult=1-(1-usageMult)*.25;
    offense*=usageMult;
    const firstCore=starters.find(p=>p.id===coreIds[0]);
    const roleMismatch=firstCore?clamp((avg(starters,playerOff)-playerOff(firstCore))*.005,0,.05):0;
    offense*=1-roleMismatch;
    const positions=new Set(starters.flatMap(p=>p.positions));
    const guards=starters.filter(p=>p.positions.some(pos=>pos==='PG'||pos==='SG')).length;
    const bigs=starters.filter(p=>p.hidden.size===5).length;
    const structure=(positions.has('PG')&&positions.has('C')&&guards>=2)?5:(guards===0||bigs>=4)?-5:0;
    let chemistry=75+starters.reduce((sum,p)=>sum+(p.hidden.fit-3)*2,0)+structure-Math.max(0,(1-usageMult)*100*.65);
    const sharedTags=['shooting','defense','playmaker','offball'].reduce((bonus,tag)=>bonus+(starters.filter(p=>p.tags.includes(tag)).length>=3?2:0),0);
    chemistry+=sharedTags;
    const lowestDef=Math.min(...starters.map(playerDef));
    const weakPenalty=lowestDef>=85?0:lowestDef>=80?.5:lowestDef>=75?1:lowestDef>=70?2:lowestDef>=65?3.5:5;
    defense-=weakPenalty*(playoffs?1.4:1);
    const sizeTotal=starters.reduce((sum,p)=>sum+p.hidden.size,0);rebound+=sizeTotal>=20?3:sizeTotal>=17?0:sizeTotal>=14?-2:-5;
    let pace=1,clutch=avg(starters,p=>p.hidden.clutch),benchWeight=1,injuryRisk=0,hotHand=false,coreBoost=1;
    if(selectedHexes.has('three_rain'))space+=4;
    if(selectedHexes.has('paint_bully')){offense+=3;space-=2;}
    if(selectedHexes.has('youth')){const young=starters.filter(p=>p.age<=25).length;offense+=young*.6;}
    if(selectedHexes.has('veterans')){const veterans=starters.filter(p=>p.age>=32).length;chemistry+=veterans*.8;clutch+=veterans*.2;}
    if(selectedHexes.has('bench_mob')){benchWeight=1.15;offense+=2;defense+=1;}
    if(selectedHexes.has('transition')&&avg(starters,p=>p.attributes.perimeterDefense)>=85)offense+=2;
    if(selectedHexes.has('second_chance'))rebound+=4;
    if(selectedHexes.has('iron_defense')){defense+=4;injuryRisk+=.02;}
    if(selectedHexes.has('fourth_quarter'))clutch+=1;
    if(selectedHexes.has('endless_energy')){offense+=1.5;defense+=1.5;injuryRisk+=.025;}
    if(selectedHexes.has('hot_hand'))hotHand=true;
    if(selectedHexes.has('one_star_four_shooters')&&coreIds[0]&&starters.filter(p=>p.id!==coreIds[0]).every(p=>p.attributes.three>=85)){offense+=5;space+=4;}
    if(selectedHexes.has('twin_towers')&&bigs>=2){rebound+=6;defense+=3;space-=3;}
    if(selectedHexes.has('death_lineup')&&bigs===0){space+=5;defense+=5;rebound-=4;}
    if(selectedHexes.has('switch_everything')&&starters.filter(p=>p.positions.length>1||p.tags.includes('multi')).length>=4)defense+=6;
    if(selectedHexes.has('defense_titles'))defense+=playoffs?6:2;
    if(selectedHexes.has('run_gun')){pace=1.1;offense+=4;defense-=2;}
    if(selectedHexes.has('all_soldiers')&&starters.every(p=>p.tier!=='LEGEND')){offense+=4;defense+=4;chemistry+=5;}
    if(selectedHexes.has('cosmic')&&space>=92){offense+=6;playmaking+=4;}
    if(selectedHexes.has('absolute_core')&&coreIds[0]){offense+=5;coreBoost=1.25;}
    chemistry=clamp(chemistry,40,100);
    offense=clamp(offense,40,100);defense=clamp(defense,40,100);space=clamp(space,40,100);rebound=clamp(rebound,40,100);playmaking=clamp(playmaking,40,100);
    let power=offense*(playoffs?.31:.34)+defense*(playoffs?.33:.29)+rebound*.10+playmaking*.10+space*.07+chemistry*.10;
    power+=(clutch-3)*(playoffs?1.2:.35);
    const legendCount=starters.filter(p=>p.tier==='LEGEND').length;
    power+=1+legendCount*1.15+Math.max(0,(chemistry-80)*.23);
    if(legendCount>=4)power=Math.max(power,88.5);
    if(selectedHexes.has('five_as_one')&&chemistry>=90)power*=1.05;
    const rim=[...starters].sort((a,b)=>b.attributes.interiorDefense-a.attributes.interiorDefense).slice(0,2);const rimProtection=(rim[0]?.attributes.interiorDefense||0)*.7+(rim[1]?.attributes.interiorDefense||0)*.3;
    return{offense:Math.round(offense),defense:Math.round(defense),space:Math.round(space),rebound:Math.round(rebound),playmaking:Math.round(playmaking),chemistry:Math.round(chemistry),power:Math.round(clamp(power,40,105)*10)/10,usage:Math.round(usage*10)/10,rimProtection:Math.round(rimProtection),pace,benchWeight,injuryRisk,hotHand,coreBoost,roleMismatch:Math.round(roleMismatch*1000)/10,starters,bench};
  }

  function rollHexQuality(step,hasPrismatic=false,rng=Math.random){const r=rng()*100;if(step<=2)return r<75?'SILVER':'GOLD';if(step===3)return !hasPrismatic&&r>=95?'PRISMATIC':r<50?'SILVER':'GOLD';return !hasPrismatic&&r>=85?'PRISMATIC':r<30?'SILVER':'GOLD';}
  function offerPlayers(chosenIds=[],rng=Math.random){return sample(players.filter(p=>!chosenIds.includes(p.id)),3,rng);}
  function offerHexes(step,chosenIds=[],rng=Math.random){const hasPrismatic=chosenIds.some(id=>hexes.find(h=>h.id===id)?.quality==='PRISMATIC');let quality=rollHexQuality(step,hasPrismatic,rng);const result=[];for(let i=0;i<3;i++){let pool=hexes.filter(h=>!chosenIds.includes(h.id)&&!result.includes(h)&&(h.quality===quality||(!result.length&&h.quality!=='PRISMATIC')));if(!pool.length)pool=hexes.filter(h=>!chosenIds.includes(h.id)&&!result.includes(h));result.push(pick(pool,rng));quality=rollHexQuality(step,hasPrismatic||result.some(h=>h.quality==='PRISMATIC'),rng);}return result;}

  const tierRanges={S:[90,94],A:[85,90],B:[79,85],C:[73,79],D:[67,73]};
  const styles=['SHOOTING','DEFENSE','SMALL_BALL','TWIN_TOWERS','STAR_ISO','FAST_BREAK','BALANCED'];
  function generateOpponents(rng=Math.random){const tiers=[...Array(3).fill('S'),...Array(7).fill('A'),...Array(10).fill('B'),...Array(7).fill('C'),...Array(3).fill('D')];return tiers.map((tier,index)=>{const[min,max]=tierRanges[tier];return{id:`ai_${index+1}`,name:`联盟球队 ${String(index+1).padStart(2,'0')}`,tier,style:styles[index%styles.length],power:Math.round((min+rng()*(max-min))*10)/10};});}
  function styleModifier(team,opponent){if(opponent.style==='SHOOTING')return team.space>=90?.03:team.defense<80?-.04:0;if(opponent.style==='TWIN_TOWERS')return team.rebound>=88?.04:team.rimProtection<75?-.06:0;if(opponent.style==='SMALL_BALL')return team.defense>=88?.04:team.space<78?-.03:0;if(opponent.style==='DEFENSE')return team.playmaking>=88?.04:0;if(opponent.style==='FAST_BREAK')return team.defense>=85?.025:-.02;return 0;}
  function winChance(team,opponent,{home=true,form=0,playoffs=false}={}){const base=.5+(team.power-opponent.power)*.025+(home?.03:-.03)+clamp(form,-.05,.05)+styleModifier(team,opponent)+(playoffs?(team.chemistry-75)*.0015:0);return clamp(base,.05,.95);}
  function simulateGame(team,opponent,options={},rng=Math.random){const chance=winChance(team,opponent,options),win=rng()<chance;const pace=team.pace||1;let own=Math.round((104+(team.offense-80)*.65+(rng()-.5)*16)*pace),opp=Math.round((104-(team.defense-80)*.55+(opponent.power-80)*.45+(rng()-.5)*16)*pace);if(team.hotHand&&rng()<.10)own+=8;if(win&&own<=opp)own=opp+Math.ceil(2+rng()*9);if(!win&&own>=opp)opp=own+Math.ceil(2+rng()*9);return{win,own,opp,chance};}
  function playerGameLine(player,roleIndex,team,rng=Math.random){let usage=[1.36,1.16,1,.72,.64,.48,.42,.36][roleIndex]||.3;if(roleIndex===0)usage*=team.coreBoost||1;const points=clamp((playerOff(player)-64)*.78*usage*team.pace+(rng()-.5)*5,2,45);return{pts:points,reb:clamp((player.attributes.rebound-45)*.16*(roleIndex<5?1:.72)+(rng()-.5)*2,1,17),ast:clamp((player.attributes.pass-50)*.13*usage+(rng()-.5)*2,1,14),stl:clamp((player.attributes.perimeterDefense-60)*.035+rng(),.2,3),blk:clamp((player.attributes.interiorDefense-55)*.04+rng()*.8,.1,4),fg:clamp(.42+(playerOff(player)-75)*.003+(rng()-.5)*.04,.38,.62),three:clamp(.31+(player.attributes.three-70)*.003+(rng()-.5)*.05,.22,.52)};}
  function evaluateTags(team,record=null,champion=false){const tags=[];if(team.offense>=95)tags.push('进攻万花筒');if(team.defense>=95)tags.push('铜墙铁壁');if(team.space>=95)tags.push('五外噩梦');if(team.usage>18.5)tags.push('一个球不够分');if(team.chemistry>=95)tags.push('真正的团队篮球');if(team.rebound>=95)tags.push('篮板统治者');if(record?.wins>=70&&!champion)tags.push('常规赛之王');if(champion&&team.power<86)tags.push('黑马奇迹');return tags.length?tags.slice(0,3):['攻守平衡'];}

  root.HexEngine={players,hexes,clamp,mulberry32,sample,playerOff,playerDef,playerSpace,playerCreate,effectiveUsage,usageMultiplier,tierRank,calculateTeam,rollHexQuality,offerPlayers,offerHexes,generateOpponents,winChance,simulateGame,playerGameLine,evaluateTags};
})(typeof globalThis!=='undefined'?globalThis:window);
