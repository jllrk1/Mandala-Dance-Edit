onresize=function() {
  //document.getElementById('asvg').style.maxHeight=window.innerHeight-40+'px';
  document.getElementById('asvg').style.maxHeight=window.innerHeight-40+'px';
}

//Menu Settings
var animateDuration = 15000;
var transDurationFactor=0.75;
var rotationFactor = 1.00;
var strokeopacityFactor = 1.00;
var fillopacityFactor = 1.00;
var astrokeWidth = 0.75;
var strokeML = 10.00;
var curveCount = 1;
var curveCountChangeRate = 0.75;
var curveCountLock = false;
var cycleSet = 9;
var cycleChangeRate = 0.75;
var softCycleRate = 0.50;
var cycleLock = false;
var fillHueChangeRate = 0.10;

var ZERO=0, TOZERO=1, STD=2;
var Curve=function(is, rc, cyc) {
  this.radiiCount=rc;
  
  this.curveTypes=[-1,-1,-1];
  this.radii=[0,0,0,0];
  this.cycles=cyc;
  this.fromData=this.zeroData();
  this.toData=this.zeroData();
  this.duration=animateDuration;
  this.start=0;
  this.active=false;
  this.cstate=is;
  this.anchor=false;
}

Curve.prototype.zeroData=function() {
  let zd=[[0,0]];
  for (var z=.01, counter=1; z<2*Math.PI; z+=.01) {
    zd[counter++]=[0,0];
  }
  return zd;
}

Curve.prototype.zeroFromData=function() {
  this.fromData=this.zeroData();
}

Curve.prototype.zeroToData=function() {
  this.toData=this.zeroData();
}

Curve.prototype.isZero=function() {
  return this.toData[0][0]==0 && this.toData[0][1]==0;
}

Curve.prototype.lineCurve=function() {
  if (this.isZero()) {
    return '';
  }
  var d='';
  d+='M'+this.toData[0][0]+' '+this.toData[0][1];
  for (var i=1; i<629; i++) {
    d+='L'+this.toData[i][0]+' '+this.toData[i][1];
  }
  d+='z';
  return d;
}

Curve.prototype.setCurve=function() {
  let offset=(()=>
  {
    if (curveTransition.ctState=='async_soft') {
      return 0;
    }
    if (curveTransition.synced) {
      return 0;
    }
    if (Math.random()<rotationFactor*(1-curveComplexity())) {
      return Math.random()*Math.PI;
    } else {
      return 0;
    } 
  })();
  let r1=this.radii[0];
  let r2=this.radii[1];
  let r3=this.radii[2];
  let r4=this.radii[3];
  let c0=this.cycles[0];
  let c1=this.cycles[1];
  let c2=this.cycles[2];
  let c3=this.cycles[3];
  switch (this.radiiCount) {
    case 1:
      var f1=1+(this.curveTypes[0]*c1)/c0;
      this.toData[0]=[
        r1*Math.cos(offset)+r2*Math.cos(f1*offset),
        r1*Math.sin(offset)+r2*Math.sin(f1*offset)
      ];
      var counter=1;
      for (let z=.01*c0+offset; z<2*Math.PI*c0+offset; z+=.01*c0) {
	this.toData[counter++]=[
    
	  r1*Math.cos(z)+r2*Math.cos(f1*z),
	  r1*Math.sin(z)+r2*Math.sin(f1*z)
        ];
      }
      break;
    case 2:
      var f1=1+(this.curveTypes[0]*c1)/c0;
      var f2=1+(this.curveTypes[0]*c1+this.curveTypes[1]*c2)/c0;
      this.toData[0]=[
      
       
         r1*Math.cos(offset)+r2*Math.cos(f1*offset)+r3*Math.cos(f2*offset),
         r1*Math.sin(offset)+r2*Math.sin(f1*offset)+r3*Math.sin(f2*offset)
      ];
      var counter=1;
      for (let z=.01*c0+offset; z<2*Math.PI*c0+offset; z+=.01*c0) {
	this.toData[counter++]=[
	  r1*Math.cos(z)+r2*Math.cos(f1*z)+r3*Math.cos(f2*z),
	  r1*Math.sin(z)+r2*Math.sin(f1*z)+r3*Math.sin(f2*z)
        ];
      }
      break;
   case 3:
      var f1=1+(this.curveTypes[0]*c1)/c0;
      var f2=1+(this.curveTypes[0]*c1+this.curveTypes[1]*c2)/c0;
      var f3=1+(this.curveTypes[0]*c1+this.curveTypes[1]*c2+this.curveTypes[2]*c3)/c0;
      this.toData[0]=[

        r1*Math.cos(offset)+r2*Math.cos(f1*offset)+r3*Math.cos(f2*offset)+r4*Math.cos(f3*offset),
        r1*Math.sin(offset)+r2*Math.sin(f1*offset)+r3*Math.sin(f2*offset)+r4*Math.sin(f3*offset)
      ];
      var counter=1;
      for (let z=.01*c0+offset; z<2*Math.PI*c0+offset; z+=.01*c0) {
	this.toData[counter++]=[
	
    r1*Math.cos(z)+r2*Math.cos(f1*z)+r3*Math.cos(f2*z)+r4*Math.cos(f3*z), 
	  r1*Math.sin(z)+r2*Math.sin(f1*z)+r3*Math.sin(f2*z)+r4*Math.sin(f3*z)
	];
      }
      break;
  }
}

Curve.prototype.getMidCurve=function(frac) {
  let d='M';
  d+=cbLoc(this.fromData[0][0],this.toData[0][0],frac);
  d+=' ';
  d+=cbLoc(this.fromData[0][1],this.toData[0][1],frac);
  for (var i=1; i<629; i++) {
    d+='L';
    d+=cbLoc(this.fromData[i][0],this.toData[i][0],frac);
    d+=' ';
    d+=cbLoc(this.fromData[i][1],this.toData[i][1],frac);
  }
  d+='z';
  return d;
}

