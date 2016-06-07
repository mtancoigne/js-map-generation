
"use strict";
/**
Generates a map for dungeons-crawling games.
Original idea found here: http://web.archive.org/web/20110825054218/http://properundead.com/2009/03/cave-generator.html

@author mtancoigne, 15/05/2016
@license MIT
@version 0.1 - Random rooms without pathes.

@constructor

The object can be created with an object of options as follow:
{
  // Base map width
  x: integer,
  // Base map width
  y: integer,
  // Number of subdivisions
  passes: integer,
  // Cleaning level (0-5)
  cleanLevel: integer,
  // Percentage of walls
  wallPercent: integer,
  // When creating sub-cells, percentage of chances to have the same type:
  sameSubCellPercent:integer,
  // Css prefix for classes
  cssPrefix: string
};
*/
const MapGen=function(options){

  // Passing options to this
  this.x                  = options[x] != undefined ? options[x] :                                   5;
  this.y                  = options[y] != undefined ? options[y] :                                   5;
  this.passes             = options[passes] != undefined ? options[passes] :                         4;
  this.cleanLevel         = options[cleanLevel] != undefined ? options[cleanLevel] :                 2;
  this.wallPercent        = options[wallPercent] != undefined ? options[wallPercent] :               50;
  this.sameSubCellPercent = options[sameSubCellPercent] != undefined ? options[sameSubCellPercent] : 80;
  this.cssPrefix          = options[cssPrefix] != undefined ? options[cssPrefix] :                   'map-';
  this.cellTypes          = options[cellTypes] != undefined ? options[cellTypes] : {
    wall:    {name:'wall',   isWalkable:false, classNames:['wall'],   canMove:false, useInMapGen:true, isBaseCell:true},
    floor:   {name:'floor',  isWalkable:true,  classNames:['floor'],  canMove:false, useInMapGen:true, isBaseCell:true},
  },
  this.items={};
  this.cells={};
  this.grid=[];

  // Base cell names
  this.WALL='wall';
  this.FLOOR='floor';

  // Checking base types.
  if(!this.cellTypes.hasOwnProperty('wall')){console.warn('You have not defined any wall in your cell types.');}
  if(!this.cellTypes.hasOwnProperty('floor')){console.warn('You have not defined any floor in your cell types.');}
}

/**
  Represents a cell
*/
MapGen.prototype.Cell=function(id, x, y, room, type){
  return{
    // Cell id
    id: id != undefined ? id : null,
    // Placement in x
    x: x != undefined ? x : null,
    // Placement in Y
    y: x != undefined ? y : null,
    // Room id
    roomId: room != undefined ? room : null,
    // Cell type
    type: type != undefined ? type : null,
  }
}

/**
  Represents a cell type
*/
MapGen.prototype.CellType=function(options){
  var o={
    // Name
    name:null,
    // Is it possible to walk on it ?
    isWalkable:null,
    // CSS classes
    classNames:[],
    // Can the object move ?
    canMove:false,
    // How much damage does this cell does ?
    damage: 0,
    // Is it a base cell ? (floor and wall only.)
    isBaseCell:false,
  };

  return Object.assign(o, options);
}
/**
  Returns the current cell type, or a WALL if outside of the map.
  @param x int - Current row
  @param y int - Current col
*/
MapGen.prototype._getCellType=function(x, y){
  if(x>=0 && y>=0 && x<this.grid[0].length && y<this.grid.length){
    return this.cells[x+':'+y].type.name;//grid[x][y];
  }else{
    return this.WALL; // Outside the map, so it's a wall.
  }
}

/**
  Count direct neighbours of the same type
  @param x int - Current row
  @param y int - Current col
*/
MapGen.prototype._getCellSameDirectNeighbours=function(x, y){
  var currentType=this._getCellType(x, y);
  var cellsToCheck=[[x-1, y], [x, y-1], [x, y+1], [x+1, y]];
  var sum=0;
  // Cumulate the values
  for(let i=0; i<cellsToCheck.length; i++){
    if(this._getCellType(cellsToCheck[i][0], cellsToCheck[i][1]) === currentType){
      sum++;
    }
  }
  return sum;
}

