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
 *               snippets are the markup under test, each one's `sandboxJs`
 *               snippet running alongside it so options-driven examples render
 *               the same as on the page).
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
        note: 'Pasting a full code, or receiving it from SMS autofill or a password manager, fills every field at once. The first field carries autocomplete="one-time-code", so autofill targets the code as one entry.'
      },
      {
        criterion: '1.3.5',
        status: 'built-in',
        note: 'The first field carries autocomplete="one-time-code", and every field gets inputmode="numeric" when the code is numeric, so browsers and autofill know what the input is for.'
      },
      {
        criterion: '3.3.2',
        status: 'built-in',
        note: 'Each digit input carries its own aria-label (default \'Digit N of M\' via the ariaLabel config).'
      },
      {
        criterion: '4.1.2',
        status: 'built-in',
        note: 'The container is a role=group and each field is a native input with its own name ("Digit N of M" by default), recomputed from the number of fields. Name the group with aria-label or aria-labelledby so it reads as one code entry.'
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
        note: 'The input gets role=combobox with aria-autocomplete, aria-expanded and aria-haspopup, plus aria-controls while the dropdown is open; the dropdown is a listbox of role=option items carrying aria-selected/aria-disabled.'
      },
      {
        criterion: '4.1.3',
        status: 'partial',
        note: 'When searchNoResultsLabel is set, the "no results" message is a role=status region inside the open list, so it is announced without moving focus. Without it, the list closes when nothing matches.'
      },
      {
        criterion: '2.1.1',
        status: 'partial',
        note: 'Arrow keys move through the options, Enter picks one, Esc closes the list and Tab moves on, or accepts the inline hint when hints are shown. Home, End and Space stay with the text in the input.'
      },
      {
        criterion: '3.3.2',
        status: 'author',
        note: 'Give the input a visible label, pointed at it through the id option, or an aria-label; a placeholder is not a label.'
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
        note: 'The toggler is a role=combobox named from its label, with aria-expanded and aria-haspopup=dialog, and aria-controls pointing at the role=dialog panel while it is open; the search input points at the list. The options are a role=listbox (multiselectable when multiple selection is on) of role=option items, and the native select is hidden from assistive technology.'
      },
      {
        criterion: '4.1.3',
        status: 'built-in',
        note: 'Removing values from the field, with a chip\'s remove button, the clear button or Backspace, is announced in a visually hidden polite live region on the page. Choosing options in the list is conveyed by each option\'s selected state.'
      },
      {
        criterion: '2.1.1',
        status: 'partial',
        note: 'Enter or ArrowDown opens the panel; arrow keys and Home/End move through the options, Space or Enter selects, Esc closes the panel and Tab moves on.'
      },
      {
        criterion: '3.3.2',
        status: 'author',
        note: 'Name the control with a label pointing at the select, or aria-label or aria-labelledby on the select; a placeholder is not a label.'
      }
    ]
  },
  {
    component: 'forms/date-picker',
    interactions: [
      { click: '[data-coreui-timepicker="true"] .form-control-action' },
      { wait: 200 }
    ],
    assertions: [
      {
        criterion: '2.4.3',
        label: 'picking a day with the keyboard hands focus back to the field',
        steps: [
          { press: 'Escape' },
          { wait: 200 },
          { focus: '.picker .form-date-time-section' },
          { press: 'Alt+ArrowDown' },
          { wait: 250 },
          { press: 'Enter' },
          { wait: 400 }
        ],
        run: 'const picker = document.querySelector(\'.date-picker\'); return Boolean(document.activeElement && picker && picker.contains(document.activeElement))'
      },
      {
        criterion: '2.4.3',
        label: 'Tab stays inside the open panel and never lands back on the field',
        steps: [
          { focus: '.picker .form-date-time-section' },
          { press: 'Alt+ArrowDown' },
          { wait: 250 },
          { press: 'Tab' },
          { press: 'Tab' },
          { wait: 150 }
        ],
        run: 'const panel = document.querySelector(\'.date-picker-popup.show\'); return Boolean(panel && document.activeElement && panel.contains(document.activeElement))'
      }
    ],
    criteria: [
      {
        criterion: '4.1.2',
        status: 'built-in',
        note: 'The toggle carries aria-haspopup=dialog and aria-expanded, plus aria-controls while the panel is open, and the panel is a role=dialog with aria-modal. With a time part, the dialog holds the calendar and the time controls together.'
      },
      {
        criterion: '1.3.1',
        status: 'built-in',
        note: 'The open panel is a grid of gridcells; the navigation buttons sit outside it.'
      },
      {
        criterion: '2.1.1',
        status: 'partial',
        note: 'Alt+ArrowDown or F4 opens the panel, Esc closes it, and the arrow keys walk the calendar.'
      },
      {
        criterion: '2.4.3',
        status: 'built-in',
        note: 'The panel is a modal dialog, so Tab cycles inside it and never lands back on the field. Closing it, with Esc or by picking a day, returns focus to the field.'
      }
    ]
  },
  {
    component: 'forms/date-range-picker',
    interactions: [
      { click: '.picker .form-control-action' },
      { wait: 200 }
    ],
    criteria: [
      {
        criterion: '4.1.2',
        status: 'built-in',
        note: 'Both calendars open under one toggle that carries aria-haspopup=dialog and aria-expanded, plus aria-controls while the panel is open. The range is a group of two date fields whose parts are spinbuttons, and the separator icon is hidden from assistive technology.'
      },
      {
        criterion: '1.3.1',
        status: 'built-in',
        note: 'Each calendar in the open panel is a grid of gridcells.'
      },
      {
        criterion: '2.1.1',
        status: 'partial',
        note: 'Alt+ArrowDown or F4 opens the panel, Esc closes it, and the arrow keys walk both calendars.'
      }
    ]
  },
  {
    component: 'forms/time-picker',
    interactions: [
      { click: '.picker .form-control-action' },
      { wait: 200 }
    ],
    criteria: [
      {
        criterion: '4.1.2',
        status: 'built-in',
        note: 'The toggle carries aria-haspopup=dialog and aria-expanded, plus aria-controls while the panel is open, and the panel is a role=dialog.'
      },
      {
        criterion: '1.3.1',
        status: 'built-in',
        note: 'The open panel is a group named "Time" holding a labelled list for hours and minutes, for seconds when they are shown, and for AM/PM in 12-hour format.'
      },
      {
        criterion: '2.1.1',
        status: 'partial',
        note: 'Alt+ArrowDown or F4 opens the panel, Esc closes it, the up and down arrows walk a time list and the left and right arrows move between lists.'
      }
    ]
  },
  {
    component: 'forms/combobox',
    // The options live in a popup that starts hidden, so open one before axe
    // runs — a collapsed combobox hides the listbox from the audit entirely.
    interactions: [
      { click: '.combobox-toggle[data-coreui-name="option"]' },
      { wait: 100 }
    ],
    criteria: [
      {
        criterion: '4.1.2',
        status: 'built-in',
        note: 'The toggle is a button with aria-haspopup=listbox and aria-expanded that drives the list through aria-activedescendant; the list is a role=listbox of role=option items with aria-selected. The hidden select that submits the value is kept out of the accessibility tree.'
      },
      {
        criterion: '1.3.1',
        status: 'built-in',
        note: 'The opened listbox contains only option and group children — the caret and the hidden input sit outside it.'
      },
      {
        criterion: '2.1.1',
        status: 'partial',
        note: 'Enter or ArrowDown opens the list. Arrow keys, Home/End and typing a letter move through it, Enter or Space picks, Esc closes it and Tab moves on. With a search field, Home, End and Space stay with the search text.'
      },
      {
        criterion: '3.3.2',
        status: 'author',
        note: 'Name the toggle with a visible label or aria-label; a placeholder is not a label.'
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
        note: 'Enter adds a chip. From the start of an empty input, Backspace, Delete or the arrow toward the chips moves to the last chip; arrow keys and Home/End move between chips, and Backspace or Delete removes the focused one.'
      },
      {
        criterion: '4.1.3',
        status: 'built-in',
        note: 'Adding and removing chips is announced in a visually hidden polite live region on the page.'
      }
    ],
    html: `<div class="chip-input" id="a11yChipInput" data-coreui-chip-input>
    <label class="chip-input-label">Tags</label>
  </div>`,
    assertions: [
      {
        criterion: '4.1.3',
        label: 'adding a chip is announced in the live region of the page',
        steps: [
          { click: '#a11yChipInput input' },
          { type: 'News' },
          { press: 'Enter' },
          { wait: 250 }
        ],
        run: 'const region = document.querySelector(\'[data-coreui-live-announcer] [aria-live="polite"]\'); return Boolean(region && region.textContent.includes(\'News added\'))'
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
        label: 'removing a chip is announced in the live region of the page',
        steps: [{ click: '.chip .chip-remove' }, { wait: 250 }],
        run: 'const region = document.querySelector(\'[data-coreui-live-announcer] [aria-live="polite"]\'); return Boolean(region && region.textContent.includes(\'removed\'))'
      }
    ],
    criteria: [
      {
        criterion: '2.1.1',
        status: 'partial',
        note: 'Arrow keys and Home/End move focus across chips, Enter or Space toggles selection, and Backspace or Delete removes a chip.'
      },
      {
        criterion: '4.1.2',
        status: 'built-in',
        note: 'A selectable set is exposed as a horizontal listbox of role=option chips (aria-selected/aria-disabled valid there); a standalone selectable chip is a toggle button with aria-pressed; a non-selectable set is a role=group, which also legitimizes the documented aria-label.'
      },
      {
        criterion: '1.3.1',
        status: 'built-in',
        note: 'The listbox contains only option children; additions and removals are announced through the live region of the page, not from inside the set.'
      },
      {
        criterion: '4.1.3',
        status: 'built-in',
        note: 'Adding and removing chips is announced in a visually hidden polite live region on the page; the wording comes from ariaAddedAnnouncement and ariaRemovedAnnouncement.'
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
        note: 'Each thumb is a native range input, which exposes its value, minimum and maximum, with aria-orientation when vertical; multi-thumb sliders get a per-thumb aria-label (ariaLabel), and aria-valuetext carries the tooltipsFormat text or the label of the tick a thumb sits on.'
      },
      {
        criterion: '2.1.1',
        status: 'partial',
        note: 'Each thumb is a native range input operated with the arrow keys, and a thumb cannot be moved past its neighbour.'
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
        note: 'The stars are native radio buttons, so Tab reaches the group and the arrow keys change the value; in read-only mode the arrow keys do nothing.'
      },
      {
        criterion: '1.4.1',
        status: 'author',
        note: 'Selected and unselected stars have the same shape and differ only in colour. The value is exposed through the checked radio; where sighted users must read the rating, show the value as text or use icons with distinct filled and outline shapes.'
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // Components
  // ---------------------------------------------------------------------------
  {
    component: 'components/calendar',
    criteria: [
      {
        criterion: '4.1.2',
        status: 'built-in',
        note: 'The calendar is a role=grid of role=gridcell cells, so a day, month, quarter or year can be marked selected. Every cell carries an aria-label with its full date, today\'s cell carries aria-current="date", and a week row carries aria-selected when whole weeks are selectable.'
      },
      {
        criterion: '1.3.1',
        status: 'built-in',
        note: 'Rows and cells keep their grid roles in every panel, so the months, quarters and years views read as a grid rather than a bare table.'
      },
      {
        criterion: '2.1.1',
        status: 'partial',
        note: 'Arrow keys walk the grid, Home and End jump to the edges of the row, Page Up and Page Down change the period, and Enter picks.'
      }
    ]
  },
  {
    component: 'components/list-box',
    criteria: [
      {
        criterion: '4.1.2',
        status: 'built-in',
        note: 'The list is a role=listbox with aria-multiselectable, aria-disabled and aria-busy following the options; every option is a role=option with aria-selected unless selection is off. A companion field gets aria-controls and aria-activedescendant while the list is on the page, and the search input is named by ariaSearchLabel.'
      },
      {
        criterion: '1.3.1',
        status: 'author',
        note: 'GAP: two kinds of children break the listbox\'s required-children rule: a group label made selectable with sectionsSelectable is a role=button inside the list, and the empty-state message stays inside the list when a filter hides every option.'
      },
      {
        criterion: '2.1.1',
        status: 'partial',
        note: 'Arrow keys, Home/End, Space, Shift and Ctrl ranges and Ctrl+A operate the list, typing a letter jumps to a matching option, and the highlighted option is kept in view.'
      }
    ]
  },
  {
    component: 'components/transfer',
    criteria: [
      {
        criterion: '4.1.2',
        status: 'built-in',
        note: 'Each move button is named by ariaMoveToTargetLabel, ariaMoveToSourceLabel, ariaMoveAllToTargetLabel or ariaMoveAllToSourceLabel unless it already has an aria-label, and points at the list it fills through aria-controls. Each side\'s options are a role=listbox named from the side title when they have no name of their own.'
      },
      {
        criterion: '1.3.1',
        status: 'built-in',
        note: 'Both sides are listboxes holding only option and group children; the select-all header and the move buttons sit outside them.'
      },
      {
        criterion: '2.1.1',
        status: 'partial',
        note: 'Each list is operated like a standalone list box, and the move buttons sit between the lists in the tab order.'
      },
      {
        criterion: '4.1.3',
        status: 'built-in',
        note: 'Every move is announced in a visually hidden polite live region on the page, with the number of items and the destination list (ariaMovedAnnouncement).'
      }
    ],
    assertions: [
      {
        criterion: '4.1.3',
        label: 'moving an option is announced in the live region of the page',
        steps: [
          { click: '#transferItems [data-coreui-transfer-list="source"] .list-box-option' },
          { click: '#transferItems [data-coreui-transfer-move="target"]' },
          { wait: 250 }
        ],
        run: 'const region = document.querySelector(\'[data-coreui-live-announcer] [aria-live="polite"]\'); return Boolean(region && region.textContent.includes(\'moved to\'))'
      }
    ]
  },
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
        note: 'Arrow keys move between items, Enter or Space activates one, Home and End jump to the first and last item, Esc closes the menu and returns focus to the toggle, and Tab moves on.'
      },
      {
        criterion: '1.4.13',
        status: 'built-in',
        note: 'Submenus opened on hover stay open while hovered and dismiss with Esc, with a grace delay for diagonal movement.'
      },
      {
        criterion: '2.4.7',
        status: 'built-in',
        note: 'A focused menu item gets the same highlighted background as a hovered one.'
      },
      {
        criterion: '4.1.2',
        status: 'author',
        note: 'Menus are intentionally generic — add role=\'menu\'/\'menuitem\' and aria-* yourself when building a true ARIA menu widget.'
      }
    ]
  },
  {
    component: 'components/context-menu',
    html: `<div id="a11yContextMenuArea" tabindex="0" data-coreui-toggle="context-menu">Right-click here</div>
  <div class="menu">
    <a class="menu-item" href="#">Menu item 1</a>
    <a class="menu-item" href="#">Menu item 2</a>
  </div>`,
    assertions: [
      {
        criterion: '2.1.1',
        label: 'Shift+F10 on the focused trigger opens the menu and moves focus into it',
        steps: [{ focus: '#a11yContextMenuArea' }, { press: 'Shift+F10' }, { wait: 100 }],
        run: 'return !!(document.activeElement && document.activeElement.classList.contains(\'menu\'))'
      },
      {
        criterion: '2.1.1',
        label: 'ArrowDown in the open menu moves focus to a menu item',
        steps: [{ press: 'ArrowDown' }, { wait: 100 }],
        run: 'return !!(document.activeElement && document.activeElement.classList.contains(\'menu-item\'))'
      },
      {
        criterion: '2.1.2',
        label: 'Escape closes the menu and returns focus to the trigger',
        steps: [{ press: 'Escape' }, { wait: 100 }],
        run: 'return document.activeElement === document.getElementById(\'a11yContextMenuArea\')'
      }
    ],
    criteria: [
      {
        criterion: '2.1.1',
        status: 'built-in',
        note: 'Shift+F10 and the Menu key open the menu at the focused trigger and move focus into it; arrow keys, Enter or Space, Home/End, Esc and Tab operate it.'
      },
      {
        criterion: '2.1.2',
        status: 'built-in',
        note: 'Esc closes the menu and returns focus to the trigger; Tab leaves the menu and closes it.'
      },
      {
        criterion: '2.4.7',
        status: 'built-in',
        note: 'A focused menu item gets the same highlighted background as a hovered one.'
      },
      {
        criterion: '4.1.2',
        status: 'author',
        note: 'Give a non-interactive trigger tabindex="0" and a nearby hint that a context menu exists; add role=\'menu\'/\'menuitem\' yourself for a true ARIA menu widget.'
      }
    ]
  },
  {
    component: 'components/tab',
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
        note: 'Arrow keys, Home and End move focus across the tabs with a roving tabindex and activate the focused tab.'
      },
      {
        criterion: '4.1.2',
        status: 'partial',
        note: 'The plugin adds role=tablist, tab and tabpanel, aria-selected, aria-labelledby on each panel and a roving tabindex where the markup lacks them. GAP: it does not add aria-controls, so give each tab one that points at its panel.'
      },
      {
        criterion: '2.4.3',
        status: 'partial',
        note: 'GAP: switching tabs from script while the active tab has focus drops focus to the page, because the outgoing tab is blurred.'
      }
    ]
  },
  {
    component: 'forms/stepper',
    criteria: [
      {
        criterion: '4.1.2',
        status: 'built-in',
        note: 'With panes below the step list, the steps are a tablist of role=tab buttons with aria-selected, each linked to its role=tabpanel pane through aria-controls and aria-labelledby. When each step holds its own content, the step buttons are disclosure buttons with aria-expanded. Inactive panes carry aria-hidden.'
      },
      {
        criterion: '2.1.1',
        status: 'partial',
        note: 'Arrow keys, Home and End move between step buttons; in linear mode the steps after the next one are disabled.'
      },
      {
        criterion: '4.1.3',
        status: 'built-in',
        note: 'When a step fails validation, focus moves to the first invalid field and its error message is added to that field\'s aria-describedby, so it is read with the field; when focus cannot move there, the message is announced in a polite live region on the page. A step change made while focus is inside the stepper moves focus to the new step button.'
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
        note: 'The modal is a native dialog element opened as a modal dialog, so the browser exposes its role and makes the rest of the page inert while it is open. Name it with aria-labelledby pointing at its title and give the dismiss button an accessible name.'
      },
      {
        criterion: '2.4.3',
        status: 'built-in',
        note: 'Opening moves focus into the dialog, and the rest of the page is inert while it is open, so Tab stays within the dialog. Closing it returns focus to the button that opened it.'
      },
      {
        criterion: '2.1.1',
        status: 'built-in',
        note: 'Esc closes the dialog unless the keyboard option is set to false.'
      },
      {
        criterion: '2.1.2',
        status: 'built-in',
        note: 'Esc and the dismiss button close the dialog and make the page interactive again, so focus is never trapped.'
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
        note: 'The offcanvas is a native dialog element. With a backdrop, or with page scrolling off, it opens as a modal dialog and the rest of the page is inert; with backdrop: false and scroll: true it opens non-modally and the page stays interactive. Name it with aria-labelledby and give the dismiss button an accessible name.'
      },
      {
        criterion: '2.1.1',
        status: 'built-in',
        note: 'Esc closes the panel unless the keyboard option is set to false.'
      },
      {
        criterion: '2.1.2',
        status: 'built-in',
        note: 'Esc and the dismiss button close the panel and make the page interactive again, and focus returns to the trigger, so focus is never trapped.'
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
        note: 'The tooltip text stays fully opaque; only the background is translucent, so the text keeps its contrast.'
      },
      {
        criterion: '4.1.2',
        status: 'built-in',
        note: 'The tip has role=tooltip, and the trigger points at it through aria-describedby while it is shown.'
      },
      {
        criterion: '1.4.13',
        status: 'built-in',
        note: 'Shown on hover and focus. The tip stays open while the pointer moves onto it or focus moves into it, and closes once both leave; Esc dismisses it without moving focus.'
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
        note: 'Popover header and body text meet the contrast minimum against the popover surface.'
      },
      {
        criterion: '4.1.2',
        status: 'built-in',
        note: 'The popover has role=tooltip, and the trigger points at it through aria-describedby while it is shown.'
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
        note: 'Toast text meets the contrast minimum against the toast surface.'
      },
      {
        criterion: '4.1.3',
        status: 'author',
        note: 'Put toasts in a live region so they are announced: role="alert" with aria-live="assertive" as in the examples, or role="status" with aria-live="polite" for less urgent messages.'
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
        note: 'Each header is a native summary element, so Enter and Space toggle its panel and Tab reaches every header. Arrow, Home and End keys do not move between headers.'
      },
      {
        criterion: '4.1.2',
        status: 'partial',
        note: 'The browser exposes each header and its expanded state from the native details and summary elements. GAP: the header is not exposed as a button with aria-controls, and the panel is not a labelled region.'
      },
      {
        criterion: '1.3.1',
        status: 'partial',
        note: 'A bare summary element is not a heading. Wrap the label in an h2–h6 inside the summary, as the examples do, so the sections stay reachable by heading navigation.'
      },
      {
        criterion: '2.4.7',
        status: 'built-in',
        note: 'The header draws a focus ring on :focus-visible, so keyboard focus is visible while a mouse click leaves it alone.'
      },
      {
        criterion: '1.4.3',
        status: 'built-in',
        note: 'Header text meets the contrast minimum in both the closed and the open state.'
      }
    ]
  },
  {
    component: 'components/alerts',
    criteria: [
      {
        criterion: '1.4.3',
        status: 'built-in',
        note: 'Alert text meets the contrast minimum against each contextual background.'
      },
      {
        criterion: '4.1.3',
        status: 'author',
        note: 'The docs examples carry role=alert; dynamically injected alerts must add it (or an aria-live region) themselves.'
      },
      {
        criterion: '4.1.2',
        status: 'partial',
        note: 'The dismiss button gets its accessible name from the aria-label you give it, as in the examples.'
      }
    ]
  }
]
