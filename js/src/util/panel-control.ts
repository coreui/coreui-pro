/**
 * Turns ARIA role names into attribute selectors.
 *
 * @param names - The role names
 * @returns One `[role="…"]` selector per name
 */
const roles = (...names: string[]): string[] => names.map(name => `[role="${name}"]`)

const SELECTOR_PANEL_FIELD = [
  'input',
  'select',
  'textarea',
  '[contenteditable]:not([contenteditable="false"])',
  ...roles('combobox', 'slider', 'spinbutton', 'textbox')
]

const SELECTOR_PANEL_WIDGET = [
  ...SELECTOR_PANEL_FIELD,
  ...roles('grid', 'listbox', 'radiogroup', 'tablist', 'toolbar', 'tree', 'treegrid')
].join(',')

const SELECTOR_PANEL_CONTROL = [
  ...SELECTOR_PANEL_FIELD,
  'option',
  'form',
  'label',
  ...roles('checkbox', 'radio', 'switch')
].join(',')

/**
 * Walks the event path from the target up to a menu panel and tells whether it meets an element
 * matching `selector` before it meets a menu item or the panel.
 *
 * @param event - The keyboard or pointer event
 * @param panel - The menu panel the event is checked against
 * @param selector - The elements that count
 * @param itemSelector - The menu items, which never count and hide everything above them
 * @param formPanel - Whether a panel that is itself a form counts
 * @returns `true` when such an element received the event inside `panel`
 */
const isFromPanelPart = (event: Event, panel: Element, selector: string, itemSelector: string, formPanel: boolean): boolean => {
  const path = event.composedPath()

  for (const node of path) {
    if (!(node instanceof Element)) {
      continue
    }

    if (node.matches(itemSelector)) {
      return false
    }

    if (node === panel) {
      return formPanel && panel.matches('form')
    }

    if (node.matches(selector)) {
      return path.includes(panel)
    }
  }

  return false
}

/**
 * Tells whether a key comes from a widget inside a menu panel that uses the arrow keys, Home and
 * End itself: a form field, an editable region, or an element with the role `combobox`, `grid`,
 * `listbox`, `radiogroup`, `slider`, `spinbutton`, `tablist`, `textbox`, `toolbar`, `tree` or
 * `treegrid`. A
 * menu item never counts, nor does anything around it, the panel or the page around the panel,
 * so items in a toolbar of the menu and a menu in a toolbar of the page keep their keys.
 *
 * @param event - The keyboard event
 * @param panel - The menu panel the event is checked against
 * @param itemSelector - The selector of the menu items
 * @returns `true` when such a widget inside `panel` received the event
 */
export const isFromPanelWidget = (event: Event, panel: Element, itemSelector: string): boolean =>
  isFromPanelPart(event, panel, SELECTOR_PANEL_WIDGET, itemSelector, false)

/**
 * Tells whether a click comes from a control inside a menu panel that is there to be used in
 * place: a form field, an editable region, a native option, a label, a form or anything in it, or
 * an element with the role `checkbox`, `combobox`, `radio`, `slider`, `spinbutton`, `switch` or
 * `textbox`. A pick in a grid, list box or tree is a choice and closes the menu like an item. A
 * panel that is itself a form counts; a menu item, everything around it and a panel with any other
 * role do not.
 *
 * @param event - The pointer event
 * @param panel - The menu panel the event is checked against
 * @param itemSelector - The selector of the menu items
 * @returns `true` when such a control inside `panel`, or a form panel, received the event
 */
export const isFromPanelControl = (event: Event, panel: Element, itemSelector: string): boolean =>
  isFromPanelPart(event, panel, SELECTOR_PANEL_CONTROL, itemSelector, true)
