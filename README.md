# js-map-generation
Map generation script for dungeon crawler-like games

This is a work in progress around map generation and [this article](http://web.archive.org/web/20110825054218/http://properundead.com/2009/03/cave-generator.html).

## Demo
There is a [codepen](http://codepen.io/mtancoigne/pen/mPZeRQ) as a demo. It may be out of sync, but i'll try to keep it up...

## Usage
Include `js/mapgen.js` and [jquery](https://jquery.com/) in your webpage prepare it:

```html
<div id="someplace"></div>
<script>
  var map=new MapGen();
  map.createMap(); // Will create the map with default options.
  map._findRooms(); // Will find the rooms
  map._cleanRooms(50); // Will remove the rooms with less than 50 cells
  map.jQueryRender('#someplace'); // Will render the map, using jquery for now.
</script>
```
