---
name: coreui-component-js
description: Write a custom JavaScript plugin on top of the CoreUI PRO for Bootstrap v6 BaseComponent and drive CoreUI plugins from your own code. Use when building your own data-attribute plugin, adding options, events, setters or Floating UI positioning to it, or calling CoreUI instances, methods and events from application code.
guide: /getting-started/javascript/
---

# Write a Custom Plugin on CoreUI PRO for Bootstrap v6

This skill builds a plugin in a user's project with the same structure as the CoreUI plugins in `@coreui/coreui-pro` `6.0.0-alpha.0`. The plugin gets `getInstance()`, `getOrCreateInstance()`, `data-coreui-*` options, `.coreui.<name>` events and `dispose()` from the base class. The running example is `Peek`, a panel that opens next to its trigger.

The package must come from npm and go through a bundler (Vite, Webpack, Parcel, Rolldown). For the install itself, see the `coreui-v6-install` skill.

## Workflow

- [ ] Step 1: Import the base modules from `js/dist`
- [ ] Step 2: Define the constants
- [ ] Step 3: Declare the options
- [ ] Step 4: Build the state from the options
- [ ] Step 5: Fire namespaced, cancelable events
- [ ] Step 6: Change a live instance through setters
- [ ] Step 7: Position with Floating UI (optional)
- [ ] Step 8: Clean up in `dispose()`
- [ ] Step 9: Wire the data API
- [ ] Step 10: Type the plugin (TypeScript, optional)
- [ ] Step 11: Use CoreUI plugins from your code
- [ ] Step 12: Verify

---

## Step 1: Import the base modules from `js/dist`

1. Import the base class and the DOM helpers from their `js/dist` paths. The package root (`@coreui/coreui-pro`) exports the plugins and `announce`, not `BaseComponent`. The UMD global `coreui` has no `BaseComponent` either, so a CDN page cannot extend it.

   | Import | Gives |
   | --- | --- |
   | `@coreui/coreui-pro/js/dist/base-component` | `BaseComponent` (default export) |
   | `@coreui/coreui-pro/js/dist/dom/event-handler` | `EventHandler`: `on`, `one`, `off`, `trigger` |
   | `@coreui/coreui-pro/js/dist/dom/selector-engine` | `SelectorEngine`: `find`, `findOne`, `children`, `closest`, `parents`, `prev`, `next`, `focusableChildren` |
   | `@coreui/coreui-pro/js/dist/dom/manipulator` | `Manipulator`: `getDataAttribute`, `getDataAttributes`, `setDataAttribute`, `removeDataAttribute` |
   | `@coreui/coreui-pro/js/dist/<plugin>` | one CoreUI plugin, for example `js/dist/modal` |
   | `@coreui/coreui-pro/utils/announce`, `@coreui/coreui-pro/utils/focus` | `announce()`, `containsFocus()`, `focusWithTemporaryTabindex()` |

2. Import the CoreUI plugins of the same page from `js/dist` too. Every `js/dist/*.mjs` file shares one copy of `base-component`, `dom/data` and `dom/event-handler`. The package root resolves to `js/dist/index.mjs`, so it loads the same copy, but `import { Modal } from '@coreui/coreui-pro'` still puts the whole library in the bundle. Import from `js/dist` to keep the bundle small.

   ```js
   import BaseComponent from '@coreui/coreui-pro/js/dist/base-component'
   import EventHandler from '@coreui/coreui-pro/js/dist/dom/event-handler'
   import SelectorEngine from '@coreui/coreui-pro/js/dist/dom/selector-engine'
   import Modal from '@coreui/coreui-pro/js/dist/modal'
   ```

3. Do not import other files from `js/dist/util/`. The helpers there (`component-functions`, `floating-ui`, `index`) are not listed as `utils/` entry points in the package `exports`.

---

## Step 2: Define the constants