Curve.prototype.randomizeRadii=function() {
  let f1=250/(this.radiiCount+1);
  this.radii[0]=f1+f1*Math.random();
  if (this.radiiCount==1) {
    this.radii[1]=this.radii[0]+randomTwenty();
  } else if (this.radiiCount==2) {
    this.radii[1]=f1+f1*Math.random();
    this.radii[2]=Math.abs(this.radii[0]-this.radii[1])+randomTwenty();
  } else if (this.radiiCount==3) {
    this.radii[1]=f1+f1*Math.random();
    this.radii[2]=f1+f1*Math.random();
    this.radii[3]=f1+f1*Math.random();
  }
  let maxC=((c)=>{
    let maxr=0;
    for (let j=0; j<c.radiiCount+1; j++) {
      maxr+=c.radii[j];
    }
    return maxr;
  })(this);
  
  let fac=(zoom.scale*250/maxC)/(this.radiiCount+1);
  for (let i=0; i<this.radiiCount+1; i++) {
    this.radii[i]*=fac;
  }       
}

var mixedCycles=true;
Curve.prototype.setCycles=function() {
  for (let i in this.cycles) {
    if (i==0) {
      this.cycles[0]=getCycle0Match()
    } else {
      if (mixedCycles) {
	if (cycleSet==10) {
	  this.cycles[i]=Math.random()<.05?4:8;
    console.log("cycleSet 10 match test");
	} else if (cycleSet==12) {
	  this.cycles[i]=Math.random()<.1?6:12;
    console.log("cycleSet 12 match test");
	} else if (cycleSet==14) {
	  this.cycles[i]=Math.random()<.2?7:14;
    console.log("cycleSet 14 match test");
	} else if (cycleSet==16) {
	  this.cycles[i]=Math.random()<.3?Math.random()<.1?4:8:16;
    console.log("cycleSet 16 match test");
	}
        
        else {
	  this.cycles[i]=cycleSet;
	}
      } else {
	this.cycles[i]=cycleSet;
      }
    }
  }
}

function getMaxTS() {
  let mts=0;
  for (let c of curves) {
    if (c.active) {
      mts=Math.max(mts,c.start);
    }
  }
  return mts;
}

Curve.prototype.randomizeRadiiCount=function() {
  let p35=2+curveComplexity();
  this.radiiCount=[1,2,3][getRandomInt(0,3,p35)];
}

Curve.prototype.randomizeCurve=function() {
  if (this.cstate==STD) {
    this.fromData=this.toData.slice();
    if (curveTransition.ctState=='async_soft') {
      this.cycles[0]=getCycle0Match();
      this.randomizeRadiiCount();
    } else {
      if (Math.random()<.7) {
	this.randomizeRadiiCount();
	for (var j=0; j<this.radiiCount; j++) {
	  if (Math.random()<.05) {
	    this.curveTypes[j]=1;
	  } else {
	    this.curveTypes[j]=-1;
	  }
	}
      }
    }
    this.randomizeRadii();
    this.setCurve();
    if (curveTransition.ctState=='async_soft') {
      this.duration=animateDuration*(.3+.7*Math.random());
    } else if (curveTransition.ctState=='sync_soft') {
      this.duration=Math.max(animateDuration/5, this.duration*.9);
    } else if (curveTransition.synced) {
      this.duration=animateDuration*transDurationFactor;
    } else {
      if (fillColor.fstate==TOSOLID || fillColor.fstate==SOLID) {
        this.duration=Math.max(animateDuration/5,this.duration*.3); 
      } else {
        this.duration=animateDuration*(.3+.7*Math.random());
      }
    }
  }
}

Curve.prototype.copyParameters=function(c) {
  this.radiiCount=c.radiiCount;
  this.curveTypes=c.curveTypes;
  this.radii=c.radii;
  this.cycles=c.cycles;
}

Curve.prototype.toSTD=function() {
  if (this.anchor) {
    return false;
  }
  if (this.cstate!=ZERO) {
    return false;
  }
  if (!cycleLock && (()=>{
    if (Math.random()<.3) {
      switch (cycleSet) {
  case 2: cycleSet=4; return true;
  case 3: cycleSet=6; return true;
  case 4: cycleSet=2; return true;
  case 5: cycleSet=10; return true;
  case 6: cycleSet=12; return true;
	case 7: cycleSet=14; return true;
	case 8: cycleSet=16; return true;
  case 9: cycleSet=3; return true;
  case 10: cycleSet=5; return true; 
  case 11: cycleSet=8; return true;
	case 12: cycleSet=6; return true;
  case 13: cycleSet=5; return true;
	case 14: cycleSet=7; return true;
  case 15: cycleSet=3; return true;
	case 16: cycleSet=8; return true;
      }
      return false;
    } else {
      return false;
    }
  }));//()) 
  {
    this.setCycles();
// TODO set in ctl ?
  }
  this.cstate=STD;
  this.randomizeCurve();
  this.active=true;
  this.start=0;
  return true;
}

Curve.prototype.toZERO=function() {
  if (this.anchor) {
    return false;
  }
  if (this.cstate!=STD) {
    return false;
  }
  this.cstate=TOZERO;
  this.fromData=this.toData.slice();
  this.zeroToData();
  this.active=true;
  this.start=0;
  return true;
}

