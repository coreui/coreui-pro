/*!
 * Tests for the class ownership index emitted next to the component manifest.
 * Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { classIndex } from './css-components.mjs'

const index = sheets => classIndex(new Map(Object.entries(sheets)))

describe('classIndex', () => {
  it('owns a class whose rule is a single compound', () => {
    assert.deepEqual(index({ transitions: '.fade { transition: opacity .15s linear }' }), { fade: 'transitions' })
  })

  it('keeps a class whose only rule carries pseudo-classes', () => {
    assert.deepEqual(index({ buttons: '.btn:disabled { pointer-events: none }' }), { btn: 'buttons' })
  })

  it('owns no class of a descendant selector', () => {
    assert.deepEqual(index({ carousel: '.carousel-indicators .active { opacity: 1 }' }), {})
  })

  it('owns no class of a child selector', () => {
    assert.deepEqual(index({ nav: '.tab-content > .active { display: block }' }), {})
  })

  it('does not own a class used as the context of another component rule', () => {
    assert.deepEqual(index({ badge: '.btn .badge { top: 0 }' }), {})
  })

  it('does not own a class combined with another class in the same compound', () => {
    assert.deepEqual(index({ alert: '.alert.fade.show { opacity: 1 }' }), {})
  })

  it('ignores the arguments of a functional pseudo-class', () => {
    assert.deepEqual(index({ 'forms/input-group': '.input-group > :not(.dropdown-menu) { flex: 1 1 auto }' }), {})
  })

  it('leaves out a class two stylesheets declare', () => {
    assert.deepEqual(index({ chip: '.chip-input-sm { padding: 0 }', 'forms/chip-input': '.chip-input-sm { padding: 0 }' }), {})
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
})
