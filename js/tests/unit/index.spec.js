import Offcanvas from '../../src/offcanvas.js'

const esm = await import('../../index.esm.js')
const umd = await import('../../index.umd.js')

const INTERNAL_MODULES = new Set(['base-component', 'combobox-base', 'dialog-base', 'picker-base', 'section-input'])

describe('index', () => {
  it('should export every component module', () => {
    const modules = import.meta.glob(['../../src/*.ts', '!../../src/index.ts'], { eager: true })
    const exported = new Set(Object.values(esm))
    const missing = Object.entries(modules)
      .filter(([path]) => !INTERNAL_MODULES.has(path.replace('../../src/', '').replace('.ts', '')))
      .filter(([, module]) => !exported.has(module.default))
      .map(([path]) => path)

    expect(missing).toEqual([])
  })

  it('should expose every module export on the UMD global', () => {
    for (const [name, plugin] of Object.entries(esm)) {
      expect(umd[name]).toBe(plugin)
    }
  })

  it('should expose the offcanvas plugin under its documented name', () => {
    expect(umd.Offcanvas).toBe(Offcanvas)
  })

  it('should keep the legacy offcanvas name as an alias', () => {
    expect(umd.OffCanvas).toBe(Offcanvas)
  })

  it('should not expose names the module build does not have', () => {
    const extra = Object.keys(umd).filter(name => !(name in esm))

    expect(extra).toEqual(['OffCanvas'])
  })
})
