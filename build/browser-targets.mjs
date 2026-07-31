/*!
 * Translates .browserslistrc into the target list oxc understands, so the
 * bundler and Autoprefixer keep reading the same support matrix.
 * Copyright 2026 The CoreUI Authors
 * Copyright 2026 creativeLabs Łukasz Holeczek
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 */

import browserslist from 'browserslist'

// oxc names a subset of what browserslist does. The engines it cannot name are
// all Chromium or Gecko forks whose floor is above one of the four below, so
// dropping them does not raise the syntax level of the output.
const OXC_NAMES = new Map([
  ['chrome', 'chrome'],
  ['edge', 'edge'],
  ['firefox', 'firefox'],
  ['ios_saf', 'ios'],
  ['node', 'node'],
  ['opera', 'opera'],
  ['safari', 'safari']
])

export default function browserTargets() {
  const lowest = new Map()

  for (const entry of browserslist()) {
    const [name, version] = entry.split(' ')
    const oxcName = OXC_NAMES.get(name)

    if (!oxcName) {
      continue
    }

    // Ranges like "12.2-12.5" report the whole span; the first number is the floor.
    const parsed = Number.parseFloat(version)

    if (Number.isNaN(parsed)) {
      continue
    }

    if (!lowest.has(oxcName) || parsed < lowest.get(oxcName)) {
      lowest.set(oxcName, parsed)
    }
  }

  return [...lowest].map(([name, version]) => `${name}${version}`)
}
