import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  classNames, loadUtilities, scan, stylesheet
} from './utilities.mjs'

const utilities = loadUtilities()

test('scan reads utilities, ux() and static class attributes', () => {
  const source = `
    <CCard utilities={['mt-4', 'shadow-sm']} className="custom d-flex">
    <div className={ux('gap-2', collapsed && 'd-none')} class='p-3 rounded'>
    <CBadge :utilities="['ms-2']" />
  `
  assert.deepEqual([...scan(source)].toSorted(), ['custom', 'd-flex', 'd-none', 'gap-2', 'mt-4', 'ms-2', 'p-3', 'rounded', 'shadow-sm'].toSorted())
})

test('scan does not see a computed name', () => {
  assert.equal(scan(['<div className={`mt-$', '{n}`} />'].join('')).size, 0)
})

test('only keeps the used rules in map order and skips empty media blocks', () => {
  const css = stylesheet(utilities, { only: new Set(['mt-md-3', 'd-flex', 'link-10-hover']) })
  const selectors = [...css.matchAll(/^\s*(\.[\w-]+(?::\w+)?) \{/gm)].map(([, selector]) => selector)
  assert.deepEqual(selectors, ['.d-flex', '.link-10-hover:hover', '.mt-md-3'])
  assert.match(css, /@media \(width >= 768px\) \{\n {4}\.mt-md-3 \{/)
  assert.doesNotMatch(css, /@media \(width >= 576px\)/)
  assert.doesNotMatch(css, /@media print/)
  assert.doesNotMatch(css, /@property/)
  assert.doesNotMatch(css, /@keyframes/)
})

test('only registers the custom properties and keyframes the used rules need', () => {
  const css = stylesheet(utilities, { only: new Set(['bg-primary', 'animation-pop', 'translate-middle-x']) })
  assert.match(css, /@property --cui-bg \{/)
  assert.doesNotMatch(css, /@property --cui-fg/)
  assert.match(css, /@keyframes animation-pop/)
  assert.match(css, /prefers-reduced-motion/)
  assert.match(css, /\*\[dir=rtl\] \.translate-middle-x/)
})

test('the class index covers the full stylesheet', () => {
  const index = classNames(utilities)
  const full = stylesheet(utilities)
  for (const name of ['mt-3', 'mt-md-3', 'd-print-none', 'shadow', 'link-10-hover', 'rounded-top-3']) {
    assert.ok(index.has(name), name)
    assert.ok(full.includes(`.${name.replace('-hover', '-hover:hover')} {`), name)
  }
})
