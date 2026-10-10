import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import banner from './banner.mjs'
import browserTargets from './browser-targets.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const BUNDLE = process.env.BUNDLE === 'true'
const ESM = process.env.ESM === 'true'

let destinationFile = `coreui${ESM ? '.esm' : ''}`
const external = ['@floating-ui/core', '@floating-ui/dom']
const plugins = [
  !ESM && {
    name: 'adopt-coreui-global',
    generateBundle(options, bundle) {
      const assignment = 'factory(global.coreui = {}'

      for (const chunk of Object.values(bundle).filter(file => file.type === 'chunk')) {
        if (!chunk.code.includes(assignment)) {
          this.error(`${chunk.fileName}: the UMD wrapper no longer assigns \`${assignment}\``)
        }

        chunk.code = chunk.code.replace(assignment, 'factory(global.coreui = Object.assign({}, global.coreui && Object.getPrototypeOf(global.coreui) === Object.prototype ? global.coreui : {})')
      }
    }
  }
]
const globals = {
  '@floating-ui/core': 'FloatingUICore',
  '@floating-ui/dom': 'FloatingUIDOM'
}
const define = {}

if (BUNDLE) {
  destinationFile += '.bundle'
  // Bundle the positioning engines instead of treating them as externals
  external.length = 0
  delete globals['@floating-ui/core']
  delete globals['@floating-ui/dom']
  define['process.env.NODE_ENV'] = '"production"'
}

const rolldownConfig = {
  input: path.resolve(__dirname, `../js/index.${ESM ? 'esm' : 'umd'}.js`),
  // oxc strips the types and lowers the syntax, so the dist path carries no
  // Babel. The targets come from .browserslistrc, the same source Babel read.
  transform: {
    define,
    target: browserTargets()
  },
  output: {
    banner: banner(),
    comments: { jsdoc: false },
    file: path.resolve(__dirname, `../dist/js/${destinationFile}.js`),
    format: ESM ? 'esm' : 'umd',
    globals,
    generatedCode: { preset: 'es2015', symbols: false }
  },
  external,
  plugins
}

if (!ESM) {
  rolldownConfig.output.name = 'coreui'
}

export default rolldownConfig
