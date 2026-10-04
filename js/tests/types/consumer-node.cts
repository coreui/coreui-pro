/**
 * --------------------------------------------------------------------------
 * CoreUI PRO js/tests/types/consumer-node.cts
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

// Resolves the package by name, through the `exports` map, as a Node consumer does.

import { Alert as RootAlert, Tooltip as RootTooltip } from '@coreui/coreui-pro'
import Alert from '@coreui/coreui-pro/js/dist/alert'
import ContextMenu from '@coreui/coreui-pro/js/dist/context-menu.js'
import Dropdown from '@coreui/coreui-pro/js/dist/dropdown.js'
import Tooltip from '@coreui/coreui-pro/js/src/tooltip.js'
import { createDate } from '@coreui/coreui-pro/utils/calendar'
import { getSectionLayout } from '@coreui/coreui-pro/utils/date-sections'

const element = document.createElement('div')

new Alert(element).close()
new RootAlert(element).close()
new ContextMenu(element).dispose()
Dropdown.getOrCreateInstance(element).toggle()
Tooltip.getOrCreateInstance(element).show()
const rootTooltip: RootTooltip = Tooltip.getOrCreateInstance(element)
createDate(2026, 0, 1).getFullYear()
getSectionLayout('dd.MM.yyyy', 'en-US')

export { rootTooltip }
