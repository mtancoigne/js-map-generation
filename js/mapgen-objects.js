"use strict";

/**
  Represents a cell
  @constructor
*/
MapGen.prototype.Cell=function(id, x, y, room, type){
  // Cell id
  this.id=(id!=undefined?id:null);
  // Placement in x
  this.x=(x!=undefined?x:null);
  // Placement in Y
  this.y=(x!=undefined?y:null);
  // Room id
  this.roomId=(room!=undefined?room:null);
  // Cell type
  this.type=(type!=undefined?type:null);
}

/**
  Represents a cell type
  @constructor
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

  // Filling properties
  if((typeof options)!= 'object'){
    console.warn('New CellTypes using defaults... this has been passed to the contructor:');
    console.warn(options);
  }else{
    for(let i in o){
      if(options[i]!=undefined){this[i]=options[i];}
      else{this[i]=o[i];}
    }
  }
}

/**
  Setter for CellTypes classNames that will avoid doubles.
*/
MapGen.prototype.CellType.prototype.addClass=function(newClass){
  if(this.classNames.indexOf(newClass)===-1){
    this.classNames.push(newClass);
  }
}
