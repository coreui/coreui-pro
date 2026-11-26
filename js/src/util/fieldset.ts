const TAG = 'coreui-fieldset-watch'

/**
 * Places a hidden form-associated element after `anchor` and calls `callback` whenever an
 * ancestor `<fieldset>` later disables or enables that position: on a toggle of its `disabled`
 * attribute, and when the element moves into or out of a disabled fieldset. The call happens
 * inside the change, so the state is current before any focus moves. Placing the element does
 * not call back; its `:disabled` state gives the state at that moment. Removing it from a disabled
 * fieldset calls back with `false`, so a component removes its watcher before it tears down.
 *
 * @param anchor - The element after which the watcher is placed
 * @param callback - Receives whether a fieldset disables the watcher now
 * @returns The watcher element, to be moved together with `anchor`
 */
export const watchFieldset = (anchor: Element, callback: (disabled: boolean) => void): HTMLElement => {
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
  watch.hidden = true
  anchor.after(watch)
  watch.addEventListener('fieldsetchange', () => callback(watch.matches(':disabled')))
  return watch
}
