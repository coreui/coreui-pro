/** @type {import('stylelint').Config} */
export default {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-recess-order',
    '@stylistic/stylelint-config'
  ],
  plugins: [
    'stylelint-order'
  ],
  reportInvalidScopeDisables: true,
  reportNeedlessDisables: [
    true,
    {
      except: [
        'no-duplicate-selectors',
        'selector-max-class',
        'selector-max-combinators',
        'selector-max-compound-selectors',
        'selector-max-universal',
        'selector-no-qualifying-type'
      ]
    }
  ],
  rules: {
    'alpha-value-notation': null,
    'at-rule-empty-line-before': null,
    'color-function-notation': null,
    'color-named': 'never',
    'custom-property-empty-line-before': null,
    'custom-property-pattern': null,
    'declaration-block-no-redundant-longhand-properties': null,
    'declaration-empty-line-before': null,
    'declaration-no-important': true,
    'font-weight-notation': [
      'numeric',
      {
        ignore: [
          'relative'
        ]
      }
    ],
    'function-url-no-scheme-relative': true,
    'media-feature-range-notation': null,
    'media-query-no-invalid': null,
    'no-descending-specificity': null,
    'number-max-precision': null,
    'rule-empty-line-before': null,
    'selector-max-attribute': 6,
    'selector-max-class': 10,
    'selector-max-combinators': 7,
    'selector-max-compound-selectors': 8,
    'selector-max-id': 0,
    'selector-max-specificity': null,
    'selector-max-type': 6,
    'selector-max-universal': 1,
    'selector-no-qualifying-type': true,
    '@stylistic/at-rule-name-space-after': 'always',
    '@stylistic/at-rule-semicolon-space-before': 'never',
    '@stylistic/block-closing-brace-empty-line-before': null,
    '@stylistic/block-closing-brace-newline-after': null,
    '@stylistic/block-opening-brace-space-before': null,
    '@stylistic/declaration-block-semicolon-newline-before': 'never-multi-line',
    '@stylistic/max-empty-lines': 2,
    '@stylistic/max-line-length': null,
    '@stylistic/number-leading-zero': 'never',
    '@stylistic/selector-list-comma-newline-before': 'never-multi-line',
    '@stylistic/selector-list-comma-space-after': 'always-single-line',
    '@stylistic/selector-list-comma-space-before': 'never-single-line',
    '@stylistic/unicode-bom': 'never',
    '@stylistic/value-list-comma-newline-after': 'never-multi-line',
    '@stylistic/value-list-comma-newline-before': 'never-multi-line',
    '@stylistic/value-list-comma-space-after': 'always',
    'color-function-alias-notation': null,
    'container-name-pattern': null,
    'property-no-deprecated': null,
    '@stylistic/no-multiple-whitespaces': null,
    'selector-not-notation': 'complex',
    // The optional prefix group is what lets `.dark\\:bg-*` through — the one
    // colon-prefixed name we keep. Responsive variants stay infixed.
    'selector-class-pattern': [
      '^([a-z][a-z0-9]*(-[a-z0-9]+)*:)?([a-z][a-z0-9]*)(-[a-z0-9]+)*$',
      { message: 'Expected class selector "%s" to be kebab-case (with optional prefix)' }
    ],
    'order/order': [
      [
        { type: 'at-rule', name: 'use' },
        { type: 'at-rule', name: 'forward' },
        'dollar-variables',
        'custom-properties',
        'declarations',
        'rules'
      ]
    ]
  },
  overrides: [
    {
      files: '**/*.scss',
      extends: [
        'stylelint-config-standard-scss',
        'stylelint-config-recess-order'
      ],
      rules: {
        'no-invalid-position-at-import-rule': null,
        'scss/at-extend-no-missing-placeholder': null,
        'scss/at-function-named-arguments': 'never',
        'scss/at-if-closing-brace-newline-after': null,
        'scss/at-if-closing-brace-space-after': null,
        'scss/at-if-no-null': null,
        'scss/at-mixin-argumentless-call-parentheses': 'always',
        'scss/at-mixin-pattern': null,
        'scss/at-rule-conditional-no-parentheses': null,
        'scss/comment-no-empty': null,
        'scss/dimension-no-non-numeric-values': true,
        'scss/dollar-variable-colon-space-after': 'at-least-one-space',
        'scss/dollar-variable-empty-line-before': null,
        'scss/double-slash-comment-empty-line-before': null,
        'scss/double-slash-comment-whitespace-inside': null,
        'scss/function-quote-no-quoted-strings-inside': null,
        'scss/media-feature-value-dollar-variable': null,
        'scss/no-global-function-names': null,
        'scss/selector-no-redundant-nesting-selector': true,
        'selector-no-qualifying-type': null,
        'declaration-property-value-disallowed-list': {
          border: 'none',
          outline: 'none',
          '/^border-(start|end)-(start|end)-radius$/': ['/^(?!0$).+/']
        },
        'function-disallowed-list': [
          'lighten',
          'darken'
        ],
        'property-disallowed-list': [
          'border-radius',
          'border-top-left-radius',
          'border-top-right-radius',
          'border-bottom-right-radius',
          'border-bottom-left-radius',
          'transition'
        ],
        'scss/dollar-variable-default': [
          true,
          {
            ignore: 'local'
          }
        ],
        'scss/selector-no-union-class-name': true
      }
    },
    {
      files: 'scss/**/*.{test,spec}.scss',
      rules: {
        'scss/dollar-variable-default': null,
        'declaration-no-important': null
      }
    },
    {
      files: 'docs/**/*.scss',
      rules: {
        'scss/dollar-variable-default': null
      }
    },
    {
      files: 'docs/**/examples/**/*.css',
      rules: {
        'comment-empty-line-before': null,
        'property-no-vendor-prefix': null,
        'selector-no-qualifying-type': null,
        'value-no-vendor-prefix': null
      }
    }
  ]
}
