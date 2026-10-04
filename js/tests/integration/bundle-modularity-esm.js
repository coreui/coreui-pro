/* eslint-disable import/no-unassigned-import */

import Tooltip from '../../dist/tooltip.mjs'
import '../../dist/carousel.mjs'

window.addEventListener('load', () => {
  [].concat(...document.querySelectorAll('[data-coreui-toggle="tooltip"]'))
    .map(tooltipNode => new Tooltip(tooltipNode))
})
