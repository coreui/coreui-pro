/**
 * --------------------------------------------------------------------------
 * CoreUI PRO js/tests/types/consumer-node.mts
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

// Resolves the package by name, through the `exports` map, as a Node consumer does.

import { Alert as RootAlert, announce as rootAnnounce, Tooltip as RootTooltip } from '@coreui/coreui-pro'
import Alert from '@coreui/coreui-pro/js/dist/alert'
import ContextMenu from '@coreui/coreui-pro/js/dist/context-menu.js'
import Dropdown from '@coreui/coreui-pro/js/dist/dropdown.js'
import Tooltip from '@coreui/coreui-pro/js/src/tooltip.js'
import { announce } from '@coreui/coreui-pro/utils/announce'
import { createDate } from '@coreui/coreui-pro/utils/calendar'
import { appendChipValues } from '@coreui/coreui-pro/utils/chip-values'
import { getSectionLayout } from '@coreui/coreui-pro/utils/date-sections'
import { onLabelClick } from '@coreui/coreui-pro/utils/field-label'
import { containsFocus } from '@coreui/coreui-pro/utils/focus'
import { focusFirstInvalidControl } from '@coreui/coreui-pro/utils/form-validation'

const element = document.createElement('div')

new Alert(element).close()
new RootAlert(element).close()
new ContextMenu(element).dispose()
Dropdown.getOrCreateInstance(element).toggle()
Tooltip.getOrCreateInstance(element).show()
const rootTooltip: RootTooltip = Tooltip.getOrCreateInstance(element)
announce('Saved', { priority: 'assertive' })()
rootAnnounce('Saved', { context: element, timeout: 1000 })()
// @ts-expect-error — 'high' is not a priority
announce('Saved', { priority: 'high' })
createDate(2026, 0, 1).getFullYear()
appendChipValues(['a'], ['b'], 2).at(-1)
getSectionLayout('dd.MM.yyyy', 'en-US')
onLabelClick(element, () => {})()
containsFocus(element).valueOf()
focusFirstInvalidControl(document.createElement('form'))

export { rootTooltip }
