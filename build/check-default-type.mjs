#!/usr/bin/env node

/*!
 * Script to keep `Default` and `DefaultType` in sync.
 * `DefaultType` is what validates data attributes at runtime, so an option
 * present in one and missing from the other is either an unvalidated option or
 * a rule for an option that no longer exists. Reads the `.ts` sources through
 * the TypeScript AST rather than the built bundle: importing every component
 * at once registers each data-api listener twice, which is exactly the thing
 * the runtime version of this test kept tripping over.
 * Copyright 2026 The CoreUI Authors
 * Copyright 2026 creativeLabs Łukasz Holeczek
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { globby } from 'globby'
import ts from 'typescript'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const KNOWN_TYPES = new Set([
  'array', 'boolean', 'date', 'element', 'function', 'null', 'number', 'object', 'string', 'undefined'
])

// A component that writes `...Tooltip.Default` inherits the parent's options,
// so the spread is followed to the parent module and its keys are folded in.
// Without that, every overridden option looks like a missing `DefaultType`.
function objectKeys(node, sourceFile) {
  const keys = []
  const spreads = []

  for (const property of node.properties) {
    if (ts.isSpreadAssignment(property)) {
      const { expression } = property

      if (ts.isPropertyAccessExpression(expression) && ts.isIdentifier(expression.expression)) {
        spreads.push(expression.expression.text)
      }

      continue
    }

    const { name } = property
    keys.push(ts.isIdentifier(name) || ts.isStringLiteral(name) ? name.text : name.getText(sourceFile))
  }

  return { keys, spreads }
}

// `import Tooltip from './tooltip.js'` → the path of `tooltip.ts` on disk.
function importedFrom(sourceFile, binding) {
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || !statement.importClause) {
      continue
    }

    const { name, namedBindings } = statement.importClause
    const names = [name?.text]

    if (namedBindings && ts.isNamedImports(namedBindings)) {
      names.push(...namedBindings.elements.map(element => element.name.text))
    }

    if (names.includes(binding) && ts.isStringLiteral(statement.moduleSpecifier)) {
      const specifier = statement.moduleSpecifier.text

      if (specifier.startsWith('.')) {
        return path.resolve(path.dirname(sourceFile.fileName), specifier.replace(/\.js$/, '.ts'))
      }
    }
  }

  return null
}

function typeNames(node) {
  const values = new Map()

  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property) || !ts.isStringLiteral(property.initializer)) {
      continue
    }

    const { name } = property
    const key = ts.isIdentifier(name) || ts.isStringLiteral(name) ? name.text : null

    if (key) {
      values.set(key, property.initializer.text)
    }
  }

  return values
}

function readMaps(file) {
  const sourceFile = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.ES2022, true)
  const found = {}

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) {
      continue
    }

    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer) {
        continue
      }

      const name = declaration.name.text
      const { initializer } = declaration

      if ((name === 'Default' || name === 'DefaultType') && ts.isObjectLiteralExpression(initializer)) {
        found[name] = { ...objectKeys(initializer, sourceFile), types: typeNames(initializer), sourceFile }
      }
    }
  }

  return found
}

// Resolves `...Parent.Default` chains, so `keys` is what the component really
// accepts at runtime.
function effectiveKeys(map, name, seen = new Set()) {
  const keys = new Set(map.keys)

  for (const binding of map.spreads) {
    const parentFile = importedFrom(map.sourceFile, binding)

    if (!parentFile || seen.has(parentFile)) {
      continue
    }

    seen.add(parentFile)
    const parent = readMaps(parentFile)[name]

    if (parent) {
      for (const key of effectiveKeys(parent, name, seen)) {
        keys.add(key)
      }
    }
  }

  return keys
}

const files = await globby(`${path.join(root, 'js/src').replaceAll('\\', '/')}/**/*.ts`)
const problems = []
let checked = 0

for (const file of files.toSorted()) {
  const { Default, DefaultType } = readMaps(file)

  if (!Default || !DefaultType) {
    continue
  }

  checked++

  const relative = path.relative(root, file)

  const defaultKeys = effectiveKeys(Default, 'Default')
  const defaultTypeKeys = effectiveKeys(DefaultType, 'DefaultType')

  const missingType = [...defaultKeys].filter(key => !defaultTypeKeys.has(key))
  const missingDefault = [...defaultTypeKeys].filter(key => !defaultKeys.has(key))

  if (missingType.length > 0) {
    problems.push(`${relative}: in Default but not in DefaultType — ${missingType.join(', ')}`)
  }

  if (missingDefault.length > 0) {
    problems.push(`${relative}: in DefaultType but not in Default — ${missingDefault.join(', ')}`)
  }

  for (const [key, value] of DefaultType.types) {
    for (const type of value.replaceAll(/[()]/g, '').split('|')) {
      if (!KNOWN_TYPES.has(type.toLowerCase())) {
        problems.push(`${relative}: DefaultType.${key} names an unknown type "${type}" in "${value}"`)
      }
    }
  }
}

if (problems.length > 0) {
  console.error(`Found ${problems.length} problem(s) in ${checked} component(s):\n`)
  console.error(problems.map(problem => `  ${problem}`).join('\n'))
  process.exit(1)
}

console.log(`Default and DefaultType agree in all ${checked} components.`)
