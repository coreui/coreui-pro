// NOTICE!!! Initially embedded in our docs this JavaScript
// file contains elements that can help you create reproducible
// use cases in StackBlitz for instance.
// In a real project please adapt this content to your needs.
// ++++++++++++++++++++++++++++++++++++++++++

/*!
 * JavaScript for Bootstrap's docs (https://getbootstrap.com/)
 * Copyright 2025 The Bootstrap Authors
 * Licensed under the Creative Commons Attribution 3.0 Unported License.
 * For details, see https://creativecommons.org/licenses/by/3.0/.
 */

import sdk from '@stackblitz/sdk'
// https://gohugo.io/hugo-pipes/js/#options
import {
  cssCdn, cssProCdn, jsBundleCdn, jsProBundleCdn, jsSnippetFile
} from '@params' // eslint-disable-line import/no-unresolved

// Open in StackBlitz logic
document.querySelectorAll('.btn-edit').forEach(btn => {
  btn.addEventListener('click', event => {
    const codeSnippet = event.target.closest('.docs-code-snippet')
    const exampleEl = codeSnippet.querySelector('.docs-example')
    const title = document.querySelector('.docs-title')
    const highlight = event.target.closest('.docs-code-snippet').querySelector('.highlight').textContent.trimEnd()
    const isPro = codeSnippet.querySelector('.btn-edit').getAttribute('data-sb-pro')
    const addDayJs = codeSnippet.querySelector('.btn-edit').getAttribute('data-sb-dayjs')

    const htmlSnippet = isPro ? highlight : exampleEl.innerHTML
    const jsSnippet = codeSnippet.querySelector('.btn-edit').getAttribute('data-sb-js-snippet')
    // Get extra classes for this example
    const classes = Array.from(exampleEl.classList).join(' ')

    openCoreUISnippet(htmlSnippet, jsSnippet, classes, title, isPro, addDayJs)
  })
})

const openCoreUISnippet = (htmlSnippet, jsSnippet, classes, title, pro, addDayJs) => {
  const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="${pro ? cssProCdn : cssCdn}" rel="stylesheet">
    <title>CoreUI ${title.innerHTML} Example</title>
    <${'script'} defer src="${pro ? jsProBundleCdn : jsBundleCdn}"></${'script'}>
    ${addDayJs ?
    `<script defer src="https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/dayjs@1/plugin/customParseFormat.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/dayjs@1/locale/es.js"></script>` :
    ''}
  </head>
  <body class="p-3 m-0 border-0 ${classes}">
    <!-- Example Code Start-->
${htmlSnippet.trimStart().replace(/^/gm, '    ').replace(/^ {4}$/gm, '').trimEnd()}
    <!-- Example Code End -->
  </body>
</html>
`

  const project = {
    files: {
      'index.html': indexHtml,
      ...(jsSnippet && { 'index.js': jsSnippetFile })
    },
    title: `${title.innerHTML} Example`,
    description: `Official example from ${window.location.href}`,
    template: jsSnippet ? 'javascript' : 'html',
    tags: ['coreui']
  }

  sdk.openProject(project, { openFile: 'index.html' })
}
