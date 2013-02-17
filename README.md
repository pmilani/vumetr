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
 - realtime metering with HTML5 audio
 - needle physics simulated feats: rise/fall time, overshoot and ringing
 - day/night mode
 - power on/off

## Technology ##
 - HTML5 canvas
 - HTML5 audio
 - jQuery integration
 - smooth/efficient animation (requestAnimFrame)

Usage
=====

- Create the VU: `$('.myclass').vumetr()`
- Connect to audio source (see Realtime metering): `$('.myclass').vumetr('connect', analyserNode)`
- Set level of the 'input audio signal': `$('.myclass').vumetr('input', 0.2)` : [0..1], 0.7 = 0 VU
- Change light mode: `$('.myclass').vumetr('lightMode', 'day')` : 'day' or 'night'
- Device power: `$('.myclass').vumetr('power', 'on')`: 'on' or 'off'
- Manually force redraw: `$('.myclass').vumetr('draw')`
- Change text in the internal label: `$('.myclass').vumetr('label','My own text')`
 
Realtime metering
=================

The realtime metering is performed by using the HTML5 Audio API.
For flexibility, the audio graph must be setup separately and VUmetr does not modify it.
VU needs an analyser node which once created can then be connected.
Eg. suppose you create the analyser node:

`var analyserNode = audioContext.createAnalyserNode()`
`analyserNode.fftSize=2048'
`// source.connect(analyserNode)`
`// analyserNode.connect(audioContext.destination)`

Then connect the VUmetr:

`$('.myclass').vumetr('connect', analyserNode)`

Compatibility
=============
Note HTML5 Audio API is under development.
This was tested on a Google Chrome Canary build.
On other browsers YMMV.
