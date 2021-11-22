
function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var math = {
  lerp: function lerp(a, b, n) {
    return (1 - n) * a + n * b;
  },
  norm: function norm(value, min, max) {
    return (value - min) / (max - min);
  }
};

var config = {
  height: window.innerHeight,
  width: window.innerWidth
};

const Ease = {
  o3: function (t) {
    return --t * t * t + 1
  },
  io6: function (t) {
    return 0 === t ? 0 : 1 === t ? 1 : (t /= 0.5) < 1 ? 0.5 * Math.pow(2, 10 * (t - 1))  : 0.5 * (2 - Math.pow(2, - 10 * --t))
  }
}


var Smooth =
/*#__PURE__*/
function () {
  function Smooth() {
    _classCallCheck(this, Smooth);

    this.bindAll();
    this.el = document.querySelector("[data-scroll]");
    this.content = document.querySelectorAll("[data-scroll-content]");
    this.direction=-1;

    this.dom = {
      el: this.el,
      content: this.content,
      elems: [this.content[0].querySelectorAll(".js-slide")],
      handle: this.el.querySelector(".js-scrollbar__handle"),
      prs:this.el.querySelectorAll('.project-thumbnail'),
      canvasImg: this.el.querySelectorAll('.canvasImgCont'),
      clock:this.el.querySelector('#caption'),
      rc1:this.el.querySelector('#rc1'),
      rc2:this.el.querySelector('#rc2'), 
	  rc3:this.el.querySelector('#rc3'), 
	  wmap:this.el.querySelectorAll('.wmap'),            
    };

    this.data = {
      total: this.dom.elems[0].length - 1,
      current: 0,
      last: {
        one: 0,
        two: 0
      },
      on: 0,
      off: 0
    };
    this.animation ={
		progress:0,
		progressd:0,
		time:1.2,
		ease:Ease['io6'],
		delay:0.3,
		opacity:1,
		opEase:Ease['o3'],
		nowd:0,
		now:0,
		start:0,
		closed:true,
		}
	this.water=true;	
    this.canvasImg={
		elem:[]
		}
	this.prs={
		elem:[]
		}
	this.mode= (document.querySelector('body').classList.contains('l-mode'))?1: 0;
    this.bounds = {
      elem: 0,
      content: 0,
      width: 0,
      max: 0,
      min: 0,
      prev:0
    };
    this.state = {
      dragging: false
    };
    this.rAF = null;
    this.stop=false;
    this.prstatus='standby';
    this.webstatus='standby';
    this.opac=1;
    this.opac2=0;
    this.opac3=0;
    this.abv1=0;
    this.abs1=0;
    this.abv2=0;
    this.abs2=0;
    this.ccs=0;
    this.init();
  }


//

  _createClass(Smooth, [{
    key: "bindAll",
    value: function bindAll() {
      var _this = this;
		
      ["scroll", "run", "resize", "stop"].forEach(function (fn) {
        return _this[fn] = _this[fn].bind(_this);
      });
    }
  }, {
    key: "setStyles",
    value: function setStyles() {
      this.dom.el.style.position = "absolute";
      this.dom.el.style.top = 0;
      this.dom.el.style.left = 0;
      this.dom.el.style.height = "100vh";
      this.dom.el.style.width = "100%";
      this.dom.el.style.overflow = "hidden";
    }
  }, {
    key: "setBounds",
    value: function setBounds(elems) {
		
      var _this2 = this;
	  var w = 0;
      elems.forEach(function (el, index) {
        var bounds = el.getBoundingClientRect();
        el.style.position = "absolute";
        el.style.top = 0;
        el.style.left = "".concat(w, "px");
        w = w + bounds.width;
        _this2.bounds.width = w;
        _this2.bounds.max = _this2.bounds.width - config.width;


        if (_this2.data.total === index && elems === _this2.dom.elems[0]) {
          _this2.dom.content[0].style.width = "".concat(w, "px");

        }
      });
    }
  }, {
    key: "scroll",
    value: function scroll() {
	  if (this.state.dragging) return;
      this.data.current = window.scrollY;
      this.clamp();
    }
  },   { key: "scrollH",
    value: function scrollH(e) {
		 var _this2b = this;
      if (this.state.dragging) return;
       var w=0;
       w = w + _this2b.dom.content[0].offsetWidth;
		var mov=(Math.abs(e.deltaX)>Math.abs(e.deltaY))?e.deltaX:e.deltaY;
       
		var posX = Math.min(Math.max(parseInt(mov),-50),50);
		
		var prposX =parseInt(this.data.current);
		var rec=Math.min(Math.max(parseInt(prposX+posX*2), 0), w);
     
      this.data.current = rec;
      this.clamp();
    }
  }, {
    key: "drag",
    value: function drag(e) {
		
      this.data.current = this.data.last.one - (e.clientX - this.data.on);
      this.clamp();
    
    }
  }, {
    key: "clamp",
    value: function clamp() {
	        
      this.data.current = Math.min(Math.max(this.data.current, 0), this.bounds.max);
      
    }
  }, {
    key: "run",
    value: function run() {
	  var _this1=this;
      this.data.last.one = math.lerp(this.data.last.one, this.data.current, 0.085);
      this.data.last.one = Math.floor(this.data.last.one * 100) / 100;
      this.data.last.two = math.lerp(this.data.last.two, this.data.current, 0.08);
      this.data.last.two = Math.floor(this.data.last.two * 100) / 100;

      var diff = this.data.current - this.data.last.one;
      var acc = diff / config.width;
      var velo = +acc;
      var bounce = 1 - Math.abs(velo * 0.25);
      var skew = velo * 7.5;
      var change1=document.getElementById('nav').offsetWidth;
      var change2=parseInt(document.getElementById('work').style.left) - change1;
	  var dir=(diff<0)?1:-1;
	  if(diff !=0){this.direction = dir;}
	  var dif=(Math.abs(diff)<50)?5:Math.abs(diff)*0.1;
	  
	  //webstatus
	   if(Math.abs(diff) > 1){_this1.webstatus='moving';}else{_this1.webstatus='standby';}
	  
	  //direction
	  if(this.direction >0){this.el.classList.add('backwards');this.el.classList.remove('forwards');}else{this.el.classList.remove('backwards');this.el.classList.add('forwards');}
  
      
      //scroll events

    	if (document.querySelector('footer').getBoundingClientRect().left-window.innerWidth*0.15 < window.innerWidth*0.8) {document.getElementById('viewport').classList.add('hd');}else{document.getElementById('viewport').classList.remove('hd');}
			
		if(document.getElementById('home').getBoundingClientRect().left < 0){   document.getElementById('viewport').classList.remove('mw');}
		if(document.getElementById('home').getBoundingClientRect().left > -10){ document.getElementById('viewport').classList.add('in');}else{ document.getElementById('viewport').classList.remove('in')}
		if(document.getElementById('home').getBoundingClientRect().right > 0){if(!this.water){window.dispatchEvent(restartAnimation); this.water=true;}	}
					   
		if(document.getElementById('about').getBoundingClientRect().left < 0.36962915*window.innerHeight && document.getElementById('about').getBoundingClientRect().right > 0.0812065*window.innerHeight){ document.getElementById('menuAbout').classList.add('current')}else{document.getElementById('menuAbout').classList.remove('current')}
		if(document.getElementById('work').getBoundingClientRect().left < 0.0812065*window.innerHeight && document.getElementById('work').getBoundingClientRect().right > 0.0812065*window.innerHeight){document.getElementById('menuWork').classList.add('current'); }else{document.getElementById('menuWork').classList.remove('current')}
		if(_this1.data.last.two.toFixed(2)> window.innerWidth*0.3334){document.body.classList.add('vw');}else{document.body.classList.remove('vw');	}
		if(document.getElementById('contact').getBoundingClientRect().left <  0.0812065*window.innerHeight && document.getElementById('contact').getBoundingClientRect().right > 100){document.getElementById('menuContact').classList.add('current')}else{document.getElementById('menuContact').classList.remove('current')}		   

		if (Math.abs(diff) < 1 && _this1.water && document.getElementById('about').getBoundingClientRect().left < 0.0812065*window.innerHeight ){
			window.dispatchEvent(cancelAnimation); this.water=false;
			logos();
			}

		document.querySelectorAll('.shw').forEach(function(el,index){if(el.getBoundingClientRect().right > 0 && el.getBoundingClientRect().left < window.innerWidth*0.75){ el.classList.remove('shw')}})														   
		if(document.getElementById('works-content').getBoundingClientRect().left < (window.innerWidth*0.5 - 0.1*window.innerHeight) && document.getElementById('works-content').getBoundingClientRect().right > window.innerWidth*0.55){
			document.getElementById('worksmap').classList.add('vs');
		}else{
			document.getElementById('worksmap').classList.remove('vs');
		}


	  //scroll transform		   		   
      this.dom.content[0].style.transform = "translate3d(-".concat(this.data.last.two.toFixed(2), "px, 0, 0)"); 
  	  var scale = math.norm(this.data.last.two, 0, this.bounds.max);
      this.dom.handle.style.transform = "scaleX(".concat(scale, ")");

  	  rota(dif,this.direction); //whell

	  // animation time controls
	  
	  if(_this1.prstatus == 'opening' ){
		if (_this1.animation.now - _this1.animation.delay*60  < _this1.animation.time*60) {
			_this1.animation.progress = _this1.animation.ease((_this1.animation.now - _this1.animation.delay*60) / (_this1.animation.time*60));
		    _this1.animation.now++;	
						  
		}
	  }else if(_this1.prstatus == 'closing'){
		   
		 if (_this1.animation.now <= _this1.animation.time*60) {
			 _this1.animation.progress = _this1.animation.ease((_this1.animation.now) / (_this1.animation.time*60));
			 _this1.animation.now++;
			
		 }else{
			 if (_this1.animation.nowd <= _this1.animation.delay*60 ){
				_this1.animation.progressd = _this1.animation.opEase((_this1.animation.nowd) / (_this1.animation.delay*60));
				_this1.animation.nowd++;
			
			}
		
		 } 
	 }
	  
	  	//about and contact images, scale and parallax				

		var Ab1= {left: _this1.dom.canvasImg[1].getBoundingClientRect().left, top:_this1.dom.canvasImg[1].getBoundingClientRect().top, right: _this1.dom.canvasImg[1].getBoundingClientRect().right , bottom:_this1.dom.canvasImg[1].getBoundingClientRect().bottom, width:_this1.dom.canvasImg[1].getBoundingClientRect().width, height:_this1.dom.canvasImg[1].getBoundingClientRect().height};
		var Ab2= {left: _this1.dom.canvasImg[0].getBoundingClientRect().left, top:_this1.dom.canvasImg[0].getBoundingClientRect().top, right: _this1.dom.canvasImg[0].getBoundingClientRect().right , bottom:_this1.dom.canvasImg[0].getBoundingClientRect().bottom, width:_this1.dom.canvasImg[0].getBoundingClientRect().width, height:_this1.dom.canvasImg[0].getBoundingClientRect().height};
		var cc= {left: _this1.dom.canvasImg[12].getBoundingClientRect().left, top:_this1.dom.canvasImg[12].getBoundingClientRect().top, right: _this1.dom.canvasImg[12].getBoundingClientRect().right , bottom:_this1.dom.canvasImg[12].getBoundingClientRect().bottom, width:_this1.dom.canvasImg[12].getBoundingClientRect().width, height:_this1.dom.canvasImg[12].getBoundingClientRect().height};
	
		
		if(Ab1.right < 0){
			_this1.abv1=(-Ab1.width - window.innerWidth)*0.1;
			_this1.abs1=1;
			}else if(Ab1.left > window.innerWidth){
			_this1.abv1=0; _this1.abs1=2;
			}else{
			_this1.abv1=(_this1.canvasImg.elem[1].pos.left-_this1.data.last.two- window.innerWidth)*0.1;	
			_this1.abs1=2+(_this1.canvasImg.elem[1].pos.left-_this1.data.last.two- window.innerWidth)/(Ab1.width + window.innerWidth);
			
			}	
		if(Ab2.right < 0){
			_this1.abs2=1+(Ab2.width + window.innerWidth)/(Ab2.width + window.innerWidth);
			}else if(Ab2.left > window.innerWidth){
			_this1.abs2=1;
			}else{
			_this1.abs2=1-(_this1.canvasImg.elem[0].pos.left-_this1.data.last.two- window.innerWidth)/(Ab2.width + window.innerWidth);
			
			}
		if(cc.right < 0){
				_this1.ccs=(-cc.width - window.innerWidth)*0.141;
				
				}else if(cc.left > window.innerWidth){
					_this1.ccs=0;
				
				}else{
					
				_this1.ccs=(_this1.canvasImg.elem[12].pos.left.toFixed(2)-_this1.data.last.two.toFixed(2)- window.innerWidth)*0.141;	


			}
		_this1.dom.clock.style.transform='translateX('+cc.left+'px)';

	   if(pixir){ //pixi delayed

		  pixir.about1.position.x = Ab1.left+_this1.abv1-(Ab1.width*_this1.abs1/2)+Ab1.width/2;
		  pixir.about1.position.y = Ab1.top-(Ab1.height*_this1.abs1/2)+Ab1.height/2;
		  pixir.about1.width=Ab1.height*_this1.abs1*1.8;
		  pixir.about1.height=Ab1.height*_this1.abs1; 
		  pixir.about1.mask.position.x =Ab1.left;
	

		  pixir.about2.position.x = Ab2.left-(Ab2.width*_this1.abs2/2)+Ab2.width/2;
		  pixir.about2.position.y = Ab2.top-(Ab2.height*_this1.abs2/2)+Ab2.height/2;
		  pixir.about2.width=Ab2.width*_this1.abs2;
		  pixir.about2.height=Ab2.width*_this1.abs2*1.3; 
		  pixir.about2.mask.position.x =Ab2.left;


		  pixir.contact1.position.x = cc.left+(cc.width-cc.height*1.8)/2-_this1.ccs/2;
		  pixir.contact1.position.y = cc.top;
		  pixir.contact1.width=cc.height*1.8;
		  pixir.contact1.height=cc.height; 
		  pixir.contact1.mask.position.x =cc.left;
	
		  if(_this1.mode==1){
				pixir.about1.texture=pixir.about1Texture;
				pixir.about2.texture=pixir.about2Texture;
				pixir.contact1.texture=pixir.contact1Texture;
				
			 }else{
			 	pixir.about1.texture=pixir.about1Texture2;		 
				pixir.about2.texture=pixir.about2Texture2;
				pixir.contact1.texture=pixir.contact1Texture2; 
			 }		  

		 this.dom.prs.forEach(function(el,index){
					 var cont=el.getBoundingClientRect();
			var fg;
			if(cont.right < 0){
				fg=(-cont.width - window.innerWidth)*0.085;
				}else if(cont.left > window.innerWidth){
				fg=0;
				}else{
				fg=(pixir.posx[index].toFixed(2)-_this1.data.last.two.toFixed(2)- window.innerWidth)*0.085;	

			}
			var mv=(pixir.posx[index].toFixed(2)-_this1.data.last.two.toFixed(2)+cont.width/2).toFixed(2); //work parallax
	
			let fop; //work opacity
					if(mv > window.innerWidth*0.525){
						if(mv < window.innerWidth*0.666){
								fop=(mv-window.innerWidth*0.525)/(window.innerWidth*0.141).toFixed(2);
						}else{
								fop=1;
						}															
					}else if (mv < window.innerWidth*0.475){
						if (mv > window.innerWidth*0.333){
							fop=(window.innerWidth*0.475 - mv)/(window.innerWidth*0.142);
						}else{
							fop=1;
						}							
					}else{
							fop=0;
					}
						
				_this1.prs.elem[index].op=fop;		
			//open position	
			let toC1x=0;		
			let toC1y=0;			   
			
			let toC2x=0;		
			let toC2y=Math.round(window.innerHeight*0.686);
			
			let toC3x=window.innerWidth;	
			let toC3y=window.innerHeight*0.686;
			
			let toC4x=window.innerWidth;
			let toC4y=0;
			
			
			//normal position
			let fromI1x= Math.round(cont.left+fg-0.9*cont.height+0.5*cont.width);
			let fromI1y= Math.round(cont.top);		
			
			//open image position
			let toI1x=0;
			let toI1y=Math.round(-(window.innerWidth/1.8 - window.innerHeight*0.65)/2); 
			
			// grid position
			let fromIw=Math.round(cont.height*1.8);
			let fromIh=Math.round(cont.height);		
			
			// open image size
			let toIw=window.innerWidth;
			let toIh=Math.round(window.innerWidth/1.8);
			
				if(_this1.prstatus=='opening'){	
					
				if(!_this1.prs.elem[index].click){	
					
				
				if(	_this1.animation.now - _this1.animation.delay*60 < 0){ //delay
						
					_this1.prs.elem[index].hov=false; 
					_this1.animation.opacity = _this1.animation.opEase((_this1.animation.now) / (_this1.animation.delay*60));				
					}
				 let opac=math.lerp(1,0,_this1.animation.opacity);
				 pixir.paras[index].position.x=fromI1x;
				 pixir.paras[index].position.y=fromI1y;
				 pixir.paras[index].width=fromIw;
				 pixir.paras[index].height=fromIh;
				 pixir.paras[index].alpha=opac;
				 pixir.paras[index].mask.position.x =cont.left;
				
				 if(_this1.mode==1){
					pixir.paras2g[index].texture=pixir.paras2t[index];
				 }else{
					pixir.paras2g[index].texture=pixir.paras3t[index];		 
					 
				 }
				 pixir.paras2g[index].position.x=fromI1x;
				 pixir.paras2g[index].position.y=fromI1y;
				 pixir.paras2g[index].width=fromIw;
				 pixir.paras2g[index].height=fromIh;
				 pixir.paras2g[index].alpha=opac;
				 pixir.paras2g[index].mask.position.x =cont.left;
								
					
					
				}else{
					if(	_this1.animation.now - _this1.animation.delay*60 < 0){ //delay
							
						_this1.prs.elem[index].hov=false; 
						_this1.animation.opacity = _this1.animation.opEase((_this1.animation.now) / (_this1.animation.delay*60));				
						}
					 let opac=math.lerp(_this1.prs.elem[index].op,0,_this1.animation.opacity);

					 if(_this1.mode==1){
						pixir.paras2g[index].texture=pixir.paras2t[index];
					 }else{
						pixir.paras2g[index].texture=pixir.paras3t[index];		 
						 
					 }
					 pixir.paras2g[index].position.x=fromI1x;
					 pixir.paras2g[index].position.y=fromI1y;
					 pixir.paras2g[index].width=fromIw;
					 pixir.paras2g[index].height=fromIh;
					 pixir.paras2g[index].alpha=opac;
					 pixir.paras2g[index].mask.position.x =cont.left;
		
					 
					 _this1.animation.progress = _this1.animation.ease((_this1.animation.now-_this1.animation.delay*60) / (_this1.animation.time*60));	
					 let ms= new PIXI.Graphics();
						ms.beginFill(0x000000);
						ms.drawRect(math.lerp(cont.left,toC1x,_this1.animation.progress),math.lerp(cont.top,toC1y,_this1.animation.progress),Math.round(math.lerp(cont.width,toC3x,_this1.animation.progress)),Math.round(math.lerp(cont.height,toC3y,_this1.animation.progress)));
					 
					 
					 						
					 pixir.paras[index].position.x=Math.round(math.lerp(fromI1x,toI1x,_this1.animation.progress));
					 pixir.paras[index].position.y=Math.round(math.lerp(fromI1y,toI1y,_this1.animation.progress));
					 pixir.paras[index].width=Math.round(math.lerp(fromIw,toIw,_this1.animation.progress));
					 pixir.paras[index].height=Math.round(math.lerp(fromIh,toIh,_this1.animation.progress));
					 pixir.paras[index].mask=ms;
			
					 pixir.contact1.alpha=opac;
			
				}
			
		}else if (_this1.prstatus=='closing'){
				if(!_this1.prs.elem[index].click){	
					
				
				if(	_this1.animation.now - _this1.animation.delay*60 < 0){ //delay
						
					_this1.prs.elem[index].hov=false; 	
					_this1.animation.opacity = _this1.animation.opEase((_this1.animation.now) / (_this1.animation.delay*60));				
					}
					
				 let opac2=math.lerp(0,_this1.prs.elem[index].op,_this1.animation.progressd)
				 let opac3=math.lerp(0,1,_this1.animation.progressd);
				 pixir.paras[index].position.x=fromI1x;
				 pixir.paras[index].position.y=fromI1y;
				 pixir.paras[index].width=fromIw;
				 pixir.paras[index].height=fromIh;
				 pixir.paras[index].alpha=opac3;
				 pixir.paras[index].mask.position.x =cont.left;
			
			 
				 if(_this1.mode==1){
					pixir.paras2g[index].texture=pixir.paras2t[index];
				 }else{
					pixir.paras2g[index].texture=pixir.paras3t[index];		 
					 
				 }
				 pixir.paras2g[index].position.x=fromI1x;
				 pixir.paras2g[index].position.y=fromI1y;
				 pixir.paras2g[index].width=fromIw;
				 pixir.paras2g[index].height=fromIh;
				 pixir.paras2g[index].alpha=opac2;
				 pixir.paras2g[index].mask.position.x =cont.left;
		
					
				}else{
					if (_this1.animation.nowd <= _this1.animation.delay*60 ){

							
						 }else{
						//restart conditions
						_this1.animation.closed=true;
						_this1.prs.elem[index].click=false;
						_this1.prs.elem[index].hovnow=0;
						}
					
				
					let opac2=math.lerp(0,_this1.prs.elem[index].op,_this1.animation.progressd)
					let opac3=math.lerp(0,1,_this1.animation.progressd)						

					 if(_this1.mode==1){
						pixir.paras2g[index].texture=pixir.paras2t[index];
					 }else{
						pixir.paras2g[index].texture=pixir.paras3t[index];		 
						 
					 }
					 pixir.paras2g[index].position.x=fromI1x;
					 pixir.paras2g[index].position.y=fromI1y;
					 pixir.paras2g[index].width=fromIw;
					 pixir.paras2g[index].height=fromIh;
					 pixir.paras2g[index].alpha=opac2;
					 pixir.paras2g[index].mask.position.x =cont.left;
			
					 
					 _this1.animation.progress = _this1.animation.ease((_this1.animation.now+17-_this1.animation.delay*60) / (_this1.animation.time*60));	
					 let ms= new PIXI.Graphics();
						ms.beginFill(0x000000);
						ms.drawRect(math.lerp(toC1x,cont.left,_this1.animation.progress),math.lerp(toC1y,cont.top,_this1.animation.progress),Math.round(math.lerp(toC3x,cont.width,_this1.animation.progress)),Math.round(math.lerp(toC3y,cont.height,_this1.animation.progress)));
					 
					 
					
					 pixir.paras[index].position.x=Math.round(math.lerp(toI1x,fromI1x,_this1.animation.progress));
					 pixir.paras[index].position.y=Math.round(math.lerp(toI1y,fromI1y,_this1.animation.progress));
					 pixir.paras[index].width=Math.round(math.lerp(toIw,fromIw,_this1.animation.progress));
					 pixir.paras[index].height=Math.round(math.lerp(toIh,fromIh,_this1.animation.progress));
					 pixir.paras[index].alpha=1;
					 pixir.paras[index].mask=ms;
			
					 pixir.contact1.alpha=opac3;		 
					 
			
				}	
				if((index+1) == _this1.dom.prs.length && _this1.animation.closed){
						_this1.prstatus='close';
						console.log('close');
						_this1.stop=false;
						_this1.animation.now=0;
						_this1.animation.nowd=0;
						_this1.animation.progressd=0;
						document.body.classList.remove('pr-inviewport');
				}
			}else{				
		
			 pixir.paras[index].position.x=fromI1x;
			 pixir.paras[index].position.y=fromI1y;
			 pixir.paras[index].width=fromIw;
			 pixir.paras[index].height=fromIh;
			 pixir.paras[index].alpha=1;
			 pixir.paras[index].mask=pixir.masks[index];
			 pixir.paras[index].mask.position.x =cont.left;
			 
			 if(_this1.mode==1){
				pixir.paras2g[index].texture=pixir.paras2t[index];
			 }else{
			 	pixir.paras2g[index].texture=pixir.paras3t[index];		 
				 
			 }
			 pixir.paras2g[index].position.x=fromI1x;
			 pixir.paras2g[index].position.y=fromI1y;
			 pixir.paras2g[index].width=fromIw;
			 pixir.paras2g[index].height=fromIh;
			 pixir.paras2g[index].alpha=fop;
			 pixir.paras2g[index].mask=pixir.masks[index];
			 pixir.paras2g[index].mask.position.x =cont.left;

		  
	  }
	  
		
		  })
		            
		         this.dom.wmap.forEach(function(el,index){
					var cont=_this1.dom.prs[index].getBoundingClientRect();
		            var wW=window.innerWidth;
		         
		            var mv=parseFloat(cont.left.toFixed(2))+parseFloat(cont.width/2);
		            
		            let scp;
					if(mv > wW*0.55){
						if(mv < wW*0.85){
								scp=(mv-wW*0.55)/(wW*0.3).toFixed(2);
						}else{
								scp=1;
						}															
					}else if (mv < wW*0.45){
						if (mv > wW*0.15){
							scp=(wW*0.45 - mv)/(wW*0.3);
						}else{
							scp=1;
						}							
					}else{
							scp=0;
					}
					let swc= 1-parseFloat(scp.toFixed(2))/1.25;
					el.style.transform='scaleX('+swc+')';	
					
				})		
 
	 pixir.renderer.render(pixir.stage);
 } //pixi delayed
     this.requestAnimationFrame();
    }
  },{
	  key:"stop",
	  value:function stop(){
		  this.cancelAnimationFrame();
		  
		  }
	  
	},{
    key: "on",
    value: function on() {
      this.setStyles();
      this.setBounds(this.dom.elems[0]);
      this.addEvents();
      var _this2=this;
      Object.entries(this.dom.prs).forEach(function(el,i){_this2.prs.elem[i]={elem:_this2.dom.prs[i], hov:false, hovin:false , hovnow:0, hovprogress:0,  es:1, click:false, op:1, ease:0, contW:_this2.dom.prs[i].getBoundingClientRect().width, contH:_this2.dom.prs[i].getBoundingClientRect().height};});
      _this2.dom.canvasImg.forEach(function(el, i){_this2.canvasImg.elem[i]={elem:_this2.dom.canvasImg[i], pos:_this2.dom.canvasImg[i].getBoundingClientRect(), parent:_this2.dom.canvasImg[i].parentElement.getBoundingClientRect()}});

      this.bounds.prev=window.innerWidth;

      this.requestAnimationFrame();
    }
  }, {
    key: "requestAnimationFrame",
    value: function (_requestAnimationFrame) {
      function requestAnimationFrame() {
        return _requestAnimationFrame.apply(this, arguments);
      }

      requestAnimationFrame.toString = function () {
        return _requestAnimationFrame.toString();
      };

      return requestAnimationFrame;
    }(function () {
      this.rAF = requestAnimationFrame(this.run);
    })
  },{
  key:"cancelAnimationFrame",
  value: function(){
	  console.log('cancel');
	  cancelAnimationFrame(this.rAF);
	  }  
  },{
  key:"check",
  value: function(){
	

	  let t=0;
	  var _this3=this;
		for(var i=0; i<_this3.prs.elem.length; i++){
			if(_this3.prs.elem[i].hov) t++;
			}
		if(t==0){_this3.prstatus='standby';   }	
	 
	 
	  }  
  },
   {
    key: "resize",
    value: function resize() {
	  var _this4 = this;
	  var w = 0;
       console.log('resize');
      _this4.dom.elems[0].forEach(function (el, index) {
	
        var bounds = el.getBoundingClientRect();
        el.style.position = "absolute";
        el.style.top = 0;
        el.style.left = "".concat(w, "px");
        w = w + bounds.width;
        _this4.bounds.width = w;
        _this4.bounds.max = _this4.bounds.width - window.innerWidth;


        if (_this4.data.total === index) {
          _this4.dom.content[0].style.width = "".concat(w, "px");

        }
      });
      _this4.canvasImg.elem.forEach(function(el,i){
		  _this4.canvasImg.elem[i].pos.x=_this4.canvasImg.elem[i].elem.getBoundingClientRect().left+_this4.data.last.two;
		  })
    }
  }, {
    key: "addEvents",
    value: function addEvents() {
      var _this5 = this;

     /* window.addEventListener("scroll", this.scroll, {
		 passive: true
      });*/
      this.dom.el.addEventListener("wheel",function(e){
		 if(!_this5.stop) _this5.scrollH(e);
		  }, {passive:true}),
	 window.addEventListener('v-mode', function (e) { if(_this5.mode==1){_this5.mode=0;}else{_this5.mode=1;}; }, false),  
		 //drag
      _this5.dom.el.addEventListener("mousemove", function (e) {
        if (!_this5.state.dragging) return;

        _this5.drag(e);
      }, {
        passive: true
      });// end drag
      _this5.dom.el.addEventListener("mousedown", function (e) {
        _this5.state.dragging = true;
        _this5.data.on = e.clientX;
      });
      
      window.addEventListener("mouseup", function () {
        _this5.state.dragging = false;
        window.scrollTo(0, _this5.data.current);
      });
      _this5.dom.prs.forEach(function(e,index){
		  e.addEventListener("mouseover", function (e) {
			_this5.prs.elem[index].hov=true;
			_this5.prs.elem[index].hovin=true;
			_this5.webstatus='hovering';  
			_this5.prstatus='hovering'; 


		  })
		  e.addEventListener("mouseleave", function (e) {
			_this5.webstatus='standby';  
			_this5.prs.elem[index].hovin=false;  
			setTimeout(function(){_this5.prs.elem[index].hov=false; _this5.prs.elem[index].hovnow=0; _this5.prs.elem[index].hovprogress=0;},550)

		  })
		  e.addEventListener("click", function (e) {
			_this5.prs.elem[index].click=true;
			_this5.animation.now=0;
			_this5.stop=true;
			_this5.webstatus='standby';
			_this5.prstatus='opening';
			_this5.animation.closed=false;
			document.body.classList.add('pr-open');
			document.body.classList.add('pr-inviewport');			 
			document.getElementById('pr-t' +(index +1)).classList.add('pr-active');
		  })
		 });
		_this5.dom.wmap.forEach(function(el,index){
		 el.addEventListener("click", function (e) {
		_this5.data.current=_this5.canvasImg.elem[index+2].pos.left - window.innerWidth * 0.5 + _this5.canvasImg.elem[index+2].pos.width*0.5;
		
			 
			 })
		 
		 })	
		 
       document.getElementById('pr-close').addEventListener('click',function(){
			_this5.prstatus='closing';
			_this5.webstatus='standby';
			_this5.animation.now=0;
			document.body.classList.remove('pr-open');
			document.querySelectorAll('.project-t').forEach(function(e){e.classList.remove('pr-active');})
		  });	     
      document.getElementById('s-logo').addEventListener('click',function(){		 
        _this5.data.current=0;
       	   
		  });
	  document.getElementById('sw-back').addEventListener('click',function(){		 
        _this5.data.current=0;
       	   
		  });	  
      document.getElementById('menuAbout').addEventListener('click',function(){
         _this5.data.current=_this5.dom.elems[0][1].offsetLeft - 0.34962915*window.innerHeight;

		  });
      document.getElementById('menuWork').addEventListener('click',function(){
		   
         _this5.data.current=_this5.dom.elems[0][2].offsetLeft + 0.307424771875*window.innerHeight;
       	   
		  });
      document.getElementById('menuContact').addEventListener('click',function(){
		  var ci=document.getElementById('contact-image').getBoundingClientRect();

        _this5.data.current=_this5.dom.elems[0][3].offsetLeft + ci.width + 0.307424771875*window.innerHeight;
       	   
		  });	  
   document.getElementById('c-srv').addEventListener('click',function(){
		  var ci=document.getElementById('contact-image').getBoundingClientRect();

        _this5.data.current=_this5.dom.elems[0][3].offsetLeft + ci.width + 0.307424771875*window.innerHeight;
       	   
		  });	
	document.querySelectorAll('.a-lang').forEach(function(el,i){
		
	el.addEventListener('click', function(){
		
		var lang= el.getAttribute('data-lang');
			document.querySelector('html').setAttribute('lang',lang);
			document.querySelectorAll('#s-lang li').forEach(function(e){e.classList.remove('active')});
			el.parentElement.classList.add('active');
			translate(lang)
	
		
		})
	
	})			  
	        
   window.addEventListener('resize', this.resize, false);
   
    }
  }, {
    key: "init",
    value: function init() {
      this.on();

    }
  }]);

  return Smooth;
}();

