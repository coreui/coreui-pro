#!/usr/bin/env node

/*!
 * Script to keep each component's config type at least as wide as its
 * `DefaultType`. `DefaultType` is what the runtime accepts, so an option whose
 * type leaves out one of its categories rejects at compile time a value the
 * component takes, and an option missing from the type rejects it entirely.
 * Reads the type a consumer sees, the second constructor parameter, so a
 * composite's forwarded options and the inherited constructors count.
 * Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { effectiveEntries, readMaps } from './component-options.mjs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = path.join(root, 'js/src')
const index = fs.readFileSync(path.join(sourcePath, 'index.ts'), 'utf8')
const components = [...index.matchAll(/export \{ default as (\w+) \} from '\.\/([\w-]+)\.js'/g)]
  .map(([, name, file]) => ({ name, file: path.join(sourcePath, `${file}.ts`) }))
  .filter(({ file }) => readMaps(file).DefaultType)

const probeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'coreui-config-types-'))
const probeFile = path.join(probeDir, 'probe.ts')

fs.writeFileSync(probeFile, [
  ...components.map(({ name, file }) => `import ${name} from '${file.replace(/\.ts$/, '.js').replaceAll('\\', '/')}'`),
  ...components.map(({ name }) => `export type ${name}Options = NonNullable<ConstructorParameters<typeof ${name}>[1]>`),
  'export declare const sampleArray: any[]',
  'export declare const sampleDate: Date',
  'export declare const sampleElement: Element',
  'export declare const sampleFunction: (...args: any[]) => any',
  'export declare const sampleObject: {}'
].join('\n'))

const { config } = ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile)
const { options } = ts.parseJsonConfigFileContent(config, ts.sys, root)
const program = ts.createProgram([probeFile], { ...options, noEmit: true })
const checker = program.getTypeChecker()
const probe = program.getSourceFile(probeFile)
const exported = new Map(checker.getExportsOfModule(checker.getSymbolAtLocation(probe)).map(symbol => [symbol.name, symbol]))
const typeOf = name => checker.getDeclaredTypeOfSymbol(exported.get(name))
const valueTypeOf = name => checker.getTypeOfSymbolAtLocation(exported.get(name), probe)

const samples = {
  array: valueTypeOf('sampleArray'),
  date: valueTypeOf('sampleDate'),
  element: valueTypeOf('sampleElement'),
  function: valueTypeOf('sampleFunction'),
  object: valueTypeOf('sampleObject')
}

// eslint-disable-next-line no-bitwise
const hasFlag = (type, flag) => (type.flags & flag) !== 0

const FLAGS = {
  boolean: ts.TypeFlags.BooleanLike,
  null: ts.TypeFlags.Null,
  number: ts.TypeFlags.NumberLike,
  string: ts.TypeFlags.StringLike,
  undefined: ts.TypeFlags.Undefined
}

const accepts = (type, category) => {
  const parts = type.isUnion() ? type.types : [type]

  if (parts.some(part => hasFlag(part, ts.TypeFlags.Any) || hasFlag(part, ts.TypeFlags.Unknown))) {
    return true
  }

  if (FLAGS[category]) {
    return parts.some(part => hasFlag(part, FLAGS[category]))
  }

  // A closed object shape such as `{ show, hide }` is a narrower object, not a missing one
  if (category === 'object' && parts.some(part => hasFlag(part, ts.TypeFlags.Object) && !checker.isArrayType(part) && part.getCallSignatures().length === 0)) {
    return true
  }

  return checker.isTypeAssignableTo(samples[category], type)
}

const problems = []

for (const { name, file } of components) {
  const relative = path.relative(root, file)
  const optionsType = typeOf(`${name}Options`)
  const declared = effectiveEntries(readMaps(file).DefaultType, 'DefaultType', 'types')

  for (const [key, rule] of declared) {
    const property = optionsType.getProperty(key)
    const indexed = checker.getIndexInfosOfType(optionsType).find(info => hasFlag(info.keyType, ts.TypeFlags.String))

    if (!property && !indexed) {
      problems.push(`${relative}: ${name} does not take the option ${key}`)
      continue
    }

    const type = property ? checker.getTypeOfSymbol(property) : indexed.type
    const missing = rule.replaceAll(/[()]/g, '').split('|').map(category => category.toLowerCase())
      .filter(category => !accepts(type, category))

    if (missing.length > 0) {
      problems.push(`${relative}: ${name} ${key} is ${checker.typeToString(type)} but DefaultType allows ${rule} — no ${missing.join(', ')}`)
    }
  }
}

fs.rmSync(probeDir, { recursive: true, force: true })

if (problems.length > 0) {
  console.error(`Found ${problems.length} option(s) typed narrower than their DefaultType:\n`)
  console.error(problems.map(problem => `  ${problem}`).join('\n'))
  process.exit(1)
}

console.log(`The config types of all ${components.length} components take what their DefaultType allows.`)
