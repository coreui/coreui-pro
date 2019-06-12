import $ from 'jquery';
import Alert from './alert';
import Button from './button';
import Carousel from './carousel';
import Collapse from './collapse';
import Dropdown from './dropdown';
import Modal from './modal';
import Popover from './popover';
import Scrollspy from './scrollspy';
import Tab from './tab';
import Toast from './toast';
import Tooltip from './tooltip';
import Util from './util';
/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.3.1): index.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

(function () {
  if (typeof $ === 'undefined') {
    throw new TypeError('Bootstrap\'s JavaScript requires jQuery. jQuery must be included before Bootstrap\'s JavaScript.');
  }

  var version = $.fn.jquery.split(' ')[0].split('.');
  var minMajor = 1;
  var ltMajor = 2;
  var minMinor = 9;
  var minPatch = 1;
  var maxMajor = 4;

  if (version[0] < ltMajor && version[1] < minMinor || version[0] === minMajor && version[1] === minMinor && version[2] < minPatch || version[0] >= maxMajor) {
    throw new Error('Bootstrap\'s JavaScript requires at least jQuery v1.9.1 but less than v4.0.0');
  }
})();

export { Util, Alert, Button, Carousel, Collapse, Dropdown, Modal, Popover, Scrollspy, Tab, Toast, Tooltip };
//# sourceMappingURL=index.js.map