AOS.init({
  duration: 1200,
})

// //겹따옴표를 홑따옴표로 바꾸기
// d3.select(“.city”).click(function(e) { d3.select('.' + this.dataset.city_name).style.display = “block”; });
//
// d3.select(“.modal”).click(function(e) { this.style.display = “none"; });

// d3.select(“."sinuiju")
//   .click(function(e) {
//     d3.select('.' + this.dataset.sinuiju)
//     .style.display = "block";
//   });
// d3.select(".modal")
//   .click(function(e) {
//     this.style.display = "none";
//   });

// d3.select(".sinuiju").click(function(e) {
//   d3.select("." + this.dataset.sinuiju).style.display = "block";
// });







//https://codepen.io/osublake/pen/e72106811a34efcccff91a03568cc790.js?v=3

class SmoothScroll {
  constructor(options) {

    this.endThreshold = 0.05;
    this.requestId = null;
    this.maxDepth = 10;
    this.viewHeight = 0;
    this.halfViewHeight = 0;
    this.maxDistance = 0;
    this.viewWidth = 0;
    this.halfViewWidth = 0;
    this.maxDistanceWidth = 0;
    this.scrollHeight = 0;
    this.endScroll = 0;
    this.returnCurrentScroll = 0;
    this.currentScroll = 0;
    this.scrollTransform = 0;
    this.horizontalScroll = 0;
    this.resizeRequest = 1;
    this.scrollRequest = 0;
    this.scrollItems = [];
    this.lastTime = -1;
    this.maxElapsedMS = 100;
    this.targetFPMS = 0.06;

    // this.scrollBody = options.scrollBody;
    // this.scrollSpacer = options.scrollSpacer;

    this.target = options.target;

    this.scrollEase = options.scrollEase != null ? options.scrollEase : 0.1;
    this.maxOffset = options.maxOffset != null ? options.maxOffset : 500;

    this.horizontalScrollWrapper = options.horizontalScrollWrapper;

    this.horizontalScrollTarget = options.horizontalScrollTarget;

    this._horziontalSetHeihgt();

    this.childElements = this._childElements();

    this.rectHorStart = this.horizontalScrollWrapper.getBoundingClientRect();

    this.horzItemStart = {
      top: this.rectHorStart.top,
      bottom: this.rectHorStart.bottom,
      height: this.rectHorStart.height
    }

    this.addItems();

    window.addEventListener("resize", this._onResize);
    window.addEventListener("scroll", this._onScroll);
    //this.scrollBody.addEventListener("scroll", this._onScroll);

    this._update();
  }

  _childElements = (event) => {
    const childElementsNode = this.target.querySelectorAll("*[data-color]");
    return childElementsNode;
  }

  _horizonstalScrollRect = (event) => {
    const horzintalRect = this.horizontalScrollTarget.getBoundingClientRect();
    return horzintalRect;
  }

  _lastScrollRect = (event) => {
    const lastScrollRect = this.horizontalScrollTarget.lastElementChild.getBoundingClientRect();
    return lastScrollRect;
  }

  _horziontalSetHeihgt = (event) => {
    let horScrHeight = 0;
    if (
      this.horizontalScrollTarget !== null &&
      this.horizontalScrollWrapper !== null
    ) {
      const lastScrollRect = this._lastScrollRect();
      horScrHeight = this.horizontalScrollTarget.scrollWidth - lastScrollRect.width + this._horizonstalScrollRect().height;
      this.horizontalScrollWrapper.style.height = horScrHeight + "px";
    }
  }

  _onResize = (event) => {
    this.resizeRequest++;
    if (!this.requestId) {
      this.lastTime = performance.now();
      this.requestId = requestAnimationFrame(this._update);
    }
  };

  _onScroll = (event) => {
    this.scrollRequest++;
    if (!this.requestId) {
      this.lastTime = performance.now();
      this.requestId = requestAnimationFrame(this._update);
    }
  };

