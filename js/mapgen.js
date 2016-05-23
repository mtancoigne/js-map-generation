
/**
Generates a map.
Original idea found here: http://web.archive.org/web/20110825054218/http://properundead.com/2009/03/cave-generator.html

@author mtancoigne, 15/05/2016
@license MIT
*/
var MapGen=function(options){
  var o={
    // Base map width
    x:5,
    // Base map width
    y:5,
    // Number of subdivisions
    passes:4,
    // Cleaning level (0-5)
    cleanLevel:2,
    // Percentage of walls
    wallPercent:50,
    // When creating sub-cells, percentage of chances to have the same type:
    sameSubCellPercent:80,
    // Css prefix for classes
    cssPrefix:'map-'
  };

  // merging options
  for(let t in options){
    o[t]=options[t];
  }
  // creating vars from options
  for(let t in o){
    this[t]=o[t];
  }

  // Base cell types
  const WALL='wall';
  const FLOOR='floor';

  // Current map
  this.grid=[];
  // Room data
  this.rooms=[];
  this.roomsData={};
  this.roomLocations=[];

  /**
    Returns the current cell type, or a WALL if outside of the map.
    @var x int Current row
    @var y int Current col
  */
  this._getCellType=function(x,y){
    if(x>=0 && y>=0 && x<this.grid.length && y<this.grid.length){
      return this.grid[x][y];
    }else{
      return WALL; // Outside the map, so it's a wall.
    }
  }

  /**
    Count direct neighbours of the same type
    @var x int Current row
    @var y int Current col
  */
  this._getCellSameDirectNeighbours=function(x, y){
    var currentType=this._getCellType(x, y);
    var cellsToCheck=[[x-1,y], [x,y-1], [x, y+1], [x+1, y]];
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
 */
 this._getCellMoreDirectNeighboursType=function (x,y){
   var types={};
   var cellsToCheck=[[x-1, y-1], [x-1,y], [x-1, y+1], [x,y-1], [x,y], [x, y+1], [x+1, y-1], [x+1, y], [x+1,y+1]];
   for(let i=0; i<cellsToCheck.length; i++){
     var type=this._getCellType(cellsToCheck[i][0], cellsToCheck[i][1]);
     if(types[type]===undefined){
       types[type]=0;
     }
     types[type]++;
   }
   // Selecting the more present cell type
   // PLEASE NOTE that this is done this way, for the possibility to have more than
   // 2 celltypes. If only two celltypes where /always/ used, the thing would have been
   // different.
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
    Creates a map of size base*(passes^2)
    @var int x           Base width of the map
    @var int y           Base height of the map
    @var int passes      Number of passes for map refinement
    @var int cleanLevel  Whether or not clean the map (remove lonely cells)
                         Value from 0 to 5, 0 being no cleanup and 5 the max.
    @var int wallPercent        Wall/floor ratio
    @var int sameSubCellPercent Chances for a cell to be of its predecessor type,
                                while subdivising the map
  */
  this.createMap=function(x, y, passes, cleanLevel, wallPercent, sameSubCellPercent){
    // Arguments:
    if(x===undefined){x=this.x}
    if(y===undefined){y=this.y}
    if(passes===undefined){passes=this.passes}
    if(cleanLevel===undefined){cleanLevel=this.cleanLevel}
    if(wallPercent===undefined){wallPercent=this.wallPercent}
    if(sameSubCellPercent===undefined){sameSubCellPercent=this.sameSubCellPercent}


    // First pass:
    this.grid=[];
    var walls=0;
    var floors=0;
    for(let i=0; i<y; i++){
      var row=[]
      for(let j=0; j<x; j++){
        var random=(Math.floor(Math.random()*100));
        row.push((random < wallPercent)?WALL:FLOOR);
        if(random<wallPercent){walls++;}else{floors++;}
      }
      this.grid.push(row);
    }

    // Map augmentation
    for(let p=0; p<passes; p++){
      var newMap=[];
      for(let i=0; i<this.grid.length; i++){
        var newRow1=[];
        var newRow2=[];
        for(let j=0; j<this.grid[i].length; j++){
          // Make a block of 4 cells from one, depending on its state
          var type=this.grid[i][j];
          var inverse=(type===WALL?FLOOR:WALL);
          newRow1.push((Math.random()*100<sameSubCellPercent)?type:inverse);
          newRow1.push((Math.random()*100<sameSubCellPercent)?type:inverse);
          newRow2.push((Math.random()*100<sameSubCellPercent)?type:inverse);
          newRow2.push((Math.random()*100<sameSubCellPercent)?type:inverse);
        }
        newMap.push(newRow1);
        newMap.push(newRow2);
      }
      this.grid=newMap.slice();
    }

    // Closing the map
    for(let i=0; i<this.grid.length; i++){
      for(let j=0; j<this.grid[i].length; j++){
        if(i===0 || i===this.grid.length-1 || j===0 || j===this.grid.length-1){
          this.grid[i][j]=WALL;
        }
      }
    }

    // Cleanup : remove cells with no connections
    if(cleanLevel>0){
      for(let i=0; i<this.grid.length; i++){
        for(let j=0; j<this.grid[i].length; j++){
          // Converts the cell if alone.
          if(this._getCellSameDirectNeighbours(i, j)<=cleanLevel-1){
            this.grid[i][j]=this._getCellMoreDirectNeighboursType(i,j);
          }
        }
      }
    }
  }

  /**
    Finds all the rooms in the map
  */
  this._findRooms=function(){
    var roomId=0; // Number of rooms
    for(let i=0; i<this.grid.length;i++){
      for(let j=0; j<this.grid[i].length;j++){
        // Is it floor ?
        if(this.grid[i][j]===FLOOR){
          // New room
          if(this._isInARoom(i, j)===false){
            // Adding cell to rooms
            this.rooms[roomId]=[];
            this.rooms[roomId].push([i, j]);
            // Adding room to cells
            this.roomsData[i+':'+j]=roomId;
            // Fill this room
            this._fillRoom(i, j, roomId);
            roomId++;
          }
        }
      }
    }
    console.log('Found ' + this.rooms.length + ' rooms.');
  }

  /**
    Remove really small rooms
  */
  this._cleanRooms=function(minSize){
    // Purge small rooms and convert them to walls
    var removed=0;
    // Array that will contain rooms kept
    var newRooms=[];
    for(let i=0; i<this.rooms.length; i++){
      if(this.rooms[i].length <= minSize){
        for(let j=0; j<this.rooms[i].length; j++){
          // Wall conversion
          this.grid[this.rooms[i][j][0]][this.rooms[i][j][1]]=WALL
        }
      }else{
        // We keep the room
        newRooms.push(this.rooms[i]);
      }
    }
    // Recalculate indexes for roomsData
    console.log('Removed ' + (this.rooms.length-newRooms.length) + ' small rooms.');
    this.rooms=newRooms;
    this.roomsData={};
    for(let i=0; i<this.rooms.length; i++){
      for(let j=0; j<this.rooms[i].length; j++){
        this.roomsData[this.rooms[i][j][0]+':'+this.rooms[i][j][1]]=i;
      }
    }
  }

  /**
    Returns a room place "box"
  */
  this._locateRoom=function(index){
    // Init with first cell values, so the base for comparison is already in the room.
    var xMin=this.rooms[index][0][1];
    var xMax=this.rooms[index][0][1];
    var yMin=this.rooms[index][0][0];
    var yMax=this.rooms[index][0][0];
    // Find boundaries
    for(let i=0; i<this.rooms[index].length; i++){
      if(this.rooms[index][i][0]>yMax){yMax=this.rooms[index][i][0]}
      if(this.rooms[index][i][0]<yMin){yMin=this.rooms[index][i][0]}
      if(this.rooms[index][i][1]>xMax){xMax=this.rooms[index][i][1]}
      if(this.rooms[index][i][1]<xMin){xMin=this.rooms[index][i][1]}
    }
    return {room:index, xMin:xMin, xMax:xMax, yMin:yMin, yMax:yMax};
  }

  this._locateRooms=function(){
    this.roomLocations=[];
    for(let i=0; i<this.rooms.length; i++){
      this.roomLocations.push(this._locateRoom(i));
    }
  }

  /**
    Searches for rooms that could communicate in a direct way.
  */
  this._findPathes=function(){

  }

  /*
    Returns an array of rooms top or under the given one
  */
  this._findRoomsInCol=function(roomIndex){
    // Define room boundaries

  }
  /*
    Returns an array of rooms right or left of the given one
  */
  this._findRoomsInRow=function(roomIndex){

  }

  /*
    Find all the cells in a room.
    x and y are the starting point.
  */
  this._fillRoom=function(x,y, index){
    var cells=this._getSameCellsAround(x, y);
    for(let i=0; i<cells.length; i++){
      // New cell ?
      if(this._isInARoom(cells[i][0], cells[i][1])===false){
        // Adding to list
        this.rooms[index].push(cells[i]);
        this.roomsData[cells[i][0]+':'+cells[i][1]]=index;
        // Continue the filling
        this._fillRoom(cells[i][0], cells[i][1], index);
      }
    }
  }

  /*
    Returns the cells of the same type, directly adjacent to a given cell.
  */
  this._getSameCellsAround=function (x,y){
    var type=this.grid[x][y];
    var inside=[[x-1, y], [x+1, y], [x,y-1], [x, y+1]]
    var results=[];
    // Looking around
    for(let i=0; i<inside.length;i++){
      if(this.grid[inside[i][0]][inside[i][1]]===type && inside[i][0]>0 &&inside[i][1]>0){
        results.push(inside[i]);
      }
    }
    return results;
  }

  /**
    Check if the given cell is already registered in a room.
    If true, returns the room number.
  */
  this._isInARoom=function(x, y){
    if(this.roomsData[x+':'+y]!=undefined){
      return this.roomsData[x+':'+y];
    }
    return false;
  }

  /**
  Renders the map using jquery in the given target.
  The rendered lines/cells can have a prefixed id.
  */
  this.jQueryRender=function(target, prefix){
    if(prefix===undefined){prefix=this.cssPrefix};
    for(let i=0; i<this.grid.length; i++){
      $(target).append('<div id="'+prefix+'row'+i+'" class="row"></div>');
      for(let j=0; j<this.grid.length; j++){
        $('#'+prefix+'row'+i).append('<div id="' + prefix + 'cell-'+i+'-'+j+'" class="' + prefix + 'cell ' + prefix + 'cell-'+this.grid[i][j]+' ' + prefix + 'room-'+this.roomsData[i+':'+j]+'"></div>');
      }
    }
  }
}
