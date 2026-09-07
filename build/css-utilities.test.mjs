/*!
 * Tests for the utilities layer the build appends to the compiled stylesheets.
 * Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 */

import assert from 'node:assert/strict'
import path from 'node:path'
import process from 'node:process'
import { describe, it } from 'node:test'
import { compile } from 'sass-embedded'
import { withUtilities } from './css-utilities.mjs'
import { LAYERS, loadUtilities, stylesheet } from './lib/utilities.mjs'

const css = stylesheet(loadUtilities(), { layer: false })
const count = (source, needle) => source.split(needle).length - 1
const entrypoint = name => compile(path.join(process.cwd(), 'scss', name), { style: 'expanded' }).css

describe('the generated utilities layer', () => {
  it('opens one utilities layer and closes it', () => {
    assert.equal(count(css, '\n@layer utilities {\n'), 1)
    assert.match(css, /^@property /)
    assert.match(css, /}\n$/)
  })

  it('leaves the layer order to the stylesheet it is written into', () => {
    assert.equal(css.includes(`@layer ${LAYERS.join(', ')};`), false)
  })
})

describe('withUtilities', () => {
  it('writes the layer in front of the source map annotation', () => {
    assert.equal(
      withUtilities('.a { color: red }\n\n/*# sourceMappingURL=a.css.map */\n', '.b { color: blue }\n'),
      '.a { color: red }\n.b { color: blue }\n\n/*# sourceMappingURL=a.css.map */\n'
    )
  })

  it('refuses a stylesheet that carries no annotation to write in front of', () => {
    assert.throws(() => withUtilities('.a { color: red }\n', '.b { color: blue }\n'), /source map annotation/)
  })
})

describe('the stylesheets the build composes', () => {
  for (const name of ['coreui.scss', 'coreui-utilities.scss']) {
    it(`${name} takes the utilities layer from the generator alone`, () => {
      const sass = entrypoint(name)
      const composed = `${sass}\n${css}`

      assert.equal(sass.includes('.float-start'), false)
      assert.equal(count(composed, '\n@layer utilities {\n'), count(sass, '\n@layer utilities {\n') + 1)
      assert.ok(composed.endsWith(css))
    })

    it(`${name} declares the layer order before the first layered block`, () => {
      const composed = `${entrypoint(name)}\n${css}`
      const order = composed.indexOf(`@layer ${LAYERS.join(', ')};`)

      assert.ok(order !== -1)
      assert.ok(order < composed.indexOf('@layer colors {'))
    })
  }
})