  _horizonstalScroll = (scrollY,dt) => {
    if (this.horizontalScrollWrapper !== null) {
      const rectHor = this.horizontalScrollWrapper.getBoundingClientRect();
      const lastScrollRect = this._lastScrollRect();

      const itemHor = {
        target: this.horizontalScrollTarget,
        targetRect: this._horizonstalScrollRect(),
        top: rectHor.top,
        bottom: rectHor.bottom + scrollY,
        topScroll: rectHor.top + scrollY,
        horizonstalMove: 0,
      };

      itemHor.horizonstalMove += this.currentScroll - this.horzItemStart.top;
      if(scrollY >= this.horzItemStart.top && scrollY <= this.horzItemStart.bottom - itemHor.targetRect.height){
        itemHor.target.style.position = 'fixed';
        itemHor.target.style.transform = `translate3d(-${itemHor.horizonstalMove}px,0px,0px)`;

        //this._paralaxHorizontal(dt);

        if(lastScrollRect.x <= (lastScrollRect.width/2)){
          this.scrollTransform = this.horzItemStart.bottom - itemHor.targetRect.height;
          itemHor.target.style.top = this.horzItemStart.bottom - itemHor.targetRect.height+'px';
        }else {
          this.scrollTransform = this.horzItemStart.top;
          itemHor.target.style.top = this.horzItemStart.top+'px';
        }
      }
    }
  };

  _changeColorBody = (event) => {

    if(this.childElements.length > 0){
      this.childElements.forEach(child => {
        const wrapper = document.querySelector('.change_color_page');
        const childRect = child.getBoundingClientRect();
        const childAttr = child.getAttribute('data-color');

        if(childRect.y <= this.halfViewHeight && childRect.bottom >= this.halfViewHeight){
          if(childAttr == "off_white"){
            if(!document.body.classList.contains('white')){
              document.body.classList.add('white');
            }
            if(!wrapper.classList.contains('white')){
              wrapper.classList.add('white');
            }
          }else if(childAttr == "dark"){
            if(document.body.classList.contains('white')){
              document.body.classList.remove('white');
            }
            if(wrapper.classList.contains('white')){
              wrapper.classList.remove('white');
            }
          }
        }
      });
    }

  }

  _update = (currentTime = performance.now()) => {
    let elapsedMS = currentTime - this.lastTime;

    if (elapsedMS > this.maxElapsedMS) {
      elapsedMS = this.maxElapsedMS;
    }

    const deltaTime = elapsedMS * this.targetFPMS;
    const dt = 1 - Math.pow(1 - this.scrollEase, deltaTime);

    const resized = this.resizeRequest > 0;
    const scrollY = window.pageYOffset;
    //const scrollY = this.scrollBody.scrollTop;

    if (resized) {
      this._horziontalSetHeihgt();
      const height = this.target.clientHeight;
      document.body.style.height = height + "px";
      //this.scrollSpacer.style.height = height + "px";
      this.scrollHeight = height;
      this.viewHeight = window.innerHeight;
      this.halfViewHeight = this.viewHeight / 2;
      this.maxDistance = this.viewHeight * 2;
      this.resizeRequest = 0;
      this.viewWidth = window.innerWidth;
      this.halfViewWidth = this.viewWidth / 2;
      this.maxDistanceWidth = this.viewWidth * 2;
    }

    this.endScroll = scrollY;
    // this.scrollTransform += (scrollY - this.scrollTransform) * this.scrollEase;
    this.scrollTransform += (scrollY - this.scrollTransform) * dt;
    this.currentScroll += (scrollY - this.currentScroll) * dt;

    if (Math.abs(scrollY - this.currentScroll) < this.endThreshold || resized) {
      this.currentScroll = scrollY;
      this.scrollRequest = 0;
    }

    if (
      Math.abs(scrollY - this.scrollTransform) < this.endThreshold ||
      resized
    ) {
      this.scrollTransform = scrollY;
      this.scrollRequest = 0;
    }

    ///change color section
    this._changeColorBody();

    ///horizontal scroll
    this._horizonstalScroll(this.currentScroll,dt);

    // const scrollOrigin = scrollY + this.halfViewHeight;
    const scrollOrigin = this.currentScroll + this.viewHeight;

    this.target.style.transform = `translate3d(0px,-${this.scrollTransform}px,0px)`;

    //items
    for (let i = 0; i < this.scrollItems.length; i++) {
      const item = this.scrollItems[i];

      const distance = scrollOrigin - item.top;
      const offsetRatio = distance / this.maxDistance;

      item.endOffset = Math.round(
        this.maxOffset * item.depthRatio * offsetRatio
      );

      if (Math.abs(item.endOffset - item.currentOffset < this.endThreshold)) {
        item.currentOffset = item.endOffset;
      } else {
        // item.currentOffset += (item.endOffset - item.currentOffset) * this.scrollEase;
        item.currentOffset += (item.endOffset - item.currentOffset) * dt;
      }
      if(item.direction == "y"){
        item.target.style.transform = `translate3d(0px,${item.currentOffset}px,0px)`;
      }else if(item.direction == "x"){
        item.target.style.transform = `translate3d(${item.currentOffset}px,0px,0px)`;
      }
    }

    this.lastTime = currentTime;

    this.requestId =
      this.scrollRequest > 0 ? requestAnimationFrame(this._update) : null;
  };