1. Put the constants at the top of the module. `NAME` is the only static the class must return. `BaseComponent` derives `DATA_KEY` (`coreui.<NAME>`), `EVENT_KEY` (`.coreui.<NAME>`) and `eventName('show')` (`show.coreui.<NAME>`) from it.

   ```js
   const NAME = 'peek'
   const DATA_KEY = `coreui.${NAME}`
   const EVENT_KEY = `.${DATA_KEY}`
   const DATA_API_KEY = '.data-api'

   const EVENT_SHOW = `show${EVENT_KEY}`
   const EVENT_SHOWN = `shown${EVENT_KEY}`
   const EVENT_HIDE = `hide${EVENT_KEY}`
   const EVENT_HIDDEN = `hidden${EVENT_KEY}`
   const EVENT_KEYDOWN = `keydown${EVENT_KEY}`
   const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`

   const CLASS_NAME_DISABLED = 'disabled'
   const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="peek"]'
   ```

2. Pick a `NAME` that no CoreUI plugin uses (`alert`, `modal`, `tooltip`, `menu`, `rating` and the rest). A shared name shares the instance slot and the event namespace.
3. Bind one plugin per element. A second plugin on the same element logs `CoreUI doesn't allow more than one instance per element` and is not registered.

---

## Step 3: Declare the options

1. Declare `Default` and `DefaultType` as constants and return them from static getters:

   ```js
   const Default = {
     disabled: false,
     offset: 8,
     placement: 'bottom',
     target: null
   }

   const DefaultType = {
     disabled: 'boolean',
     offset: 'number',
     placement: 'string',
     target: '(string|element)'
   }
   ```

   ```js
   class Peek extends BaseComponent {
     static get Default() {
       return Default
     }

     static get DefaultType() {
       return DefaultType
     }

     static get NAME() {
       return NAME
     }
   }
   ```

2. Know the merge order. The base constructor applies it; you write none of it. Later wins:

   | Order | Source | Example |
   | --- | --- | --- |
   | 1 | `Default` | `offset: 8` |
   | 2 | JSON in `data-coreui-config` | `data-coreui-config='{"offset":4}'` |
   | 3 | Each `data-coreui-*` attribute | `data-coreui-offset="12"` |
   | 4 | The object passed to the constructor | `new Peek(el, { offset: 16 })` |

3. Attribute names become camelCase keys: `data-coreui-auto-hide` is `autoHide`. Values are converted: `"true"` and `"false"` to booleans, numeric strings to numbers, `""` and `"null"` to `null`, valid JSON to its value. Anything else stays a string.
4. `sanitize`, `allowList` and `sanitizeFn` are ignored in markup. Pass them in the constructor object.
5. Every `DefaultType` key is checked after the merge. The value is a regular expression over the type name: `'boolean'`, `'number'`, `'string'`, `'element'`, `'function'`, `'array'`, `'object'`, `'null'`, `'undefined'`, or a group such as `'(null|string|element)'`. A mismatch throws `TypeError: PEEK: Option "offset" provided type "string" but expected type "number".`
6. To normalize a value before the check, override `_configAfterMerge(config)` and return the config. It runs inside `super()`, before your constructor body and before class field initializers.
7. To change a default for every new instance, set it on the class: `Peek.Default.offset = 4`.

---

## Step 4: Build the state from the options

1. Call `super(element, config)` first. It accepts an element or a selector, merges and checks the config, disposes an older instance of the same plugin on the element and registers the new one.
2. Return early when no element was found. `super()` then binds nothing and `this._element` is unset.
3. Compute every piece of state from `this._config`. Write classes and ARIA attributes as a result of that state. Never read your own state classes (`.disabled`, `.show`) or `aria-*` back from the DOM.

   ```js
   class Peek extends BaseComponent {
     constructor(element, config) {
       super(element, config)

       if (!this._element) {
         return
       }

       this._panel = typeof this._config.target === 'string' ?
         SelectorEngine.findOne(this._config.target) :
         this._config.target
       this._disabled = this._config.disabled
       this._shown = false
       this._stopAutoUpdate = null
       this._onKeydown = event => {
         if (event.key === 'Escape') {
           this.hide()
         }
       }

       this._panel.hidden = true
       this._element.setAttribute('aria-expanded', 'false')
       this._paintDisabled()
     }

     _paintDisabled() {
       this._element.classList.toggle(CLASS_NAME_DISABLED, this._disabled)
       this._element.setAttribute('aria-disabled', String(this._disabled))
     }
   }
   ```

