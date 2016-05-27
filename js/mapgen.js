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
    cssPrefix:'map-',
    // default cell types
    cellTypes:{
      wall:    {name:'wall',   isWalkable:false, classNames:['wall'],   canMove:false, useInMapGen:true, isBaseCell:true},
      floor:   {name:'floor',  isWalkable:true,  classNames:['floor'],  canMove:false, useInMapGen:true, isBaseCell:true},
    },
    // Default items. Use this.createItems() to fill this, after map generation.
    items:{}
  };
  // merging options
  for(let t in options){
    o[t]=options[t];
  }
  // creating vars from options
  for(let t in o){
    this[t]=o[t];
  }

  // Checking base types.
  if(!this.cellTypes.hasOwnProperty('wall')){
    console.warn('You have not defined any wall in your cell types.')
  }
  if(!this.cellTypes.hasOwnProperty('floor')){
    console.warn('You have not defined any floor in your cell types.')
  }

  // Base cell types
  this.WALL='wall';
  this.FLOOR='floor';

  // Current map
  this.grid=[];
  // Room data
  this.rooms=[];
  this.cells={};
}