var curves=[
  new Curve(STD,6,[1,6,6,6]), 
  new Curve(STD,2,[2,6,6,6]),
//  new Curve(STD,1,[2,6,6,6]), 
 // new Curve(STD,3,[3,3,3,3]),
//  new Curve(STD,1,[1,6,6,6,6]),
 // new Curve(STD,2,[2,6,6,6,6]),
  new Curve(STD,9,[1,9,9,9,9]), 
  new Curve(STD,3,[2,9,9,9,9]), 
 // new Curve(STD,3,[6,10,10,10,10]),
//  new Curve(STD,2,[1,10,10,10,10]),
  new Curve(ZERO,1,[3,9,9,9,9]),
 // new Curve(ZERO,2,[8,9,9,9,9]),
  new Curve(ZERO,2,[3,6,6,6])
 // new Curve(ZERO,2,[9,3,3,3]),
//  new Curve(ZERO,3,[6,3,3,3])
 /*
  new Curve(STD,6,[3,6,6,6,6]),
  new Curve(STD,5,[1,6,6,6,6]), 
  new Curve(STD,4,[4,6,6,6,6]), 
  new Curve(STD,3,[6,6,6,6,6]),
  new Curve(STD,2,[1,6,6,6,6]),
  new Curve(ZERO,1,[11,6,6,6,6]),*/
   /*
  new Curve(STD,6,[3,7,7,7,7]),
  new Curve(STD,2,[1,7,7,7,7]), 
  new Curve(STD,3,[4,7,7,7,7]), 
  new Curve(STD,1,[8,7,7,7,7]),
  new Curve(STD,4,[2,7,7,7,7]),
  new Curve(ZERO,1,[11,7,7,7,7]),*/
  /*
  new Curve(STD,4,[2,6,6]), 
  new Curve(STD,3,[2,6,6]), 
  new Curve(STD,2,[2,6,6]),
  new Curve(STD,1,[2,6,6]),*/
 // new Curve(ZERO,1,[17,6,6]),
  /*
  new Curve(STD,2,[1,10,10,10,10]), 
  new Curve(STD,1,[4,10,10,10,10]), 
  new Curve(STD,3,[6,10,10,10,10]),
  new Curve(STD,2,[1,10,10,10,10]),
  new Curve(ZERO,1,[1,10,10,10,10]),
  
  new Curve(STD,2,[1,6,6,6,6]), 
  new Curve(STD,1,[5,6,6,6,6]), 
  new Curve(STD,3,[7,6,6,6,6]),
  new Curve(STD,1,[1,6,6,6,6]),
  new Curve(STD,2,[2,6,6,6,6]),
  new Curve(ZERO,1,[11,6,6,6,6]),
  */

];
curves[0].anchor=true;
curves[1].anchor=false;

var curveTransition={
  synced:false,
  ctCount:0,	// cycle transition count
  ctState:'async_steady'
}

var stopped=true;
var halts={
  stop:false,
  sync:false,
  stopNow:false
}


function curvesInTransition() {
  for (c of curves) {
    if (c.cstate==TOZERO) {
      return true;
    } 
  }
  return false;
}

function getZeroData() {
  let zd=[[0,0]];
  for (var z=.01, counter=1; z<2*Math.PI; z+=.01) {
    zd[counter++]=[0,0];
  }
  return zd;
}

function powerRandom(p) {
  function rec(p,r) {
    --p;
    if (p<=0) {
      return r;
    } else {
      r*=Math.random();
      return rec(p,r);
    }
  }
  p=Math.round(p);
  return rec(p,Math.random());
}

var path=document.getElementById('rpath');
var sgroup=document.getElementById('pcontrol');

var SOLID=0, GRAD=1, TOSOLID=2, TOGRAD=3, FADEIN=4;//, OTHER=5;
var fillColor={
//  fromFillHSL:[175,90,80],
 // toFillHSL:[175,90,80],
  fromFillHSL: [175,50,100],
  toFillHSL: [175,50,100],
  hueDiff:0,
  fillDuration:animateDuration/5,
  lock:false,
  start:null,
  active:false,
  fstate:FADEIN,
  randomize:function() {
    this.fromFillHSL=this.toFillHSL.slice();
    this.hueDiff=fillHueChangeRate*(180-Math.round(360*Math.random()));
    if (this.fromFillHSL[0]+this.hueDiff>360 || this.fromFillHSL[0]+this.hueDiff<0) { 
      this.hueDiff*=-1;
    }
    this.toFillHSL[0]=this.fromFillHSL[0]+Math.round(this.hueDiff);
    var col=this.getHSLString();
  },
  getHSLString:function() {
    return 'hsl('+this.toFillHSL[0]+','+this.toFillHSL[1]+'%,'+this.toFillHSL[2]+'%)'; 
  },
  switchToSolid:function() {
    this.type=SOLID;
    this.fstate=SOLID;
    this.active=false;
  },
  switchToGradient:function() {
    this.type=GRAD;
    this.fstate=GRAD;
    this.active=true;
    zoom.randomize();
    this.fillDuration=animateDuration;
  }
};
path.style.fill='url(#phsRG)';

var SMALL=1;
var MED=2;
var LRG=3;
var zoom={
  scale:1.0,
  duration:animateDuration,
  randomize:function() {
    if (this.lock) return;

    if (curveTransition.synced) {
      this.scale=1.5;
    } else if (curveTransition.ctState=='async_soft') {
      this.scale=2.0;
    } else if (fillColor.fstate==GRAD || fillColor.fstate==TOGRAD || fillColor.fstate==FADEIN) {
      var zf=(curveCount-1)/4;
      this.scale=2+zf*Math.random();
    } else { 
      this.scale=SMALL;
    }
  },
  setZoom:function(z) {
    // set controls?
    this.scale=z;
  }
}

var Stop=function(number,oArr) {
  this.number=number
  this.el=document.createElementNS("http://www.w3.org/2000/svg", "stop");
  this.el.setAttribute('offset',oArr[0]);
  this.fromOffset=oArr[0];
  this.toOffset=oArr[0];
  this.oLock=true;	//
  this.oTime=0;
  this.fromHSL=[40,oArr[2],oArr[3]];
  this.toHSL=[getRandomInt(0,360),oArr[2],oArr[3]];
  this.fromHSL[0]=this.toHSL[0];
  this.el.setAttribute('stop-color',this.getHSLString());
  this.cLock=true;	//
  this.hueDiff=0;
  this.fromOpacity=oArr[1];
  this.toOpacity=oArr[1];
  this.state='';
  this.signal;
  if (oArr[0]==0) {
    this.state='zero';
  } else {
    this.state='active';
  }
  this.animateDuration=animateDuration;
  this.randomizeColor=function() {
    this.fromHSL=this.toHSL.slice();
    this.hueDiff=180-Math.round(360*Math.random());
    if (this.fromHSL[0]+this.hueDiff>360 || this.fromHSL[0]+this.hueDiff<0) {
      this.hueDiff*=-1;
    }
    this.toHSL[0]=this.fromHSL[0]+Math.round(this.hueDiff);
  }
  this.shiftPropertiesL=function() {
    this.fromHSL[1]=this.toHSL[1];
    this.fromHSL[2]=this.toHSL[2];
    if (fillColor.fstate==TOSOLID) {
    } else {
      this.toHSL[1]=getSOL(stops.length)[this.number][2];
      this.toHSL[2]=getSOL(stops.length)[this.number][3];
    }
    this.fromOffset=this.toOffset;
    this.toOffset=getSOL(stops.length)[this.number][0];
  }
}