/**
 Count global neighbours of the same type
 @param x int - Current row
 @param y int - Current col
*/
MapGen.prototype._getCellSameNeighbours=function(x, y){
 var currentType=this._getCellType(x, y);
 var cellsToCheck=[[x-1, y-1], [x-1, y], [x-1, y+1], [x, y-1], [x, y+1], [x+1, y-1], [x+1, y], [x+1, y+1]];
 var sum=0;
 // Cumulate the values
 for(let i=0; i<cellsToCheck.length; i++){
   if(this._getCellType(cellsToCheck[i][0], cellsToCheck[i][1]) === currentType){
     sum++;
   }
 }
 return sum;
}

/**
 Returns the dominant type of surrounding cells.
 @param x int - Current row
 @param y int - Current col
*/
MapGen.prototype._getCellDominantDirectNeighbours=function (x, y){
 var types={};
 var cellsToCheck=[[x-1, y-1], [x-1, y], [x-1, y+1], [x, y-1], [x, y], [x, y+1], [x+1, y-1], [x+1, y], [x+1, y+1]];
 for(let i=0; i<cellsToCheck.length; i++){
   var type=this._getCellType(cellsToCheck[i][0], cellsToCheck[i][1]);
   if(types[type]===undefined){
     types[type]=0;
   }
   types[type]++;
 }
 var cellTypes=Object.keys(types);
 var max=0;
 var maxType='';
 for(let i=0; i<cellTypes.length; i++){
   if(types[cellTypes[i]]>max){ // Higher value
     max=types[cellTypes[i]];
     maxType=cellTypes[i];
   }
 }
 return maxType;
}

/**
  Check if the given cell is already registered in a room.
  If true, returns the room number.
  @param x int - Current row
  @param y int - Current col
*/
MapGen.prototype._isInARoom=function(x, y){
  if(this.cells[x+':'+y].roomId!=null){
    return this.cells[x+':'+y].roomId;
  }
  return false;
}

/**
  Returns the index of the given room in this.rooms or false if not found.
  @param int roomId - Id of the targeted room
*/
MapGen.prototype._getRoomIndex=function(roomId){
  for(let i=0; i<this.rooms.length; i++){
    if(this.rooms[i].id===roomId){
      return i;
    }
  }
  return false;
}

/**
  Find all the cells in a room.
  @param x int - X position of the starting point
  @param y int - Y position of the starting point
  @param roomId - Room id
*/
MapGen.prototype._fillRoom=function(x, y, roomId){
  var cells=this._getWalkableCellsAround(x, y);
  for(let i=0; i<cells.length; i++){
    // New cell ?
    if(this._isInARoom(cells[i][0], cells[i][1])===false){
      // Adding to list
      this.rooms[this._getRoomIndex(roomId)].cells.push([cells[i][0], cells[i][1]]);
      this.cells[cells[i][0]+':'+cells[i][1]].roomId=roomId;
      // Continue the filling
      this._fillRoom(cells[i][0], cells[i][1], roomId);
    }
  }
}

/**
  Returns the cells that are walkables, directly adjacent to a given cell.
  @param x int - Current row
  @param y int - Current col
*/
MapGen.prototype._getWalkableCellsAround=function (x,y){
  var type=this.grid[y][x];
  var inside=[[x-1, y], [x+1, y], [x, y-1], [x, y+1]]
  var results=[];
  // Looking around
  for(let i=0; i<inside.length;i++){
    let newX=inside[i][0];
    let newY=inside[i][1];
    if(newX>=0 && newY>=0){
      try {
        if(this.cells[newX+':'+newY].type.isWalkable === true){
          results.push(inside[i]);
        }
      } catch (e) {
        console.log(e);
        console.log({x:x,y:y, newX:newX, newY:newY, type:type})
        console.log(this.cells);
      } finally {

      }

    }
  }
  return results;
}

/**
  Returns the names of the cell types that can be used for map generation
  walls and floor excepted.
  @param boolean noBase - If true, will skip base cells (wall and floor)
*/
MapGen.prototype._getBuildableTypes=function(noBase){
  var types=[];
  for(let i in this.cellTypes){
    // Generate a temporary CellType object to have access to all its properties
    let tmpCellType=new this.CellType(this.cellTypes[i])
    if(noBase===false || tmpCellType.isBaseCell===false ){
      types.push(i);
    }
  }
  return types;
}