  addItems() {
    this.scrollItems = [];
    const elements = document.querySelectorAll("*[data-depth]");
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const depth = +element.getAttribute("data-depth");
      const direction_item = element.getAttribute("data-direction");
      const rect_item = element.getBoundingClientRect();
      const item = {
        rect: rect_item,
        target: element,
        top: rect_item.top + window.pageYOffset,
        //top: rect_item.top + this.scrollBody.scrollTop,
        depth: depth,
        depthRatio: depth / this.maxDepth,
        currentOffset: 0,
        endOffset: 0,
        direction: direction_item
      };
      this.scrollItems.push(item);
    }
    return this;
  }

  currentScrollReturn() {
    return this.currentScroll;
  }
}

document.documentElement.style.setProperty(
  "--scrollbar-size",
  getScrollbarSize() + "px"
);

var scroller = new SmoothScroll({
  // scrollBody: document.querySelector(".scroll-content"),
  // scrollSpacer: document.querySelector(".spacer"),
  target: document.querySelector(".scroll-container"), // element container to scroll
  scrollEase: 0.05,
  horizontalScrollWrapper: document.querySelector(".horizontal-scroll-wrapper"),
  horizontalScrollTarget: document.querySelector(".horizontal-scroll")
});

function getScrollbarSize() {
  var div = document.createElement("div");
  div.classList.add("scrollbar-test");
  document.body.appendChild(div);
  var size = div.offsetWidth - div.scrollWidth;
  document.body.removeChild(div);
  return size;
}

///line
var x = $(".one h1").offset();
var one = $(".one").width();
var para = $(".one h1").width();
var right = one - (x.left + para);
var twoOffset = $(".two h1").offset();
var twoLeftOffset = twoOffset.left - one;
var firstLine = twoLeftOffset + right;
var leftPos = para + x.left;

$(".horizontal-line").css({"top": x.top, "left": leftPos});
// init controller
var controller = new ScrollMagic.Controller();

var controller = new ScrollMagic.Controller();

		// define movement of panels
		var wipeAnimation = new TimelineMax()
			.to("#slideContainer", 1,   {x: "-75%"})

		// create scene to pin and link animation
		new ScrollMagic.Scene({
				triggerElement: "#pinContainer",
				triggerHook: "onLeave",
				duration: "500%"
			})
		  .setPin("#pinContainer")
			.setTween(wipeAnimation)
			.addIndicators()
			.addTo(controller);


   var horizontal = new ScrollMagic.Scene({
        offset: 50,
        duration: 300,
       // reverse: false
      }).setTween(".horizontal-line", {width: firstLine}) // trigger a TweenMax.to tween
        // .addIndicators()
        .addTo(controller);


//// ScrollPane
Init();

//Mouse Wheel event : jQuery Mouse Wheel Plugin
$('.pane,.scrzone').mousewheel(function(event) {
	event.preventDefault();
	if($ScrollState==false){$ScrollState=true;if(event.deltaY < 0){UpdateScreen('+');}else if(event.deltaY > 0){UpdateScreen('-');}else{$ScrollState=false;}}
});

//Init
function Init(){
	$ScrollSpeed = 0.3; //Vitesse animation
	$ScrollState=false; //Scroll possible si True - Si False anim déjà en cours //
	$ActualSlide = $CibleSlide = $('.pane').first().attr('data-id'); //Première slide
	$ListSlides = new Array(); $('.pane').each(function(){ $ListSlides.push($(this).attr('data-id')); }); //Liste des slides (.pane)
	TweenMax.to(window, 0, {scrollTo:0});
	TweenMax.to('.spane', 0, {scrollTo:{y:0, x:0}});
	$('.visible').removeClass('visible');
	$('#Helper').html("Init()");//Helper
}