Stop.prototype.getHSLString=function() {
  return 'hsl('+this.toHSL[0]+','+this.toHSL[1]+'%,'+this.toHSL[2]+'%)';
}

Stop.prototype.setMidOffset=function(frac) {
  let fos=this.toOffset*frac+this.fromOffset*(1-frac);
  this.el.setAttribute('offset',fos);
}

Stop.prototype.setMidColor=function(frac) {
  let sat=this.toHSL[1]*frac+this.fromHSL[1]*(1-frac);
  let lum=this.toHSL[2]*frac+this.fromHSL[2]*(1-frac);
  var fill='hsl('+this.fromHSL[0]+','+sat+'%,'+lum+'%)';
  this.el.setAttribute('stop-color',fill);
  this.el.setAttribute('stop-opacity',fill);
}

Stop.prototype.inactivate=function() {
  if (this.state=='active') {
    this.state='rest';
  }
}

Stop.prototype.activate=function() {
  if (this.state=='rest') {
    this.state='active';
  }
}

function getRandomInt(min, max, low) {
  min=Math.ceil(min);
  max=Math.floor(max);
  if (low) {
    return Math.floor(powerRandom(low)*(max-min))+min; 
  } else {
    return Math.floor(Math.random()*(max-min))+min;
  }
}

function centralRandom(r) {
  if (r==undefined) { return 0; }
  return r-2*r*Math.random();
}

function changeCurveCount(cc) {
  if (cc==1) {
    for (let c of curves) {
      if (c.anchor) {
      } else {
        c.zeroFromData();
        c.zeroToData();
        c.active=false;
	c.cstate=ZERO;
      }
    }
  } else if (cc==2) {
    let cct=0;
    for (let c of curves) {
      if (c.anchor) {
      } else {
        if (cct++>0) {
          c.zeroFromData();
          c.zeroToData();
          c.active=false;
	  c.cstate=ZERO;
        } else {
          // check STD & non-STD
	  c.cstate=STD;
          c.randomizeCurve();
          c.fromData=c.toData.slice();
          c.randomizeCurve();
          c.active=stopped?false:true;
        }
      }
    }
  } else if (cc==3) {
    let cct=0;
    for (let c of curves) {
      if (c.anchor) {
      } else {
        if (cct++>1) {
          c.zeroFromData();
          c.zeroToData();
          c.active=false;
	  c.cstate=ZERO;
        } else {
	  c.cstate=STD;
          c.randomizeCurve();
          c.fromData=c.toData.slice();
          c.randomizeCurve();
          c.active=stopped?false:true;
        }
      }
    }
  } else if (cc==4) {
    let cct=0;
    for (let c of curves) {
      if (c.anchor) {
      } else {
        if (cct++>2) {
          c.zeroFromData();
          c.zeroToData();
          c.active=false;
	  c.cstate=ZERO;
        } else {
	  c.cstate=STD;
          c.randomizeCurve();
          c.fromData=c.toData.slice();
          c.randomizeCurve();
          c.active=stopped?false:true;
        }
      }
    }
  } else if (cc==5) {
    for (let c of curves) {
      if (c.anchor) {
      } else {
	c.cstate=STD;
        c.randomizeCurve();
        c.fromData=c.toData.slice();
        c.active=stopped?false:true;
      }
    }
  }
  drawCurves();
  curveCount=cc;
}

function reportCurveCount() {
  document.getElementById('ccRep').textContent=curveCount;
  document.getElementById('ccRange').value=curveCount;
}

function randomCurveCountChange(curve) {
  if (curveCountLock) {
    return false;
  }
  if (zoom.scale==SMALL) {
    return false;
  }
  let p35=1.5*(.35-curveComplexity());  // .35 desirable level
  let cdel=curveCountChangeRate+Math.abs(p35);
  if (Math.random()<cdel) {
    switch (curveCount) {
      case 1:
        for (c of curves) {
          if (c==curve) {
            continue;
          }
          if (c.toSTD()) {
            curveCount++;
            reportCurveCount();
            return true;
          }
        }
        return false;
      case 2:
        if (Math.random()<(1+p35)) { // add
	  for (c of curves) {
	    if (c==curve) {
	      continue;
	    }
            if (c.toSTD()) {
              curveCount++;
              reportCurveCount();
              return true;
            }
          }
        } else {
          if (curve.toZERO()) {
            reportCurveCount();
         //   curveCount--;
            return true;
          }
        }
        return false;
      case 3:
        if (Math.random()<(.5+p35)) {
          for (c of curves) {
	    if (c==curve) {
	      continue;
	    }
            if (c.toSTD()) {
              curveCount++;
              reportCurveCount();
              return true;
            }
          }
        } else {
          if (curve.toZERO()) {
            curveCount--;
            reportCurveCount();
            return true;
          }
        }
        return false;
      case 4:
        if (Math.random()<(.25+p35)) {
          for (c of curves) {
	    if (c==curve) {
	      continue;
	    }
            if (c.toSTD()) {
              curveCount++;
              reportCurveCount();
              return true;
            }
          }
        } else {
          if (curve.toZERO()) {
              curveCount--;
            reportCurveCount();
            return true;           
          }
        }
        return false;
      case 5:
        if (curve.toZERO()) {
            curveCount--;
          reportCurveCount();
          return true;          
        }
    }
    return false;
  }
  return false;
}
function getCycle0Match() {
  switch (cycleSet) {
    case 2:
      return [1,3,5,7,9,11,13,15,17][getRandomInt(0,9,6)];
    case 3:
      return [1,2,4,5,7,8,10,11,13,14,16,17][getRandomInt(0,12,5)];
    case 4:
      return [1,3,5,7,9,11,13,15,17][getRandomInt(0,9,5)];
    case 5:
      return [1,2,3,4,6,7,8,9,11,12,13,14,16,17][getRandomInt(0,14,4)];
    case 6:
      return [1,3,5,7,9,11,13,15,17][getRandomInt(0,9,4)];
    case 7:
      return [1,2,3,4,5,6,8,9,10,11,12,13,15,16,17][getRandomInt(0,15,4)];
    case 8:
      return [1,3,5,7,9,11,13,15,17][getRandomInt(0,9,3)];
    case 9:
      return [1,2,4,5,7,8,10,11,13,14,16,17][getRandomInt(0,12,3)];
    case 10:
      return [1,3,7,9,11,13,17][getRandomInt(0,7,3)];
    case 11:
      return [1,2,3,4,5,6,7,8,9,10,12,13,14,15,16,17][getRandomInt(0,16,2)];   
    case 12:
      return [1,5,7,11,13,17][getRandomInt(0,6,2)];
    case 13:
      return [1,2,3,4,5,6,7,8,9,10,11,12,14,15,16,17][getRandomInt(0,16,2)];
    case 14:
      return [1,3,5,9,11,13,15,17][getRandomInt(0,8)];
    case 15:
      return [1,2,4,7,8,11,13,14,16,17][getRandomInt(0,10)];
    case 16:
      return [1,3,5,7,9,11,13,15,17][getRandomInt(0,9)];
    case 17:
      return [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16][getRandomInt(0,16)];
  }
  return false;
}

