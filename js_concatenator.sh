#!/bin/bash -
#title          :js_concatenator.sh
#description    :Assembles the js files
#author         :mtancoigne
#date           :20160527
#version        :0.1
#usage          :./js_concatenator.sh
#notes          :
#bash_version   :4.3.42(1)-release
#============================================================================
# As long as I don't get the JS builder around, i'll do this...
echo '' > build.js
cat js/mapgen.js js/mapgen-objects.js js/mapgen-privates.js js/mapgen-methods.js >> build.js
echo '' > build-demo.js
cat js/demo_functions.js js/demo_base_objects.js js/demo_room_samples.js >>build-demo.js
