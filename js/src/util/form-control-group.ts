/**
 * --------------------------------------------------------------------------
 * CoreUI PRO util/form-control-group.js
 * License (https://coreui.io/pro/license/)
 *
 * The JavaScript side of the `.form-control-group` primitive: components that
 * assemble a control out of parts build their adornments the same way, so the
 * markup contract lives in one place rather than in each shell.
 * --------------------------------------------------------------------------
 */

type ActionOptions = {
  className: string
  disabled?: boolean
  icon: string
  label: string
  sanitizeIcon: (icon: string) => string
}

/**
 * Builds an adornment button for a form control group.
 * @param {object} options The button's class, icon, accessible label, disabled state and the icon sanitizer.
 * @returns {HTMLButtonElement} The button.
 */
export const createControlGroupAction = (options: ActionOptions): HTMLButtonElement => {
  const button = document.createElement('button')
  button.classList.add(options.className)
  button.type = 'button'
  button.disabled = Boolean(options.disabled)
  button.setAttribute('aria-label', options.label)
  button.innerHTML = options.sanitizeIcon(options.icon)

  return button
}