//ANIMATE
// function UpdateScreen(operator){
// 	$ActualSlide = $CibleSlide;
// 	if(operator=="+"){ $CibleSlide = $ListSlides[$ListSlides.indexOf($ActualSlide)+1]; }else{ $CibleSlide = $ListSlides[$ListSlides.indexOf($ActualSlide)-1]; }//Si + slide suivante / si - slide précédente
// 	$('#Helper').html("From <strong>"+$ActualSlide+"</strong> to <strong>"+$CibleSlide+"</strong>");//helper
// 	if(!$CibleSlide){ $ScrollState=false; $('#Helper').html("Break");$CibleSlide = $ActualSlide; return; }//Arrete tout si pas de slide avant/après
// 	$ActualSlideDOM = $('.pane[data-id='+$ActualSlide+']');
// 	$CibleSlideDOM = $('.pane[data-id='+$CibleSlide+']');
// 	//Scroll To : Greensock GSAP
// 	if( $ActualSlideDOM.closest('.prt').find('.spane').length && (operator=="+" && $ActualSlideDOM.next('.pane').length  ||  operator=="-" && $ActualSlideDOM.prev('.pane').length ) ){
// 		TweenMax.to($ActualSlideDOM.closest('.spane'), $ScrollSpeed, {scrollTo:'.pane[data-id='+$CibleSlide+']',ease: Power2.easeOut,onComplete:function(){$ScrollState=false; $CibleSlideDOM.addClass('visible');}}); //Horizontal ou vertical
// 	}else{
// 		TweenMax.to(window, $ScrollSpeed, {scrollTo:'.pane[data-id='+$CibleSlide+']',ease: Power2.easeOut,onComplete:function(){$ScrollState=false; $CibleSlideDOM.addClass('visible');}});//Normal
// 	}
// }

//Init() On Resize
$(window).resize(function(){
	Init();
});



////line-scroll
// init ScrollMagic controller
var controller = new ScrollMagic.Controller();

// build scene 1
var scene = new ScrollMagic.Scene({
	triggerElement: "#demo-one",
	duration: "1000%"
})
// animate 1
.setTween("#line-one", {
	height: "300%"
})

.addTo(controller);



// line test

let timeLine = document.querySelector('.timeline');

window.addEventListener('scroll', () => {
  let hauteur = document.body.clientHeight;
  let scrollY = (window.scrollY + window.innerHeight)*100/hauteur;
  timeLine.style.width = `${scrollY}vw`;
});


// vertical Split
Init();

//Mouse Wheel event : jQuery Mouse Wheel Plugin
$('.pane,.scrzone').mousewheel(function(event) {
	event.preventDefault();
	if($ScrollState==false){$ScrollState=true;if(event.deltaY < 0){UpdateScreen('+');}else if(event.deltaY > 0){UpdateScreen('-');}else{$ScrollState=false;}}
});

//Init
function Init(){
	$ScrollSpeed = 0.3; //Vitesse animation
	$ScrollState=false; //Scroll possible si True - Si False anim déjà en cours //
	$ActualSlide = $CibleSlide = $('.pane').first().attr('data-id'); //Première slide
	$ListSlides = new Array(); $('.pane').each(function(){ $ListSlides.push($(this).attr('data-id')); }); //Liste des slides (.pane)
	TweenMax.to(window, 0, {scrollTo:0});
	TweenMax.to('.spane', 0, {scrollTo:{y:0, x:0}});
	$('.visible').removeClass('visible');
	$('#Helper').html("Init()");//Helper
}

//ANIMATE
// function UpdateScreen(operator){
// 	$ActualSlide = $CibleSlide;
// 	if(operator=="+"){ $CibleSlide = $ListSlides[$ListSlides.indexOf($ActualSlide)+1]; }else{ $CibleSlide = $ListSlides[$ListSlides.indexOf($ActualSlide)-1]; }//Si + slide suivante / si - slide précédente
// 	$('#Helper').html("From <strong>"+$ActualSlide+"</strong> to <strong>"+$CibleSlide+"</strong>");//helper
// 	if(!$CibleSlide){ $ScrollState=false; $('#Helper').html("Break");$CibleSlide = $ActualSlide; return; }//Arrete tout si pas de slide avant/après
// 	$ActualSlideDOM = $('.pane[data-id='+$ActualSlide+']');
// 	$CibleSlideDOM = $('.pane[data-id='+$CibleSlide+']');
// 	//Scroll To : Greensock GSAP
// 	if( $ActualSlideDOM.closest('.prt').find('.spane').length && (operator=="+" && $ActualSlideDOM.next('.pane').length  ||  operator=="-" && $ActualSlideDOM.prev('.pane').length ) ){
// 		TweenMax.to($ActualSlideDOM.closest('.spane'), $ScrollSpeed, {scrollTo:'.pane[data-id='+$CibleSlide+']',ease: Power2.easeOut,onComplete:function(){$ScrollState=false; $CibleSlideDOM.addClass('visible');}}); //Horizontal ou vertical
// 	}else{
// 		TweenMax.to(window, $ScrollSpeed, {scrollTo:'.pane[data-id='+$CibleSlide+']',ease: Power2.easeOut,onComplete:function(){$ScrollState=false; $CibleSlideDOM.addClass('visible');}});//Normal
// 	}
// }

//Init() On Resize
$(window).resize(function(){
	Init();
});
