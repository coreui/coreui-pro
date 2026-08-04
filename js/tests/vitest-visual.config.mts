/*!
 * Visual regression suite — the same Chromium-through-Playwright setup as the
 * unit config, pointed at `js/tests/visual/` and with coverage off (screenshot
 * specs execute a sliver of the sources; the unit thresholds don't apply).
 * Baselines live next to the specs in `__screenshots__/`, suffixed with the
 * platform: font rendering differs between macOS and Linux, so each platform
 * compares only against its own set.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

import { mergeConfig } from 'vitest/config'
import baseConfig from './vitest.config.mts'

// mergeConfig concatenates arrays, so `include` is replaced after the merge —
// otherwise the visual run would drag the whole unit suite along.
const config = mergeConfig(baseConfig, {
  test: {
    coverage: {
      enabled: false
    }
  }
})

config.test.include = ['js/tests/visual/**/*.spec.js']
config.test.exclude = []

export default config
