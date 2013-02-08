Info
====

**VUmetr**

Copyright 2013 Paolo Milani. All rights reserved.

Graphical reproduction of a VU meter.
A VU meter is a real life electronic device used to monitor analog audio signals.
The response of the needle is intentionally slow. The purpose is to show a indication of loudness 
as the human hearing perceives it.

All graphic elements are drawn exclusively using the canvas API, no imagery.

## Features ##
 - needle physics simulated feats: rise/fall time, overshoot and ringing
 - day/night mode
 - power on/off

## Technology ##
 - HTML5 canvas
 - jQuery integration
 - smooth/efficient animation (requestAnimFrame)

Usage
=====

- Create the VU: `$('.myclass').vumetr()`
- Set level of the 'input audio signal': `$('.myclass').vumetr('input', 0.2)` : [0..1], 0.7 = 0 VU
- Change light mode: `$('.myclass').vumetr('lightMode', 'day')` : 'day' or 'night'
- Device power: `$('.myclass').vumetr('power', 'on')`: 'on' or 'off'
- Manually force redraw: `$('.myclass').vumetr('draw')`
- Change text in the internal label: `$('.myclass').vumetr('label','My own text')`
 
