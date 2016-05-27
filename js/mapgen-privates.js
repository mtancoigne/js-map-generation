/**
  Returns the current cell type, or a WALL if outside of the map.
  @param x int - Current row
  @param y int - Current col
*/
MapGen.prototype._getCellType=function(x, y){
  if(x>=0 && y>=0 && x<this.grid.length && y<this.grid.length){
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
      if(this.cells[newX+':'+newY].type.isWalkable === true){
        results.push(inside[i]);
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
