/*!
 * Tests for the forced colors build flag: `$enable-forced-colors: false`
 * removes every forced colors rule from the full stylesheet.
 * Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 */

import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'node:test'
import { compileString } from 'sass'

const root = fileURLToPath(new URL('..', import.meta.url))

const compile = enabled => compileString(
  `@use "scss/config" with ($enable-forced-colors: ${enabled});
   @use "scss/coreui";`,
  { loadPaths: [root, `${root}node_modules`], style: 'expanded' }
).css

const count = (css, text) => css.split(text).length - 1

describe('forced colors build flag', () => {
  it('writes the forced colors rules by default', () => {
    const css = compile(true)

    assert.ok(count(css, '@media (forced-colors: active)') > 0)
    assert.ok(count(css, 'forced-color-adjust') > 0)
  })

  it('leaves every forced colors rule out when the flag is off', () => {
    const css = compile(false)

    assert.equal(count(css, 'forced-colors'), 0)
    assert.equal(count(css, 'forced-color-adjust'), 0)
  })
})
