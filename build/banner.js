'use strict'

const path = require('path')
const pkg = require(path.resolve(__dirname, '../package.json'))
const year = new Date().getFullYear()

function getBanner(pluginFilename) {
  return `/*!
  * CoreUI PRO ${pluginFilename ? ` ${pluginFilename}` : ''}v${pkg.version} (${pkg.homepage})
  * Copyright ${year} ${pkg.author.name}
  * License (${pkg.homepage}/pro/license/)
  */`
}

module.exports = getBanner
