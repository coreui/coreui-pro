/**
 * --------------------------------------------------------------------------
 * CoreUI util/component-functions.ts
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 *
 * This is a modified version of the Bootstrap's util/component-functions.ts
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import EventHandler from '../dom/event-handler.js'
import SelectorEngine from '../dom/selector-engine.js'
import type BaseComponent from '../base-component.js'
import { isDisabled } from './index.js'

const enableDismissTrigger = (component: typeof BaseComponent, method = 'hide', closestSelector?: string): void => {
  const clickEvent = `click.dismiss${component.EVENT_KEY}`
  const name = component.NAME

  EventHandler.on(document, clickEvent, `[data-coreui-dismiss="${name}"]`, function (this: HTMLElement, event: Event) {
    if (['A', 'AREA'].includes(this.tagName)) {
      event.preventDefault()
    }

    if (isDisabled(this)) {
      return
    }

    const target = SelectorEngine.getElementFromSelector(this) || this.closest(closestSelector ?? `.${name}`)
    const instance: any = component.getOrCreateInstance(target)

    // Method argument is left, for Alert and only, as it doesn't implement the 'hide' method
    instance[method]()
  })
}

/**
 * Start a data API on `eventName`, or on the next task when that event has already fired because
 * the script loaded after it, as an `import()` once the page is shown does. Waiting a task lets the
 * page's own code right after the import set `Default` or create its instances with options first.
 * `DOMContentLoaded` counts as fired once the navigation timing says it started, so a module or
 * deferred script, which runs before it, still waits for it like a classic script does. The listener
 * keeps its data API namespace, so a page that turns the data API off before it fires stops it.
 *
 * @param target - `document` for a `DOMContentLoaded` event, `window` for a `load` event.
 * @param eventName - The namespaced event the data API listens to.
 * @param callback - The data API start.
 * @returns Nothing.
 */
const onDocumentReady = (target: Document | Window, eventName: string, callback: () => void): void => {
  EventHandler.on(target, eventName, callback)

  const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
  const fired = target === window ?
    document.readyState === 'complete' :
    (navigation ? navigation.domContentLoadedEventStart > 0 : document.readyState !== 'loading')

  if (fired) {
    setTimeout(callback)
  }
}

export {
  enableDismissTrigger,
  onDocumentReady
}
