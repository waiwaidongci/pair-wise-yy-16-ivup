// Copies the task-provided runtime assets into public/ so Vite serves them as
// static files. Content photos come ONLY from mock-data/photos and fonts ONLY
// from assets/fonts — reference PNGs are never copied.
import { cpSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

rmSync(resolve(root, 'public', 'photos'), { recursive: true, force: true })
rmSync(resolve(root, 'public', 'fonts'), { recursive: true, force: true })

mkdirSync(resolve(root, 'public', 'photos'), { recursive: true })
cpSync(resolve(root, 'mock-data', 'photos'), resolve(root, 'public', 'photos'), { recursive: true })
mkdirSync(resolve(root, 'public', 'fonts'), { recursive: true })
cpSync(resolve(root, 'assets', 'fonts'), resolve(root, 'public', 'fonts'), { recursive: true })

console.log('synced public/photos <- mock-data/photos, public/fonts <- assets/fonts')
