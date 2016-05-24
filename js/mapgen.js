
/**
Generates a map for dungeons-crawling games.
Original idea found here: http://web.archive.org/web/20110825054218/http://properundead.com/2009/03/cave-generator.html

@author mtancoigne, 15/05/2016
@license MIT
@version 0.1 - Random rooms without pathes.

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
  this.cellsData={};


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
  this.createRooms=function(){
    var roomId=0; // Number of rooms
    for(let i=0; i<this.grid.length;i++){
      for(let j=0; j<this.grid[i].length;j++){
        // Is it floor ?
        if(this.grid[i][j]===FLOOR){
          // New room
          if(this._isInARoom(i, j)===false){
            // Adding first cell to room
            this.rooms.push({id:roomId, cells:[[i, j]], box:[], pathesTo:[]});
            //this.rooms[roomId].cells.push([i, j]);
            // Adding room to cells
            this.cellsData[i+':'+j]=roomId;
            // Fill this room
            this._fillRoom(i, j, roomId);
            // Determine the bounding box
            this.rooms[roomId].box=this._getRoomBoundingBox(roomId);
            // Next
            roomId++;
          }
        }
      }
    }
    console.log('Found ' + this.rooms.length + ' rooms.');
  }

  /**
    Check if the given cell is already registered in a room.
    If true, returns the room number.
  */
  this._isInARoom=function(x, y){
    if(this.cellsData[x+':'+y]!=undefined){
      return this.cellsData[x+':'+y];
    }
    return false;
  }

  /**
    Returns the index of the given room in the rooms list or false if not found.
  */
  this._getRoomIndex=function(roomId){
    for(let i=0; i<this.rooms.length; i++){
      if(this.rooms[i].id===roomId){
        return i;
      }
    }
    return false;
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
        this.rooms[this._getRoomIndex(index)].cells.push(cells[i]);
        this.cellsData[cells[i][0]+':'+cells[i][1]]=index;
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
    Remove really small rooms
  */
  this.removeSmallRooms=function(minSize){
    // Purge small rooms and convert them to walls
    var removed=0;
    // Array that will contain rooms kept
    var newRooms=[];
    for(let i=0; i<this.rooms.length; i++){
      if(this.rooms[i].cells.length <= minSize){
        for(let j=0; j<this.rooms[i].cells.length; j++){
          // Wall conversion
          this.grid[this.rooms[i].cells[j][0]][this.rooms[i].cells[j][1]]=WALL
        }
      }else{
        // We keep the room
        newRooms.push(this.rooms[i]);
      }
    }
    // Recalculate indexes for cellsData
    console.log('Removed ' + (this.rooms.length-newRooms.length) + ' small rooms.');
    this.rooms=newRooms;
    this.cellsData={};
    for(let i=0; i<this.rooms.length; i++){
      for(let j=0; j<this.rooms[i].cells.length; j++){
        this.cellsData[this.rooms[i].cells[j][0]+':'+this.rooms[i].cells[j][1]]=this.rooms[i].id;
      }
    }
  }

  /**
    Returns a room place "box"
  */
  this._getRoomBoundingBox=function(roomId){
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
  */
  this._findPaths=function(){
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
  */
  this._sortPair=function(arr, dataCol){
    arr.sort(function(a, b){
      if (a[dataCol] === b[dataCol]) {return 0;}
      else {return (a[dataCol] < b[dataCol]) ? -1 : 1;}
    });
    return arr;
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
  */
  this.createMapFromSample=function(sample){
    var out=[];
    for (let i=0; i<sample.length; i++){
      var row=[];
      for (let j=0; j<sample[i].length; j++){
        row.push((sample[i][j]==='0')?'wall':'floor');
      }
      out.push(row);
    }
    this.grid=out;
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
        $('#'+prefix+'row'+i).append('<div id="' + prefix + 'cell-'+i+'-'+j+'" class="' + prefix + 'cell ' + prefix + 'cell-'+this.grid[i][j]+((this.cellsData[i+':'+j]!=undefined)?' ' + prefix + 'room-'+this.cellsData[i+':'+j]:'')+'"></div>');
      }
    }
  }  
}
