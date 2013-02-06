# Info

**VUmetr**

Copyright 2013 Paolo Milani. All rights reserved.

## Features
 - day/night mode
 - power on/off

## Technology:
 - HTML5 canvas
 - jQuery integration
 - efficient animation scheduling

## FIX NEEDED:
 - needle movement
 - values and marks of the scale

# Usage

- Create the VU: `$('.myclass').vumetr()`
- Light mode: `$('.myclass').vumetr('lightMode', 'day')` : 'day' or 'night'
- Device power: `$('.myclass').vumetr('power', 'on')`: 'on' or 'off'
- Manually force redraw: `$('.myclass').vumetr('draw')`
- Change text in the internal label: `$('.myclass').vumetr('label','My own text')`
 