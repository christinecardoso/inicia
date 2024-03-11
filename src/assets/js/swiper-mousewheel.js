// import { Swiper } from 'swiper';
// import { Navigation, Pagination, EffectFade, Keyboard,Mousewheel } from 'swiper/modules';
import Swiper from 'swiper/bundle';
// import "swiper/css/swiper.css";
// import { Navigation, Pagination, Scrollbar, EffectFade } from 'swiper/modules';
// import styles bundle
import 'swiper/css/bundle';
// Import GSAP and ScrollTrigger
import splt from "spltjs";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
// import anime from 'animejs/lib/anime.es.js';
import anime from 'animejs';

// Register ScrollTrigger with GSAP
gsap.registerPlugin(ScrollTrigger);

// import 'swiper/css';
// import 'swiper/css/navigation';
// import 'swiper/css/pagination';
// import 'swiper/css/scrollbar';

// var swiper = new Swiper(".mySwiper", {
//   direction: "vertical",
//   slidesPerView: 1,
//   spaceBetween: 30,
//   mousewheel: true,
//   pagination: {
//     el: ".swiper-pagination",
//     clickable: true,
//   },
// });
//

const swiper = new Swiper('.swiper', {})
const numPanels = swiper.slides.length;
console.log(numPanels)

// Gsap Code
let currentIndex = 0;
let animating;

swiper.on('slideChange', function () {
  currentSlide.textContent = swiper.activeIndex + 1
  gsap.to(swiper.slides[swiper.activeIndex], {scale:1, opacity:1})
  gsap.to(swiper.slides[swiper.previousIndex], {opacity:0.3, scale:0.8})
  swiper.slides[swiper.previousIndex].animation.pause(0)
  swiper.slides[swiper.activeIndex].animation.restart()
	currentIndex = swiper.activeIndex
});

swiper.on('slideChangeTransitionEnd', function() {
	animating = false
})

splt({});
//
// anime({
//   targets: '.char',
//   translateY: [0, 40],
//   direction: 'alternate',
//   loop: true,
//   delay: anime.stagger(50),
// });

// splt({reveal: true})
//
// anime({
//   targets: '.reveal',
//   translateY: [0, 20],
//   direction: 'alternate',
//   loop: 1,
//   delay: anime.stagger(25),
//   easing: 'cubicBezier(.71,-0.77,.43,1.67)'
// });

swiper.slides.forEach((slide, index)=>{
	let letter = slide.querySelector("h1")
	let description = slide.querySelector("h2")
	// let chars = SplitText.create(description, {type:"chars"})
  let chars = description
	let tl = gsap.timeline({paused:true, onComplete:function(){

	}})
	tl.from(letter, {scale:0, opacity:0, ease:"back", duration:1})
  .from(description, {opacity:0, yPercent:50, stagger:0.02}, "-=0.5")
	  // .from(chars.chars, {opacity:0, yPercent:50, stagger:0.02}, "-=0.5")

	slide.animation = tl
})

swiper.slides[0].animation.play()


/*
ALL OF THE FOLLOWING CODE IS BORROWED FROM THIS PEN FROM GREENSOCK
https://codepen.io/GreenSock/pen/MWGVJYL?editors=1000
I MADE SLIGHT ALTERATIONS TO MAKE GOTOPANEL() TALK TO SWIPER
*/

// create an observer and disable it to start
let intentObserver = ScrollTrigger.observe({
  type: "wheel,touch",
  onUp: () => !animating && gotoPanel(currentIndex + 1, true),
  onDown: () => !animating && gotoPanel(currentIndex - 1, false),
  wheelSpeed: -1, // to match mobile behavior, invert the wheel speed
  tolerance: 30,
  preventDefault: true,
  onPress: self => {
    // on touch devices like iOS, if we want to prevent scrolling, we must call preventDefault() on the touchstart (Observer doesn't do that because that would also prevent side-scrolling which is undesirable in most cases)
    ScrollTrigger.isTouch && self.event.preventDefault()
  }
})
intentObserver.disable();

let preventScroll = ScrollTrigger.observe({
			preventDefault: true,
			type: "wheel,scroll",
			allowClicks: true,
			onEnable: self => {
			console.log("enable")
				return self.savedScroll = self.scrollY()
			}, // save the scroll position
			onChangeY: self => {
				console.log("disable")
				self.scrollY(self.savedScroll)    // refuse to scroll
			}
		});
preventScroll.disable();

// handle the panel swipe animations
function gotoPanel(index, isScrollingDown) {
  animating = true;
	console.log("gotoPanel")
  // return to normal scroll if we're at the end or back up to the start
  if (
    (index === numPanels && isScrollingDown) ||
    (index === -1 && !isScrollingDown)
  ) {
	  console.log("return to normal scroll")
    intentObserver.disable();
    preventScroll.disable();

    animating = false;
    // now make it go 1px beyond in the correct direction so that it doesn't trigger onEnter/onEnterBack.
    preventScroll.scrollY(preventScroll.scrollY() + (index === numPanels ? 1 : -1));
    return;
  }
  console.log("call swiper slideTo()")
	swiper.slideTo(index)

  currentIndex = index;
}

// pin swipe section and initiate observer
ScrollTrigger.create({
  trigger: ".gallery",
  pin: true,
  anticipatePin: true,
  start: "top top",
  end: "+=50%",
  onEnter: (self) => {
    if (preventScroll.isEnabled === false) {
      self.scroll(self.start);
      preventScroll.enable();
      intentObserver.enable();

      gotoPanel(currentIndex + 1, true);
    }
  },
  onEnterBack: (self) => {
    if (preventScroll.isEnabled === false) {
      self.scroll(self.start);
      preventScroll.enable();
      intentObserver.enable();

      gotoPanel(currentIndex - 1, false);
    }
  }
});

ScrollTrigger.config({
  ignoreMobileResize: true
});
