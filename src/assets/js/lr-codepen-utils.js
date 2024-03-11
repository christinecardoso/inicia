var utils = (function() {
    var ticks = Object.create(null);
    var timeStamp = new Date().getTime();

    var getUID = function() {
        return timeStamp++;
    };

    var interval = function(fn_, delay_) {
        var start = new Date().getTime();
        var handle = Object.create(null);

        function loop() {
            var current = new Date().getTime();
            var delta = current - start;

            if (delta >= delay_) {
                fn_.call();
            } else {
                handle.value = requestAnimationFrame(loop);
            }
        }

        handle.value = requestAnimationFrame(loop);
        return handle;
    };

    var clearInterval = function(handle_) {
        if (!handle_)
            return;

        cancelAnimationFrame(handle_.value);
        delete ticks[handle_.uid];
    };

    var nextTick = function(callback_, scope_, t_) {
        t_ = t_ || 60;

        var it = interval(function() {
            clearInterval(it);
            callback_ && callback_.call(scope_);
        }, t_);

        it.uid = getUID();
        ticks[it.uid] = it;
        return it;
    };

    var clearAllTicks = function() {
        var values = Object.values(ticks);
        var i = 0;
        var l = values.length;

        for (; i < l; i++) {
            clearInterval(values[i]);
        }
    };

    var clamp = function(val_, min_, max_) {
        return Math.max(min_, Math.min(val_, max_));
    };

    var interpolateRange = function(value_, r1min_, r1max_, r2min_, r2max_) {
        return value_ === r1min_ ? r2min_ : ((value_ - r1min_) * (r2max_ - r2min_)) / (r1max_ - r1min_) + r2min_;
    };

    var hasClass = function(el_, className_) {
        if (!el_ || !el_.classList)
            return false;

        return el_.classList.contains(className_);
    };

    var addClass = function(el_, className_) {
        if (!el_ || !el_.classList)
            return;

        el_.classList.add(className_);
    };

    var removeClass = function(el_, className_) {
        if (!el_ || !el_.classList)
            return;

        el_.classList.remove(className_);
    };

    var isTouch = (function() {
        var cachedResult;

        return function() {
            if (cachedResult !== undefined) {
                return cachedResult;
            }

            var supportsTouch = 'ontouchstart' in window;
            var msTouch = 'msMaxTouchPoints' in window.navigator;
            var standardTouch = 'maxTouchPoints' in window.navigator;

            if (supportsTouch && (msTouch || standardTouch)) {
                cachedResult = true;
            } else if (window.matchMedia && window.matchMedia('(pointer:coarse)').matches) {
                cachedResult = true;
            } else if ('orientation' in window) {
                cachedResult = true;
            } else {
                var touchScreenUserAgents = /\b(BlackBerry|webOS|iPhone|IEMobile|Android|Windows Phone|iPad|iPod)\b/i;
                cachedResult = touchScreenUserAgents.test(window.navigator.userAgent);
            }

            if (cachedResult) {
                addClass(document.body, 'is-touch');
            } else {
                addClass(document.body, 'is-desktop');
            }

            return cachedResult;
        };
    })();

    var getVh = function() {
        if (!isTouch()) {
            return window.innerHeight;
        }

        var fixed = document.createElement('div');
        fixed.style.width = '1px';
        fixed.style.height = '100vh';
        fixed.style.position = 'fixed';
        fixed.style.left = '0';
        fixed.style.top = '0';
        fixed.style.bottom = '0';
        fixed.style.visibility = 'hidden';
        document.body.appendChild(fixed);

        var fixedHeight = fixed.clientHeight;
        fixed.remove();
        return fixedHeight;
    };

    var scrollTo = function(value_, auto_) {
        var behavior = !auto_ ? 'smooth' : 'auto';
        var options = {
            left: 0,
            top: value_,
            behavior: behavior
        };

        nextTick(function() {
            window.scrollTo(options);
        }, this);
    };

    var calculateDistanceFromParentTop = function(el_, parentEl_, alignment_) {
        var distance = 0;
        var currentElement = el_;

        while (currentElement && currentElement !== parentEl_) {
            distance += currentElement.offsetTop;
            currentElement = currentElement.offsetParent;
        }

        switch (alignment_) {
            case 'bottom':
                distance += el_.offsetHeight;
                break;
            case 'center':
                distance += el_.offsetHeight * 0.5;
                break;
        }

        return distance;
    };

    var scrollTriggerToWindowScrollPosition = function(tween_, progress_) {
        if (typeof gsap == 'undefined' || typeof gsap == 'undefined') {
            console.warn('gsap lib not included');
            return 0;
        }

        var p = gsap.utils.clamp(0, 1, progress_ || 0);
        var st = tween_.scrollTrigger;
        var containerAnimation = st.vars.containerAnimation;

        if (containerAnimation) {
            var time = st.start + (st.end - st.start) * p;
            st = containerAnimation.scrollTrigger;
            return st.start + (st.end - st.start) * (time / containerAnimation.duration());
        }

        return st.start + (st.end - st.start) * p;
    };

    var getComputedStyle = function(el_, pseudoEl_) {
        return (window.getComputedStyle(el_, pseudoEl_) || {});
    };

    var getPropertyValue = function(computedStyleEl_, property_) {
        return computedStyleEl_[property_] && computedStyleEl_[property_].replace(/^["'](.*)["']$/, '$1');
    };

    var getStyles = function(el_, pseudoEl_) {
        return el_.ownerDocument.defaultView.getComputedStyle(el_, pseudoEl_);
    };

    var getStyle = function(el_, property_, pseudoEl_) {
        return getPropertyValue(getComputedStyle(el_, pseudoEl_), property_);
    };

    var remToPx = function(rem_) {
        return rem_ * parseFloat(window.getComputedStyle(document.documentElement).fontSize);
    };

    var toNumeric = function(value_) {
        return parseFloat(value_.match(/\d+(\.\d+)?/)[0]);
    };

    var numericValue = function(value_, toPixels_) {
        value_ = toNumeric(value_);

        if (toPixels_) {
            return remToPx(value_);
        }

        return value_;
    };

    var getCustomCssVar = function(name_, numericValue_, toPixels_) {
        var tempValue = getStyles(document.documentElement).getPropertyValue(name_);

        if (numericValue_) {
            return numericValue(tempValue, toPixels_);
        }

        return tempValue;
    };

    var setCustomCssVar = function(name_, value_) {
        document.documentElement.style.setProperty(name_, value_);
    };

    var getElCustomCssVar = function(el_, name_, numericValue_, toPixels_) {
        var tempValue = getComputedStyle(el_).getPropertyValue(name_);

        if (numericValue_) {
            return numericValue(tempValue, toPixels_);
        }

        return tempValue;
    };

    var getElStyleCustomCssVar = function(el_, name_, numericValue_, toPixels_) {
        var tempValue = el_.style.getPropertyValue(name_);

        if (numericValue_) {
            return numericValue(tempValue, toPixels_);
        }

        return tempValue;
    };

    return {
        getUID: getUID,
        nextTick: nextTick,
        clearAllTicks: clearAllTicks,
        clamp: clamp,
        interpolateRange: interpolateRange,
        hasClass: hasClass,
        addClass: addClass,
        removeClass: removeClass,
        isTouch: isTouch,
        getVh: getVh,
        calculateDistanceFromParentTop: calculateDistanceFromParentTop,
        scrollTriggerToWindowScrollPosition: scrollTriggerToWindowScrollPosition,
        scrollTo: scrollTo,
        getCustomCssVar: getCustomCssVar,
        setCustomCssVar: setCustomCssVar,
        getElCustomCssVar: getElCustomCssVar,
        getElStyleCustomCssVar: getElStyleCustomCssVar,
    };
})();

export { utils };
