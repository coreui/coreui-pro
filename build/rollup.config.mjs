import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { babel } from '@rollup/plugin-babel'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import banner from './banner.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const BUNDLE = process.env.BUNDLE === 'true'
const BOOTSTRAP = process.env.BOOTSTRAP === 'true'
const ESM = process.env.ESM === 'true'

let destinationFile = BOOTSTRAP ? `bootstrap${ESM ? '.esm' : ''}` : `coreui${ESM ? '.esm' : ''}`
const external = ['@popperjs/core']
const plugins = [
  babel({
    // Only transpile our source code
    exclude: 'node_modules/**',
    // Include the helpers in the bundle, at most one copy of each
    babelHelpers: 'bundled'
  })
]
const globals = {
  '@popperjs/core': 'Popper',
  'date-fns': 'dateFns'
}

if (BUNDLE) {
  destinationFile += '.bundle'
  // Remove last entry in external array to bundle Popper
  external.pop()
  delete globals['@popperjs/core']
  // Remove last entry in external array to bundle dateFns
  external.pop()
  delete globals['date-fns']
  plugins.push(
    replace({
      'process.env.NODE_ENV': '"production"',
      preventAssignment: true,
      ...BOOTSTRAP && {
        delimiters: ['', ''], // disable word boundaries
        '/coreui': '/coreui', // prevents https://coreui.io being replaced with https://bs.io
        'coreui.': 'bs.',
        '.coreui': '.bs',
        'coreui-': 'bs-',
        '-coreui': '-bs',
        "'coreui'": "'bs'",         // key.startsWith('coreui') => key.startsWith('bs')
        'coreuiConfig': 'bsConfig', // key.startsWith('coreuiConfig')) => key.startsWith('bsConfig'))
        '^coreui': '^bs',           // key.replace(/^coreui/, ''); => key.replace(/^bs/, '');
        'coreui=': 'bs=',           // [data-coreui="navigation"] => [data-bs="navigation"] (workaround for preventAssignment being true)
      }
    }),
    nodeResolve()
  )
}

const rollupConfig = {
  input: path.resolve(__dirname, `../js/index.${ESM ? 'esm' : 'umd'}.js`),
  output: {
    banner: banner(),
    file: path.resolve(__dirname, `../dist/js/${destinationFile}.js`),
    format: ESM ? 'esm' : 'umd',
    globals,
    generatedCode: 'es2015'
  },
  external,
  plugins
}

if (!ESM) {
  rollupConfig.output.name = BOOTSTRAP ? 'bootstrap' : 'coreui'
}

export default rollupConfig