function resetCycleSet() {
  for (let c of curves) {
    c.setCycles();
  }
}

function softRecycle() {
  for (let c of curves) {
    c.cycles[0]=getCycle0Match();
  }
}

function randomizeCycles() {
  let yx=cycleSet;
  cycleSet=(()=>{
      switch (curveCount) {
	case 1: return [17,16,15,14,13,12,11,9,10,8,7,6];
	case 2: return [14,15,13,16,12,17,11,9,10,8,7,6];
	case 3: return [11,10,9,12,8,13,7,14,6,15,16,17];
  case 4: return [15,12,9,6,3,1,2,4,7,10,13,16]; 
      }
      return [6,7,8,9,11,10,12,13,14,15,16,17];
  })()[getRandomInt(0,12,3)];
  resetCycleSet();
  if (yx!=cycleSet) {
    curveTransition.ctCount++;
    console.log("ctCount ++");
  } else {
      curveTransition.ctCount--;
    console.log("ctCount --");
  }
  document.getElementById('cvRep').textContent=cycleSet;
  document.getElementById('cvRange').value=cycleSet;
}

function randomizeCurves() {
  for (c of curves) {
    if (c.cstate==STD) {
      c.randomizeCurve();
      c.active=true;
    }
  }
}

function curveComplexity() {
  let comp1=0;
  for (let c of curves) {
    if (c.cstate!=ZERO) {
      comp1+=c.radiiCount;
    }
  }
//  comp1=(comp1-1)/33;
  //let comp2=(cycleSet-2)/66;
 // comp1=(comp1-1)/75;
  //let comp2=(cycleSet-2)/30;
  comp1=(comp1-1)/420;
  let comp2=(cycleSet-2)/100;
  return comp1+comp2;
}

function randomTwenty() {
  return 20-40*Math.random();
}

function isAActive() {
  for (let c of curves) {
    if (c.active) {
      return true; 
    }
  }
  if (fillColor.active) { 
    return true; 
  }
  return false;
}

function drawCurve() {
  let d='';
  for (let i=0; i<arguments.length; i++) {
    d+=arguments[i].lineCurve();
  }
  path.setAttribute('d',d);
}

function drawCurves() {
  var d='';
  for (c of curves) {
    if (c.cstate!=ZERO) {
      d+='M'+c.toData[0][0]+' '+c.toData[0][1];
      for (var i=1; i<629; i++) {
	d+='L'+c.toData[i][0]+' '+c.toData[i][1];
      }
      d+='z';
      c.start=0;
    }
  }
  path.setAttribute('d',d);
}
function cbLoc(p1,p2,frac) {
  let f1=.1;
  let f2=.9;
  var e1=Math.pow(1-frac,3)*p1;
  var e2=3*frac*Math.pow(1-frac,2)*(p1+(p2-p1)*f1);
  var e3=3*(1-frac)*Math.pow(frac,2)*(p1+(p2-p1)*f2);
  var e4=Math.pow(frac,3)*p2;
  return e1+e2+e3+e4;
}
/*function cbLoc(p1,p2,frac) {
  let f1=.1;
  let f2=.9;
  var e1=Math.atan2(1-frac,3)*p1;
  var e2=3*frac*Math.atan2(1-frac,2)*(p1+(p2-p1)*f1);
  var e3=3*(1-frac)*Math.atan2(frac,2)*(p1+(p2-p1)*f2);
  var e4=Math.atan2(frac,3)*p2;
  return e1+e2+e3+e4;
}*/

