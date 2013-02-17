/**
 * VUmetr - copyright 2013 Paolo Milani 
 * All rights reserved.
 * 
 * HISTORY
 * - realtime audio analysis
 * - refactored animation code to perform anims in sequence
 * - optimized: pre-render and cache all parts beyond the needle
 * - fixed: needle response in correct rise time
 * - needle animation
 * - glass effect
 * - indicator shadow
 * - lighting effects
 * - color styling
 * - basic: scale, marks, needle
 */
function VU() {

	var element;
	var W=400;
	var H=300;
	var ox = 200;
	var oy = 250;
	var aStart = 1.25*Math.PI;
	var aRedStart = 1.6*Math.PI;
	var aEnd = 1.75*Math.PI;
	var baseRadius = 200;
	
	var redline = percentOf(aRedStart);
	var riseTime = 300; // == fallTime
	var needleSpeed = 0.7 / riseTime * 1000;  // 0.7 = 0dB; it must take 300ms to reach 0db from 0
	var DYNRANGE = 6.02*8+1.76; // 8bit dyn.range ~= 50
	
	var indicatorValue = -.1; // 0 .. 1
	var animLastTime = 0;

	var currentAnim;

	var powered = false;
	var showfps = false;
	
	var labelText = "VUmetr digital audio";
	
	var backgroundImage;

	var fps = '';
	var frames = 0;
	var frameTime = 0;
	
	// audio api analysis connection
	var analyser;

	var ColorDefs = [
		// 0: light off
		{
			backgroundFill: function(ctx) {
				var grad = ctx.createRadialGradient(W/2,0,30, W/2,0,H);
				grad.addColorStop(0, 'rgba(248,230,150,.2)');
				grad.addColorStop(0.25, 'rgba(226,195,140,.2)');
				grad.addColorStop(1, 'rgba(60,34,10,.2)');
				return grad;
			},
			scaleMarksColor: 'black',
			overloadMarksColor: 'red',
			indicatorColor:'black', indicatorShadowColor:'rgba(0,0,0,.5)', indicatorShadowBlur:15,
			glassGrad: function(ctx) {
				var grad = ctx.createLinearGradient(W/2,0,W/2,H);
				grad.addColorStop(0, 'rgba(150,150,150,.6)');
				grad.addColorStop(.2, 'rgba(150,150,150,.2)');
				grad.addColorStop(.70, 'rgba(150,150,150,.2)');
				grad.addColorStop(.85, 'rgba(0,0,0,.2)');
				return grad;
			},
			glassReflex: function(ctx) {
				var grad = ctx.createRadialGradient(W/2,-W,W, W/2,-W,W*1.15);
				grad.addColorStop(0, 'rgba(250,250,250,.25)');
				grad.addColorStop(.7, 'rgba(250,250,250,.4)');
				grad.addColorStop(1, 'rgba(255,255,255,.60)');
				return grad;
			},
			lightColor: 'rgba(25,15,10,.8)',
			borderBottomGrad: function(ctx) {
				var grad = ctx.createLinearGradient(0,oy+10,0,H);
				grad.addColorStop(0, 'rgb(40,40,40)');
				grad.addColorStop(.1, 'rgb(180,180,180)');
				grad.addColorStop(.2, 'rgb(0,0,0)');
				return grad;
			}
		},
		// 1: daylight
		{
			backgroundFill: function(ctx) {
				var grad = ctx.createRadialGradient(W/2,0,30, W/2,0,H);
				grad.addColorStop(0, 'rgba(248,230,150,.2)');
				grad.addColorStop(0.25, 'rgba(226,195,140,.2)');
				grad.addColorStop(1, 'rgba(60,34,10,.2)');
				return grad;
			},
			scaleMarksColor: 'black',
			overloadMarksColor: 'red',
			indicatorColor:'black', indicatorShadowColor:'rgba(0,0,0,.5)', indicatorShadowBlur:20,
			glassGrad: function(ctx) {
				var grad = ctx.createLinearGradient(W/2,0,W/2,H);
				grad.addColorStop(0, 'rgba(150,150,150,.6)');
				grad.addColorStop(.2, 'rgba(150,150,150,.2)');
				grad.addColorStop(.70, 'rgba(150,150,150,.2)');
				grad.addColorStop(.85, 'rgba(0,0,0,.2)');
				return grad;
			},
			glassReflex: function(ctx) {
				var grad = ctx.createRadialGradient(W/2,-W,W, W/2,-W,W*1.15);
				grad.addColorStop(0, 'rgba(250,250,250,.25)');
				grad.addColorStop(.7, 'rgba(250,250,250,.5)');
				grad.addColorStop(1, 'rgba(255,255,255,.75)');
				return grad;
			},
			lightColor: 'transparent',
			borderBottomGrad: function(ctx) {
				var grad = ctx.createLinearGradient(0,oy+10,0,H);
				grad.addColorStop(0, 'rgb(40,40,40)');
				grad.addColorStop(.1, 'rgb(180,180,180)');
				grad.addColorStop(.2, 'rgb(0,0,0)');
				return grad;
			}
		},
		
		// 2: internal light on
		{
			backgroundFill: function(ctx) {
				var grad = ctx.createRadialGradient(W/2,0,20, W/2,0,H);
				grad.addColorStop(0, 'rgb(248,230,155)');
				grad.addColorStop(0.25, 'rgb(226,195,140)');
				grad.addColorStop(1, 'rgb(60,34,10)');
				return grad;
			},
			scaleMarksColor: 'black',
			overloadMarksColor: '#e01010',
			indicatorColor:'black', indicatorShadowColor:'rgba(0,0,0,.5)', indicatorShadowBlur:5,
			glassGrad: function(ctx) {
				var grad = ctx.createRadialGradient(W/2,0,30, W/2,0,H);
				grad.addColorStop(0, 'rgba(248,230,150,.2)');
				grad.addColorStop(0.25, 'rgba(226,195,140,.2)');
				grad.addColorStop(1, 'rgba(60,34,10,.2)');
				return grad;
			},
			glassReflex: function(ctx) {
				var grad = ctx.createRadialGradient(W/2,-W,W, W/2,-W,W*1.15);
				grad.addColorStop(0, 'rgba(250,250,250,.0)');
				grad.addColorStop(.7, 'rgba(250,250,250,.25)');
				grad.addColorStop(1, 'rgba(255,255,255,.6)');
				return grad;
			},
			lightColor: 'transparent',
			borderBottomGrad: function(ctx) {
				var grad = ctx.createLinearGradient(0,oy+10,0,H);
				grad.addColorStop(0, 'rgb(30,30,15)');
				grad.addColorStop(.1, 'rgb(70,60,50)');
				grad.addColorStop(.2, 'rgb(0,0,0)');
				return grad;
			}
		}
	];
	
	var selectedLight = 0;
	var colorScheme = ColorDefs[selectedLight];

function create() {
	element = document.createElement("canvas");
	element.setAttribute("width", W);
	element.setAttribute("height",H);
	
	var ctx = element.getContext('2d');

	for (var i=0; i<ColorDefs.length; i++) {
		var scheme = ColorDefs[i];
		for (var prop in scheme) {
			if (typeof(scheme[prop]) == "function")
				scheme[prop] = scheme[prop](ctx);
		}
	}
}

function angleOf(percent) {
	return aStart + (aEnd-aStart) * percent;
}

function percentOf(angle) {
	return ( (angle%Math.PI)-(aStart%Math.PI) ) / ( (aEnd%Math.PI)-(aStart%Math.PI) );
}

function renderBackground(ctx) {
	drawBackground(ctx);
	drawScaleBaseline(ctx);
	drawScaleMarks(ctx);
	drawScaleNumbers(ctx);
	return element.toDataURL();
}

function requestUpdateBackground() {
	backgroundImage = null;
}

var gconsole = {
	color: 'blue',
	lines: [],
	log: function(text) {
		this.lines.push(text);
	},
	draw: function(ctx) {
		if (this.lines.length == 0) return;
		ctx.font = '8pt Arial';
		ctx.textAlign = 'left';
		ctx.fillStyle = this.color;
		for (var i in this.lines)
			ctx.fillText(this.lines[i],4,10+i*10);
		this.lines = [];
	}
};

function draw() {
	var ctx = element.getContext('2d');
	ctx.clearRect(0, 0, W, H);

	if (!backgroundImage) {
		backgroundImage = new Image();
		backgroundImage.src = renderBackground(ctx);
	} else ctx.drawImage(backgroundImage,0,0);	// 'else' saves rendering 1 extra time
	drawIndicator(ctx, indicatorValue);
	drawGlass(ctx);
	drawBottom(ctx);
	drawLightMultiplier(ctx);

	if (showfps) {
		gconsole.log(fps);
	}
	
	gconsole.draw(ctx);
}

function drawBackground(ctx) {
	ctx.beginPath();
	ctx.rect(0,0,W,H);
	ctx.fillStyle = colorScheme.backgroundFill;
	ctx.fill();
	
	// text
	ctx.textAlign = 'start';
	ctx.font = '12pt CaviarDreamsBold';
	ctx.fillStyle = 'rgba(0,0,0,1)';
	ctx.fillText(labelText, W/8,H/4*3);
	ctx.font = '10pt Lucida';
	ctx.fillStyle = 'black';
	ctx.fillText('0 VU = +4 dBu', W/4*3,H/4*3);
	
	ctx.font = '24pt Helvetica';
	ctx.save();
	ctx.fillStyle = 'rgb(40,40,40)';
	ctx.textAlign = 'center';
	ctx.translate(ox,H/5*2);
	ctx.scale(1.2,1);
	ctx.fillText('VU', 0,0);
	ctx.restore();
}

function drawScaleBaseline(ctx) {
	ctx.beginPath();
	ctx.arc(ox,oy,baseRadius+.75,aStart,aRedStart);
	ctx.lineWidth = 1.5;
	ctx.strokeStyle = colorScheme.scaleMarksColor;
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(ox,oy,baseRadius+5,aRedStart,aEnd);
	ctx.strokeStyle = colorScheme.overloadMarksColor;
	ctx.lineWidth = 10;
	ctx.stroke();
}

function drawScaleMarks(ctx) {
	markAt(4, 20, [0, .04, .15, .3, .4, .5, .6, .7, .75, .8, .9, 1]);	// thick
	markAt(1, 10, [.35, .45, .55, .65]);	// thin
	
	function markAt(lw, len, positions) {
		alongScale(positions, function(percent, xconv, yconv){
			var x0 = ox + baseRadius*xconv;
			var y0 = oy + baseRadius*yconv;
			var x1 = ox + baseRadius*xconv+len*xconv;
			var y1 = oy + baseRadius*yconv+len*yconv;
			ctx.beginPath();
			ctx.moveTo(x0,y0);
			ctx.lineTo(x1,y1);
			ctx.strokeStyle = colorScheme.scaleMarksColor;
			if (percent >= redline) ctx.strokeStyle = colorScheme.overloadMarksColor;
			ctx.lineWidth = lw;
			ctx.stroke();
		})
	};
}

function alongScale(positions, fn) {
	for (var i=0; i<positions.length; i++) {
		var percent = positions[i];
		var xconv = Math.cos(angleOf(percent));
		var yconv = Math.sin(angleOf(percent));
		fn(percent, xconv, yconv);
	}	
}

function drawScaleNumbers(ctx) {
	var positions = [-.02,0.04, .3, .5, .6, .7, .8, .9, 1,1.04];
	var labels = [];
	labels[-.02] = '-';
	labels[0.04] = '20';
	labels[.3] = '10';
	labels[.5] = '3';
	labels[.6] = '1';
	labels[.7] = '0';
	labels[.8] = '1';
	labels[.9] = '2';
	labels[1] = '3';
	labels[1.04] = '+';
	
	ctx.font = '16pt CaviarDreamsBold';
	ctx.textAlign = 'center';
	alongScale(positions, function(percent, xconv, yconv){
		var xt = ox + baseRadius*xconv+25*xconv;
		var yt = oy + baseRadius*yconv+25*yconv;
		ctx.beginPath();
		ctx.fillStyle = colorScheme.scaleMarksColor;
		if (percent >= redline) ctx.fillStyle = colorScheme.overloadMarksColor;
		ctx.save();
		ctx.translate(ox,oy);
		ctx.rotate(-1.5*Math.PI+angleOf(percent));
		ctx.scale(.8,1);
		ctx.fillText(labels[percent], 0,-baseRadius-25);
		ctx.restore();
	})
}

function drawIndicator(ctx, percent) {
	var len = 210;
	
	ctx.beginPath();
	ctx.save();
	ctx.translate(ox,oy);
	ctx.rotate(angleOf(percent));
	ctx.moveTo(0,0);
	ctx.lineTo(len,0);
	ctx.strokeStyle = colorScheme.indicatorColor;
	ctx.lineWidth = 6;
	ctx.shadowColor = colorScheme.indicatorShadowColor;
	ctx.shadowBlur = colorScheme.indicatorShadowBlur;
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 15;
	ctx.stroke();
	ctx.restore();
}

function drawBottom(ctx) {
	ctx.beginPath();
	ctx.arc(ox,oy+10,30,0,Math.PI,true);
	ctx.fillStyle = 'black';
	ctx.fill();
	ctx.beginPath();
	ctx.rect(0,oy+10,W,H-(oy+10));
	ctx.fillStyle = colorScheme.borderBottomGrad;
	ctx.fill();
}

// Animates needle by simulating a ringing oscillation around the 
// current value of 'input'
// Damps oscillation using the reciprocal function of the log 
function RingingAnim(targetValue,direction,oscRate,scale,duration,fnComplete) {
	this.phaseFreq = 2*Math.PI*oscRate/1000;
	this.phase = (direction==1) ? 0 : Math.PI;
	this.scale = scale;
	this.timePos = .0;
	this.timeRate = (Math.E-1)*1000/duration;
	this.timeLeft = duration;
	this.onComplete = fnComplete;
	this.currentValue = targetValue;
	this.targetValue = targetValue;
}
RingingAnim.prototype.update = function(deltaTimeMillis) {
	var dampFactor = 1/Math.log(1+this.timePos); // inf. when timePos=0
	if (dampFactor>1) dampFactor = 1; // fix inf.
	this.currentValue = this.targetValue + Math.sin(this.phase)*this.scale*dampFactor;
	this.timePos += this.timeRate*deltaTimeMillis;
	this.phase += this.phaseFreq*deltaTimeMillis;
	this.timeLeft -= deltaTimeMillis;
	if (this.timeLeft<0 && this.onComplete) this.onComplete();
}

// Move the needle at fixed speed towards target value
// The duration of anim depends on the 'distance' to target
// When complete, start ringing anim
function MoveAnim(targetValue, motionRate) {
	this.targetValue = targetValue;
	var delta = targetValue - indicatorValue;
	this.currentValue = indicatorValue;
	this.timeLeft = 1000*Math.abs(delta)/motionRate;
	this.velocity = sign(delta) * motionRate;
}
MoveAnim.prototype.update = function(deltaTimeMillis) {
	var delta = this.velocity * deltaTimeMillis / 1000;
	this.currentValue += delta;
	this.timeLeft -= deltaTimeMillis;
	if (this.timeLeft<0) {
		indicatorValue = this.targetValue;
		currentAnim = new RingingAnim(this.targetValue, sign(this.velocity), 1.1, 0.015, 1400, function(){
			indicatorValue = currentAnim.targetValue;
			currentAnim = null;
		});
	}
}

function sign(x) {
	return x ? x < 0 ? -1 : 1 : 0; 
}

function animateIndicator(time) {
	var deltaTimeMillis = (time - animLastTime);

	// NOTE: to reduce CPU consumption draw only when necessary

	if (analyser && powered) {
		var rmsdb = rmsPowerAnalysis();
		//gconsole.log('dB '+rmsdb.toFixed(1));
		var rms = db2vu(rmsdb);
		var delta;
		if (rms >= indicatorValue)
			delta = Math.log(1+rms-indicatorValue)/(deltaTimeMillis/3);
		else
			delta = -Math.log(1+indicatorValue-rms)/(deltaTimeMillis/4);
		indicatorValue += delta;
		//gconsole.log('VU '+indicatorValue.toFixed(2));
		if (delta != 0) draw(); 
	}
	if (currentAnim) {
		indicatorValue = currentAnim.currentValue;
		currentAnim.update(deltaTimeMillis);
		draw(); 
	}
	
	requestAnimationFrame(animateIndicator);
	animLastTime = time;
	
	if (showfps) {
		frameTime += deltaTimeMillis;
		frames += 1;
		if (frameTime > 1000) {
			fps = (frames * 1000 / frameTime).toFixed(1);
			frameTime = 0;
			frames = 0;
		}
	}
}

function db2vu(decibel) {
	var reference = -3;	// dB value of 0 VU
	if (decibel===-Infinity) return 0;
	return 1+(decibel+reference)/DYNRANGE;
}

function decibel(sampleValue) {
	return 20*Math.log(sampleValue)/2.302585092994046;
}

function rmsPowerAnalysis() {
	if (!powered) return -Infinity;

    var length = analyser.frequencyBinCount;
	var wavedata = new Uint8Array(length);
	analyser.getByteTimeDomainData(wavedata);
	
    var power = 0;
    var numberOfChannels = 1; // fixme
    for (var i = 0; i < length; i++) {
    	var sample = wavedata[i]-128;
    	power +=  sample * sample;
    }
    var rms = Math.sqrt(power / (numberOfChannels * length)) / DYNRANGE; 
    return decibel(rms);
}

function startAnimating(callback) {
	animLastTime = new Date().getTime();
	requestAnimationFrame(callback);
}

function drawLightMultiplier(ctx) {
	ctx.rect(0,0,W,H);
	ctx.fillStyle = colorScheme.lightColor;
	ctx.fill();
}

function drawGlass(ctx) {
	ctx.beginPath();
	ctx.rect(0,0,W,H);
	ctx.fillStyle = colorScheme.glassGrad;
	ctx.fill();
	
	ctx.beginPath();
	ctx.arc(W/2,-W*1.05,W*1.2,aStart,aEnd,true);
	ctx.fillStyle = colorScheme.glassReflex;
	ctx.fill();
}

function changeColorScheme(selectedIndex) {
	colorScheme = ColorDefs[selectedIndex];
	requestUpdateBackground();
	requestAnimationFrame(draw);
}

///// privileged members //////////////
this.width = function() { 
	return W;
};

this.height = function() {
	return H;
};

this.canvas = function() {
	return element;
};

this.draw = function() {
	requestAnimationFrame(draw);
};

this.connect = function(audioAnalyser) {
	analyser = audioAnalyser;
}

this.lightMode = function(mode) { // day||night
	if (mode==='day' && selectedLight!=1) selectedLight=1;
	if (mode==='night' && selectedLight==1) {
		if (powered) selectedLight=2;
		else selectedLight=0;
	}
	changeColorScheme(selectedLight);
};

this.power = function(onOrOff) {
	if (onOrOff===undefined) return powered;
	if ((onOrOff=="on" || onOrOff==1) && !powered) {
		powered = true;
		if (selectedLight==0) selectedLight=2;
		changeColorScheme(selectedLight);
		currentAnim = new MoveAnim(0, needleSpeed/3);
	}
	if ((onOrOff=="off" || onOrOff==0) && powered) {
		if (selectedLight==2) selectedLight=0;
		changeColorScheme(selectedLight);
		currentAnim = new MoveAnim(-.1, needleSpeed/3);
		powered = false;
	}
};

this.input = function(percent) {
	if (powered) {
		currentAnim = new MoveAnim(percent, needleSpeed);
	}
};

this.label = function(text) {
	labelText = text;
	requestUpdateBackground();
	requestAnimationFrame(draw);
};

this.fps = function(onOrOff) {
	if (onOrOff===undefined) return showfps;
	if ((onOrOff=="on" || onOrOff==1) && !showfps) showfps = true;
	if ((onOrOff=="off" || onOrOff==0) && showfps) showfps = false;
};

create();
startAnimating(animateIndicator);
};

////////////////////////////////////
// requestAnimationFrame polyfill (Paul Irish)
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = 
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

///////////////////////////////////////
// jQuery integration
(function ($) {
	$.fn.vumetr = function(method) {
		if (method) {
			var vu = $(this).data('vumetr');
			if (vu[method]) {
				return vu[method].apply(vu, Array.prototype.slice.call(arguments,1));
			}
		} else return this.each(function(){
			var $this = $(this);
			var vu = $this.data('vumetr');
			if (!vu) {
				vu = new VU();
				$this.append(vu.canvas);
				$this.data('vumetr',vu);
			}
		});
	};
})(jQuery);