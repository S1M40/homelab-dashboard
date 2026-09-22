#!/usr/bin/env node
/**
 * Homelab Dashboard — Service Manager CLI
 *
 * Usage:
 *   node scripts/manage-services.js
 *
 * Interactively add, edit, remove, and list services in config/services.json.
 * No npm install required — uses only built-in Node.js modules.
 */

import { createInterface } from 'readline'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// ─── Paths ────────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONFIG_PATH = resolve(__dirname, '..', 'config', 'services.json')

// ─── Terminal colours ─────────────────────────────────────────────────────────

const c = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  red:    '\x1b[31m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  blue:   '\x1b[34m',
  cyan:   '\x1b[36m',
  white:  '\x1b[37m',
  gray:   '\x1b[90m',
}

const clr = (color, text) => `${color}${text}${c.reset}`
const bold  = (t) => clr(c.bold, t)
const dim   = (t) => clr(c.dim + c.gray, t)
const ok    = (t) => clr(c.green, t)
const warn  = (t) => clr(c.yellow, t)
const err   = (t) => clr(c.red, t)
const info  = (t) => clr(c.cyan, t)
const label = (t) => clr(c.blue + c.bold, t)

// ─── readline helper ──────────────────────────────────────────────────────────

const rl = createInterface({ input: process.stdin, output: process.stdout })

function ask(question, defaultValue = '') {
  const hint = defaultValue ? dim(` [${defaultValue}]`) : ''
  return new Promise((resolve) => {
    rl.question(`${question}${hint}: `, (answer) => {
      resolve(answer.trim() || defaultValue)
    })
  })
}

function askYesNo(question, defaultYes = true) {
  const hint = defaultYes ? ' [Y/n]' : ' [y/N]'
  return new Promise((resolve) => {
    rl.question(`${question}${dim(hint)}: `, (answer) => {
      const a = answer.trim().toLowerCase()
      if (!a) resolve(defaultYes)
      else resolve(a === 'y' || a === 'yes')
    })
  })
}

async function pickFromList(question, options) {
  console.log(`\n${question}`)
  options.forEach((opt, i) => console.log(`  ${dim(String(i + 1).padStart(2))}. ${opt}`))
  while (true) {
    const answer = await ask(`\nEnter number (1–${options.length})`)
    const n = parseInt(answer, 10)
    if (n >= 1 && n <= options.length) return n - 1
    console.log(warn(`  Please enter a number between 1 and ${options.length}`))
  }
}

// ─── Config helpers ───────────────────────────────────────────────────────────

function loadConfig() {
  if (!existsSync(CONFIG_PATH)) {
    console.log(warn(`\nConfig not found at: ${CONFIG_PATH}`))
    console.log(warn('Creating a new config file…\n'))
    const blank = {
      settings: { title: 'Homelab', subtitle: 'Infrastructure Dashboard' },
      services: [],
    }
    saveConfig(blank)
    return blank
  }
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'))
  } catch (e) {
    console.error(err(`\nFailed to parse config: ${e.message}`))
    process.exit(1)
  }
}

