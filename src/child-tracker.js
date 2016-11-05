/** @module ChildTracker */
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    }
    else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        window.ChildTracker = factory.call(this);
    }
})(function() {
    var lib = {};

    // Underscore "now()" implementation
    var getNow = Date.now || function() {
        return new Date().getTime();
    };

    // Underscore throttle implementation
    function throttle(func, wait, options) {
        var context, args, result;
        var timeout = null;
        var previous = 0;
        if (!options) {options = {};}
        var later = function() {
            previous = options.leading === false ? 0 : getNow();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) {context = args = null;}
        };
        return function() {
            var now = getNow();
            if (!previous && options.leading === false) {previous = now;}
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = now;
                result = func.apply(context, args);
                if (!timeout) {context = args = null;}
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    }

    // A simple wrapper for starting and clearing a timeout
    var Timer = function(callback, duration) {
        var alerter;

        function start() {
            if (callback && duration) {
                alerter = setTimeout(callback, duration);
            }
        }

        function stop() {
            clearTimeout(alerter);
        }

        return {
            start: start,
            stop: stop
        };
    };

    /**
     * Tracks how long an element is visible.
     *
     * @class Parent
     * @param {String} id The id of the element the tracker will watch.
     * @param {Function} callback Will be called on every new time bucket.
     * @param {Object} config Configuration to override the default settings.
     */
    lib.VisibilityTracker = function(pymParent, id, callback, config) {
        /**
         * The VisibilityTracker settings, updated by the values passed in the config object
         *
         * @memberof module:ChildTracker.VisibilityTracker
         * @member {Object} settings
         * @inner
         */
        this.settings = {
            WAIT_TO_ENSURE_SCROLLING_IS_DONE: 40,
            WAIT_TO_MARK_READ: 500,
            ANIMATION_DURATION: 800,
            ALLOW_PARTIAL: true
        };

        this.id = id;
        this.isVisible = false;

        // Add any overrides to settings coming from config.
        for (var key in config) {
            this.settings[key] = config[key];
        }

        var timer = new Timer(callback, this.settings.WAIT_TO_MARK_READ);

        // Ensure a config object
        config = (config || {});

        function _parseRect(rect) {
            var rectArray = rect.split(' ');
            var rectObj = {
                'top': parseFloat(rectArray[0]),
                'left': parseFloat(rectArray[1]),
                'bottom': parseFloat(rectArray[2]),
                'right': parseFloat(rectArray[3])
            };

            return rectObj;
        }

        var sendRectRequest = function() {
            // Ignore events to empty embeds, keeps listening after unloading the page
            if (pymParent.el.getElementsByTagName('iframe').length !== 0) {
                pymParent.sendMessage('request-bounding-client-rect', this.id);
            }
        };

        function isElementInViewport(rect, partial) {
            // Adapted from http://stackoverflow.com/a/15203639/117014
            //
            // Returns true only if the WHOLE element is in the viewport

            var iframeRect = pymParent.iframe.getBoundingClientRect();
            var vWidth   = window.innerWidth || document.documentElement.clientWidth;
            var vHeight  = window.innerHeight || document.documentElement.clientHeight;

            // Track partial visibility
            if (partial) {
                // For partial visibility
                //   Vertically: -rect.bottom <= iframeRect.top <= vHeight - rect.top
                //   Horizontally: -rect.right <= iframeRect.left <= vWidth - rect.left
                if ((iframeRect.top <= vHeight - rect.top &&
                     iframeRect.top >= -rect.bottom) &&
                    (iframeRect.left <= vWidth - rect.left &&
                     iframeRect.left >= -rect.right)) {
                        return true;
                }
            }

            // Track complete visibility
            // For complete visibility
            //   Vertically: -rect.top <= iframeRect.top <= vHeight - rect.bottom
            //   Horizontally: -rect.left <= iframeRect.left <= vWidth - rect.right
            if ((iframeRect.top <= vHeight - rect.bottom &&
                 iframeRect.top >= -rect.top) &&
                (iframeRect.left <= vWidth - rect.right &&
                 iframeRect.left >= -rect.left)) {
                    return true;
            }
            return false;
        }

        function checkIfVisible(rect) {
            var newVisibility = isElementInViewport(rect, this.settings.ALLOW_PARTIAL);
            // Stop timer if element is out of viewport now
            if (this.isVisible && !newVisibility) {
                timer.stop();
            }

            if (!this.isVisible && newVisibility) {
                timer.start();
                // Ignore events to empty embeds, keeps listening after unloading the page
                if (pymParent.el.getElementsByTagName('iframe').length !== 0) {
                    pymParent.sendMessage('element-visible', this.id);
                }
            }

            this.isVisible = newVisibility;
            this.rect = rect;
            return this.isVisible;
        }

        var handler = throttle(sendRectRequest.bind(this), this.settings.WAIT_TO_ENSURE_SCROLLING_IS_DONE);

        this.stopTracking = function() {
            if (window.removeEventListener) {
                removeEventListener('DOMContentLoaded', handler, false);
                removeEventListener('load', handler, false);
                removeEventListener('scroll', handler, false);
                removeEventListener('resize', handler, false);
            }
            //Remove event handler for this id from pymParent
            delete pymParent.messageHandlers[this.id + '-bounding-client-rect-return'];
        };

        // Listen to different window movement events
        if (window.addEventListener) {
            addEventListener('DOMContentLoaded', handler, false);
            addEventListener('load', handler, false);
            addEventListener('scroll', handler, false);
            addEventListener('resize', handler, false);
        }

        pymParent.onMessage(this.id + '-bounding-client-rect-return', function(rect) {
            var rectObj = _parseRect(rect);
            checkIfVisible.call(this, rectObj);
        }.bind(this));

        // Initialize
        sendRectRequest.call(this);

        return this;
    };
    return lib;
});