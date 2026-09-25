/*!
 * Tests for the output options of the library bundles.
 * Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import vm from 'node:vm'
import { rolldown } from 'rolldown'

const modules = {
  entry: 'import { computePosition } from \'@floating-ui/dom\'\nexport const Alert = \'alert\'\nexport const position = computePosition\n',
  '@floating-ui/dom': 'export const computePosition = \'computePosition\'\n'
}

const virtual = {
  name: 'virtual',
  resolveId(id) {
    return Object.hasOwn(modules, id) ? `\0${id}` : null
  },
  load(id) {
    return id.startsWith('\0') ? modules[id.slice(1)] : null
  }
}

const floatingUi = 'var FloatingUIDOM = { computePosition: \'computePosition\' }\n'

const load = async environment => {
  for (const key of ['BOOTSTRAP', 'BUNDLE', 'ESM']) {
    process.env[key] = environment[key] ?? 'false'
  }

  const { default: config } = await import(`./rolldown.config.mjs?${new URLSearchParams(environment)}`)
  return config
}

const build = async environment => {
  const config = await load(environment)
  const bundle = await rolldown({ input: 'entry', external: config.external, plugins: [virtual, ...config.plugins.filter(Boolean)] })
  const { name, format, generatedCode, globals } = config.output
  const { output } = await bundle.generate({
    name, format, generatedCode, globals
  })

  return output[0].code
}

const run = (code, setup = '') => {
  const context = vm.createContext({})
  vm.runInContext(floatingUi + setup, context)
  vm.runInContext(code, context)

  return vm.runInContext('coreui', context)
}

describe('rolldown config', () => {
  it('creates window.coreui as a plain object when nothing is there', async () => {
    const coreui = run(await build({}))

    assert.equal(coreui.Alert, 'alert')
    assert.equal(coreui.position, 'computePosition')
    assert.equal(Object.prototype.toString.call(coreui), '[object Object]')
  })

  it('keeps what a companion package put on window.coreui before the library', async () => {
    const coreui = run(await build({}), 'var coreui = { Utils: \'utils\' }')

    assert.equal(coreui.Utils, 'utils')
    assert.equal(coreui.Alert, 'alert')
  })

  it('keeps it in the bundle build, which carries Floating UI inside', async () => {
    const coreui = run(await build({ BUNDLE: 'true' }), 'delete globalThis.FloatingUIDOM\nvar coreui = { ChartJS: \'chartjs\' }')

    assert.equal(coreui.ChartJS, 'chartjs')
    assert.equal(coreui.position, 'computePosition')
  })

  it('copies a frozen window.coreui into a new object', async () => {
    const coreui = run(await build({}), 'var coreui = Object.freeze({ Utils: \'utils\' })')

    assert.equal(coreui.Utils, 'utils')
    assert.equal(coreui.Alert, 'alert')
  })

  it('does not take over the Module tag a companion package set', async () => {
    const coreui = run(await build({}), 'var coreui = { DataGrid: \'grid\' }\nObject.defineProperty(coreui, Symbol.toStringTag, { value: \'Module\' })')

    assert.equal(coreui.DataGrid, 'grid')
    assert.equal(Object.prototype.toString.call(coreui), '[object Object]')
  })

  it('does not attach to a window.coreui that is not a plain object', async () => {
    const coreui = run(await build({}), 'class Element { Tooltip = \'input\' }\nvar coreui = new Element()')

    assert.equal(coreui.constructor.name, 'Object')
    assert.equal(coreui.Tooltip, undefined)
    assert.equal(coreui.Alert, 'alert')
  })

  it('replaces window.bootstrap in the Bootstrap-compatible build', async () => {
    const config = await load({ BOOTSTRAP: 'true' })

    assert.equal(config.output.name, 'bootstrap')
    assert.equal(config.plugins.some(plugin => plugin?.name === 'adopt-coreui-global'), false)
  })

  it('fails the build when the UMD wrapper no longer matches', async () => {
    const config = await load({})
    const plugin = config.plugins.find(plugin => plugin?.name === 'adopt-coreui-global')
    const context = {
      error(message) {
        throw new Error(message)
      }
    }

    assert.throws(
      () => plugin.generateBundle.call(context, {}, { 'coreui.js': { type: 'chunk', fileName: 'coreui.js', code: 'factory(global.coreui = global.coreui || {})' } }),
      /coreui\.js: the UMD wrapper no longer assigns/
    )
  })
})
