/*!
 * Unified accessibility test config.
 *
 * Adapted from Bootstrap's WCAG conformance suite (twbs/bootstrap#42502,
 * build/a11y.config.mjs); the per-component criterion selection and notes below
 * are our own, verified against the CoreUI sources.
 *
 * Single source of truth for *which* WCAG criteria each component is tested
 * against, and our coverage status for each. The criterion catalog (titles,
 * levels, "Understanding" URLs) and the criterion -> axe rule mapping live in
 * build/wcag.mjs. This file only *selects* criteria per component and is
 * validated against that catalog at runtime by build/test-a11y.mjs.
 *
 * Entry shape:
 *   component   Logical id; also the default docs path the test renders from,
 *               i.e. docs/src/content/docs/<component>.mdx (its `<Example>`
 *               snippets are the markup under test).
 *   criteria[]  { criterion, status?, note? }
 *                 criterion  Key into wcagCriteria (e.g. '4.1.2').
 *                 status     'built-in' | 'partial' | 'author' (default 'author').
 *                              built-in/partial -> machine-checkable criteria are
 *                              asserted PASS/FAIL; author -> reported only.
 *                 note       Optional rationale shown in the report.
 *   examplesFrom (optional) Pull markup from a different docs path.
 *   html         (optional) Inline markup (string or string[]) for components
 *                that have no docs examples to render, or that need a specific,
 *                deterministic structure to drive `interactions`/`assertions`.
 *   interactions (optional) Ordered Playwright steps run *before* axe so a
 *                component can be audited in its open/interactive state. Each
 *                step is one of:
 *                  { click: selector }
 *                  { focus: selector }
 *                  { type: text, on?: selector }
 *                  { press: key, on?: selector }
 *                  { wait: ms }
 *   assertions   (optional) Scripted checks for criteria axe can't verify
 *                statically (keyboard operation, focus order/restore, status
 *                messages). Each assertion is:
 *                  { criterion, label?, steps?: Step[], run: string, expect? }
 *                `steps` run (cumulatively, on the live page) before the check;
 *                `run` is a function body evaluated in-page whose return value is
 *                compared to `expect` (or treated as a boolean when omitted). A
 *                failing assertion on an owned criterion is a CI-breaking FAIL.
 *
 * NOTE — confirmed code gaps (no component fixes in this pass): criteria below
 * that the component does not yet fully satisfy are *not* marked `built-in`;
 * they carry a `note` prefixed with "GAP:" so a follow-up PR can fix the
 * component and promote the status.
 */

/** @typedef {{ click?: string, focus?: string, type?: string, press?: string, on?: string, wait?: number }} Step */
/** @typedef {{ criterion: string, status?: 'built-in' | 'partial' | 'author', note?: string }} A11yCriterion */
/** @typedef {{ criterion: string, label?: string, steps?: Step[], run: string, expect?: unknown }} A11yAssertion */
/** @typedef {{ component: string, criteria: A11yCriterion[], examplesFrom?: string, html?: string | string[], interactions?: Step[], assertions?: A11yAssertion[] }} A11yComponent */