function animate(ts) {
  if (halts.stopNow) {
    park();
    return;
  }
  var endMove=false;
  var d='';
  for (var cx of curves) {
    if (cx.active) {
      if (cx.start==0) {
	cx.start=ts;
      }
      var progress=ts-cx.start;
      if (progress<cx.duration) {
	var frac=progress/(cx.duration);
        d+=cx.getMidCurve(frac);
      } else {
        cx.start=0;
	if (cx.cstate==TOZERO) {
	  cx.cstate=ZERO;
          curveCount--;
          reportCurveCount();
	  cx.active=false;
	}
        if (curvesInTransition()) {
          if (cx.cstate==STD) {
            cx.randomizeCurve();
          }
        } else {
          if (halts.stop || halts.sync) {
            cx.active=false;
          } else {
	    if (curveTransition.synced) {
	      if (!(cycleSet%2) && Math.random()<softCycleRate && curveTransition.ctCount<1) {
                cx.cycles[0]=getCycle0Match();
	      } else {
		// exit synchrony 
                curveTransition.ctState='async_steady';
		curveTransition.synced=false;
		fillColor.active=true;  // TODO unless locked
		fillColor.start=0;
	      }
	    } else {
              // unsynced
	      if (randomCurveCountChange(cx)) {
	      } else {
		if (fillColor.fstate==SOLID) {
                  if (cycleSet%2==0 && Math.random()<softCycleRate) {
                    curveTransition.ctState='async_soft';
                  } else {
		    if (curveTransition.ctCount<1) {
		      halts.sync=true;
                      curveTransition.ctState='to_sync';
		    } 
                  }
		}
	      }
            }
            if (cx.cstate==STD) {
              cx.randomizeCurve();
            }
          }
        }
	if (Math.random()<.5 && !curveTransition.synced && !halts.sync) {
	  zoom.randomize();
	}
	endMove=true;
      }
    } else {
      d+=cx.lineCurve();
    }
  } // curve loop

  if (!endMove) {
    path.setAttribute('d',d);
  }

  if (fillColor.fstate==SOLID) {
    if (fillColor.active) {
      if (halts.stop || halts.sync) {
        fillColor.active=false;
      } else {
        if (curveTransition.ctCount>0 && !curveTransition.synced) {
   	  fillColor.fstate=TOGRAD;
 	  fillColor.fillDuration=animateDuration*.1;
 	  curveTransition.ctCount=0;
          curveTransition.ctState='async_steady';
 	  zoom.randomize();
        } 
      }
    }
  } else {
    for (let stop of stops) {
      if (stop.state=='active') {
	if (!stop.oTime) {
	  stop.oTime=ts;
	}
	var progress=ts-stop.oTime;
	if (progress<fillColor.fillDuration) {
	  let frac=progress/fillColor.fillDuration;
	  stop.setMidOffset(frac);
          stop.setMidColor(frac);
	} else {
	  stop.oTime=0;
	  stop.inactivate();
	  if (stopsInactive()) {
	    if (halts.stop || halts.sync) {
	      fillColor.active=false;
	    } else {
	      shiftStops();
	      if (fillColor.fstate==GRAD) {
//		if (Math.random()<cycleChangeRate*(.5+Math.abs(cycleSet-8)/16)) {
		if (Math.random()<cycleChangeRate*(.5+Math.abs(cycleSet-9)/16)) {
		  fillColor.fillDuration=animateDuration*.1;
		  fillColor.fstate=TOSOLID;
		  zoom.setZoom(SMALL);
		}
	      } else if (fillColor.fstate==TOSOLID) {
		if (stops[stops.length-1].toHSL[0]==stops[stops.length-2].toHSL[0] && stops[stops.length-2].toOffset==1) {
		  fillColor.switchToSolid();
		}
	      } else if (fillColor.fstate==TOGRAD) {
		if (stops[stops.length-1].toHSL[0]!=stops[stops.length-2].toHSL[0]) {
	          fillColor.switchToGradient();
		}
	      }
	      activateStops();
            }
          }
	}
      }
    }
  }

  if (isAActive()) {
    requestAnimationFrame(animate);
  } else {
    if (halts.stop) { // synchronized stop
      park();
    } else {
      if (halts.sync) {
        if((()=>{ 
            if (cycleSet%2) { return false; }
            if (Math.random()<softCycleRate) { 
	      for (let c of curves) {
		if (c.cstate==STD) {
		  for (let i=1; i<c.cycles.length; i++) {
		    if (c.cycles[i]!=cycleSet) {
		      return false;
		    }
		  }
		}
	      }
              return true;
            }
            return false;
          })()) {
          softRecycle();
          curveTransition.ctState='sync_soft';
          zoom.randomize();
          randomizeCurves();
        } else {
          if (!cycleLock) {
	    randomizeCycles();
          } else {
            curveTransition.ctCount=1;
          }
          curveTransition.ctState='sync_trans';
          randomizeCurves();
        }
        curveTransition.synced=true;
        halts.sync=false;
      }
      requestAnimationFrame(animate);
    }
  }
}

function init() {
  zoom.randomize();
  if (stops.length>4) {
    stops[1].fromHSL[1]=0;
    stops[1].toHSL[1]=0;
    stops[1].fromHSL[2]=20;
    stops[1].toHSL[2]=20;
    stops[1].toHSL[3]=100;
    stops[1].fromHSL[3]=100;
    stops[1].toHSL[4]=225;
    stops[1].fromHSL[4]=225;
    stops[2].fromHSL[1]=0;
    stops[2].toHSL[1]=0;
    stops[2].fromHSL[2]=20;
    stops[2].toHSL[2]=20;
    stops[2].fromHSL[3]=100;
    stops[2].toHSL[3]=100;
    stops[2].fromHSL[4]=225;
    stops[2].toHSL[4]=225;
    stops[3].fromHSL[1]=0;
    stops[3].toHSL[1]=0;
    stops[3].fromHSL[2]=20;
    stops[3].toHSL[2]=20;
    stops[3].fromHSL[3]=100;
    stops[3].toHSL[3]=100;
    stops[3].fromHSL[4]=225;
    stops[3].toHSL[4]=225;
    stops[4].fromHSL[1]=0;
    stops[4].toHSL[1]=0;
    stops[4].fromHSL[2]=20;
    stops[4].toHSL[2]=20;
    stops[4].fromHSL[3]=100;
    stops[4].toHSL[3]=100;
    stops[4].fromHSL[4]=225;
    stops[4].toHSL[4]=225;
  }
  randomizeCurves();
  start();
}

function start() {
  if (stopped) {
    stopped=false;
    halts.stop=false;
    halts.stopNow=false;
    activateStops();
    fillColor.active=true;
    for (c of curves) {
      if (c.cstate==STD) {
        c.randomizeCurve();
        c.active=true;
        c.start=0;
      }
    }
    document.querySelector('#ss').textContent='Stop';
    document.querySelector('#onoff').innerHTML='&#10679;';
    requestAnimationFrame(animate);
  } else {
    if (halts.stop) {
      halts.stopNow=true;
    } else {
      halts.stop=true;
      document.querySelector('#ss').textContent='Stopping';
    }
  }
}

