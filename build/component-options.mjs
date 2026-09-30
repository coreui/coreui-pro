/*!
 * Reads the `Default` and `DefaultType` maps of the component sources through
 * the TypeScript AST, following `...Parent.Default` spreads to the parent module.
 * Copyright 2026 The CoreUI Authors
 * Copyright 2026 creativeLabs Łukasz Holeczek
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

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
    if (!ts.isPropertyAssignment(property)) {
      continue
    }

    const initializer = unwrap(property.initializer)

    if (!ts.isStringLiteral(initializer)) {
      continue
    }

    const { name } = property
    const key = ts.isIdentifier(name) || ts.isStringLiteral(name) ? name.text : null

    if (key) {
      values.set(key, initializer.text)
    }
  }

  return values
}

// The runtime type each literal default carries, so it can be matched against
// the component's own rule. A default that is not statically knowable (a call,
// an imported constant) is left out rather than guessed.
function valueTypes(node) {
  const types = new Map()

  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property)) {
      continue
    }

    const { name } = property
    const key = ts.isIdentifier(name) || ts.isStringLiteral(name) ? name.text : null
    const type = valueType(unwrap(property.initializer))

    if (key && type) {
      types.set(key, type)
    }
  }

  return types
}

function valueType(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateExpression(node)) {
    return 'string'
  }

  if (ts.isNumericLiteral(node)) {
    return 'number'
  }

  if (ts.isPrefixUnaryExpression(node) && ts.isNumericLiteral(node.operand)) {
    return 'number'
  }

  if (node.kind === ts.SyntaxKind.TrueKeyword || node.kind === ts.SyntaxKind.FalseKeyword) {
    return 'boolean'
  }

  if (node.kind === ts.SyntaxKind.NullKeyword) {
    return 'null'
  }

  if (ts.isArrayLiteralExpression(node)) {
    return 'array'
  }

  if (ts.isObjectLiteralExpression(node)) {
    return 'object'
  }

  if (ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
    return 'function'
  }

  return null
}

function unwrap(node) {
  return ts.isAsExpression(node) || ts.isParenthesizedExpression(node) ? unwrap(node.expression) : node
}

export function readMaps(file) {
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
        found[name] = {
          ...objectKeys(initializer, sourceFile),
          types: typeNames(initializer),
          values: valueTypes(initializer),
          sourceFile
        }
      }
    }
  }

  return found
}

// Same walk as `effectiveKeys`, for the per-option maps: the parent's entries
// first, so an overridden option keeps the child's.
export function effectiveEntries(map, name, field, seen = new Set()) {
  const entries = new Map()

  for (const binding of map.spreads) {
    const parentFile = importedFrom(map.sourceFile, binding)

    if (!parentFile || seen.has(parentFile)) {
      continue
    }

    seen.add(parentFile)
    const parent = readMaps(parentFile)[name]

    if (parent) {
      for (const [key, value] of effectiveEntries(parent, name, field, seen)) {
        entries.set(key, value)
      }
    }
  }

  for (const [key, value] of map[field]) {
    entries.set(key, value)
  }

  return entries
}

// Resolves `...Parent.Default` chains, so `keys` is what the component really
// accepts at runtime.
export function effectiveKeys(map, name, seen = new Set()) {
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