/** @type {A11yComponent[]} */
export const a11yComponents = [
  // ---------------------------------------------------------------------------
  // Forms
  // ---------------------------------------------------------------------------
  {
    component: 'forms/otp-input',
    criteria: [
      {
        criterion: '3.3.8',
        status: 'built-in',
        note: 'Pasting a full code distributes it across the fields, and autocomplete=\'one-time-code\' on every digit input lets password managers and SMS autofill target it.'
      },
      {
        criterion: '1.3.5',
        status: 'built-in',
        note: 'autocomplete=\'one-time-code\' plus inputmode=\'numeric\' (type: \'number\') identify each field\'s purpose.'
      },
      {
        criterion: '3.3.2',
        status: 'built-in',
        note: 'Each digit input carries its own aria-label (default \'Digit N of M\' via the ariaLabel config).'
      },
      {
        criterion: '4.1.2',
        status: 'built-in',
        note: 'Each digit input exposes a name, role, and value; keep per-digit aria-labels in sync with the field count so the group reads as one code entry.'
      },
      {
        criterion: '2.2.1',
        status: 'author',
        note: 'Give codes a generous expiry (≥ ~60s) for cognitive and motor needs.'
      },
      {
        criterion: '3.3.7',
        status: 'author',
        note: 'Don\'t force re-entry of a code already provided in the same flow.'
      }
    ]
  },
  {
    component: 'forms/autocomplete',
    criteria: [
      {
        criterion: '4.1.2',
        status: 'built-in',
        note: 'The input gets role=combobox with aria-autocomplete, aria-expanded, aria-haspopup and aria-controls; the dropdown is a listbox of role=option items carrying aria-selected/aria-disabled.'
      },
      {
        criterion: '4.1.3',
        status: 'built-in',
        note: 'The "no results" placeholder is a role=status live region, announced without receiving focus.'
      },
      {
        criterion: '2.1.1',
        status: 'partial',
        note: 'Arrow keys, Home/End, Enter, Esc and Tab operate the listbox; verify manually for full conformance.'
      },
      {
        criterion: '3.3.2',
        status: 'author',
        note: 'Associate a visible <label> (or aria-label) with the input; default examples rely on a placeholder.'
      }
    ]
  },
  {
    component: 'forms/multi-select',
    // Docs examples are unlabeled fragments, so audit a representative,
    // correctly labelled instance — that is what exercises the component's own
    // wiring (label association, hidden native select) rather than the docs.
    html: `<label for="a11yMultiSelect">Choose technologies</label>
  <select id="a11yMultiSelect" multiple data-coreui-multi-select>
    <option value="angular">Angular</option>
    <option value="react" selected>React.js</option>
    <option value="vue">Vue.js</option>
  </select>`,
    criteria: [
      {
        criterion: '4.1.2',
        status: 'built-in',
        note: 'The toggler gets role=combobox named from the associated <label> via aria-labelledby (or the select\'s aria-label), with aria-expanded, aria-haspopup and aria-controls; options render as a role=listbox with aria-multiselectable and role=option items; the replaced native <select> is removed from the accessibility tree (aria-hidden, tabindex=-1).'
      },
      {
        criterion: '4.1.3',
        status: 'built-in',
        note: 'The selection summary is an aria-live=polite region, so selection changes are announced.'
      },
      {
        criterion: '2.1.1',
        status: 'partial',
        note: 'Arrow keys, Home/End, Enter, Esc and Tab operate the listbox; verify manually for full conformance.'
      },
      {
        criterion: '3.3.2',
        status: 'author',
        note: 'Associate a visible <label> (or aria-label) with the control; default examples rely on a placeholder.'
      }
    ]
  },
  {
    component: 'forms/chip-input',
    criteria: [
      {
        criterion: '4.1.2',
        status: 'built-in',
        note: 'The container carries no invalid ARIA (disabled/readonly semantics live on the native inner input); chip remove buttons are labelled via ariaRemoveLabel.'
      },
      {
        criterion: '3.3.2',
        status: 'built-in',
        note: 'A .chip-input-label <label> is wired to the ghost input via a generated `for` when it lacks one.'
      },
      {
        criterion: '2.1.1',
        status: 'partial',
        note: 'Enter adds a chip, Backspace/Delete and arrow keys move between input and chips; verify manually for full conformance.'
      },
      {
        criterion: '4.1.3',
        status: 'built-in',
        note: 'Adding and removing chips is announced through the inherited visually hidden role=status region next to the container. Verified here: typing a value and pressing Enter updates the region.'
      }
    ],
    html: `<div class="chip-input" id="a11yChipInput" data-coreui-chip-input>
    <label class="chip-input-label">Tags</label>
  </div>`,
    assertions: [
      {
        criterion: '4.1.3',
        label: 'adding a chip is announced in the status region',
        steps: [
          { click: '#a11yChipInput input' },
          { type: 'News' },
          { press: 'Enter' },
          { wait: 100 }
        ],
        run: 'const region = document.querySelector(\'.chip-input + [role="status"]\'); return Boolean(region && region.textContent.includes(\'added\'))'
      }
    ]
  },
  {
    component: 'components/chip-set',
    // Audit a representative labelled, selectable, removable set — that is
    // what exercises the component's own role/announcement wiring.
    html: `<div class="chip-set" aria-label="Applied filters" data-coreui-chip-set data-coreui-selectable="true" data-coreui-removable="true">
    <span class="chip">Alpha</span>
    <span class="chip">Beta</span>
  </div>`,
    assertions: [
      {
        criterion: '4.1.3',
        label: 'removing a chip is announced in the status region',
        steps: [{ click: '.chip .chip-remove' }, { wait: 100 }],
        run: 'const region = document.querySelector(\'.chip-set + [role="status"]\'); return Boolean(region && region.textContent.includes(\'removed\'))'
      }
    ],
    criteria: [
      {
        criterion: '2.1.1',
        status: 'partial',
        note: 'Arrow keys, Home/End move focus across chips; Enter/Space toggle selection; Backspace/Delete remove. Verify manually.'
      },
      {
        criterion: '4.1.2',
        status: 'built-in',
        note: 'A selectable set is exposed as a horizontal listbox of role=option chips (aria-selected/aria-disabled valid there); a standalone selectable chip is a toggle button with aria-pressed; a non-selectable set is a role=group, which also legitimizes the documented aria-label.'
      },
      {
        criterion: '1.3.1',
        status: 'built-in',
        note: 'The listbox contains only option children — the add/remove live region lives next to the set, not inside it.'
      },
      {
        criterion: '4.1.3',
        status: 'built-in',
        note: 'Adding and removing chips is announced through a visually hidden role=status region (labels configurable via ariaAddedAnnouncement/ariaRemovedAnnouncement). Verified here: removing a chip updates the region.'
      }
    ]
  },
  {
    component: 'forms/password-input',
    criteria: [
      {
        criterion: '4.1.2',
        status: 'built-in',
        note: 'The visibility toggle reflects its state via aria-pressed and the control stays a native password/text input.'
      },
      {
        criterion: '3.3.8',
        status: 'built-in',
        note: 'Paste is not blocked, and revealing the typed password reduces reliance on memory.'
      },
      {
        criterion: '3.3.2',
        status: 'author',
        note: 'Pair the input with a <label for> (shown in the docs examples).'
      }
    ]
  },
  {
    component: 'forms/password-strength',
    criteria: [
      {
        criterion: '4.1.3',
        status: 'built-in',
        note: 'The label, warning and suggestions share one role=status/aria-live=polite region, so the verdict is announced as a single polite message. Debouncing keeps the region from updating on every keystroke.'
      },
      {
        criterion: '1.4.1',
        status: 'built-in',
        note: 'Strength is carried by the text label, not by the bar colour alone; the segmented bar is aria-hidden because it only restates that label.'
      },
      {
        criterion: '3.3.2',
        status: 'author',
        note: 'Pair the password field with a <label for> (shown in the docs examples).'
      }
    ]
  },
  {
    component: 'forms/range',
    criteria: [
      {
        criterion: '4.1.2',
        status: 'built-in',
        note: 'The control is a native range input in both forms; the tooltip and the tick marks the plugin adds are aria-hidden decorations, so the value is announced once.'
      },
      {
        criterion: '2.1.1',
        status: 'built-in',
        note: 'Native range input, operable with the arrow keys; the plugin adds no focusable element.'
      },
      {
        criterion: '3.3.2',
        status: 'author',
        note: 'Label the input; the tooltip is aria-hidden and not a substitute for a label.'
      }
    ]
  },
  {
    component: 'forms/range-slider',
    criteria: [
      {
        criterion: '4.1.2',
        status: 'built-in',
        note: 'Each thumb is a role=slider input with aria-valuemin/max/now and aria-orientation; multi-thumb sliders get per-thumb aria-label (ariaLabels) and aria-valuetext when tooltipsFormat is set.'
      },
      {
        criterion: '2.1.1',
        status: 'partial',
        note: 'Thumbs are native range inputs operable with arrow keys; verify multi-thumb clamping manually.'
      },
      {
        criterion: '3.3.2',
        status: 'author',
        note: 'Label the slider group; per-thumb labels default to Minimum/Maximum value only for two thumbs.'
      }
    ]
  },
  {
    component: 'forms/rating',
    criteria: [
      {
        criterion: '4.1.2',
        status: 'built-in',
        note: 'Each item is a native radio input named via the ariaLabel config (default \'N of M\'), so the group exposes name, role, and checked state.'
      },
      {
        criterion: '2.1.1',
        status: 'partial',
        note: 'Native radios move with arrow keys; verify the readOnly/disabled variants manually.'
      },
      {
        criterion: '1.4.1',
        status: 'author',
        note: 'The filled/empty stars are also distinguished by shape, but confirm custom icon sets keep a non-color cue.'
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // Components
  // ---------------------------------------------------------------------------
  {
    component: 'components/menu',
    html: `<button class="btn btn-primary" type="button" id="a11yMenuToggle" data-coreui-toggle="menu" aria-expanded="false">
    Toggle menu
  </button>
  <div class="menu">
    <a class="menu-item" href="#">Menu item 1</a>
    <a class="menu-item" href="#">Menu item 2</a>
    <a class="menu-item" href="#">Menu item 3</a>
  </div>`,
    interactions: [
      { click: '#a11yMenuToggle' },
      { wait: 150 }
    ],
    assertions: [
      {
        criterion: '2.1.1',
        label: 'ArrowDown from the open toggle moves focus to a menu item',
        steps: [{ press: 'ArrowDown' }, { wait: 100 }],
        run: 'return !!(document.activeElement && document.activeElement.classList.contains(\'menu-item\'))'
      }
    ],
    criteria: [
      {
        criterion: '2.1.1',
        status: 'built-in',
        note: 'Full keyboard support: arrows to move, Enter/Space to activate, Esc to close, Home/End to jump, Tab to move on. Verified here: ArrowDown moves focus into the menu.'
      },
      {
        criterion: '1.4.13',
        status: 'built-in',
        note: 'Submenus opened on hover stay open while hovered and dismiss with Esc, with a grace delay for diagonal movement.'
      },
      {
        criterion: '2.4.7',
        status: 'built-in',
        note: 'Focused menu items show a visible focus indicator (verify visually).'
      },
      {
        criterion: '4.1.2',
        status: 'author',
        note: 'Menus are intentionally generic — add role=\'menu\'/\'menuitem\' and aria-* yourself when building a true ARIA menu widget.'
      }
    ]
  },
  {
    component: 'components/navs-tabs',
    html: `<ul class="nav nav-tabs" id="a11yTab" role="tablist">
    <li class="nav-item" role="presentation">
      <button class="nav-link active" id="a11yTabHome" data-coreui-toggle="tab" data-coreui-target="#a11yTabHomePane" type="button" role="tab" aria-controls="a11yTabHomePane" aria-selected="true">Home</button>
    </li>
    <li class="nav-item" role="presentation">
      <button class="nav-link" id="a11yTabProfile" data-coreui-toggle="tab" data-coreui-target="#a11yTabProfilePane" type="button" role="tab" aria-controls="a11yTabProfilePane" aria-selected="false">Profile</button>
    </li>
  </ul>
  <div class="tab-content">
    <div class="tab-pane fade show active" id="a11yTabHomePane" role="tabpanel" aria-labelledby="a11yTabHome" tabindex="0"><p>Home content.</p></div>
    <div class="tab-pane fade" id="a11yTabProfilePane" role="tabpanel" aria-labelledby="a11yTabProfile" tabindex="0"><p>Profile content.</p></div>
  </div>`,
    interactions: [
      { focus: '#a11yTabHome' }
    ],
    assertions: [
      {
        criterion: '2.1.1',
        label: 'ArrowRight moves roving focus to the next tab',
        steps: [{ press: 'ArrowRight' }, { wait: 100 }],
        run: 'return document.activeElement && document.activeElement.id === \'a11yTabProfile\''
      }
    ],
    criteria: [
      {
        criterion: '2.1.1',
        status: 'built-in',
        note: 'Arrow/Home/End keys move a roving tabindex across tabs and activate the focused tab. Verified here: ArrowRight advances focus.'
      },
      {
        criterion: '4.1.2',
        status: 'partial',
        note: 'JS sets role=tablist/tab/tabpanel, aria-selected, aria-labelledby, and a roving tabindex (audited here). GAP: it does not set aria-controls (author must) and does not aria-hidden inactive panels.'
      },
      {
        criterion: '2.4.3',
        status: 'partial',
        note: 'GAP: `_deactivate()` calls blur() on the outgoing tab, which can momentarily drop focus; verify focus order across panels manually.'
      }
    ]
  },
  {
    component: 'forms/stepper',
    criteria: [
      {
        criterion: '4.1.2',
        status: 'built-in',
        note: 'JS sets role=tab/tabpanel with aria-selected, aria-controls and aria-labelledby across step buttons and panes, and mirrors visibility via aria-hidden.'
      },
      {
        criterion: '2.1.1',
        status: 'partial',
        note: 'Arrow keys move between step triggers; linear mode intentionally blocks skipping ahead. Verify manually.'
      },
      {
        criterion: '4.1.3',
        status: 'built-in',
        note: 'Step panes are aria-live=polite, so step changes are announced without moving focus.'
      }
    ]
  },
  {
    component: 'components/modal',
    html: `<button type="button" class="btn btn-primary" id="a11yModalTrigger" data-coreui-toggle="modal" data-coreui-target="#a11yModal">
    Open modal
  </button>
  <div class="modal fade" id="a11yModal" tabindex="-1" aria-labelledby="a11yModalTitle" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="a11yModalTitle">Modal title</h5>
          <button type="button" class="btn-close" data-coreui-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body"><p>Modal body text.</p></div>
      </div>
    </div>
  </div>`,
    interactions: [
      { click: '#a11yModalTrigger' },
      { wait: 500 }
    ],
    assertions: [
      {
        criterion: '2.4.3',
        label: 'opening the modal moves focus inside it',
        run: 'const modal = document.getElementById(\'a11yModal\'); return !!(document.activeElement && modal.contains(document.activeElement) || document.activeElement === modal)'
      },
      {
        criterion: '2.1.1',
        label: 'Escape closes the modal',
        steps: [{ press: 'Escape' }, { wait: 500 }],
        run: 'return !document.getElementById(\'a11yModal\').classList.contains(\'show\')'
      }
    ],
    criteria: [
      {
        criterion: '4.1.2',
        status: 'partial',
        note: 'JS sets role=dialog and aria-modal while open and manages aria-hidden (audited here in the open state). Author supplies aria-labelledby and the dismiss button label.'
      },
      {
        criterion: '2.4.3',
        status: 'built-in',
        note: 'Opening moves focus into the dialog and the focus trap keeps Tab cycling inside. Verified here.'
      },
      {
        criterion: '2.1.1',
        status: 'built-in',
        note: 'Escape closes the dialog (keyboard: true default). Verified here.'
      },
      {
        criterion: '2.1.2',
        status: 'built-in',
        note: 'The focus trap releases on hide, so focus is never permanently trapped.'
      }
    ]
  },
  {
    component: 'components/offcanvas',
    html: `<button class="btn btn-primary" type="button" id="a11yOffcanvasTrigger" data-coreui-toggle="offcanvas" data-coreui-target="#a11yOffcanvas" aria-controls="a11yOffcanvas">
    Open offcanvas
  </button>
  <div class="offcanvas offcanvas-start" tabindex="-1" id="a11yOffcanvas" aria-labelledby="a11yOffcanvasTitle">
    <div class="offcanvas-header">
      <h5 class="offcanvas-title" id="a11yOffcanvasTitle">Offcanvas</h5>
      <button type="button" class="btn-close" data-coreui-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body"><p>Offcanvas body text.</p></div>
  </div>`,
    interactions: [
      { click: '#a11yOffcanvasTrigger' },
      { wait: 500 }
    ],
    assertions: [
      {
        criterion: '2.1.1',
        label: 'Escape closes the offcanvas',
        steps: [{ press: 'Escape' }, { wait: 500 }],
        run: 'return !document.getElementById(\'a11yOffcanvas\').classList.contains(\'show\')'
      }
    ],
    criteria: [
      {
        criterion: '4.1.2',
        status: 'partial',
        note: 'JS sets role=dialog and aria-modal while open (audited here in the open state); with backdrop: false they are removed and the page stays interactive. Author supplies aria-labelledby and the dismiss button label.'
      },
      {
        criterion: '2.1.1',
        status: 'built-in',
        note: 'Escape closes the panel (keyboard: true default). Verified here.'
      },
      {
        criterion: '2.1.2',
        status: 'built-in',
        note: 'The focus trap (with backdrop) releases on hide, so focus is never permanently trapped.'
      }
    ]
  },
  {
    component: 'components/tooltips',
    html: `<button type="button" class="btn btn-secondary" id="a11yTooltipTrigger" data-coreui-toggle="tooltip" data-coreui-title="Tooltip text">
    Hover or focus me
  </button>`,
    interactions: [
      { focus: '#a11yTooltipTrigger' },
      { wait: 500 }
    ],
    criteria: [
      {
        criterion: '1.4.3',
        status: 'built-in',
        note: 'The label text renders at full opacity — the translucency lives in the surface colour (audited here in the shown state).'
      },
      {
        criterion: '4.1.2',
        status: 'built-in',
        note: 'The tip has role=tooltip and the trigger is wired to it via aria-describedby while shown (audited here).'
      },
      {
        criterion: '1.4.13',
        status: 'partial',
        note: 'Shown on hover and focus, dismissed on blur/mouseleave. GAP: the default tip is not itself hoverable — moving the pointer onto it dismisses it.'
      }
    ]
  },
  {
    component: 'components/popovers',
    html: `<button type="button" class="btn btn-secondary" id="a11yPopoverTrigger" data-coreui-toggle="popover" data-coreui-title="Popover title" data-coreui-content="Popover body content.">
    Toggle popover
  </button>`,
    interactions: [
      { click: '#a11yPopoverTrigger' },
      { wait: 500 }
    ],
    criteria: [
      {
        criterion: '1.4.3',
        status: 'built-in',
        note: 'Popover header and body text meet the contrast minimum against the popover surface (audited here in the shown state).'
      },
      {
        criterion: '4.1.2',
        status: 'built-in',
        note: 'The trigger is wired to the tip via aria-describedby while shown (audited here).'
      },
      {
        criterion: '2.1.1',
        status: 'built-in',
        note: 'Click/Enter toggles the popover on a focusable trigger; the default trigger is click, not hover-only.'
      }
    ]
  },
  {
    component: 'components/toasts',
    criteria: [
      {
        criterion: '1.4.3',
        status: 'built-in',
        note: 'Toast text meets the contrast minimum against the toast surface (audited on the docs examples).'
      },
      {
        criterion: '4.1.3',
        status: 'author',
        note: 'Wrap toasts (or their container) in an aria-live region — role=alert or aria-live=polite — as shown in the docs, so they are announced.'
      },
      {
        criterion: '2.2.1',
        status: 'partial',
        note: 'Toasts auto-hide after 5s by default; set autohide: false (or a longer delay) for messages users must be able to finish reading.'
      }
    ]
  },
  {
    component: 'components/accordion',
    html: `<div class="accordion" id="a11yAccordion">
    <details class="accordion-item" name="a11yAccordion" open>
      <summary class="accordion-header"><h3>First</h3></summary>
      <div class="accordion-body">First panel.</div>
    </details>
    <details class="accordion-item" name="a11yAccordion">
      <summary class="accordion-header"><h3>Second</h3></summary>
      <div class="accordion-body">Second panel.</div>
    </details>
  </div>`,
    interactions: [
      { focus: '#a11yAccordion > .accordion-item:last-of-type > .accordion-header' }
    ],
    assertions: [
      {
        criterion: '2.1.1',
        label: 'Enter on a collapsed header opens its panel',
        steps: [{ press: 'Enter' }, { wait: 100 }],
        run: 'return document.querySelector(\'#a11yAccordion > .accordion-item:last-of-type\').open === true'
      },
      {
        criterion: '2.1.1',
        label: 'Enter on an expanded header closes it again',
        steps: [{ press: 'Enter' }, { wait: 100 }],
        run: 'return document.querySelector(\'#a11yAccordion > .accordion-item:last-of-type\').open === false'
      },
      {
        criterion: '1.3.1',
        label: 'A heading inside the summary stays exposed as a heading',
        run: 'return document.querySelector(\'#a11yAccordion .accordion-header > h3\') !== null'
      }
    ],
    criteria: [
      {
        criterion: '2.1.1',
        status: 'built-in',
        note: 'The header is a <summary>, so Enter/Space toggle its panel and Tab reaches every header without a roving tabindex. Verified here in both directions. APG also lists optional Arrow/Home/End navigation between headers, which we do not implement.'
      },
      {
        criterion: '4.1.2',
        status: 'partial',
        note: 'The browser exposes the disclosure role and the expanded state from <details>/<summary>; nothing is bookkept in ARIA. Chromium reports role DisclosureTriangle (DisclosureTriangleGrouped when items share a name) with expanded=true|false. GAP vs the APG pattern: the header is not role=button, carries no aria-controls, and the panel is not role=region + aria-labelledby.'
      },
      {
        criterion: '1.3.1',
        status: 'partial',
        note: 'A bare <summary> is not a heading. The docs show wrapping the label in <h2>-<h6> inside the summary, which keeps the sections reachable by heading navigation; APG instead wraps the button in the heading. Authors who skip the heading lose that navigation.'
      },
      {
        criterion: '2.4.7',
        status: 'built-in',
        note: 'The header draws a focus ring on :focus-visible, so keyboard focus is visible while a mouse click leaves it alone.'
      },
      {
        criterion: '1.4.3',
        status: 'built-in',
        note: 'Header text meets the contrast minimum in both the resting and the open state (audited on the examples above).'
      }
    ]
  },
  {
    component: 'components/alerts',
    criteria: [
      {
        criterion: '1.4.3',
        status: 'built-in',
        note: 'Alert text meets the contrast minimum against each contextual background (audited on the docs examples).'
      },
      {
        criterion: '4.1.3',
        status: 'author',
        note: 'The docs examples carry role=alert; dynamically injected alerts must add it (or an aria-live region) themselves.'
      },
      {
        criterion: '4.1.2',
        status: 'partial',
        note: 'Dismissible alerts get a .btn-close whose accessible name comes from the author\'s aria-label (audited on the docs examples).'
      }
    ]
  }
]