function park() {
  stopped=true;
  document.querySelector('#ss').textContent='Start';
  document.querySelector('#onoff').innerHTML='&#10687;';
}

function changeDuration(si) {
  animateDuration=si.value*1000;
  document.getElementById('durRep').textContent=si.value+'s';
}

function changeRotation(si) {
  rotationFactor=si.value;
  document.getElementById('rotRep').textContent=(si.value*100).toFixed(0)+'%';
}

function changestrokeOpacity(si) {
    strokeopacityFactor=si.value;
  document.getElementById('strokeopacity_value').textContent=(si.value*100).toFixed(0)+'%';  
}

function changefillOpacity(si) {
    fillopacityFactor=si.value;
  document.getElementById('fillopacity_value').textContent=(si.value*100).toFixed(0)+'%';  
}

function changerStrokeWidth(si) {
  rstrokeWidth=si.value;
  document.getElementById('rStrokeWidth_value').textContent=si;
}
function changeaStrokeWidth(si) {
  astrokeWidth=si.value;
  document.getElementById('aStrokeWidth_value').textContent=si;
}

function changestrokeML(si) {
  strokeML=si.value;
  document.getElementById('strokeML_value').textContent=si;
}


function inputCurveCount(si) {
  document.getElementById('ccRep').textContent=si.value;
  if (isAActive()) {
    document.getElementById('kCount').checked=true;
    curveCountLock=true;
  }
  changeCurveCount(parseInt(si.value));
}

function lockCurveCount(cb) {
  if (cb.checked) {
    curveCountLock=true;
  } else {
    curveCountLock=false;
  }
}

function inputCurveCycles(si) {
  document.getElementById('cvRep').textContent=si.value;
  cycleSet=parseInt(si.value);
  resetCycleSet();
  if (isAActive()) {
    if (fillColor.fstate==GRAD || fillColor.fstate==TOGRAD) {
      cycleLock=true;
      document.getElementById('kCycle').checked='checked';
    }
  }
  for (c of curves) {
    c.setCurve();
    c.fromData=c.toData.slice();
    if (c.cstate==STD) {
      c.randomizeCurve();
    }
  }
  drawCurves();
}

function lockCurveCycles(cb) {
  if (cb.checked) {
    cycleLock=true;
  } else {
    cycleLock=false;
  }
}


function activateStops() {
  for (stop of stops) {
    stop.activate();
  }
}

function stopsInactive() {
  for (stop of stops) {
    if (stop.state=='active') {
      return false;
    }
  }
  return true;
}

function shiftStops() {
  insertStop();
  deleteStop();
  for (let i in stops) {
    stops[i].number=i;
    stops[i].shiftPropertiesL();
    if (i==stops.length-1) {
      if (stops[i].signal) {
        fillColor.fstate=GRAD;
        fillColor.fillDuration=animateDuration;
        stops[i].signal=false;
      }
    }
  }
  if (fillColor.fstate==TOSOLID) {
    fillColor.fillDuration=Math.max(100, fillColor.fillDuration*.7);
  } else if (fillColor.fstate==TOGRAD) {
    fillColor.fillDuration=Math.min(animateDuration, fillColor.fillDuration/.7);
  }
}
var gradient=document.querySelector('#phsRG');

function getSOL(count) {
  let sa=[[0,1,90,80]];
  if (count==1) {
    return sa;
  } else if (count==2) {
    sa.push([1,1,90,80]);
    return sa;
  } else if (count==3) {
    sa.push([1,1,10,10]);
  //  sa.push([0,5,20,20]);
   // sa.push([0,10,40,40]);
    sa.push([.5,.5,70,70]);
 //   sa.push([1,0,0,20]);
    return sa;
  } else {
    let seg=1/(count-2);
   /* for (let i=1; i<count-2; i++) {
      let nos=0.18*Math.atan2(seg*i,3)+0.85*seg*i;
      let lum=80-60*Math.atan2(i*seg,2);
      let sat=90*(1-Math.atan2(i*seg,2));
      sa.push([nos,1-Math.atan2(seg*i,6), sat, lum]);*/
      
          for (let i=1; i<count-2; i++) {
      let nos=0.18*Math.pow(seg*i,2)+0.85*seg*i;
      let lum=80-60*Math.pow(i*seg,4);
      let sat=90*(1-Math.pow(i*seg,4));
      sa.push([nos,1-Math.pow(seg*i,5), sat, lum]);
    }
    sa.push([1,0,0,20]);
    sa.push([1,0,0,20]);
  //  sa.push([1,0,4.0,8.0]);
  //  sa.push([1,0,4.0,8.0]);
  //  sa.push([2,0,0,40]);
  //  sa.push([2,0,0,40]);
  //  sa.push([3,0,0,80]);
   // sa.push([3,0,0,80]);
  //  sa.push([1,2,2,10]);
 //   sa.push([1,2,2,10]);
  /*  sa.push([1,0,0,20]);
    sa.push([1,0,0,20]);
    sa.push([2,0,0,80]);
    sa.push([2,0,0,80]);
    sa.push([1,0,4.0,8.0]);
    sa.push([1,0,4.0,8.0]);*/
    
  }
  return sa;
}

var MAX_STOP_COUNT=10;
var so=getSOL(MAX_STOP_COUNT);
var stops=[];

for (let i=0; i<so.length; i++) {
  let op=(i==0)?1:(i==1)?.8:0;
  let stopx=new Stop(i,[so[i][0],op,so[i][2],so[i][3]]);
  stops.push(stopx);
  gradient.appendChild(stopx.el);
}
stops[0].signal=true;

function insertStop() {
  stops.unshift(new Stop(0,[0,1,90,80]));
//  stops.unshift(new Stop(0,[0,1,90,80]));
  stops[0].state='zero';
  stops[1].state='active';  
  gradient.insertBefore(stops[0].el, gradient.firstChild);
  if (fillColor.fstate==TOSOLID) {
    stops[0].fromHSL=stops[1].fromHSL.slice();
    stops[0].toHSL=stops[1].toHSL.slice();
    stops[0].el.setAttribute('stop-color',stops[1].getHSLString());
  }
}

