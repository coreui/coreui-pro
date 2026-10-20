import markdown from '@eslint/markdown'
import eslintConfigXo from 'eslint-config-xo'
import html from 'eslint-plugin-html'
import eslintPluginImportX from 'eslint-plugin-import-x'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const xoBase = eslintConfigXo({ browser: true, space: false }).find(config => config.name === 'xo/base')

const plugins = {
  import: eslintPluginImportX,
  unicorn: eslintPluginUnicorn
}

export default [
  {
    plugins
  },
  {
    ...xoBase,
    plugins: {
      ...xoBase.plugins,
      ...plugins
    },
    rules: {
      ...Object.fromEntries(Object.entries(xoBase.rules).filter(([name]) => !name.startsWith('import-x/'))),
      ...eslintPluginUnicorn.configs.recommended.rules,
      'import/default': 'error',
      'import/export': 'error',
      'import/named': 'error',
      'import/namespace': 'error',
      'import/no-unresolved': 'error'
    }
  },
  {
    ignores: [
      '**/*.json',
      '**/*.min.js',
      '**/dist/',
      '**/vendor/',
      '.babelrc.js',
      '.cache/',
      '**/*.md/*.vue',
      '_site/',
      'docs/.astro/',
      'docs/scripts/',
      'docs/astro.config.mjs',
      'docs/**/*.ts',
      'js/coverage/'
    ]
  },
  {
    rules: {
      '@stylistic/comma-dangle': 'off',
      '@stylistic/curly-newline': 'off',
      '@stylistic/function-paren-newline': 'off',
      '@stylistic/indent': 'off',
      '@stylistic/indent-binary-ops': 'off',
      '@stylistic/jsx-quotes': 'off',
      '@stylistic/max-len': 'off',
      '@stylistic/object-curly-spacing': 'off',
      '@stylistic/operator-linebreak': 'off',
      '@stylistic/quotes': 'off',
      '@stylistic/semi': 'off',
      'arrow-body-style': 'off',
      'capitalized-comments': 'off',
      'comma-dangle': ['error', 'never'],
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'always'
        }
      ],
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-absolute-path': 'error',
      'import/no-amd': 'error',
      'import/no-cycle': [
        'error',
        {
          ignoreExternal: true
        }
      ],
      'import/no-duplicates': 'error',
      'import/no-extraneous-dependencies': 'error',
      'import/no-mutable-exports': 'error',
      'import/no-named-as-default': 'error',
      'import/no-named-as-default-member': 'error',
      'import/no-named-default': 'error',
      'import/no-self-import': 'error',
      'import/no-unassigned-import': ['error'],
      'import/no-useless-path-segments': 'error',
      'import/order': 'error',
      indent: [
        'error',
        2,
        {
          MemberExpression: 'off',
          SwitchCase: 1
        }
      ],
      'logical-assignment-operators': 'off',
      'max-params': ['warn', 5],
      'multiline-ternary': ['error', 'always-multiline'],
      'new-cap': [
        'error',
        {
          properties: false
        }
      ],
      'no-console': 'error',
      'no-negated-condition': 'off',
      'object-curly-spacing': ['error', 'always'],
      'operator-linebreak': ['error', 'after'],
      'prefer-object-has-own': 'off',
      'prefer-template': 'error',
      semi: ['error', 'never'],
      strict: 'error',
      'unicorn/explicit-length-check': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/no-anonymous-default-export': 'off',
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/no-array-method-this-argument': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-typeof-undefined': 'off',
      'unicorn/no-unused-properties': 'error',
      'unicorn/numeric-separators-style': 'off',
      'unicorn/prefer-array-flat': 'off',
      'unicorn/prefer-at': 'off',
      'unicorn/prefer-dom-node-dataset': 'off',
      'unicorn/prefer-global-this': 'off', // added to avoid the error: 'Use `globalThis` instead of `window` or `global`'
      'unicorn/prefer-module': 'off',
      'unicorn/prefer-query-selector': 'off',
      'unicorn/prefer-spread': 'off',
      'unicorn/prefer-string-raw': 'off',
      'unicorn/prefer-string-replace-all': 'off',
      'unicorn/prefer-structured-clone': 'off',
      'unicorn/prevent-abbreviations': 'off',
      // Rules new/changed in ESLint 10 / updated plugins — disable to preserve old behavior
      'xo/import-specifier-newline': 'off',
      '@eslint-community/eslint-comments/require-description': 'off',
      'import-x/no-anonymous-default-export': 'off',
      'import-x/no-extraneous-dependencies': 'off',
      'import-x/no-unassigned-import': 'off',
      'n/file-extension-in-import': 'off',
      'n/no-deprecated-api': 'off',
      'n/no-extraneous-import': 'off',
      'n/prefer-global/buffer': 'off',
      'n/prefer-global/process': 'off',
      'n/prefer-promises/fs': 'off',
      'no-shadow': 'off',
      'require-unicode-regexp': 'off',
      'unicorn/better-dom-traversing': 'off',
      'unicorn/class-reference-in-static-methods': 'off',
      'unicorn/consistent-boolean-name': 'off',
      'unicorn/consistent-class-member-order': 'off',
      'unicorn/consistent-compound-words': 'off',
      'unicorn/consistent-conditional-object-spread': 'off',
      'unicorn/default-export-style': 'off',
      'unicorn/dom-node-dataset': 'off',
      'unicorn/explicit-timer-delay': 'off',
      'unicorn/logical-assignment-operators': 'off',
      'unicorn/max-nested-calls': 'off',
      'unicorn/name-replacements': 'off',
      'unicorn/no-break-in-nested-loop': 'off',
      'unicorn/no-computed-property-existence-check': 'off',
      'unicorn/no-declarations-before-early-exit': 'off',
      'unicorn/no-duplicate-if-branches': 'off',
      'unicorn/no-global-object-property-assignment': 'off',
      'unicorn/no-incorrect-query-selector': 'off',
      'unicorn/no-return-array-push': 'off',
      'unicorn/no-this-outside-of-class': 'off',
      'unicorn/no-unnecessary-splice': 'off',
      'unicorn/no-unused-array-method-return': 'off',
      'unicorn/no-unreadable-for-of-expression': 'off',
      'unicorn/no-subtraction-comparison': 'off',
      'unicorn/prefer-add-event-listener-options': 'off',
      'unicorn/prefer-array-from-map': 'off',
      'unicorn/prefer-await': 'off',
      'unicorn/prefer-continue': 'off',
      'unicorn/prefer-early-return': 'off',
      'unicorn/prefer-global-number-constants': 'off',
      'unicorn/prefer-includes-over-repeated-comparisons': 'off',
      'unicorn/prefer-iterator-to-array': 'off',
      'unicorn/prefer-minimal-ternary': 'off',
      'unicorn/prefer-number-coercion': 'off',
      'unicorn/prefer-object-define-properties': 'off',
      'unicorn/prefer-object-iterable-methods': 'off',
      'unicorn/prefer-private-class-fields': 'off',
      'unicorn/prefer-scoped-selector': 'off',
      'unicorn/prefer-split-limit': 'off',
      'unicorn/prefer-string-repeat': 'off',
      'unicorn/prefer-ternary': 'off',
      'unicorn/prefer-unicode-code-point-escapes': 'off',
      'unicorn/no-top-level-assignment-in-function': 'off',
      'unicorn/no-top-level-side-effects': 'off',
      'unicorn/no-useless-coercion': 'off',
      'unicorn/no-useless-template-literals': 'off',
      'unicorn/no-unsafe-string-replacement': 'off',
      'unicorn/require-array-sort-compare': 'off',
      'unicorn/require-css-escape': 'off',
      'unicorn/no-array-from-fill': 'off',
      'unicorn/no-chained-comparison': 'off',
      'unicorn/no-duplicate-loops': 'off',
      'unicorn/no-exports-in-scripts': 'off',
      'unicorn/no-invalid-argument-count': 'off',
      'unicorn/no-negated-array-predicate': 'off',
      'unicorn/no-unnecessary-boolean-comparison': 'off',
      'unicorn/no-unreadable-object-destructuring': 'off',
      'unicorn/no-useless-boolean-cast': 'off',
      'unicorn/prefer-array-flat-map': 'off',
      'unicorn/prefer-array-iterable-methods': 'off',
      'unicorn/prefer-boolean-return': 'off',
      'unicorn/prefer-direct-iteration': 'off',
      'unicorn/prefer-else-if': 'off',
      'unicorn/prefer-hoisting-branch-code': 'off',
      'unicorn/prefer-math-constants': 'off',
      'unicorn/prefer-promise-with-resolvers': 'off',
      'unicorn/prefer-unary-minus': 'off'
    }
  },
  {
    files: ['**/*.{js,mjs}'],
    languageOptions: {
      sourceType: 'module'
    }
  },
  {
    // Sources and specs use ESM-style `.js` specifiers that resolve to `.ts`
    // files. import/extensions reads that literally and demands the `.ts`
    // extension, which is exactly what tsc forbids — tsc enforces the
    // specifier instead. Upstream disables the same rule for the same reason.
    files: ['js/**'],
    rules: {
      'import/extensions': 'off'
    }
  },
  {
    // The library sources are migrating to TypeScript file by file, so this
    // block only applies where a `.ts` file already exists.
    files: ['js/src/**/*.ts', 'js/tests/vitest.config.mts'],
    languageOptions: {
      parser: tseslint.parser,
      sourceType: 'module'
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin
    },
    rules: {
      // `eslint-recommended` disables the base rules that misread TypeScript —
      // no-undef fires on DOM types like ParentNode, which live in type
      // position and are not runtime identifiers.
      ...tseslint.configs.recommended.find(config => config.name === 'typescript-eslint/eslint-recommended')?.rules,
      ...tseslint.configs.recommended.find(config => config.rules && config.name === 'typescript-eslint/recommended')?.rules,
      // The config objects are intentionally loose — see util/config
      '@typescript-eslint/no-explicit-any': 'off',
      // The TS-aware rule replaces the base one, so it has to repeat its
      // options — otherwise `_` placeholders that pass in .js fail in .ts.
      '@typescript-eslint/no-unused-vars': ['error', {
        args: 'after-used',
        argsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_$',
        ignoreRestSiblings: true,
        vars: 'all',
        varsIgnorePattern: '^_'
      }],
      // Fires on `.ts` but not on byte-identical `.js`: the rule misreads arrows
      // that close over `this`, which by definition cannot move to outer scope.
      'unicorn/consistent-function-scoping': 'off'
    }
  },
  {
    // The consumer type test imports the emitted declarations on purpose, so it
    // resolves only after a build — and the lint job runs before one.
    files: ['js/tests/types/**/*.{cts,mts,ts}'],
    languageOptions: {
      parser: tseslint.parser,
      sourceType: 'module'
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin
    },
    rules: {
      ...tseslint.configs.recommended.find(config => config.name === 'typescript-eslint/eslint-recommended')?.rules,
      ...tseslint.configs.recommended.find(config => config.rules && config.name === 'typescript-eslint/recommended')?.rules,
      'import/no-unresolved': 'off'
    }
  },
  {
    files: ['build/**'],
    languageOptions: {
      globals: {
        ...globals.node
      },
      sourceType: 'module'
    },
    rules: {
      'no-console': 'off',
      'unicorn/prefer-top-level-await': 'off'
    }
  },
  {
    // CommonJS holdouts (the vendored rollup resolver); must come after the
    // `build/**` block, which would otherwise claim them as ES modules
    files: ['**/*.cjs'],
    languageOptions: {
      globals: {
        ...globals.node
      },
      sourceType: 'commonjs'
    }
  },
  {
    // The Vitest setup files and the integration configs are ES modules that
    // run under Node/Vite, not in the spec sandbox
    files: ['js/tests/*.js', 'js/tests/*.mts', 'js/tests/integration/rolldown*.mjs'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jquery,
        ...globals.node
      }
    }
  },
  {
    // Imports the ES modules the build writes, while lint runs before it
    files: ['js/tests/integration/bundle-modularity-esm.js'],
    rules: {
      'import/no-unresolved': 'off'
    }
  },
  {
    files: ['js/tests/unit/**', 'js/tests/visual/**'],
    languageOptions: {
      globals: {
        ...globals.jasmine,
        ...globals.jquery
      }
    },
    rules: {
      'max-lines': 'off', // added to avoid the error: 'File must not contain more than 1500 lines of code'
      'max-nested-callbacks': 'off',
      'no-console': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/no-useless-undefined': 'off',
      'unicorn/prefer-add-event-listener': 'off'
    }
  },
  {
    files: ['js/tests/visual/**'],
    plugins: {
      html
    },
    settings: {
      'html/html-extensions': ['.html']
    },
    rules: {
      'no-console': 'off',
      'no-new': 'off',
      'unicorn/no-for-each': 'off'
    }
  },
  {
    files: ['scss/tests/**'],
    languageOptions: {
      globals: {
        ...globals.node
      },
      sourceType: 'commonjs'
    }
  },
  {
    // Docs demo snippets (`?raw` imports) and docs-site helper scripts: plain browser
    // scripts that run against the global `coreui` bundle. Instantiating for side
    // effects (`new coreui.X(...)`), keeping the mapped instance list, and `console`
    // are expected here.
    files: ['docs/src/content/docs/**/snippets/**/*.js', 'docs/public/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        Chart: 'readonly',
        coreui: 'readonly',
        dayjs: 'readonly'
      }
    },
    rules: {
      'no-console': 'off',
      'no-new': 'off',
      'no-unused-vars': 'off',
      'unicorn/no-for-each': 'off',
      'unicorn/prefer-top-level-await': 'off'
    }
  },
  {
    files: ['**/*.md'],
    plugins: {
      markdown
    },
    processor: 'markdown/markdown'
  },
  ...markdown.configs.processor,
  {
    files: ['**/*.md/*.js', '**/*.md/*.mjs'],
    languageOptions: {
      sourceType: 'module'
    },
    rules: {
      'unicorn/prefer-node-protocol': 'off'
    }
  },
  {
    files: ['skills/**/*.md/*.js', 'skills/**/*.md/*.jsx', 'skills/**/*.md/*.mjs'],
    rules: {
      'import/no-unassigned-import': 'off',
      'import/no-unresolved': 'off'
    }
  }
]
