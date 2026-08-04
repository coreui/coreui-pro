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

const CLASS_NAME_GROUP = 'form-control-group'
const CLASS_NAME_FORM_CONTROL = 'form-control'

export type ControlGroup = {
  created: boolean
  element: HTMLElement
  movedClassNames: string[]
}

/**
 * Returns the group a control sits in, building one around it when there is
 * none. A component that supplies its own adornments can supply the frame that
 * lays them out too, so its markup is a plain form control.
 *
 * Everything the author wrote on that control except `.form-control` moves to
 * the group: a class on the control describes the field, and once it is
 * wrapped the field is the frame — a margin left behind would sit inside the
 * border.
 * @param {HTMLElement} element The control.
 * @returns {ControlGroup} The group, whether it was created, and the classes moved onto it.
 */
export const ensureControlGroup = (element: HTMLElement): ControlGroup => {
  const existing = element.closest<HTMLElement>(`.${CLASS_NAME_GROUP}`)

  if (existing) {
    return { created: false, element: existing, movedClassNames: [] }
  }

  const group = document.createElement('div')
  group.classList.add(CLASS_NAME_GROUP)

  const movedClassNames = [...element.classList].filter(name => name !== CLASS_NAME_FORM_CONTROL)
  element.classList.remove(...movedClassNames)
  group.classList.add(...movedClassNames)

  element.before(group)
  group.append(element)

  return { created: true, element: group, movedClassNames }
}

/**
 * Undoes ensureControlGroup: the classes go back on the control, and a group
 * this library created is removed. One the author wrote stays — it is theirs,
 * and may hold more than this control.
 * @param {HTMLElement} element The control.
 * @param {ControlGroup} group The group returned by ensureControlGroup.
 */
export const releaseControlGroup = (element: HTMLElement, group: ControlGroup): void => {
  element.classList.add(...group.movedClassNames)
  group.element.classList.remove(...group.movedClassNames)

  if (group.created) {
    group.element.before(element)
    group.element.remove()
  }
}

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
