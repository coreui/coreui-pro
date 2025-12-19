// package metadata file for Meteor.js

/* global Package */

Package.describe({
  name: 'coreui:coreui-pro', // https://atmospherejs.com/coreui/coreui
  summary: 'The most popular front-end framework for developing responsive, mobile-first projects on the web rewritten and maintained by the CoreUI Team.',
  version: '5.23.0',
  git: 'https://github.com/coreui/coreui-pro.git'
})

Package.onUse(api => {
  api.versionsFrom('METEOR@1.0')
  api.addFiles([
    'dist/css/coreui.css',
    'dist/js/coreui.js'
  ], 'client')
})