4. Read content and references from the markup (option text, `id`, `aria-labelledby`). Those are not state.
5. A data API instance is created on the first click. Put `hidden` on the panel in the markup, so the page renders it closed before that.

---

## Step 5: Fire namespaced, cancelable events

1. Fire an infinitive event before the action and a past participle after it. Stop when a listener called `preventDefault()` on the first one.
2. `EventHandler.trigger(element, name, payload)` dispatches a bubbling, cancelable native event and copies the payload keys onto it. Listeners can use `addEventListener('show.coreui.peek', …)`.
3. Run the "after" event through `this._queueCallback(callback, element)`. It waits for the CSS transition on `element`, skips the callback when the instance was disposed meanwhile, and returns a promise. Return that promise from `show()` and `hide()`, so callers can `await` them.

   ```js
   class Peek extends BaseComponent {
     toggle() {
       return this._shown ? this.hide() : this.show()
     }

     async show() {
       if (this._disabled || this._shown) {
         return
       }

       const showEvent = EventHandler.trigger(this._element, EVENT_SHOW, { relatedTarget: this._panel })

       if (showEvent.defaultPrevented) {
         return
       }

       this._shown = true
       this._panel.hidden = false
       this._element.setAttribute('aria-expanded', 'true')
       this._stopAutoUpdate = autoUpdate(this._element, this._panel, () => this._position())
       EventHandler.on(document, EVENT_KEYDOWN, this._onKeydown)

       await this._queueCallback(() => {
         EventHandler.trigger(this._element, EVENT_SHOWN, { relatedTarget: this._panel })
       }, this._panel)
     }

     async hide() {
       if (!this._shown) {
         return
       }

       const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE, { relatedTarget: this._panel })

       if (hideEvent.defaultPrevented) {
         return
       }

       this._shown = false
       this._stopPositioning()
       this._panel.hidden = true
       this._element.setAttribute('aria-expanded', 'false')

       await this._queueCallback(() => {
         EventHandler.trigger(this._element, EVENT_HIDDEN, { relatedTarget: this._panel })
       }, this._panel)
     }
   }
   ```

4. Bind every listener with a namespaced event name. On `this._element`, `dispose()` removes all of them. On `document` or `window`, remove your own handler by reference: `EventHandler.off(document, EVENT_KEYDOWN, this._onKeydown)`. Calling `off` with the event name alone removes the handlers of every instance of the plugin.

---

## Step 6: Change a live instance through setters

1. Treat options as fixed after start. Do not add a generic `setConfig()` or `update(config)`. Give each value that can change on a live instance its own method:

   | Option | Method |
   | --- | --- |
   | Boolean (`disabled`) | `disable()` and `enable()` |
   | Any other (`placement`) | `set` + option name: `setPlacement(placement)` |
   | Yes or no question | `isShown()` |

2. Make a setter synchronous and return nothing. Check the argument with the same rule as the constructor, so a wrong type throws the same `TypeError`.
3. Do not fire change events from a setter. Events report what the user did.

   ```js
   class Peek extends BaseComponent {
     disable() {
       this._setDisabled(true)
     }

     enable() {
       this._setDisabled(false)
     }

     setPlacement(placement) {
       this._typeCheckConfig({ placement }, { placement: DefaultType.placement })
       this._config = { ...this._config, placement }

       if (this._shown) {
         this._position()
       }
     }

     isShown() {
       return this._shown
     }

     _setDisabled(disabled) {
       if (disabled === this._disabled) {
         return
       }

       this._disabled = disabled
       this._paintDisabled()

       if (disabled) {
         this.hide()
       }
     }
   }
   ```

