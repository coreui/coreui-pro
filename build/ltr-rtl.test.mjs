/*!
 * Tests for the direction mixins' build flags: which of the two directions a
 * stylesheet carries, and at what cost in selectors.
 * Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 */

import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'node:test'
import { compileStringAsync } from 'sass'

const root = fileURLToPath(new URL('..', import.meta.url))

const compile = async flags => {
  const result = await compileStringAsync(
    `@use "scss/config" with (${flags});
   @use "scss/mixins/ltr-rtl" as *;

   .probe {
     float: left;

     @include rtl() {
       float: right;
     }

     @include rtl() {
       &::before {
         content: "mirrored";
       }
     }
   }`,
    { loadPaths: [root, `${root}node_modules`], style: 'expanded' }
  )

  return result.css.trim()
}

// The whole output, not a search through it: in a right-to-left build the
// mirrored value wins on source order alone, so a spec that only looks for it
// would pass with the base declaration written after it.
describe('direction build flags', () => {
  it('writes the mirrored value behind :dir(rtl) when both directions are enabled', async () => {
    assert.equal(await compile('$enable-ltr: true, $enable-rtl: true'), [
      '.probe {',
      '  float: left;',
      '}',
      '.probe:dir(rtl) {',
      '  float: right;',
      '}',
      '.probe:dir(rtl)::before {',
      '  content: "mirrored";',
      '}'
    ].join('\n'))
  })

  it('leaves the mirrored value out of a left-to-right build', async () => {
    assert.equal(await compile('$enable-ltr: true, $enable-rtl: false'), [
      '.probe {',
      '  float: left;',
      '}'
    ].join('\n'))
  })

  it('makes the mirrored value the base of a right-to-left build, with no direction selector', async () => {
    assert.equal(await compile('$enable-ltr: false, $enable-rtl: true'), [
      '.probe {',
      '  float: left;',
      '  float: right;',
      '}',
      '.probe::before {',
      '  content: "mirrored";',
      '}'
    ].join('\n'))
  })
})
