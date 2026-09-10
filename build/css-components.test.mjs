/*!
 * Tests for the class ownership index emitted next to the component manifest.
 * Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { classIndex, layersOf } from './css-components.mjs'

const index = sheets => classIndex(new Map(Object.entries(sheets)))

describe('classIndex', () => {
  it('gives a class to the stylesheet that declares it as a rule of its own', () => {
    assert.deepEqual(index({ transitions: '.fade { transition: opacity .15s linear }' }), { fade: 'transitions' })
  })

  it('reads a declaration that carries pseudo-classes', () => {
    assert.deepEqual(index({ buttons: '.btn:disabled { pointer-events: none }' }), { btn: 'buttons' })
  })

  it('prefers the declaring stylesheet over one that only styles a descendant', () => {
    assert.deepEqual(
      index({ buttons: '.btn { padding: 0 }', badge: '.btn .badge { top: 0 }' }),
      { badge: 'badge', btn: 'buttons' }
    )
  })

  it('gives a class no stylesheet declares to the one that styles it as a subject', () => {
    assert.deepEqual(
      index({ nav: '.tab-content > .tab-pane { display: none }', card: '.card { border: 0 }' }),
      { card: 'card', 'tab-content': 'nav', 'tab-pane': 'nav' }
    )
  })

  it('gives a class only ever used as a context to the one stylesheet that styles under it', () => {
    assert.deepEqual(
      index({ 'forms/number-input': '.number-input .form-control { padding: 0 }', 'forms/form-control': '.form-control { display: block }' }),
      { 'form-control': 'forms/form-control', 'number-input': 'forms/number-input' }
    )
  })

  it('leaves out a state several stylesheets style', () => {
    const owners = index({ alert: '.alert.fade.show { opacity: 1 }', modal: '.modal.show { display: block }' })
    assert.equal(owners.show, undefined)
    assert.deepEqual([owners.alert, owners.modal], ['alert', 'modal'])
  })

  it('ignores the arguments of a functional pseudo-class', () => {
    assert.deepEqual(index({ 'forms/input-group': '.input-group > :not(.dropdown-menu) { flex: 1 1 auto }' }), { 'input-group': 'forms/input-group' })
  })

  it('leaves out a class two stylesheets declare', () => {
    assert.deepEqual(index({ chip: '.chip-input-sm { padding: 0 }', 'forms/chip-input': '.chip-input-sm { padding: 1px }' }), {})
  })

  it('gives a class two stylesheets declare to the stylesheet named after it', () => {
    assert.deepEqual(
      index({ 'forms/form-field': '.form-check { display: block }', 'forms/form-check': '.form-check { margin: 0 }' }),
      { 'form-check': 'forms/form-check' }
    )
  })

  it('leaves out the classes of base.css', () => {
    assert.deepEqual(index({ base: '.theme-primary { color: red }' }), {})
  })

  it('reads every selector of a rule list', () => {
    assert.deepEqual(index({ spinner: '.spinner-border, .spinner-grow { display: inline-block }' }), {
      'spinner-border': 'spinner', 'spinner-grow': 'spinner'
    })
  })

  it('reads rules nested in at-rules', () => {
    assert.deepEqual(index({ modal: '@layer components { @media (min-width: 576px) { .modal-dialog { max-width: 500px } } }' }), {
      'modal-dialog': 'modal'
    })
  })

  it('sorts the index by class name', () => {
    assert.deepEqual(Object.keys(index({ card: '.card-title { margin: 0 } .card { border: 0 } .card-body { padding: 0 }' })), [
      'card', 'card-body', 'card-title'
    ])
  })
})

describe('layersOf', () => {
  it('lists the layers a stylesheet writes rules into, in cascade order', () => {
    assert.deepEqual(
      layersOf('@layer forms, components;\n@layer components { .sidebar { display: flex } }\n@layer forms { .form-range { width: 100% } }'),
      ['forms', 'components']
    )
  })

  it('ignores the layer order declaration and an empty layer block', () => {
    assert.deepEqual(layersOf('@layer colors, config, root;\n@layer root {}\n@layer components { .card { border: 0 } }'), ['components'])
  })
})