4. Do not watch the DOM with `MutationObserver` to pick up changes. Read the DOM when the plugin acts, or expose a method the page calls after it changes the markup.

---

## Step 7: Position with Floating UI (optional)

1. Install the peer dependency the CoreUI plugins use: `npm i @floating-ui/dom` (`^1.8.0`).
2. Import from `@floating-ui/dom` directly. CoreUI's own positioning helpers are internal.
3. Start `autoUpdate()` when the panel opens and keep the function it returns. Call it on hide and in `dispose()`.
4. Check the panel after the `await`. `dispose()` sets every instance field to `null`, and a position can resolve after it.

   ```js
   import {
     autoUpdate, computePosition, flip, offset, shift
   } from '@floating-ui/dom'
   ```

   ```js
   class Peek extends BaseComponent {
     async _position() {
       const { x, y } = await computePosition(this._element, this._panel, {
         placement: this._config.placement,
         middleware: [offset(this._config.offset), flip(), shift({ padding: 8 })]
       })

       if (!this._panel) {
         return
       }

       this._panel.style.left = `${x}px`
       this._panel.style.top = `${y}px`
     }

     _stopPositioning() {
       EventHandler.off(document, EVENT_KEYDOWN, this._onKeydown)

       if (this._stopAutoUpdate) {
         this._stopAutoUpdate()
         this._stopAutoUpdate = null
       }
     }
   }
   ```

5. Give the panel the position Floating UI expects:

   ```css
   .peek-panel {
     position: absolute;
     top: 0;
     left: 0;
     width: max-content;
   }
   ```

---

## Step 8: Clean up in `dispose()`

1. Undo what lives outside the element first, then call `super.dispose()`. The base method unregisters the instance, removes every `.coreui.<name>` listener on `this._element` and sets every instance field to `null`.

   ```js
   class Peek extends BaseComponent {
     dispose() {
       this._stopPositioning()
       super.dispose()
     }
   }
   ```

2. Clean up these yourself: timers, observers, listeners on `document` or `window`, `autoUpdate()` cleanups, instances of other plugins you created, and nodes you inserted.
3. Restore nothing else. The next instance computes classes and ARIA attributes from its options again.

---

## Step 9: Wire the data API

1. Add the data API after the class, as a module side effect. Delegate from `document` and add `.data-api` to the event name. Use a `function`, so `this` is the matched element.

   ```js
   EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, function (event) {
     event.preventDefault()
     Peek.getOrCreateInstance(this).toggle()
   })

   export default Peek
   ```

2. For a plugin that must exist before any click, initialize on load the way the CoreUI form plugins do:

   ```js
   EventHandler.on(window, `load${EVENT_KEY}${DATA_API_KEY}`, () => {
     for (const element of SelectorEngine.find('[data-coreui-peek]')) {
       Peek.getOrCreateInstance(element)
     }
   })
   ```

3. Write the markup. Options go in `data-coreui-*` attributes on the element the plugin binds to:

   ```html
   <button type="button" class="btn-solid theme-primary" data-coreui-toggle="peek" data-coreui-target="#peekPanel" data-coreui-placement="top" data-coreui-offset="12">
     Details
   </button>
   <div id="peekPanel" class="peek-panel card" hidden>
     <div class="card-body">Panel content</div>
   </div>
   ```

4. Import the module once in the app entry. The data API exists only after the import runs, and a second copy registers the click handler twice.
5. Inside a shadow root the data API does not reach the element. Create the instance with `new Peek(root.querySelector('…'))`.

---

## Step 10: Type the plugin (TypeScript, optional)