/**
  Returns a room's bounding box
  @param int roomId - Room id
*/
MapGen.prototype._getRoomBoundingBox=function(roomId){
  var index=this._getRoomIndex(roomId);
  if(index===false){return false;}
  // Init with first cell values, so the base for comparison is already in the room.
  var xMin=this.rooms[index].cells[0][1];
  var xMax=this.rooms[index].cells[0][1];
  var yMin=this.rooms[index].cells[0][0];
  var yMax=this.rooms[index].cells[0][0];
  // Find boundaries
  for(let i=0; i<this.rooms[index].cells.length; i++){
    if(this.rooms[index].cells[i][0]>yMax){yMax=this.rooms[index].cells[i][0]}
    if(this.rooms[index].cells[i][0]<yMin){yMin=this.rooms[index].cells[i][0]}
    if(this.rooms[index].cells[i][1]>xMax){xMax=this.rooms[index].cells[i][1]}
    if(this.rooms[index].cells[i][1]<xMin){xMin=this.rooms[index].cells[i][1]}
  }
  return {xMin:xMin, xMax:xMax, yMin:yMin, yMax:yMax, cX:Math.floor((xMax+xMin)/2), cY:Math.floor((yMax+yMin)/2)};
}

/**
  Calculates the distances between two rooms centers
  WORK IN PROGRESS...
*/
MapGen.prototype._findPaths=function(){
  var distances=[];
  var pathData={};
  for(let i in this.rooms){
    // Shortcuts
    let iId=this.rooms[i].id;
    let cx1=this.rooms[i].box.cX;
    let cy1=this.rooms[i].box.cY;
    for (let j in this.rooms){
      let jId=this.rooms[j].id;
      if(pathData[jId]===undefined){
        pathData[jId]=[];
      }
      if(iId!=jId && pathData[iId].indexOf(jId)===-1){
        // Shortcuts
        let cx2=this.rooms[j].box.cX;
        let cy2=this.rooms[j].box.cY;
        var distance=Math.sqrt(Math.pow(((cx1>cx2)?cx1-cx2:cx2-cx1), 2)+Math.pow(((cy1>cy2)?cy1-cy2:cy2-cy1),2));
        distances.push([distance, [iId, jId]]);
        pathData[jId].push(iId)
      }
    }
  }

  this.distances=distances;
  this.pathData=pathData;
}

/**
  Sorts an array of arrays of 2 values (ie: `[[1,2], [3,4], [5,6]]`) on the
  first or second col

  Be carreful, indexes still start at 0
  @param array arr - Array to sort
  @param int dataCol - Index of order.
*/
MapGen.prototype._sortPair=function(arr, dataCol){
  arr.sort(function(a, b){
    if (a[dataCol] === b[dataCol]) {return 0;}
    else {return (a[dataCol] < b[dataCol]) ? -1 : 1;}
  });
  return arr;
}


/**
  Fills this.cells with grid data
*/
MapGen.prototype._convertGridToNamedCells=function(){
  var id=1;
  for(let y=0; y<this.grid.length; y++){
    for (let x=0; x<this.grid[y].length; x++){
      this.cells[x+':'+y]=new this.Cell(id, x, y, null, new this.CellType(this.cellTypes[this.grid[y][x]]));
      id++;
    }
  }
}