function saveConfig(config) {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n', 'utf-8')
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// ─── Display helpers ──────────────────────────────────────────────────────────

function printHeader() {
  console.clear()
  console.log()
  console.log(bold(clr(c.cyan, '  ╔══════════════════════════════════════╗')))
  console.log(bold(clr(c.cyan, '  ║   Homelab Dashboard — Service CLI    ║')))
  console.log(bold(clr(c.cyan, '  ╚══════════════════════════════════════╝')))
  console.log()
}

function printServiceTable(services) {
  if (!services.length) {
    console.log(dim('  (no services configured)\n'))
    return
  }

  const COL = { id: 18, name: 18, category: 16, icon: 14, url: 34 }

  const hdr = (t, w) => label(t.padEnd(w))
  console.log(
    `  ${hdr('ID', COL.id)} ${hdr('Name', COL.name)} ${hdr('Category', COL.category)} ${hdr('Icon', COL.icon)} ${hdr('URL', COL.url)}`
  )
  console.log(`  ${dim('─'.repeat(COL.id + COL.name + COL.category + COL.icon + COL.url + 4))}`)

  services.forEach((s, i) => {
    const num  = dim(String(i + 1).padStart(3) + '. ')
    const id   = (s.id ?? '').padEnd(COL.id).substring(0, COL.id)
    const name = (s.name ?? '').padEnd(COL.name).substring(0, COL.name)
    const cat  = (s.category ?? '').padEnd(COL.category).substring(0, COL.category)
    const icon = (s.icon ?? '').padEnd(COL.icon).substring(0, COL.icon)
    const url  = (s.url ?? '').substring(0, COL.url)
    const fav  = s.favorite ? clr(c.yellow, '★') : ' '
    console.log(`${num}${id} ${name} ${cat} ${icon} ${url} ${fav}`)
  })
  console.log()
}

function printService(s) {
  const row = (k, v) => console.log(`  ${label(k.padEnd(14))} ${v ?? dim('(not set)')}`)
  console.log()
  row('ID',          s.id)
  row('Name',        s.name)
  row('Description', s.description)
  row('URL',         s.url)
  row('Icon',        s.icon)
  row('Category',    s.category)
  row('Color',       s.color)
  row('Favorite',    s.favorite ? ok('yes') : 'no')
  console.log()
}

// ─── Actions ──────────────────────────────────────────────────────────────────

async function actionList() {
  const config = loadConfig()
  printHeader()
  console.log(bold(`  Services  ${dim(`(${config.services.length} total)`)}\n`))
  printServiceTable(config.services)

  // Group by category
  const cats = {}
  config.services.forEach((s) => {
    const cat = s.category || 'Other'
    cats[cat] = (cats[cat] || 0) + 1
  })
  console.log(bold('  Categories:\n'))
  Object.entries(cats).forEach(([cat, count]) => {
    console.log(`    ${info('•')} ${cat} ${dim(`(${count})`)}`)
  })
  console.log()
}

async function actionAdd() {
  const config = loadConfig()
  printHeader()
  console.log(bold('  Add a New Service\n'))

  const name = await ask(label('Service name') + ' (e.g. Grafana)')
  if (!name) { console.log(warn('\nName is required. Cancelled.')); return }

  const suggestedId = slugify(name)
  const id = await ask(label('ID') + ' (unique slug)', suggestedId)

  // Check for duplicate ID
  if (config.services.find((s) => s.id === id)) {
    console.log(err(`\n  A service with id "${id}" already exists. Use "Edit" to modify it.`))
    return
  }

  const description = await ask(label('Description'))
  const url         = await ask(label('URL') + ' (e.g. https://grafana.local)')
  const icon        = await ask(label('Icon slug') + dim(' (see simpleicons.org)'), slugify(name))

  console.log()
  console.log(dim('  Common categories: Infrastructure, Monitoring, Media, Network, Development'))
  const category = await ask(label('Category'), 'Other')

  const color    = await ask(label('Accent color') + dim(' (hex, optional, e.g. #F46800)'), '')
  const favorite = await askYesNo(label('Mark as favorite?'), false)

  const service = {
    id,
    name,
    description,
    url,
    icon,
    category,
    ...(color ? { color } : {}),
    ...(favorite ? { favorite: true } : {}),
  }

  console.log()
  console.log(bold('  Preview:'))
  printService(service)

  const confirm = await askYesNo('  Add this service?')
  if (!confirm) { console.log(warn('\nCancelled.\n')); return }

  config.services.push(service)
  saveConfig(config)
  console.log(ok(`\n  ✓ Service "${name}" added successfully.\n`))
  console.log(dim('  Refresh your browser to see the changes.\n'))
}

async function actionEdit() {
  const config = loadConfig()
  if (!config.services.length) {
    console.log(warn('\nNo services to edit.\n'))
    return
  }

  printHeader()
  console.log(bold('  Edit a Service\n'))
  printServiceTable(config.services)

  const idx = await pickFromList('Which service do you want to edit?', config.services.map((s) => `${s.name} ${dim(`(${s.id})`)} — ${s.category}`))
  const service = config.services[idx]

  console.log()
  console.log(bold('  Current values:'))
  printService(service)
  console.log(dim('  Press Enter to keep the current value.\n'))

  service.name        = await ask(label('Name'),        service.name)
  service.description = await ask(label('Description'), service.description)
  service.url         = await ask(label('URL'),         service.url)
  service.icon        = await ask(label('Icon slug'),   service.icon)
  service.category    = await ask(label('Category'),    service.category)
  service.color       = await ask(label('Color (hex)'), service.color ?? '')
  if (!service.color) delete service.color

  const fav = await askYesNo(label('Favorite?'), service.favorite === true)
  if (fav) service.favorite = true
  else delete service.favorite

  console.log()
  console.log(bold('  Updated service:'))
  printService(service)

  const confirm = await askYesNo('  Save changes?')
  if (!confirm) { console.log(warn('\nCancelled. No changes saved.\n')); return }

  config.services[idx] = service
  saveConfig(config)
  console.log(ok(`\n  ✓ Service "${service.name}" updated.\n`))
  console.log(dim('  Refresh your browser to see the changes.\n'))
}

async function actionRemove() {
  const config = loadConfig()
  if (!config.services.length) {
    console.log(warn('\nNo services to remove.\n'))
    return
  }

  printHeader()
  console.log(bold('  Remove a Service\n'))
  printServiceTable(config.services)

  const idx = await pickFromList('Which service do you want to remove?', config.services.map((s) => `${s.name} ${dim(`(${s.id})`)} — ${s.category}`))
  const service = config.services[idx]

  console.log()
  console.log(bold('  Service to remove:'))
  printService(service)

  const confirm = await askYesNo(err(`  Delete "${service.name}" permanently?`), false)
  if (!confirm) { console.log(warn('\nCancelled.\n')); return }

  config.services.splice(idx, 1)
  saveConfig(config)
  console.log(ok(`\n  ✓ Service "${service.name}" removed.\n`))
  console.log(dim('  Refresh your browser to see the changes.\n'))
}

async function actionToggleFavorite() {
  const config = loadConfig()
  if (!config.services.length) {
    console.log(warn('\nNo services.\n'))
    return
  }

  printHeader()
  console.log(bold('  Toggle Favorites\n'))
  printServiceTable(config.services)

  const idx = await pickFromList('Which service?', config.services.map((s) => {
    const star = s.favorite ? ok('★ ') : '  '
    return `${star}${s.name} ${dim(`(${s.id})`)}`
  }))
  const service = config.services[idx]

  if (service.favorite) {
    delete service.favorite
    saveConfig(config)
    console.log(ok(`\n  ✓ "${service.name}" removed from favorites.\n`))
  } else {
    service.favorite = true
    saveConfig(config)
    console.log(ok(`\n  ✓ "${service.name}" added to favorites.\n`))
  }
}

async function actionSettings() {
  const config = loadConfig()
  printHeader()
  console.log(bold('  Dashboard Settings\n'))

  const s = config.settings ?? {}
  console.log(dim('  Press Enter to keep the current value.\n'))
  config.settings = {
    title:    await ask(label('Dashboard title'),    s.title    ?? 'Homelab'),
    subtitle: await ask(label('Dashboard subtitle'), s.subtitle ?? 'Infrastructure Dashboard'),
  }

  saveConfig(config)
  console.log(ok('\n  ✓ Settings saved.\n'))
  console.log(dim('  Refresh your browser to see the changes.\n'))
}

async function actionSort() {
  const config = loadConfig()
  printHeader()
  console.log(bold('  Sort Services\n'))

  const methods = ['By category, then name (A→Z)', 'By name (A→Z)', 'By category (A→Z)']
  const idx = await pickFromList('Sort by:', methods)

  config.services.sort((a, b) => {
    if (idx === 0) {
      const catCmp = (a.category ?? '').localeCompare(b.category ?? '')
      return catCmp !== 0 ? catCmp : (a.name ?? '').localeCompare(b.name ?? '')
    }
    if (idx === 1) return (a.name ?? '').localeCompare(b.name ?? '')
    return (a.category ?? '').localeCompare(b.category ?? '')
  })

  saveConfig(config)
  console.log(ok(`\n  ✓ Services sorted: ${methods[idx]}\n`))
}

// ─── Main menu ────────────────────────────────────────────────────────────────

const MENU = [
  { label: 'List all services',       action: actionList           },
  { label: 'Add a new service',       action: actionAdd            },
  { label: 'Edit a service',          action: actionEdit           },
  { label: 'Remove a service',        action: actionRemove         },
  { label: 'Toggle favorite ★',       action: actionToggleFavorite },
  { label: 'Sort services',           action: actionSort           },
  { label: 'Change dashboard title',  action: actionSettings       },
  { label: 'Exit',                    action: null                 },
]

async function mainMenu() {
  while (true) {
    printHeader()
    console.log(bold(`  Config: ${dim(CONFIG_PATH)}\n`))

    const idx = await pickFromList('What do you want to do?', MENU.map((m, i) => {
      if (i === MENU.length - 1) return dim(m.label)
      return m.label
    }))

    const { action } = MENU[idx]

    if (!action) {
      console.log(dim('\n  Goodbye!\n'))
      rl.close()
      process.exit(0)
    }

    console.log()
    await action()
    await ask(dim('  Press Enter to return to the menu…'))
  }
}

mainMenu()
