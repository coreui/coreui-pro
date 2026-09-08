/*!
 * Tests for the composition of the compiled stylesheets with the generated layers.
 * Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 */

import assert from 'node:assert/strict'
import path from 'node:path'
import process from 'node:process'
import { describe, it } from 'node:test'
import { compile } from 'sass-embedded'
import {
  ENTRYPOINTS, layers, MARKER, padMappings, withLayers, withUtilities
} from './css-compose.mjs'
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

  it('respells the tokens for a theme that renames the prefix', () => {
    const themed = stylesheet(loadUtilities(), { layer: false, prefix: 'bs-' })

    assert.equal(themed.includes('--cui-'), false)
    assert.equal(themed.replaceAll('--bs-', '--cui-'), css)
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

describe('withLayers', () => {
  const generated = new Map([['root', ':root {\n  --a: 1;\n}\n']])

  it('swaps the comment for the layer and reports the lines it added', () => {
    const { css: composed, edits } = withLayers('.a {}\n/*! @coreui:root */\n.b {}\n', generated)

    assert.equal(composed, '.a {}\n:root {\n  --a: 1;\n}\n.b {}\n')
    assert.deepEqual(edits, [{ line: 1, added: 2 }])
  })

  it('leaves a stylesheet without comments alone', () => {
    assert.deepEqual(withLayers('.a {}\n', generated), { css: '.a {}\n', edits: [] })
  })

  it('refuses a comment no generator answers to', () => {
    assert.throws(() => withLayers('/*! @coreui:nope */\n', generated), /no generated layer named nope/)
  })
})

describe('padMappings', () => {
  it('pushes the groups below an insertion down by the lines it added', () => {
    assert.equal(padMappings('A;B;C;D', [{ line: 1, added: 2 }]), 'A;B;;;C;D')
  })

  it('applies several insertions without shifting one another', () => {
    assert.equal(padMappings('A;B;C;D', [{ line: 0, added: 1 }, { line: 2, added: 1 }]), 'A;;B;C;;D')
  })

  it('grows a mappings string Sass ended early', () => {
    assert.equal(padMappings('A', [{ line: 3, added: 1 }]), 'A;;;;')
  })
})

describe('the stylesheets the build composes', () => {
  for (const { file, prefix, dataInfix, overlays, utilities } of ENTRYPOINTS) {
    const name = `${path.basename(file, '.css').replace('bootstrap', 'themes/bootstrap/bootstrap')}.scss`
    const sass = entrypoint(name)
    const generated = layers({ prefix, dataInfix, overlays })
    const { css: composed, edits } = withLayers(sass, generated)
    const whole = utilities ? `${composed}\n${stylesheet(loadUtilities(), { layer: false, prefix })}` : composed

    it(`${name} leaves no comment for a layer the build did not write`, () => {
      assert.equal(composed.split('\n').some(line => MARKER.test(line)), false)
      assert.equal(edits.length, count(sass.split('\n').filter(line => MARKER.test(line)).join('\n'), '@coreui:') || 0)
    })

    it(`${name} carries each generated layer exactly once`, () => {
      for (const [layer, block] of generated) {
        const marker = `/*! @coreui:${layer} */`

        if (sass.includes(marker)) {
          assert.equal(count(composed, block), 1, layer)
        }
      }
    })

    it(`${name} takes its token and utility layers from the generator alone`, () => {
      assert.equal(sass.includes('--cui-primary-bg:'), false)
      assert.equal(sass.includes('.float-start'), false)
    })

    if (name !== 'coreui-grid.scss') {
      it(`${name} declares the layer order before the first layered block`, () => {
        const order = whole.indexOf(`@layer ${LAYERS.join(', ')};`)

        assert.ok(order !== -1)
        assert.ok(order < whole.indexOf('@layer colors {'))
      })
    }
  }
})
