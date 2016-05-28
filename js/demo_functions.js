
/**
  Demo : creates and renders the map
  @param object o - A list of named options
*/
function createAndRenderMap(o){
  defaults={
    mapOptions:{},
    // Min room size on cleaning.
    minRoomSize:50,
    createEnnemies:true,
    ennemiesPercent:10,
    createBoss:true,
    createLifePotions:true,
    lifePotionsMapPercent:2,
    createStrenghtTokens:true,
    createDamageTokens:true,
    strenghtTokenMapPercent:3,
    damageTokenMapPercent:3,
    placeLivingThings:true,
    placeDeadThings:true,
    drawRooms:true,
    drawPathes:true,
    useSample:false,
    placeObjectsOnDamagingCells:true,
    sample:[],
  }
  for(let i in defaults){
    if(o[i]===undefined){
      o[i]=defaults[i];
    }
  }

  map = new MapGen(o.mapOptions);
  // Generating the map
  map.createMap();
  //map.createMapFromSample(samples[2]);
  map.createRooms();
  if(o.minRoomSize>0){map.removeSmallRooms(o.minRoomSize);}

  // At this point we can consider the map geography won't change, so we can
  // generate some data about it
  var walkableCells=map._getWalkableCells(false);
  var walkableSafeCells=map._getWalkableCells(true);

  /*
    "game" specific "mechanisms" here. This is not included in the class
    (beside of map.addItem())
  */

  // Creating ennemies, taking size of the map in account
  if(o.createEnnemies){('ennemy', living_things.player.level, walkableSafeCells.length);}
  if(o.createBoss){createEnnemies('boss', living_things.player.level, null, 1);}
  // Adding to the map
  if(o.placeLivingThings){map.addItems(living_things, true);}
  // Creating life potions
  if(o.createLifePotions){createSimpleItem('life_potion', walkableSafeCells.length, o.lifePotionsMapPercent);}
  // Creating chests
  if(o.createStrenghtTokens){createSimpleItem('token_strength', walkableSafeCells.length, o.strenghtTokenMapPercent);}
  if(o.createDamageTokens){createSimpleItem('token_damage', walkableSafeCells.length, o.damageTokenMapPercent);}
  // Adding them to the map.
  if(o.placeDeadThings){map.addItems(dead_things, !o.placeObjectsOnDamagingCells);}

  // Debug
  //map.outlineRooms();
  if(o.drawPathes){map._findPaths();}

  // Render the map
  map.jQueryRender('#grid');

  /***************************************************************************
  Beside this point, it's only debugging things (room overlays, and paths essay)

  */
  var cellSize= 14;

  /*
    Rooms overlays... May be included in the class later...
  */
  if(o.drawRooms){
    for(let i in map.rooms){
      $('#rooms').append('<div class="'+map.cssPrefix+'room '+map.cssPrefix+'room-'+map.rooms[i].id+'-overlay" style="top:'+(map.rooms[i].box.xMin*cellSize)
      +'px; left:'+(map.rooms[i].box.yMin*cellSize)
      +'px; height:'+((map.rooms[i].box.xMax-map.rooms[i].box.xMin+1)*cellSize)
      +'px; width:'+((map.rooms[i].box.yMax-map.rooms[i].box.yMin+1)*cellSize)
      +'px"><h2>'+map.rooms[i].id+'</h2>'+(map.rooms[i].box.xMax-map.rooms[i].box.xMin)+' x '+(map.rooms[i].box.yMax-map.rooms[i].box.yMin)+'<br>C: '+map.rooms[i].box.cX+' x '+map.rooms[i].box.cY+'</div>')
    }
  }

  if(o.drawPathes){
    $('#grid').prepend('<canvas id="'+map.cssPrefix+'pathes" width="'+(map.grid[0].length*cellSize)+'px" height="'+(map.grid.length*cellSize)+'px"></canvas>');
    /*
      Drawing all pathes on the overlay. May be included later as a class function.
    */
    var cId=map.cssPrefix+'pathes';
    var c=document.getElementById(cId);
    var ctx=c.getContext("2d");
    ctx.lineWidth =2;
    ctx.strokeStyle = '#096f00';
    ctx.beginPath();
    for (let i=0; i<map.distances.length; i++){
      let idx1=map._getRoomIndex(map.distances[i][1][0]);
      let idx2=map._getRoomIndex(map.distances[i][1][1])
      ctx.moveTo((map.rooms[idx1].box.cY*cellSize), (map.rooms[idx1].box.cX*cellSize));
      ctx.lineTo((map.rooms[idx2].box.cY*cellSize), (map.rooms[idx2].box.cX*cellSize));
    }
    ctx.closePath();
    ctx.stroke();
  }
}