/**
  Finds all walkable cells,

  @param int avoidDeadlyAreas - Include damaging cells, default true
  @return array - List of indexes from this.cells
*/
MapGen.prototype._getWalkableCells=function (avoidDeadlyAreas){
  if(avoidDeadlyAreas===undefined){avoidDeadlyAreas=false;}

  var list=[];
  for(let i in this.cells){
    if(this.cells[i].type.isWalkable===true && (this.cells[i].type.damage===0 || avoidDeadlyAreas===false)){
      list.push(i);
    }
  }

  return list;
}
/**
  Creates a map of size base*(passes^2).
  Calling this function with no params will use the defaults values.

  Note that if you want to skip a specific param in the list, you should make it `undefined`
  (ie: `createMap(5,5,4, undefined, 2,5)` Note that the last param was omited)

  @param int xLength - Base width of the map
  @param int yLength - Base height of the map
  @param int passes - Number of passes for map refinement
  @param int cleanLevel - Whether or not clean the map (remove lonely cells. Value from 0 to 5, 0 being no cleanup and 5 the max.
  @param int wallPercent - Wall/floor ratio
  @param int sameSubCellPercent - Chances for a cell to be of its predecessor type, while subdivising the map
*/
MapGen.prototype.createMap=function(xLength, yLength, passes, cleanLevel, wallPercent, sameSubCellPercent){
  // Arguments:
  if(xLength===undefined){xLength=this.x}
  if(yLength===undefined){yLength=this.y}
  if(passes===undefined){passes=this.passes}
  if(cleanLevel===undefined){cleanLevel=this.cleanLevel}
  if(wallPercent===undefined){wallPercent=this.wallPercent}
  if(sameSubCellPercent===undefined){sameSubCellPercent=this.sameSubCellPercent}

  // Buildable cell types:
  var alternateCellTypes=this._getBuildableTypes(true);
  var allCellTypes=this._getBuildableTypes(false);

  /*
  First pass
  */
  // this.grid will contain cell types names until the end of the function, where
  // types names will be replaced by cell Ids.
  this.grid=[];
  for(let y=0; y<yLength; y++){
    var row=[]
    for(let x=0; x<xLength; x++){
      // Determine cell type
      var cellType=this.WALL;
      if(Math.floor(Math.random()*100) > wallPercent){
        // Not a wall, so determine the others
        if(Math.floor(Math.random()*100) < 70){ // 70% chances to build plain floor
          cellType=this.FLOOR;
        }else{
          cellType=alternateCellTypes[Math.floor(Math.random()*alternateCellTypes.length)];
        }
      }
      row.push(cellType)
    }
    this.grid.push(row);
  }

  /*
  Map augmentation
  */
  for(let p=0; p<passes; p++){
    var newMap=[];
    for(let y=0; y<this.grid.length; y++){
      var newRow1=[];
      var newRow2=[];
      for(let x=0; x<this.grid[y].length; x++){
        // Make a block of 4 cells from one, depending on its state
        var type=this.grid[y][x];
        var other=allCellTypes[Math.floor(Math.random()*alternateCellTypes.length)];
        newRow1.push((Math.random()*100<sameSubCellPercent)?type:other);
        newRow1.push((Math.random()*100<sameSubCellPercent)?type:other);
        newRow2.push((Math.random()*100<sameSubCellPercent)?type:other);
        newRow2.push((Math.random()*100<sameSubCellPercent)?type:other);
      }
      newMap.push(newRow1);
      newMap.push(newRow2);
    }
    this.grid=newMap.slice();
  }

  /*
  Closing the map
  */
  for(let y=0; y<this.grid.length; y++){
    for(let x=0; x<this.grid[y].length; x++){
      if(y===0 || y===this.grid.length-1 || x===0 || x===this.grid.length-1){
        this.grid[y][x]=this.WALL;
      }
    }
  }

  /*
  Fill the cells data and convert this.grid in an array of Ids.
  */
  this._convertGridToNamedCells();

  /*
  Cleanup : remove cells with no connections
  */
  if(cleanLevel>0){
    for(let y=0; y<this.grid.length; y++){
      for(let x=0; x<this.grid[y].length; x++){
        // Converts the cell if alone.
        if(this._getCellSameDirectNeighbours(x, y)<=cleanLevel-1){
          let dominant=this._getCellDominantDirectNeighbours(x, y);
          this.grid[y][x]=dominant;
          this.cells[x+':'+y].type=new this.CellType(this.cellTypes[dominant]);
        }
      }
    }
  }
}

/**
  Finds all the rooms in the map, fills this.rooms and completes this.cells.
*/
MapGen.prototype.createRooms=function(){
  var roomId=1; // Room identifier
  for(let y=0; y<this.grid.length; y++){
    for(let x=0; x<this.grid[y].length; x++){
      // Is it walkable ?
      if(this.cells[x+':'+y].type.isWalkable===true){
        // New room
        if(this._isInARoom(x, y)===false){
          // Adding first cell to room
          this.rooms.push({id:roomId, cells:[[x, y]], box:[], pathesTo:[]});
          //this.rooms[roomId].cells.push([i, j]);
          // Adding room to cells
          this.cells[x+':'+y].roomId=roomId;
          // Fill this room
          this._fillRoom(x, y, roomId);
          // Determine the bounding box
          this.rooms[roomId-1].box=this._getRoomBoundingBox(roomId);
          // Next
          roomId++;
        }
      }
    }
  }
  console.log('Found ' + this.rooms.length + ' rooms.');
}




/**
  Adds an additionnal class to wall cells next to a room for nice styling.
  @todo Make this thing work.
*/
/*MapGen.prototype.outlineRooms=function(){
  var twalls=0
  var walls=0;
  for(let i in this.cells){
    if(this._getCellSameNeighbours(this.cells[i].x, this.cells[i].y)<8 && this.cells[i].type.name===this.WALL){
      //console.log({cell:i, type:this.cells[i].type.name, sn:this._getCellSameNeighbours(this.cells[i].x, this.cells[i].y)});
      //console.log(this.cells[this.cells[i].x+':'+this.cells[i].y]);
      this.cells[i].type.addClass('wall-close');
      walls++;
    }
    twalls++;
  }
}*/

