"use strict";
/**
* Generates a map for dungeons-crawling games.
* Original idea found here: http://web.archive.org/web/20110825054218/http://properundead.com/2009/03/cave-generator.html
*
* @author mtancoigne, 15/05/2016
* @license MIT
* @version 0.1 - Random rooms without pathes.
*
* @constructor
*
* The object can be created with an object of options as follow:
* {
*   // Base map width
*   x: integer,
*   // Base map width
*   y: integer,
*   // Number of subdivisions
*   passes: integer,
*   // Cleaning level (0-5)
*   cleanLevel: integer,
*   // Percentage of walls
*   wallPercent: integer,
*   // When creating sub-cells, percentage of chances to have the same type:
*   sameSubCellPercent:integer,
*   // Css prefix for classes
*   cssPrefix: string
* };
*/
const MapGen=function(options){

  // Passing options to this
  this.x                  = options.x != undefined ? options.x :                                   5;
  this.y                  = options.y != undefined ? options.y :                                   5;
  this.passes             = options.passes != undefined ? options.passes :                         4;
  this.cleanLevel         = options.cleanLevel != undefined ? options.cleanLevel :                 2;
  this.wallPercent        = options.wallPercent != undefined ? options.wallPercent :               50;
  this.sameSubCellPercent = options.sameSubCellPercent != undefined ? options.sameSubCellPercent : 80;
  this.cssPrefix          = options.cssPrefix != undefined ? options.cssPrefix :                   'map-';
  this.cellTypes          = options.cellTypes != undefined ? options.cellTypes : {
    wall:    {name:'wall',   isWalkable:false, classNames:['wall'],   canMove:false, useInMapGen:true, isBaseCell:true},
    floor:   {name:'floor',  isWalkable:true,  classNames:['floor'],  canMove:false, useInMapGen:true, isBaseCell:true},
  },
  this.items={};
  this.cells={};
  this.grid=[];
  this.rooms=[];

  // Base cell names
  this.WALL='wall';
  this.FLOOR='floor';

  // Checking base types.
  if(!this.cellTypes.hasOwnProperty('wall')){console.warn('You have not defined any wall in your cell types.');}
  if(!this.cellTypes.hasOwnProperty('floor')){console.warn('You have not defined any floor in your cell types.');}
}

/**
* Returns an object representing a Cell
*/
MapGen.prototype.Cell=function(id, x, y, room, type){
  //console.log(type);
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
* Returns an object representing a CellType
*/
MapGen.prototype.CellType=function(options){
  var o={
    // Name
    name:       null,
    // Is it possible to walk on it ?
    isWalkable: null,
    // CSS classes
    classNames: [],
    // Can the object move ?
    canMove:    false,
    // How much damage does this cell does ?
    damage:     0,
    // Is it a base cell ? (floor and wall only.)
    isBaseCell: false,
  };
  return JSON.parse(JSON.stringify(Object.assign(o, options)));
}