function deleteStop() {
  gradient.removeChild(gradient.lastElementChild);
  stops.pop();
}

function setMenu(menu,on) {
  if(on) {
    menu.dataset.state='1';
    menu.title='hide';
  } else {
    menu.dataset.state='0';
    menu.title='show';
  }
  menu.childNodes.forEach(function(n) {
    if (n.tagName=='SPAN') {
      if (on) {
        n.style.transform='rotate(180deg)';
       // n.style.transform='rotate(90deg)';
      } else {
        n.style.transform='rotate(0deg)';
      }
    }
  });
}

function menuAnimate(timestamp, mdata) {
  if (!mdata.start) mdata.start=timestamp;
  var progress = timestamp - mdata.start;
  var frac=progress/400;
  if (mdata.open) {
    mdata.divstyle.height=Math.min(frac*mdata.ht, mdata.ht) + 'px';
    mdata.divstyle.width=Math.min(120+frac*(mdata.wd-120), mdata.wd) + 'px';
  } else {
    mdata.divstyle.height=mdata.ht-Math.min(frac*mdata.ht, mdata.ht) + 'px';
    var mWidth=mdata.wd-(mdata.wd-120)*frac;
    mdata.divstyle.width=mWidth+'px';
  }
  if (progress<400) {
    requestAnimationFrame(function(ts) { menuAnimate(ts,mdata); });
  } 
}

function togMenu(menu,show) {
  var cd=document.getElementById('cdiv'+menu.dataset.con);
  var ti=document.getElementById('props'+menu.dataset.con);
  var ww=window.innerWidth;
  var mdata={"start":null,"divstyle":cd.style,"ht":ti.offsetHeight,"wd":ti.offsetWidth,"ww":ww};
  if (arguments.length==1) {
    if (menu.dataset.state=='0') { 
      mdata.open=true;
      requestAnimationFrame(function(ts) { menuAnimate(ts,mdata); });
      setMenu(menu,true);
    } else {
      mdata.open=false;
      requestAnimationFrame(function(ts) { menuAnimate(ts,mdata); });
      setMenu(menu,false);
    }
  } else {
    mdata.open=show;
    requestAnimationFrame(function(ts) { menuAnimate(ts,mdata); });
    setMenu(menu,show);
  }
}

var red_slider = document.getElementById("red_slider");
var green_slider = document.getElementById("green_slider");
var blue_slider = document.getElementById("blue_slider");
var strokeopacity_slider = document.getElementById("strokeopacity_slider");
var fillopacity_slider = document.getElementById("fillopacity_slider");
var rStrokeWidth_slider = document.getElementById("rStrokeWidth_slider");
var aStrokeWidth_slider = document.getElementById("aStrokeWidth_slider");
var strokeML_slider = document.getElementById("strokeML_slider");
var strkred_slider = document.getElementById("strkred_slider");
var strkgreen_slider = document.getElementById("strkgreen_slider");
var strkblue_slider = document.getElementById("strkblue_slider");



var red_output = document.getElementById("red_value");
var green_output = document.getElementById("green_value");
var blue_output = document.getElementById("blue_value");
var strokeopacity_output = document.getElementById("strokeopacity_value");
var fillopacity_output = document.getElementById("fillopacity_value");
var rStrokeWidth_output = document.getElementById("rStrokeWidth_value");
var aStrokeWidth_output = document.getElementById("aStrokeWidth_value");
var strokeML_output = document.getElementById("strokeML_value");
var strkred_output = document.getElementById("strkred_value");
var strkgreen_output = document.getElementById("strkgreen_value");
var strkblue_output = document.getElementById("strkblue_value");



red_slider.oninput = function() {
  red_output.innerHTML = this.value;
  document.documentElement.style.setProperty('--red-color', this.value);

}
green_slider.oninput = function() {
  green_output.innerHTML = this.value;
  document.documentElement.style.setProperty('--green-color', this.value);

}
blue_slider.oninput = function() {
  blue_output.innerHTML = this.value;
  document.documentElement.style.setProperty('--blue-color', this.value);
}

strokeopacity_slider.oninput = function() {
  strokeopacity_output.innerHTML = this.value;
  document.documentElement.style.setProperty('--opacity', this.value);
}

fillopacity_slider.oninput = function() {
  fillopacity_output.innerHTML = this.value;
  document.documentElement.style.setProperty('--fopacity', this.value);
}

/*rStrokeWidth_slider.oninput = function() {
  rStrokeWidth_output.innerHTML = this.value;
  document.documentElement.style.setProperty('--rStrokeWidth', this.value);
}*/
aStrokeWidth_slider.oninput = function() {
  aStrokeWidth_output.innerHTML = this.value;
  document.documentElement.style.setProperty('--aStrokeWidth', this.value);
}

strokeML_slider.oninput = function() {
  strokeML_output.innerHTML = this.value;
  document.documentElement.style.setProperty('--strokeML', this.value);
}

strkred_slider.oninput = function() {
  strkred_output.innerHTML = this.value;
  document.documentElement.style.setProperty('--Strk_red-color', this.value);

}
strkgreen_slider.oninput = function() {
  strkgreen_output.innerHTML = this.value;
  document.documentElement.style.setProperty('--Strk_green-color', this.value);

}
strkblue_slider.oninput = function() {
  strkblue_output.innerHTML = this.value;
  document.documentElement.style.setProperty('--Strk_blue-color', this.value);
}


document.getElementById("mBlend-select").onchange = function(event) {
  document.getElementById("asvg").style.mixBlendMode = document.getElementById("mBlend-select").selectedOptions[0].innerHTML;
}
/*
document.getElementById("iso-select").onchange = function(event) {
  document.getElementById("ascell").style.isolation = document.getElementById("iso-select").selectedOptions[0].innerHTML;
}*/

//console.log(document.getElementById('ascell'));
//console.log(document.getElementById('blend'));



onresize();

init();