/**
  Remove really small rooms
  @param int minSize - Minimum size for a room to be kept.
*/
MapGen.prototype.removeSmallRooms=function(minSize){
  // Purge small rooms and convert them to walls
  var removed=0;
  // Array that will contain rooms kept
  var newRooms=[];
  for(let i=0; i<this.rooms.length; i++){
    if(this.rooms[i].cells.length <= minSize){
      for(let j=0; j<this.rooms[i].cells.length; j++){
        // Wall conversion
        this.grid[this.rooms[i].cells[j][0]][this.rooms[i].cells[j][1]]=this.WALL;
        // Cell update
        this.cells[this.rooms[i].cells[j][0]+':'+this.rooms[i].cells[j][1]].type=new this.CellType(this.cellTypes[this.WALL]);
        this.cells[this.rooms[i].cells[j][0]+':'+this.rooms[i].cells[j][1]].roomId=null;
      }
    }else{
      // We keep the room
      newRooms.push(this.rooms[i]);
    }
  }
  // Recalculate indexes for cells
  console.log('Removed ' + (this.rooms.length-newRooms.length) + ' small rooms.');
  this.rooms=newRooms;
}

/**
  Converts a sample array into a base grid.
  array should be like:
  [
    '000',
    '010',
    '000'
  ]
  where 0 is a wall cell and 1 is a room cell
  @param array sample - Sample data
*/
MapGen.prototype.createMapFromSample=function(sample){
  var out=[];
  for (let i=0; i<sample.length; i++){
    var row=[];
    for (let j=0; j<sample[i].length; j++){
      row.push((sample[i][j]==='0')?this.WALL:this.FLOOR);
    }
    out.push(row);
  }
  this.grid=out;

  //Fill the cells data and convert this.grid in an array of Ids.
  this._convertGridToNamedCells();
}

MapGen.prototype.addItems=function(itemsToCreate, avoidDeadlyAreas){
  //List cells
  var cells=this._getWalkableCells(avoidDeadlyAreas);
  // placing items
  for(let i in itemsToCreate){
    do{
      var choosenCell = cells[Math.floor(Math.random()*cells.length)]
    }while (this.getCellContent(choosenCell)!=false);
    this.items[i]=itemsToCreate[i];
    this.items[i].position=choosenCell;
    // Find cells
  }
}

/**
  Renders the map using jquery in the given target.
  The rendered lines/cells can have a prefixed id.
  @param string target - Target id, with the # for jQuery.
  @param string prefix - Prefix for css classes. Default is `map-`
*/
MapGen.prototype.jQueryRender=function(target, prefix){
  if(prefix===undefined){prefix=this.cssPrefix};
  for(let y=0; y<this.grid.length; y++){
    $(target).append('<div id="'+prefix+'row'+y+'" class="row"></div>');
    for(let x=0; x<this.grid[y].length; x++){
      let id=x+':'+y;
      // Cell classes
      let cssClasses=this.cells[id].type.classNames.slice();
      let classString=prefix+'cell';
      // Room id for room style
      if(this.cells[id].roomId!=null){
        cssClasses.push('room-' + this.cells[id].roomId);
      }

      // cell x-y--id for testing
      cssClasses.push(y+'-'+x+'--'+this.cells[id].id);

      // Items ?
      let item=this.getCellContent(id);
      if(item!=false){
        cssClasses.push('item-'+this.items[item].className);
      }

      // Other classes
      for(let i=0; i<cssClasses.length; i++){
        classString+=' '+prefix+'cell-'+cssClasses[i];
      }

      // Preparing the cell
      let cell=[
        '<div ',
        'title="'+x+':'+y+'"',
        'id="'+ prefix + 'cell-' + x + '-' + y +'" ',
        'class="'+ classString +'" ',
        '></div>'
      ]

      // Render
      $('#'+prefix+'row'+y).append(cell.join(''));
    }
  }
}

/**
Returns the item on a given cell, false if empty
*/
MapGen.prototype.getCellContent=function (cellId){
  for (let i in this.items){
    if (this.items[i].position===cellId){
      return i;
    }
  }
  return false;
}
