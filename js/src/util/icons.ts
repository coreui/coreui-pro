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

// The chevron autocomplete and multi select both draw, duplicated byte for
// byte between them until now. Full-bleed horizontally, so it needs no crop.
export const INDICATOR_ICON: string = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M256.045 416.136.717 160.807l29.579-29.579 225.749 225.748 225.749-225.748 29.579 29.579-255.328 255.329z"/></svg>'

// The password toggle's pair, moved out of CSS masks: the same two glyphs the
// `$form-password-icon-*` variables used to encode as data URIs, which every
// stylesheet carried whether or not the page had a password field.
export const PASSWORD_SHOW_ICON: string = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M256,144.927A103.309,103.309,0,1,0,359.309,248.236,103.426,103.426,0,0,0,256,144.927Zm0,174.618a71.309,71.309,0,1,1,71.309-71.309A71.39,71.39,0,0,1,256,319.545Z"/><path d="M397.222,131.1l-.218-.223c-77.75-77.749-204.258-77.749-282.008,0L16,233.79v28.893l98.778,102.689.218.222a199.409,199.409,0,0,0,282.008,0l99-102.911V233.79ZM464,249.79l-89.732,93.285a167.409,167.409,0,0,1-236.536,0L48,249.79v-3.107L137.729,153.4c65.247-65.13,171.3-65.13,236.542,0L464,246.683Z"/><rect width="32" height="32" x="240" y="232" /></svg>'

export const PASSWORD_HIDE_ICON: string = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M397.222,131.1l-.218-.223C333.831,67.707,238.47,55.862,163.228,95.346l23.938,23.939c61.571-27.691,136.573-16.327,187.105,34.115L464,246.683v3.107l-71.744,74.585,22.63,22.63L496,262.683V233.79Z"/><path d="M352.8,284.33A103.307,103.307,0,0,0,219.907,151.438L246.1,177.63a71.228,71.228,0,0,1,80.507,80.508Z"/><path d="M369.9,347.268l-33.831-33.831c.088-.108.179-.212.266-.32l-22.805-22.806c-.083.113-.169.222-.253.334l-99.681-99.681c.112-.083.221-.17.334-.253L191.12,167.906c-.108.087-.213.179-.321.266L38.627,16H16V38.627l95.689,95.689L16,233.79v28.893l98.778,102.689.218.222A199.732,199.732,0,0,0,367.372,390l106,106H496V473.373L392.537,369.911Zm-177.157-131.9L288.871,311.5a71.28,71.28,0,0,1-96.133-96.133ZM137.729,343.073,48,249.79v-3.107l86.319-89.737,35.065,35.064A103.248,103.248,0,0,0,312.226,334.853l32.007,32.007C279.723,406.875,193.711,398.955,137.729,343.073Z"/></svg>'
