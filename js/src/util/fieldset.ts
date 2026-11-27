const TAG = 'coreui-fieldset-watch'

/**
 * Places a hidden form-associated element after `anchor` and calls `callback` whenever an
 * ancestor `<fieldset>` later disables or enables that position: on a toggle of its `disabled`
 * attribute, and when the element moves into or out of a disabled fieldset. The call happens
 * inside the change, so the state is current before any focus moves. Placing the element does
 * not call back; its `:disabled` state gives the state at that moment. Removing it from a disabled
 * fieldset calls back with `false`, so a component removes its watcher before it tears down.
 * `release` runs once in a microtask after the element is placed or changes, and only when a
 * fieldset still disables the watcher then, so a fieldset disabled and enabled again in one task
 * keeps the focus.
 *
 * @param anchor - The element after which the watcher is placed
 * @param callback - Receives whether a fieldset disables the watcher now
 * @param release - Gives up the focus and closes what is open once the change has settled
 * @returns The watcher element, to be moved together with `anchor`
 */
export const watchFieldset = (anchor: Element, callback: (disabled: boolean) => void, release?: () => void): HTMLElement => {
  if (!customElements.get(TAG)) {
    customElements.define(TAG, class extends HTMLElement {
      static formAssociated = true

      constructor() {
        super()
        this.attachInternals()
      }

      formDisabledCallback(): void {
        this.dispatchEvent(new Event('fieldsetchange'))
      }
    })
  }

  const watch = document.createElement(TAG)
  let settling = false
  const settle = () => {
    if (release && !settling) {
      settling = true
      queueMicrotask(() => {
        settling = false

        if (watch.matches(':disabled')) {
          release()
        }
      })
    }
  }

  watch.hidden = true
  anchor.after(watch)
  watch.addEventListener('fieldsetchange', () => {
    callback(watch.matches(':disabled'))
    settle()
  })
  settle()
  return watch
}
