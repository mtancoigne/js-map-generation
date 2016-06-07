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
        this.cells[this.rooms[i].cells[j][0]+':'+this.rooms[i].cells[j][1]].type= this.CellType(this.cellTypes[this.WALL]);
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
