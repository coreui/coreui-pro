#!/usr/bin/env node

/*!
 * Script to check that every agent skill in skills/ carries a valid name,
 * description and guide, that its guide is a docs page, and that the Agent
 * Skills docs page lists exactly the skills the package ships.
 * Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const skillsDir = path.join(root, 'skills')
const docsDir = path.join(root, 'docs/src/content/docs')
const pagePath = path.join(docsDir, 'ai-tools/skills.mdx')
const problems = []

const readFrontmatter = file => {
  const match = /^---\n(?<body>[\s\S]*?)\n---\n/.exec(fs.readFileSync(file, 'utf8'))

  if (!match) {
    return null
  }

  return Object.fromEntries(match.groups.body.split('\n').map(line => /^(?<key>[a-z]+): (?<value>.*)$/.exec(line)?.groups).filter(Boolean).map(({ key, value }) => [key, value.trim()]))
}

const isDocsPage = guide => /^\/[\w/-]+\/$/.test(guide) &&
  [`${guide.slice(1, -1)}.mdx`, `${guide.slice(1)}index.mdx`].some(file => fs.existsSync(path.join(docsDir, file)))

const skills = fs.readdirSync(skillsDir, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name)

for (const skill of skills) {
  const file = path.join(skillsDir, skill, 'SKILL.md')

  if (!fs.existsSync(file)) {
    problems.push(`skills/${skill} has no SKILL.md`)
    continue
  }

  const frontmatter = readFrontmatter(file)

  if (!frontmatter) {
    problems.push(`skills/${skill}/SKILL.md has no frontmatter`)
    continue
  }

  if (frontmatter.name !== skill) {
    problems.push(`skills/${skill}/SKILL.md is named "${frontmatter.name}", not "${skill}"`)
  }

  if (!/^[a-z\d]+(?:-[a-z\d]+)*$/.test(skill)) {
    problems.push(`skills/${skill} is not a lowercase, hyphenated name`)
  }

  if (!frontmatter.description || frontmatter.description.length > 1024 || !frontmatter.description.includes('Use when')) {
    problems.push(`skills/${skill}/SKILL.md needs a description of at most 1024 characters that says "Use when"`)
  }

  if (!frontmatter.guide || !isDocsPage(frontmatter.guide)) {
    problems.push(`skills/${skill}/SKILL.md guide "${frontmatter.guide}" is not a docs page`)
  }
}

const listed = [...fs.readFileSync(pagePath, 'utf8').matchAll(/^\| `(?<name>[\w-]+)` \|/gm)].map(match => match.groups.name)

for (const skill of skills.filter(skill => !listed.includes(skill))) {
  problems.push(`ai-tools/skills.mdx does not list ${skill}`)
}

for (const name of listed.filter(name => !skills.includes(name))) {
  problems.push(`ai-tools/skills.mdx lists ${name}, which skills/ does not ship`)
}

if (problems.length > 0) {
  console.error(`Found ${problems.length} problem(s) in the agent skills:\n`)
  console.error(problems.map(problem => `  ${problem}`).join('\n'))
  process.exit(1)
}

console.log(`All ${skills.length} agent skills are valid and listed on the docs page.`)
