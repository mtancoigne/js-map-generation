/*

OBJECTS CONFIGURATION

*/

// Some bosses :
var bossNames=[
  {name:'Acará virus', description:'The Acará virus (ACAV) is a possible species in the genus Bunyavirus, belonging to the Capim serogroup. It is isolated from sentinel mice, Culex species, and the rodent Nectomys squamipes in Para, Brazil and in Panama. The symptoms of the Acará virus is death. Sometimes reported to cause disease in humans.', more:'https://en.wikipedia.org/wiki/Acar%C3%A1_virus'},
  {name:'Banana virus X', description:'Cafeteria roenbergensis virus (CroV) is a giant virus that infects the marine bicosoecid flagellate Cafeteria roenbergensis. CroV has one of the largest genomes of all marine virus known, consisting of ~730,000 base pairs of double-stranded DNA', more:'https://en.wikipedia.org/wiki/Cafeteria_roenbergensis_virus'},
  {name:'Mokola virus', description:'Mokola virus (MOKV) is a RNA virus related to the Rabies virus that has been sporadically isolated from mammals across sub-Saharan Africa. The majority of isolates have come from domestic cats exhibiting symptoms characteristically associated to Rabies virus infection.', more:'https://en.wikipedia.org/wiki/Mokola_virus'},
  {name:'Nipah Virus', description:'Nipah virus was identified in April 1999, when it caused an outbreak of neurological and respiratory disease on pig farms in peninsular Malaysia, resulting in 257 human cases, including 105 human deaths and the culling of one million pigs.', more:'https://en.wikipedia.org/wiki/Henipavirus#Nipah_virus'},
]

// Some ennemies : bacterias and fungis
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
