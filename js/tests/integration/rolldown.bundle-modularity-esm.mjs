import { defineConfig } from 'rolldown'
import browserTargets from '../../../build/browser-targets.mjs'

// Same as `rolldown.bundle-modularity.mjs`, but it imports the ES modules
// next to the plugins, so a broken import between them fails the build.
export default defineConfig({
  input: 'js/tests/integration/bundle-modularity-esm.js',
  transform: {
    target: browserTargets(),
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  },
  output: {
    file: 'js/coverage/bundle-modularity-esm.js',
    format: 'iife'
  }
})
