/**
 * --------------------------------------------------------------------------
 * CoreUI PRO util/form-control-group.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import { getUID, reflow } from './index.js'

const CLASS_NAME_FORM_FLOATING = 'form-floating'
const CLASS_NAME_GROUP = 'form-control-group'
const CLASS_NAME_FORM_CONTROL = 'form-control'
const CLASS_NAME_STAYS_ON_CONTROL = /^(?:is|was|js)-/

export const SIZE_CLASS_NAMES: string[] = [`${CLASS_NAME_FORM_CONTROL}-lg`, `${CLASS_NAME_FORM_CONTROL}-sm`]

export const applyControlGroupSize = (element: HTMLElement, size: string | null): void => {
  if (!size) {
    return
  }

  element.classList.remove(...SIZE_CLASS_NAMES)
  element.classList.add(`${CLASS_NAME_FORM_CONTROL}-${size}`)
}

export const managedSizeClassNames = (size: string | null): string[] =>
  size ? [...new Set([...SIZE_CLASS_NAMES, `${CLASS_NAME_FORM_CONTROL}-${size}`])] : []

export type HostClasses = { classNames: string[], hadAttribute: boolean }

export const captureHostClasses = (element: HTMLElement, managed: string[]): HostClasses => ({
  classNames: managed.filter(className => element.classList.contains(className)),
  hadAttribute: element.hasAttribute('class')
})

export const restoreHostClasses = (element: HTMLElement, managed: string[], host: HostClasses): void => {
  for (const className of managed) {
    element.classList.toggle(className, host.classNames.includes(className))
  }

  if (!host.hadAttribute && element.classList.length === 0) {
    element.removeAttribute('class')
  }
}

export const applyControlGroupClasses = (element: HTMLElement, ...classNames: string[]): void => {
  if (element.classList.contains(CLASS_NAME_GROUP)) {
    element.classList.add(...classNames)
    return
  }

  const hadStyleAttribute = element.hasAttribute('style')
  const previous = element.style.transitionProperty
  element.style.transitionProperty = 'none'
  element.classList.add(...classNames)
  reflow(element)
  element.style.transitionProperty = previous

  if (!hadStyleAttribute && element.getAttribute('style') === '') {
    element.removeAttribute('style')
  }
}

export type ControlGroup = {
  created: boolean
  element: HTMLElement
  movedClassNames: string[]
}

export const ensureControlGroup = (element: HTMLElement): ControlGroup => {
  const existing = element.closest<HTMLElement>(`.${CLASS_NAME_GROUP}`)

  if (existing) {
    return { created: false, element: existing, movedClassNames: [] }
  }

  const group = document.createElement('div')
  group.classList.add(CLASS_NAME_GROUP)

  const movedClassNames = [...element.classList].filter(name => name !== CLASS_NAME_FORM_CONTROL && !CLASS_NAME_STAYS_ON_CONTROL.test(name))
  element.classList.remove(...movedClassNames)
  group.classList.add(...movedClassNames)

  element.before(group)
  group.append(element)

  return { created: true, element: group, movedClassNames }
}

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

export const appendControlGroupField = (group: HTMLElement, field: HTMLElement, floatingLabel: string | null, uidPrefix: string): HTMLElement => {
  if (!floatingLabel) {
    group.append(field)
    return field
  }

  const wrapper = document.createElement('div')
  wrapper.classList.add(CLASS_NAME_FORM_FLOATING)
  field.id ||= getUID(uidPrefix)
  const label = document.createElement('label')
  label.htmlFor = field.id
  label.textContent = floatingLabel
  wrapper.append(label, field)
  group.append(wrapper)

  return wrapper
}

export const createControlGroupAction = (options: ActionOptions): HTMLButtonElement => {
  const button = document.createElement('button')
  button.classList.add(options.className)
  button.type = 'button'
  button.disabled = Boolean(options.disabled)
  button.setAttribute('aria-label', options.label)
  button.innerHTML = options.sanitizeIcon(options.icon)

  return button
}
