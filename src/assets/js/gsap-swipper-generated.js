// https://codepen.io/luis-lessrain/pen/PoXwpEo

import Swiper from 'swiper';
import { Navigation, Pagination, Scrollbar, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import { utils } from './lr-codepen-utils';


// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

/*------------------------------
Your existing GSAP Swipeable Panels Code
------------------------------*/
let currentIndex = -1;
let animating;
let swipePanels = gsap.utils.toArray(".swipe-section .panel");

// set second panel two initial 100%
gsap.set(".x-100", { xPercent: 100 });

// set z-index levels for the swipe panels
gsap.set(swipePanels, {
  zIndex: i => i
});

// create an observer and disable it to start
let intentObserver = ScrollTrigger.observe({
  type: "wheel,touch",
  onUp: () => !animating && gotoPanel(currentIndex + 1, true),
  onDown: () => !animating && gotoPanel(currentIndex - 1, false),
  wheelSpeed: -1, // to match mobile behavior, invert the wheel speed
  tolerance: 10,
  preventDefault: true,
  onPress: self => {
    // on touch devices like iOS, if we want to prevent scrolling, we must call preventDefault() on the touchstart (Observer doesn't do that because that would also prevent side-scrolling which is undesirable in most cases)
    ScrollTrigger.isTouch && self.event.preventDefault()
  }
});
intentObserver.disable();

let preventScroll = ScrollTrigger.observe({
  preventDefault: true,
  type: "wheel,scroll",
  allowClicks: true,
  onEnable: self => self.savedScroll = self.scrollY(), // save the scroll position
  onChangeY: self => self.scrollY(self.savedScroll)    // refuse to scroll
});
preventScroll.disable();

// handle the panel swipe animations
function gotoPanel(index, isScrollingDown) {
  animating = true;
  // return to normal scroll if we're at the end or back up to the start
  if (
    (index === swipePanels.length && isScrollingDown) ||
    (index === -1 && !isScrollingDown)
  ) {
    intentObserver.disable();
    preventScroll.disable();
    animating = false;
    // now make it go 1px beyond in the correct direction so that it doesn't trigger onEnter/onEnterBack.
    preventScroll.scrollY(preventScroll.scrollY() + (index === swipePanels.length ? 1 : -1));
    return;
  }

  //   target the second panel, last panel?
  let target = isScrollingDown ? swipePanels[index] : swipePanels[currentIndex];

  gsap.to(target, {
    xPercent: isScrollingDown ? 0 : 100,
    duration: 0.75,
    onComplete: () => {
      animating = false;
    }
  });
  currentIndex = index;
}

// pin swipe section and initiate observer
ScrollTrigger.create({
  trigger: ".swipe-section",
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

/*------------------------------
Swiper Initialization and Integration
------------------------------*/
var gsapSwiper = {

  // ... (Your existing Swiper-related code)

  initialize: function (options_) {
    // ... (Your existing initialization code)

    // Initialize the Swiper.js instance
    this._initializeSwiper(this.DOM.swiper);

    // Combine with existing GSAP code for ScrollTrigger
    if (this._options.isScrubActive) {
      this.DOM.el.dataset.scrub = 'true';
      this.DOM.pin = this.DOM.el.querySelector('.container');
      this.DOM.trigger = this.DOM.mediaContainerRef;

      // Initialize GSAP animation for ScrollTrigger
      this._initializeGsapAnimation();

      // Add ScrollTrigger to control the combined animation
      ScrollTrigger.create({
        trigger: this.DOM.trigger,
        start: 'top top',
        end: '+=' + this._getSwiperWrapperWidth() + 'px',
        scrub: 0.25,
        onUpdate: (self) => {
          var progress = self.progress;
          this.updateSwiperState(progress);
        },
        onRefresh: () => {
          if (this._swiper && this._swiperInitialized) {
            this._updateSwiper();
            this._updateIntroWrapper();
          }
        },
        markers: true,
      });
    }
  },

  // ... (Your existing methods)
};

// Initialize the combined functionality
var initialize = function () {
  console.clear();
  // Initialize the shared ScrollSmoother
  scroller && scroller.initialize();

  // Initialize the first instance of gsapSwiper
  var gsapSwiperTest1 = Object.assign({}, gsapSwiper).initialize({
    selector: '#gsap_swiper_01_scrub_1',
    isScrubActive: true,
  });

  // Initialize the second instance of gsapSwiper
  var gsapSwiperTest2 = Object.assign({}, gsapSwiper).initialize({
    selector: '#gsap_swiper_01_scrub_2',
    isScrubActive: true,
    scrubDir: -1,
  });

  // Refresh ScrollTrigger on orientation change for touch devices
  if (utils.isTouch()) {
    window.addEventListener('orientationchange', function () {
      utils.nextTick(function () {
        console.log('orientation change');
        ScrollTrigger.refresh();
      }, this, 500);
    });
  }
};

// Call the combined initialization function
initialize();
