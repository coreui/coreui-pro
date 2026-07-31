import markdown from '@eslint/markdown'
import xo from 'eslint-config-xo'
import xoBrowser from 'eslint-config-xo/browser'
import html from 'eslint-plugin-html'
import eslintPluginImport from 'eslint-plugin-import'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
  {
    // The migration leaves the tree mixed: a `.js` module can import a sibling
    // that is already `.ts`, written as the ESM-style `./x.js` specifier that
    // tsc resolves. The default resolver takes that literally and reports
    // no-unresolved, so hand resolution to the TypeScript-aware one.
    settings: {
      'import/resolver': {
        typescript: { project: './tsconfig.json' }
      }
    }
  },
  eslintPluginImport.flatConfigs.errors,
  eslintPluginImport.flatConfigs.warnings,
  eslintPluginUnicorn.configs.recommended,
  ...xo,
  ...xoBrowser,
  {
    ignores: [
      '**/*.json',
      '**/*.min.js',
      '**/dist/',
      '**/vendor/',
      '.babelrc.js',
      '.cache/',
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
      'no-restricted-properties': [
        'error',
        {
          property: 'at',
          message: 'Avoid Array/String.prototype.at(): it is unsupported in the browsers declared in .browserslistrc (Chrome < 92, Safari < 15.4) and the build does not polyfill. Use index access, e.g. arr[arr.length - 1].'
        }
      ],
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
      'unicorn/prevent-abbreviations': 'off'
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
    files: ['js/tests/types/**/*.ts'],
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
    files: ['js/tests/unit/**'],
    languageOptions: {
      globals: {
        ...globals.jasmine,
        ...globals.jquery
      }
    },
    rules: {
      'max-lines': 'off', // added to avoid the error: 'File must not contain more than 1500 lines of code'
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
      'unicorn/no-array-for-each': 'off'
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
        coreui: 'readonly',
        dayjs: 'readonly'
      }
    },
    rules: {
      'no-console': 'off',
      'no-new': 'off',
      'no-unused-vars': 'off',
      'unicorn/no-array-for-each': 'off',
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
  }
]