var cancelAnimation = new Event('cancelAnimation');
var restartAnimation = new Event('restartAnimation');
	    var A1=document.getElementById('about1C');
	    var A2=document.getElementById('about2C');	
		var C1=document.getElementById('contact1C'); 
		
var Pixi=function() {
	  var that = this;
	  	  this.stage = new PIXI.Container();
	  this.renderer = PIXI.autoDetectRenderer(
		window.innerWidth,
		window.innerHeight,
		{view:document.getElementById("canvasCont"), transparent: true}
	  );
	  
if (navigator.userAgent.indexOf("Chrome") !== -1){
	var Ab1imagel="img/about/one-l.webp";
	var Ab1imaged="img/about/one-d.webp";
	var Ab2imagel="img/about/two-l.webp";
	var Ab2imaged="img/about/two-d.webp";	
	var Ccimagel="img/contact/algorta-l.webp";
	var Ccimaged="img/contact/algorta-d.webp";	
	}else{
	var Ab1imagel="img/about/one-l.jpg";
	var Ab1imaged="img/about/one-d.jpg";
	var Ab2imagel="img/about/two-l.jpg";
	var Ab2imaged="img/about/two-d.jpg";	
	var Ccimagel="img/contact/algorta-l.jpg";
	var Ccimaged="img/contact/algorta-d.jpg";			
	} 
	
	  this.about1Texture = PIXI.Texture.fromImage(Ab1imagel);
	  this.about1Texture2 = PIXI.Texture.fromImage(Ab1imaged);
	  this.about1 = new PIXI.Sprite(this.about1Texture);

	 
	  
	  var mask = new PIXI.Graphics();
			mask.beginFill(0x000000);
			mask.drawRect(0,A1.getBoundingClientRect().y,A1.getBoundingClientRect().width,A1.getBoundingClientRect().height);
	  this.about1.mask = mask;
	  
	  this.stage.addChild(this.about1);	
	  

	  this.about2Texture = PIXI.Texture.fromImage(Ab2imagel);
	  this.about2Texture2 = PIXI.Texture.fromImage(Ab2imaged);
	  this.about2 = new PIXI.Sprite(this.about2Texture);

	  var mask2 = new PIXI.Graphics();
			mask2.beginFill(0x000000);
			mask2.drawRect(0,A2.getBoundingClientRect().y,A2.getBoundingClientRect().width,A2.getBoundingClientRect().height);
	  this.about2.mask = mask2;
	  
	  this.stage.addChild(this.about2);
	 

	  this.contact1Texture = PIXI.Texture.fromImage(Ccimagel);
	  this.contact1Texture2 = PIXI.Texture.fromImage(Ccimaged);
	  this.contact1 = new PIXI.Sprite(this.contact1Texture);

	  var mask3 = new PIXI.Graphics();
			mask3.beginFill(0x000000);
			mask3.drawRect(0,C1.getBoundingClientRect().y,C1.getBoundingClientRect().width,C1.getBoundingClientRect().height);
	  this.contact1.mask = mask3;	
	  this.stage.addChild(this.contact1);
	 
	  this.paras=[];
	  this.posx=[];
	  this.paras2g=[];
      this.paras2t=[];
      this.paras3t=[];
      this.masks=[];
	  	document.querySelectorAll('.floatImg').forEach(function(el,index){
			
			eval("that.floatTexture"+index+"="+'PIXI.Texture.fromImage(el.querySelector(\'div\').getAttribute(\'src\'))');
			
			eval('that.'+"float"+index+"="+'new PIXI.Sprite(that.floatTexture'+index+')');
			eval('that.'+"float"+index+".position.x ="+'el.getBoundingClientRect().x');
			eval('that.'+"float"+index+".position.y ="+'el.getBoundingClientRect().x');
			eval('that.'+"float"+index+".width ="+'el.getBoundingClientRect().width');
			eval('that.'+"float"+index+".height ="+'el.getBoundingClientRect().height');
			eval('that.paras['+index+']=that.'+"float"+index);
			let ms= new PIXI.Graphics();
			ms.beginFill(0x000000);
			ms.drawRect(0,el.getBoundingClientRect().y,el.getBoundingClientRect().width,el.getBoundingClientRect().height);
			that.masks[index]=ms;
			eval('that.stage.addChild(that.'+"float"+index+')');

			eval("that.floatTexture2"+index+"="+'PIXI.Texture.fromImage(el.querySelector(\'div\').getAttribute(\'srcg\'))');
			eval('that.'+"float2"+index+"="+'new PIXI.Sprite(that.floatTexture2'+index+')');
			eval('that.'+"float2"+index+".position.x ="+'el.getBoundingClientRect().x');
			eval('that.'+"float2"+index+".position.y ="+'el.getBoundingClientRect().x');
			eval('that.'+"float2"+index+".width ="+'el.getBoundingClientRect().width');
			eval('that.'+"float2"+index+".height ="+'el.getBoundingClientRect().height');
			eval('that.paras2g['+index+']=that.'+"float2"+index);
			eval('that.paras2t['+index+']=that.'+"floatTexture2"+index);
			eval('that.stage.addChild(that.'+"float2"+index+')');			
			
			eval("that.floatTexture3"+index+"="+'PIXI.Texture.fromImage(el.querySelector(\'div\').getAttribute(\'srca\'))');
			eval('that.paras3t['+index+']=that.'+"floatTexture3"+index);
			
			
			
			that.posx[index]=el.getBoundingClientRect().left;
			
		});
		
		setTimeout(function(){
			that.stwidth=that.stage.width;
			that.stheight=that.stage.height;
	  },1000)
	  	
		window.addEventListener('resize',
		 
			debounce(function(){

				that.renderer.resize(window.innerWidth, window.innerHeight);
	            var rat = window.innerWidth/window.innerHeight;
				var A1w=smooth.canvasImg.elem[1].pos.width;
				var nA1w=A1.getBoundingClientRect().width;
				var A1h=smooth.canvasImg.elem[1].pos.height;
				var nA1h=A1.getBoundingClientRect().height;							
				that.about1.mask.scale.x=nA1w/A1w;
				that.about1.mask.scale.y=nA1h/A1h;

				
				var A2w=smooth.canvasImg.elem[0].pos.width;
				var nA2w=A2.getBoundingClientRect().width;
				var A2h=smooth.canvasImg.elem[0].pos.height;
				var nA2h=A2.getBoundingClientRect().height;
				that.about2.mask.scale.x=nA2w/A2w;
				that.about2.mask.scale.y=nA2h/A2h;
									

				var C1w=smooth.canvasImg.elem[12].pos.width;
				var nC1w=C1.getBoundingClientRect().width;
				var C1h=smooth.canvasImg.elem[12].pos.height;
				var nC1h=C1.getBoundingClientRect().height;
				that.contact1.mask.scale.x=nC1w/C1w;
				that.contact1.mask.scale.y=nC1h/C1h;
							

			for(i=0; i<10; i++){
				let P1w=smooth.canvasImg.elem[i+2].pos.width;
				let nP1w=document.querySelectorAll('.floatImg')[i].getBoundingClientRect().width;
				let P1h=smooth.canvasImg.elem[i+2].pos.height;
				let nP1h=document.querySelectorAll('.floatImg')[i].getBoundingClientRect().height;				
			 that.paras[i].mask.scale.x=nP1w/P1w;
			 that.paras[i].mask.scale.y=nP1h/P1h;
			 that.paras2g[i].mask.scale.x=nP1w/P1w;
			 that.paras2g[i].mask.scale.y=nP1h/P1h;
			 
			}
           setTimeout(function(){
			   for(i=0; i<10; i++){
	           that.posx[i]=document.querySelectorAll('.floatImg')[i].getBoundingClientRect().left+smooth.data.last.two;
			   }
			   
			   },100);

		         config.width=window.innerWidth;
		         config.height=window.innerHeight;
				},500)
			, false);	
	

	}
      
      		