/**
  Generates item states, so all items have the same
*/
function itemStats(options){
  var o={
    // Life of the cell. -1 is infinite, 0 is dead;
    life:-1,
    // Attack power
    damage:0,
    // Strenght level
    strenght:0,
    // Current level (maybe that should be calculated from XP)
    level:1,
    // Current experience
    xp:0,
    // How much xp is won with this
    giveXp:0
  };

  // Filling properties
  for(let i in o){
    if(options[i]!=undefined){o[i]=options[i];}
  }
  return o;
}

/**
  Represents an item (static item, ennemy, player,...)
  @constructor
  @param object options - A list of named options.
*/
var Item=function(options){
  var o={
    name:'NO NAME',
    description: 'NO DESCRIPTION',
    canMove:false,
    storable: false,
    consumable: false,
    effects:[],
    inventory:[],
    stats:{},
    className:'item',
  };
  // Filling properties
  for(let i in o){
    if(options[i]!=undefined){this[i]=options[i];}
    else{this[i]=o[i];}
  }
};

/**
  Generate ennemies and adds them to the living_things
  @param string type - The type of ennemy (ennemy/boss)
  @param int playerLevel - Player level, to generate ennemy stats
  @param int walkableCells - Number of walkable cells to base ennemies number
  @param int number - Forces the ennemy number
*/
function createEnnemies(type, playerLevel, walkableCells, number){
  var nb=0;
  if(number!=undefined){
    nb=number;
  }else{
    nb=Math.floor(5*walkableCells/100);
  }
  // Number of ennemies to generate:
  var ennemies={};
  for(let i=0; i<nb; i++){
    // Select random ennemy
    let ennemy=ennemyNames[Math.floor(Math.random()*ennemyNames.length)];
    let ennemyStats={};
    // Generate random states
    var randomGen=Math.floor(Math.random()*101);
    if(randomGen<80){
      ennemyStats.life=basePlayerStats.life*0.8;
      ennemyStats.damage=basePlayerStats.damage;
      ennemyStats.strenght=basePlayerStats.strenght;
      ennemyStats.level=basePlayerStats.level;
      ennemyStats.giveXp=ennemyStats.level*10;
    }else if (randomGen<90) {
      ennemyStats.life=basePlayerStats.life*1.1;
      ennemyStats.damage=Math.ceil(basePlayerStats.damage*(Math.floor(Math.random()*0.2)+1));
      ennemyStats.strenght=Math.ceil(basePlayerStats.strenght*(Math.floor(Math.random()*0.2)+1));
      ennemyStats.level=basePlayerStats.level+1;
      ennemyStats.giveXp=ennemyStats.level*20;
    }else if(randomGen<97) {
      ennemyStats.life=basePlayerStats.life*1.4;
      ennemyStats.damage=Math.ceil(basePlayerStats.damage*(Math.floor(Math.random()*0.4)+1));
      ennemyStats.strenght=Math.ceil(basePlayerStats.strenght*(Math.floor(Math.random()*0.4)+1));
      ennemyStats.level=basePlayerStats.level+2;
      ennemyStats.giveXp=ennemyStats.level30;
    }else{
      ennemyStats.life=basePlayerStats.life*1.6;
      ennemyStats.damage=Math.ceil(basePlayerStats.damage*(Math.floor(Math.random()*0.6)+1));
      ennemyStats.strenght=Math.ceil(basePlayerStats.strenght*(Math.floor(Math.random()*0.6)+1));
      ennemyStats.level=basePlayerStats.level+3;
      ennemyStats.giveXp=ennemyStats.level*40;
    }

     living_things[type+'_'+i]=new Item({
      name:ennemy.name,
      description:ennemy.description+' <a href="'+ennemy.more+'" target="_blank">More...</a>',
      canMove:true,
      stats: itemStats(ennemyStats),
      className: (number===1?'boss': 'ennemy'),
    })
  }
}

/**
  Creates items and add them to dead_things
  @param string name - Item index in availableItems
  @param int walkableCells - Number of walkable cells on the map
  @param float percent - Percentage of walkable cells to use for this item
  @param int number - Optionnal override for the number of items to place.
*/
function createSimpleItem(name, walkableCells, percent, number){
  var nb=0;
  if(number!=undefined){
    nb=number
  }else{
    nb=Math.floor((walkableCells*Math.random()*percent)/100)
  }
  for(i=0; i<nb; i++){
    dead_things[name+'_'+i]=new Item(availableItems[name]);
  }
}


/**
  Renders Json data in a UL
  @param json json - Json data

  @return string - Html elements
*/
function displayData(json){
  var content='<ul>'
  for(let i in json){
    content+='<li>';
    var item='';
    switch(typeof json[i]){
      case 'object':
        item=displayData(json[i]);
        break;
      case 'function':
        item='(function)';
        break;
      default:
        item=json[i];
        break;
    }
    content+='<strong>'+i+':</strong> '+item;
    content+='</li>';
  }
  content+='</ul>'
  return content;
}