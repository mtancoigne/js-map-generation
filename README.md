# js-map-generation
Map generation script for dungeon crawler-like games

This is a work in progress around map generation and [this article](http://web.archive.org/web/20110825054218/http://properundead.com/2009/03/cave-generator.html).

## What's working ?

  - [x] Random base map generation
  - [x] Room detection
  - [x] Room removal
  - [ ] Creating pathes between rooms
  - [ ] Place random objects
  - [x] Render with jQuery
## Demo
For now, there is a [codepen](http://codepen.io/mtancoigne/pen/mPZeRQ) as a demo. It may be out of sync, but i'll try to keep it up...

## How it works
The map generator creates arrays of data and functions to work with. The _map_ is an array of rows made of cells. Basically, a map is something like this:

```js
[
  ['wall', 'wall',  'wall', 'wall',  'wall'],
  ['wall', 'floor', 'floor','floor', 'wall'],
  ['wall', 'floor', 'wall', 'floor', 'wall'],
  ['wall', 'floor', 'floor','floor', 'wall'],
  ['wall', 'wall',  'wall', 'wall',  'wall']
]
```
At this stage, there are floors and walls, but any _cell_ type should be handled in the future.


## Dependencies
For now, the library has no dependency, but if you want to display the generated map, a function using jQuery is available.

## Usage
### Javascript
To include the generator in a webpage, simply load the script `js/mapgen.js` and create a new `MapGen` object.

```html
<div id="destination"></div>

<script src="mapgen.min.js"></script>
<script>
  var options={};
  // Will create an empty object.
  var map=new MapGen(options);

  // Map generation
  map.createMap();

  // jQuery renderer
  map.jQueryRender('#destination');
</script>
```
#### MapGen options
The class can be created with optionnal options. If you don't use one, a default value will be used.
```js
// Options and their default values
var options={
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
```

### Styling
If you use the jQuery render function to render the map, you should take a look at the `scss/style.scss` file. It will give you hints on the rows and cells styling.

Note that for debugging purposes, this file generates a lot of classes used to outline rooms (`.#{$prefix}room-#{$i}-overlay{}` and `.#{$prefix}room, ##{$prefix}pathes{}`).

## Methods
For now, all the methods are _public_, but a lot should become _private_ later. Same for variables.

These are the following main methods to be used :

### createMap

```js
/**
  Creates a map of size base*(passes^2).
  Calling this function with no params will use the defaults values.

  Note that if you want to skip a specific param in the list, you should make it `undefined`
  (ie: `createMap(5,5,4, undefined, 2,5)` Note that the last param was omited)

  @param int x - Base width of the map
  @param int y - Base height of the map
  @param int passes - Number of passes for map refinement
  @param int cleanLevel - Whether or not clean the map (remove lonely cells. Value from 0 to 5, 0 being no cleanup and 5 the max.
  @param int wallPercent - Wall/floor ratio
  @param int sameSubCellPercent - Chances for a cell to be of its predecessor type, while subdivising the map
*/
function(x, y, passes, cleanLevel, wallPercent, sameSubCellPercent){}
```

### createMapFromSample

```js
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
this.createMapFromSample=function(sample){}
```
Some samples are present in `js/room_samples.js`. This method is meant to replace `createMap()`. You should not use `removeSmallRooms()` too, as it will modify your sample.

A typical use will be:
```js
var sample = [] // The sample

var map=new MapGen;
map.createMapFromSample(sample);
// If you need rooms data:
map.createRooms();
```

### createRooms
```js
/**
  Finds all the rooms in the map and fills this.rooms and this.cellsData.
*/
this.createRooms=function(){}
```

### removeSmallRooms
```js
/**
  Remove really small rooms
  @param int minSize - Minimum size for a room to be kept.
*/
this.removeSmallRooms=function(minSize){}
```
This must be called after `createRooms()`.

### jQueryRender
```js
/**
  Renders the map using jquery in the given target.
  The rendered lines/cells can have a prefixed id.
  @param string target - Target id, with the # for jQuery.
  @param string prefix - Prefix for css classes. Default is `map-`
*/
this.jQueryRender=function(target, prefix){}
```

## Variables

### grid
It's an array representing rows and cells like :
```js
var grid=[
  ['wall', 'wall',  'wall',  'wall',  'wall'], // Row 1
  ['wall', 'floor', 'floor', 'floor', 'wall'], // Row 2
  ['wall', 'floor', 'floor', 'floor', 'wall'], // Row 3
  ['wall', 'floor', 'floor', 'floor', 'wall'], // Row 4
  ['wall', 'wall',  'wall',  'wall',  'wall'], // Row 5
]
```
For now, there are two types of cells, but this should be extendable in the future.

### rooms
It's the list of rooms created by `createRooms`.
```js
var rooms=[
  {
    // Room id
    id: 0,
    // Unordered cells list
    cells: [
        // row, cell
        [1, 34],
        [9, 22],
        [...], // other cells
        [7, 31],
        [6, 31]
    ],
    // Bounding box
    box: {
        xMin: 22,
        xMax: 35,
        yMin: 1,
        yMax: 9,
        // Box center
        cX: 28,
        cY: 5
    },
    // Not used yet
    pathesTo: []
  }, {...} // Other rooms
]
```

### cellsData
List of cells and their corresponding Id. This is created by `createRooms`.
```js
var cellsData={
  "1:34":0,
  "9:22":0,
  "...":0, // Other cells
}

```
