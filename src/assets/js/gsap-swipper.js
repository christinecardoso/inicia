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


gsap.registerPlugin(ScrollTrigger);

// Gsap Code
let currentIndex = -1;
let animating;
let swipePanels = gsap.utils.toArray(".swipe-section .panel");

// set second panel two initial 100%
gsap.set(".x-100", {xPercent: 100});

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
})
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
Register Gsap plugins
------------------------------*/
// gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
gsap.registerPlugin(ScrollTrigger);

/*------------------------------
ScrollTrigger Config
------------------------------*/
ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true,
    //autoRefreshEvents: ''
});

/*------------------------------
Init Gsap ScrollSmoother
------------------------------*/
// Init Gsap ScrollSmoother
const scroller = (() => {
    if (typeof gsap === 'undefined' || typeof ScrollSmoother === 'undefined' || utils.isTouch()) {
        utils.addClass(document.body, 'normalize-scroll');
        return null;
    }

    return {
        initialize: function (contentSelector_ = '.content-scroll', wrapperSelector_ = '.viewport-wrapper') {
            return ScrollSmoother.create({
                content: contentSelector_,
                wrapper: wrapperSelector_,
                smooth: 2,
                effects: false,
                normalizeScroll: true,
                preventDefault: true
            });
        }
    };
})();