1. The `js/dist` files ship `.d.ts` and `.d.mts` declarations. Install no `@types/…` package.
2. Write a `PeekConfig` type with every option and type `Default` with it.
3. Narrow the inherited config with `protected declare _config: PeekConfig`. Declare your own fields the same way (`protected declare _shown: boolean`) and assign them in the constructor. A redeclared `_config` without `declare` fails with `TS2612`.
4. Type the constructor as `constructor(element?: string | Element | null, config?: Partial<PeekConfig> | null)`. `getOrCreateInstance()` takes its config type from this parameter.
5. With `noImplicitOverride` on, mark the static getters and `dispose()` with `override`: `static override get NAME(): string`.
6. Import the event type with `import EventHandler, { type CoreUIEvent } from '@coreui/coreui-pro/js/dist/dom/event-handler'`.
7. Import a CoreUI plugin's config type from the plugin path, not the root: `import { type TooltipConfig } from '@coreui/coreui-pro/js/dist/tooltip'`.

---

## Step 11: Use CoreUI plugins from your code

1. Get an instance. Every constructor and static method takes an element or a selector:

   | Call | Result |
   | --- | --- |
   | `new Modal('#myModal', { keyboard: false })` | New instance. Replaces an older one of the same plugin on the element. |
   | `Modal.getInstance('#myModal')` | The instance, or `null`. |
   | `Modal.getOrCreateInstance('#myModal', config)` | The instance, created with `config` when missing. |

2. Await the methods that run a transition. `show`, `hide` and `toggle` on Collapse, Dialog, Drawer, Menu, Modal, Offcanvas, Popover, Sidebar and Tooltip return a promise, as do Toast `show`/`hide`, Tab `show` and Alert `close`. The promise also resolves when the call does nothing, so check the state when it matters.

   ```js
   const modal = Modal.getOrCreateInstance('#myModal')

   await modal.show()
   ```

3. Listen to events on the plugin's element with the full name. Cancel the infinitive one to stop the action:

   ```js
   const modalElement = document.querySelector('#myModal')

   modalElement.addEventListener('show.coreui.modal', event => {
     if (!formIsReady()) {
       event.preventDefault()
     }
   })
   ```

4. Change a live instance with its setters, not by creating it again: `rating.setValue(4)`, `multiSelect.setValue(['a', 'b'])`, `rating.disable()`, `tooltip.enable()`. Setters do not fire the plugin's change event.
5. Dispose after the transition ends: `await toast.hide()`, then `toast.dispose()`. From a listener of another event of the same plugin, defer it with `queueMicrotask(() => chipSet.dispose())`.
6. Change a default for all new instances on the class: `Modal.Default.keyboard = false`.
7. When your plugin creates CoreUI instances on its own elements, keep them on fields and call their `dispose()` in your `dispose()`.

---

## Step 12: Verify

1. Load the page and click the trigger. The panel opens next to it, `aria-expanded` is `"true"`, and the console shows no `TypeError`.
2. In the console, check the wiring:
   - `Peek.getInstance(trigger)` returns the instance after the first click and `null` before it.
   - `Peek.getInstance(trigger)._config` holds the `data-coreui-*` values with the right types (`offset: 12`, a number).
   - A `show.coreui.peek` listener that calls `preventDefault()` keeps the panel closed, and `await peek.show()` still resolves.
   - `peek.disable()` adds `.disabled` and `aria-disabled="true"`, and a click does nothing until `peek.enable()`.
   - `peek.setPlacement(5)` throws `TypeError: PEEK: Option "placement" provided type "number" but expected type "string".`
   - After `peek.dispose()`, `Peek.getInstance(trigger)` is `null`, and the next click creates a new instance.
3. Grep the project:
   - `from '@coreui/coreui-pro'` in a file that also imports `@coreui/coreui-pro/js/dist/`: keep the `js/dist` paths only.
   - `js/dist/util/`: replace with your own code or a `@coreui/coreui-pro/utils/<name>` entry point.
   - `setConfig(` or `update(config` in your plugin: replace with `set<Option>()`, `disable()` or `enable()`.
   - `classList.contains(` or `getAttribute('aria-` reading your own state: read the instance field instead.
   - `EventHandler.off(document, EVENT_` without a handler argument: pass the handler.
   - `MutationObserver` in a plugin: replace with a method the page calls.
4. Bundle the entry without minification. `const eventRegistry` appears once in the output when the plugin and the CoreUI plugins share one copy of `dom/event-handler`.
