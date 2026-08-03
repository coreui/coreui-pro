/**
 * --------------------------------------------------------------------------
 * CoreUI PRO util/icons.js
 * License (https://coreui.io/pro/license/)
 *
 * Icons shared by more than one component. They live in JavaScript rather than
 * in CSS masks — inline SVG on currentColor, so a component's state reaches the
 * icon without a colour token of its own, and swappable through an option.
 * --------------------------------------------------------------------------
 */

// `cil-x` from the CoreUI set, cropped so every adornment can share one icon
// size. The artwork carries 85 units of built-in margin where the calendar and
// clock carry 16, so untouched it would paint a third less ink; cropped to
// their coverage it overshoots instead, because a cross reaching the corners
// reads larger than an orthogonal glyph of the same box. This sits between.
export const CLEANER_ICON: string = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="39.15 39.15 433.71 433.71" fill="currentColor"><path d="m427.314 107.313-22.628-22.626L256 233.373 107.314 84.687l-22.628 22.626L233.373 256 84.686 404.687l22.628 22.626L256 278.627l148.686 148.686 22.628-22.626L278.627 256z"/></svg>'