/*------------------------------
  Init gsapSwiper
------------------------------*/
var gsapSwiper = {

    // Gsap

    // Updates the swiper's state based on a progress value
    updateSwiperState: function(progress_) {
        if (!this._swiper || !this._swiperInitialized) return 0;

        progress_ = isNaN(progress_) ? 0 : utils.clamp(progress_, 0, 1);

        if (this._options.scrubDir === -1) {
            progress_ = 1 - progress_;
        }

        var minTranslation = this._swiper.minTranslate();
        var maxTranslation = this._swiper.maxTranslate();

        // Compute the current translation value based on the progress
        var currentTranslation = (maxTranslation - minTranslation) * progress_ + minTranslation;
        this._swiper.translateTo(currentTranslation, 0);

        // Update active index and classes
        this._swiper.updateActiveIndex();
        this._swiper.updateSlidesClasses();
    },

    _getSwiperSpaceBetweenValue: function() {
        if (!this.DOM.swiperSpacing) return 0;
        return Math.ceil(this.DOM.swiperSpacing.offsetWidth * -1);
    },

    _getSwiperWrapperWidth: function() {
        if (!this._swiper || !this._swiperInitialized) return 0;
        // Calculate the swiper wrapper width by multiplying the offsetWidth of the swiper wrapper
        // by the slideWidthFactor in the options
        return (this.DOM.swiperWrapper.offsetWidth * this._options.slideWidthFactor);
    },

    _initializeGsapAnimation: function() {
        if (this._options.isScrubActive && !this._gsapAnimation) {
            var self = this;
            this._gsapAnimation = gsap.to(this, {
                updateSwiperState: 1,
                duration: 1,
                ease: 'none',
                scrollTrigger: {
                    trigger: this.DOM.trigger,
                    pin: this.DOM.pin,
                    pinSpacing: true,
                    scrub: 0.25,
                    invalidateOnRefresh: true,
                    anticipatePin: 1,
                    onRefreshInit: function() {
                        if (self._swiper && self._swiperInitialized) {
                            self._swiper.updateSize();
                        }
                    },
                    onRefresh: function() {
                        if (self._swiper && self._swiperInitialized) {
                            // Update Swiper after ScrollTrigger refreshes
                            self._updateSwiper();
                            self._updateIntroWrapper();
                        }
                    },
                    start: 'center center',
                    end: function() {
                        if (self._swiper && self._swiperInitialized) {
                            return '+=' + self._getSwiperWrapperWidth() + 'px';
                        }
                        return '+=' + utils.getVh() + 'px';
                    },
                    markers: true,
                }
            });
        }
    },

    // Swiper initialization

    _initializeSwiper: function(selector_) {
        var swiperOptions = {
            init: false,
            runCallbacksOnInit: true,
            direction: 'horizontal',
            slidesPerView: 'auto',
            centeredSlides: true,
            centeredSlidesBounds: false,
            spaceBetween: 0,
            initialSlide: this._currentActiveSlideIndex,
            loop: false,
            speed: 700,
            roundLengths: false,
            preloadImages: false,
            touchMoveStopPropagation: false,
            threshold: utils.isTouch() ? 10 : 6,
            passiveListeners: true,
            preventClicks: true,
            watchSlidesProgress: true,
            watchSlidesVisibility: false,
            grabCursor: utils.isTouch() ? false : true,
            customTransition: true,
            pagination: false,
            slideToClickedSlide: false,
            virtualTranslate: false,
            watchOverflow: false,
            resistanceRatio: 0.85,
            on: {}
        }

        //Bind the event callback functions and assign them to the 'on' object
        swiperOptions.on.init = this._swiperInitCallback.bind(this);
        swiperOptions.on.setTransition = this._swiperSetTransitionCallback.bind(this);
        swiperOptions.on.touchStart = this._swiperTouchStartCallback.bind(this);

        // if Scrub prevent Swiper to update on resize, prevent drag cursor and prevent swipping.
        if (this._options.isScrubActive) {
            swiperOptions.updateOnWindowResize = false;
            swiperOptions.grabCursor = false;
            utils.addClass(this.DOM.swiper, 'swiper-no-swiping');
        }

        this._swiper = new Swiper(selector_, swiperOptions);
        // Initialize in the next frame
        utils.nextTick(function() {
            this._swiper.init();
        }, this);
    },

    // Swiper Callbacks
    _swiperInitCallback: function() {
        console.log('swiper:init', this._swiper.el);

        // If slideWidthFactor is set to 0 in the options, set it to the number of slides
        if (this._options.slideWidthFactor === 0) {
            this._options.slideWidthFactor = this._swiper.slides.length;
        }

        this._swiperInitialized = true;

        if (this._gsapAnimation && this._gsapAnimation.scrollTrigger && this._options.isScrubActive) {
            ScrollTrigger.refresh();
        }
    },

    // Sets transition speed for slides
    _swiperSetTransitionCallback: function(speed_) {
        if (!this._swiperInitialized || !this._swiper) return;
        var slides = this._swiper.slides;
        var l = slides.length;
        var slide, transitionStyle;
        for (var i = 0; i < l; i++) {
            slide = slides[i];
            if (slide) {
                transitionStyle = speed_ + 'ms';
                slide.style.transition = transitionStyle;
            }
        }
    },

    // Resets transition on touch start
    _swiperTouchStartCallback: function() {
        if (!this._swiperInitialized || !this._swiper || this._options.isScrubActive) return;
        var slides = this._swiper.slides;
        var l = slides.length;
        var slide;
        for (var i = 0; i < l; i++) {
            slide = slides[i];
            if (slide) {
                slide.style.transition = '';
            }
        }
    },

    _updateSwiper: function() {
        if (!this._swiperInitialized || !this._swiper) return;
        if (window.innerWidth < (this._mdBreakpoint + 0.5)) {
            this._swiper.params.centeredSlides = false;
        } else {
            this._swiper.params.centeredSlides = true;
        }
        this._swiper.transitionEnd(null);
        this._swiper.params.spaceBetween = this._getSwiperSpaceBetweenValue();
        this._swiper.update();
    },

    _updateIntroWrapper: function() {
        if (!this._swiper || !this.DOM.introWrapper || !this._swiper.params.centeredSlides) {
            return;
        }

        var bodyWidth = document.body.clientWidth;
        var slideWidth = this.DOM.mediaContainerRef.offsetWidth;

        // Calculate the offset for the slide based on the center alignment.
        var slideOffsetX = (bodyWidth - slideWidth) * 0.5;

        // Calculate the difference in width, ensuring it doesn't go negative.
        var wDiff = Math.max(0, (bodyWidth - this._maxWrapperSize) * 0.5);

        // Set CSS custom properties for the intro wrapper in one combined statement.
        this.DOM.introWrapper.style.cssText = "--swiper-intro-width: " + (bodyWidth - slideOffsetX - wDiff) + "px; --swiper-intro-margin-left: " + slideOffsetX + "px;";
    },

    _reset: function() {
        this.DOM = {};
        this._mdBreakpoint = 768;
        this._maxWrapperSize = 1200;
        this._swiper = null;
        this._swiperInitialized = false;
        this._currentActiveSlideIndex = 0;
        this._gsapAnimation = null;

        this._options = {
            selector: null,
            isScrubActive: false,
            scrubDir: 1,
            slideWidthFactor: 1,
        };
    },

    initialize: function(options_) {
        // Reset the object's properties to their default values
        this._reset();

        // Merge defaults with options_,
        this._options = Object.assign(this._options, options_);

        // Get the main element based on the provided selector
        this.DOM.el = document.querySelector(this._options.selector);

        // Verify if the element based on the selector exists
        if (!this.DOM.el) {
            console.warn('The selector option is not optional. Please provide a valid selector.');
            return;
        }

        this.DOM.mediaContainerRef = this.DOM.el.querySelector('.media-container');
        this.DOM.introWrapper = this.DOM.el.querySelector('.intro-wrapper');

        // If scrub is active, add the data-scrub attribute and initialize GSAP animation
        if (this._options.isScrubActive) {
            this.DOM.el.dataset.scrub = 'true';
            this.DOM.pin = this.DOM.el.querySelector('.container');
            this.DOM.trigger = this.DOM.mediaContainerRef;
            this._initializeGsapAnimation(); // Initialize GSAP animation
        }

        // Store references to the swiper and swiper-wrapper DOM elements
        this.DOM.swiper = this.DOM.el.querySelector('.swiper-container');
        this.DOM.swiperSpacing = this.DOM.swiper.querySelector('.swiper-column-gap');
        this.DOM.swiperWrapper = this.DOM.swiper.querySelector('.swiper-wrapper');

        this._initializeSwiper(this.DOM.swiper); // Initialize the Swiper.js instance
    },

};

var initialize = function() {
    console.clear();
    scroller && scroller.initialize();
    var gsapSwiperTest1 = Object.assign({}, gsapSwiper).initialize({
        selector: '#gsap_swiper_01_scrub_1',
        isScrubActive: true,
    });
    var gsapSwiperTest2 = Object.assign({}, gsapSwiper).initialize({
        selector: '#gsap_swiper_01_scrub_2',
        isScrubActive: true,
        scrubDir: -1,
    });

    if (utils.isTouch()) {
        window.addEventListener('orientationchange', function() {
            utils.nextTick(function() {
                console.log('orientation change');
                ScrollTrigger.refresh();
            }, this, 500);

        });
    }
};

initialize();
