/**
 * --------------------------------------------------------------------------
<<<<<<< HEAD
 * CoreUI (v2.0.0-beta.5): index.js
=======
 * CoreUI (v2.0.0-beta.5): index.js
>>>>>>> a926b65c2932926c6b52b4c2e2c2438166fb77be
 * Licensed under MIT (https://coreui.io/license)
 * --------------------------------------------------------------------------
 */
(function ($) {
  if (typeof $ === 'undefined') {
    throw new TypeError('CoreUI\'s JavaScript requires jQuery. jQuery must be included before CoreUI\'s JavaScript.');
  }

  var version = $.fn.jquery.split(' ')[0].split('.');
  var minMajor = 1;
  var ltMajor = 2;
  var minMinor = 9;
  var minPatch = 1;
  var maxMajor = 4;

  if (version[0] < ltMajor && version[1] < minMinor || version[0] === minMajor && version[1] === minMinor && version[2] < minPatch || version[0] >= maxMajor) {
    throw new Error('CoreUI\'s JavaScript requires at least jQuery v1.9.1 but less than v4.0.0');
  }
})($);

window.getStyle = getStyle;
window.hexToRgb = hexToRgb;
window.hexToRgba = hexToRgba;
window.rgbToHex = rgbToHex;
//# sourceMappingURL=index.js.map