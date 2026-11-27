import { readFileSync, rmSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(scriptDir, '..')
const envExample = readFileSync(resolve(projectRoot, '.env.example'), 'utf8')
const childEnv = { ...process.env }

for (const match of envExample.matchAll(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/gm)) {
  childEnv[match[1]] = ''
}

// Limit Next.js build workers on Windows to avoid concurrent directory creation races.
if (process.platform === 'win32') childEnv.CIRCLE_NODE_TOTAL = '2'

rmSync(resolve(projectRoot, '.next'), { recursive: true, force: true })

const child = spawn(process.execPath, [resolve(projectRoot, 'node_modules', 'next', 'dist', 'bin', 'next'), 'build'], {
  cwd: projectRoot,
  env: childEnv,
  stdio: 'inherit',
})

child.on('error', (error) => {
  console.error('Failed to start next build:', error)
  process.exitCode = 1
})

child.on('close', (code) => {
  process.exit(code ?? 1)
})
