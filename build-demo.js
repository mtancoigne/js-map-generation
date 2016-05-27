
/*

GENERAL FUNCTIONS

*/

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

// Ennemies are created dynamically with this function:
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

/*

OBJECTS CONFIGURATION

*/

var bossNames=[
  {name:'Acará virus', description:'The Acará virus (ACAV) is a possible species in the genus Bunyavirus, belonging to the Capim serogroup. It is isolated from sentinel mice, Culex species, and the rodent Nectomys squamipes in Para, Brazil and in Panama. The symptoms of the Acará virus is death. Sometimes reported to cause disease in humans.', more:'https://en.wikipedia.org/wiki/Acar%C3%A1_virus'},
  {name:'Banana virus X', description:'Cafeteria roenbergensis virus (CroV) is a giant virus that infects the marine bicosoecid flagellate Cafeteria roenbergensis. CroV has one of the largest genomes of all marine virus known, consisting of ~730,000 base pairs of double-stranded DNA', more:'https://en.wikipedia.org/wiki/Cafeteria_roenbergensis_virus'},
  {name:'Mokola virus', description:'Mokola virus (MOKV) is a RNA virus related to the Rabies virus that has been sporadically isolated from mammals across sub-Saharan Africa. The majority of isolates have come from domestic cats exhibiting symptoms characteristically associated to Rabies virus infection.', more:'https://en.wikipedia.org/wiki/Mokola_virus'},
  {name:'Nipah Virus', description:'Nipah virus was identified in April 1999, when it caused an outbreak of neurological and respiratory disease on pig farms in peninsular Malaysia, resulting in 257 human cases, including 105 human deaths and the culling of one million pigs.', more:'https://en.wikipedia.org/wiki/Henipavirus#Nipah_virus'},
]
var ennemyNames=[
  // Lazy me... http://alltoptens.com/top-ten-most-dangerous-bacteria-on-earth/
  // This list was completed with wikipedia articles and some names has been changed or removed when info wasn't clear enough.
  {name:'Escherichia coli', description:'Virulent strains can cause gastroenteritis, urinary tract infections, and neonatal meningitis. It can also be characterized by severe abdominal cramps, diarrhea that typically turns bloody within 24 hours, and sometimes fever.', more:'https://en.wikipedia.org/wiki/Escherichia_coli'},
  {name:'Clostridium Botulinum', description:'Infection with the bacterium may result in a potentially fatal disease called botulism. Botulinum is the most acutely lethal toxin known, with an estimated human median lethal dose (LD50) of 1.3–2.1 ng/kg intravenously or intramuscularly and 10–13 ng/kg when inhaled.', more:'https://en.wikipedia.org/wiki/Botulinum_toxin'},
  {name:'Salmonella', description:'Strains of Salmonella cause illnesses such as typhoid fever, paratyphoid fever, and food poisoning (salmonellosis).', more:'https://en.wikipedia.org/wiki/Salmonella'},
  {name:'Vibrio cholera', description:'Cholera affects an estimated 3–5 million people worldwide and causes 58,000–130,000 deaths a year as of 2010.While it is currently classified as a pandemic, it is rare in the developed world. Children are mostly affected.', more:'https://en.wikipedia.org/wiki/Cholera'},
  {name:'Clostridium tetani', description:'Tetanus toxin is a potent neurotoxin. On the basis of weight, tetanospasmin is one of the most potent toxins known (based on tests conducted on mice). The estimated minimum human lethal dose is 2.5 nanograms per kilogram of body weight, or 175 nanograms in a 70 kg (154 lb) human.', more:'https://en.wikipedia.org/wiki/Clostridium_tetani'},
  {name:'Aspergillus fumigatus', description:'An ubiquitous organism that is capable of living under extensive environmental stress. It is estimated that most humans inhale thousands of Aspergillus spores daily, but they do not affect most people’s health due to effective immune responses. Taken together, the major chronic, invasive and allergic forms of aspergillosis account for around 600,000 deaths annually worldwide.', more:'https://en.wikipedia.org/wiki/Aspergillosis'},
  {name:'Treponema pallidum', description:'Treponema pallidum is a spirochaete bacterium with subspecies that cause treponemal diseases such as syphilis, bejel, pinta, and yaws. The treponemes have a cytoplasmic and an outer membrane. Using light microscopy, treponemes are only visible using dark field illumination.', more:'https://en.wikipedia.org/wiki/Treponema_pallidum'},
  {name:'Streptococcus', description:'In addition to streptococcal pharyngitis (strep throat), certain Streptococcus species are responsible for many cases of pink eye, meningitis, bacterial pneumonia, endocarditis, erysipelas, and necrotizing fasciitis (the \'flesh-eating\' bacterial infections).', more:'https://en.wikipedia.org/wiki/Streptococcus'},
  {name:'Mycobacterium tuberculosis', description:'Tuberculosis generally affects the lungs, but can also affect other parts of the body. Most infections do not have symptoms, known as latent tuberculosis. About 10% of latent infections progress to active disease which, if left untreated, kills about half of those infected.', more:'https://en.wikipedia.org/wiki/Tuberculosis'},
]

// Base player stats
var basePlayerStats={life:50, damage:10, strenght:1, level:1};

// Player
// For ennemies and bosses, this should be filled after map generation, as the createEnnemies function
// needs infos baout the map.
var living_things={
  player: new Item({name:'Leukocyt', description: 'You, a white globule', canMove:true, stats: itemStats(basePlayerStats), className:'player'}),
}
var dead_things={};

// Pickable items
var availableItems={
  life_potion:    {name:'Life potion',       description: 'Gives you 50 points of life', storable:false, consumable:true,  className:'health'},
  token_strength: {name:'Token of strenght', description: 'Adds 1 to your strenght',     storable:true,  consumable:false, className:'chest'},
  token_damage:   {name:'Token of damage',   description: 'Adds 1 to your damage',       storable:true,  consumable:false, className:'chest'},
};

// Cell types used to generate the map
var cellTypes={
  wall:    {name:'wall',   isWalkable:false, classNames:['wall'],   isBaseCell:true},
  floor:   {name:'floor',  isWalkable:true,  classNames:['floor'],  isBaseCell:true},
  lava:    {name:'lava',   isWalkable:true,  classNames:['lava'],   damage:1},
  water:   {name:'water',  isWalkable:true,  classNames:['water']},
};
var samples=[
  // Square rooms
  [
    '00000000000000000',
    '01110001110001110',
    '01110001110001110',
    '01110001110001110',
    '00000000000000000',
    '00000000000000000',
    '00000000000000000',
    '01110001110001110',
    '01110001110001110',
    '01110001110001110',
    '00000000000000000',
    '00000000000000000',
    '00000000000000000',
    '01110001110001110',
    '01110001110001110',
    '01110001110001110',
    '00000000000000000',
  ],
  // Triangles
  [
    '00000000000000000',
    '01111100000000010',
    '01111000000000110',
    '01110000000001110',
    '01100000000011110',
    '01000000000111110',
    '00000000001111110',
    '01000000000111110',
    '01100000000011110',
    '01110000000001110',
    '01111000000000110',
    '01111100000000010',
    '00000000000000000',
  ],
  // Triangles2
  [
    '00000000000000000',
    '01111100000000010',
    '01111000000000110',
    '01110000000001110',
    '01100000000011110',
    '01000000000111110',
    '00000000001111110',
    '01000000000111110',
    '01100001000011110',
    '01110001100001110',
    '01111001000000110',
    '01111100000000010',
    '00000000000000000',
  ]
];