/* *******************************************/


var smooth = new Smooth();
var pixir=false;

setTimeout(function(){
pixir = new Pixi();	
	}, 4000)//delayed pixi

     
 
window.addEventListener("load", function() {

});

//**************************Logos*****************************/
   var http_request_logo = true; 
    function logos(){
		
if(http_request_logo){
        if (window.XMLHttpRequest) { // Mozilla, Safari,...
            http_request = new XMLHttpRequest();
            if (http_request.overrideMimeType) {
                http_request.overrideMimeType('text/xml');
            }
        } else if (window.ActiveXObject) { // IE
            try {
                http_request = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                try {
                    http_request = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (e) {}
            }
        }

        if (!http_request) {
            alert('Falla :( No es posible crear una instancia XMLHTTP');
            return false;
        }
        http_request.onreadystatechange = setContents2;
        http_request.open('GET', window.location.protocol+'//'+window.location.hostname+'/ajax/logos', true);
        http_request.send();
		 http_request_logo = false;
	}	
 }
		 
function setContents2() {

        if (http_request.readyState == 4) {
            if (http_request.status == 200) {
	document.querySelector('.slide-content').innerHTML+=http_request.responseText;
				
               
            } else {
                console.log('Hubo problemas con la petición.');
            }
        }

    }


//*********other functions*************/


function isVisible(el) {
    var rect     = el.getBoundingClientRect(),
        vWidth   = window.innerWidth || doc.documentElement.clientWidth,
        vHeight  = window.innerHeight || doc.documentElement.clientHeight,
 		topHe=(rect.height > vHeight)?rect.height:vHeight;   

    // Return false if it's not in the viewport
    if (rect.right < 0 || rect.bottom < 0 || rect.left > vWidth || rect.top > vHeight) {
		return false;
	}
    // Return true if any of its four corners are visible	
		return true;


}


function getComputedTranslateX(obj)
{
	
    if(!window.getComputedStyle) return;
    var style = getComputedStyle(obj),
        transform = style.transform || style.webkitTransform || style.mozTransform;
    var mat = transform.match(/^matrix3d\((.+)\)$/);
    if(mat) return parseFloat(mat[1].split(', ')[13]);
    mat = transform.match(/^matrix\((.+)\)$/);
    return mat ? parseFloat(mat[1].split(', ')[4]) : 0;
}

function markee(id,sp,direction){
		
		var obj=document.getElementById(id);
		var r=getComputedTranslateX(obj);
		var spe=parseFloat(sp).toFixed(3);
		var vel=parseFloat(r-(spe * direction)*0.15).toFixed(3);
		var objB=obj.getBoundingClientRect();
		var limit=-objB.height/2;
		if (spe*direction > 0){

			if(vel <= limit){
	
				var el=obj.style.transform ='translateX(0px)';
			}else{
						
		
				var el=obj.style.transform ='translateX('+vel+'px)';
		
			}				
		}else{
			
			if(vel >= 0){
				var el=obj.style.transform ='translateX('+limit+'px)';
			}else{
			
				if(vel <= limit){
	
				//var el=obj.style.transform ='translateX('+limit+'px)';	
					}else{			
				
				var el=obj.style.transform ='translateX('+vel+'px)';
				}
			}	
		};
	};


function rota(sp,direction){
	
		var r=getRotate('scroll-t');
		var spe=parseFloat(sp).toFixed(3);
		var vel=parseFloat(r-(spe * direction)*0.15).toFixed(3);
		var el=document.getElementById('scroll-t').style.transform ='rotate('+vel+'deg)';
		
	}

function getRotate(id){

	var el = document.getElementById(id);
	var st = window.getComputedStyle(el, null);
	var tr = st.getPropertyValue("-webkit-transform") ||
			 st.getPropertyValue("-moz-transform") ||
			 st.getPropertyValue("-ms-transform") ||
			 st.getPropertyValue("-o-transform") ||
			 st.getPropertyValue("transform") ||
			 "FAIL";
	// rotation matrix - http://en.wikipedia.org/wiki/Rotation_matrix

	var values = tr.split('(')[1].split(')')[0].split(',');
	var a = values[0];
	var b = values[1];
	var c = values[2];
	var d = values[3];

	var scale = Math.sqrt(a*a + b*b);
	// arc sin, convert from radians to degrees, round
	var sin = b/scale;
	var angle = parseFloat(Math.atan2(b, a) * (180/Math.PI)).toFixed(3);

	return angle;
}

function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

var now = function() {
  return Date.now();
};



	




