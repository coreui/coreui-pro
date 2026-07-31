import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import replace from '@rollup/plugin-replace'
import banner from './banner.mjs'
import browserTargets from './browser-targets.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const BUNDLE = process.env.BUNDLE === 'true'
const BOOTSTRAP = process.env.BOOTSTRAP === 'true'
const ESM = process.env.ESM === 'true'

let destinationFile = BOOTSTRAP ? `bootstrap${ESM ? '.esm' : ''}` : `coreui${ESM ? '.esm' : ''}`
const external = ['@floating-ui/core', '@floating-ui/dom']
const plugins = [
  BOOTSTRAP && replace({
    preventAssignment: false,
    delimiters: ['', ''],
    '/coreui': '/coreui', // prevents changes in URLs
    coreui: 'bs',
    '-coreui': '-bs',
    'coreui=': 'bs=', // [data-coreui="navigation"] => [data-bs="navigation"] (workaround for `preventAssignment` being true),
    '--cui-': '--bs-'
  })
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
    file: path.resolve(__dirname, `../dist/js/${destinationFile}.js`),
    format: ESM ? 'esm' : 'umd',
    globals,
    generatedCode: { preset: 'es2015' }
  },
  external,
  plugins
}

if (!ESM) {
  rolldownConfig.output.name = BOOTSTRAP ? 'bootstrap' : 'coreui'
}

export default rolldownConfig
