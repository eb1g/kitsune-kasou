const icons = {
  fox: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 17 6 6l10 5c2.3-1.1 4.9-1.7 7.9-1.7s5.6.6 7.9 1.7L42 6l-2 11c.7 2 1 4.2 1 6.5C41 33.6 33.4 41 24 41S7 33.6 7 23.5c0-2.3.3-4.5 1-6.5Z" fill="currentColor" opacity=".2"/><path d="M8 17 6 6l10 5c2.3-1.1 4.9-1.7 7.9-1.7s5.6.6 7.9 1.7L42 6l-2 11c.7 2 1 4.2 1 6.5C41 33.6 33.4 41 24 41S7 33.6 7 23.5c0-2.3.3-4.5 1-6.5Z" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/><path d="M16 25c1.3 1.5 3.2 2.3 5.6 2.3M32 25c-1.3 1.5-3.2 2.3-5.6 2.3M20.5 33.5c1-.7 2.2-1 3.5-1s2.5.3 3.5 1M20 20h.01M28 20h.01" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>`,
  power: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v8M6.3 5.8a8 8 0 1 0 11.4 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  play: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7V5Z" fill="currentColor"/></svg>`,
  upload: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V4m0 0L8 8m4-4 4 4M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  chevron: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  cpu: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M9 2v3m6-3v3M9 19v3m6-3v3M2 9h3m-3 6h3m14-6h3m-3 6h3M10 10h4v4h-4z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
  memory: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14v9H5zM8 8V5m4 3V5m4 3V5M8 17v2m4-2v2m4-2v2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 11h.01M12 11h.01M16 11h.01" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>`,
  disk: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11L20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8 4v5h8V4M8 16h8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
  floppy: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h12l2 2v14H5V4Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8 4v5h8V4M8 15h8v5H8z" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>`,
  check: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  alert: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4 21 20H3L12 4Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 9v5m0 3h.01" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  terminal: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m7 9 3 3-3 3m5 0h4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 0 0-14.8-3L3 11m0 0V6m0 5h5M4 13a8 8 0 0 0 14.8 3L21 13m0 0v5m0-5h-5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  external: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v5M19 5l-8 8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 13v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
}


const stateLabels = {
  idle: { label: '未起動', tone: 'neutral' },
  booting: { label: '起動中', tone: 'amber' },
  running: { label: '稼働中', tone: 'green' },
  stopping: { label: '停止中', tone: 'amber' },
}


const osOptions = [
  { id: 'linux', name: 'Linux', detail: 'Ubuntu / Alpine', glyph: '⌁', color: 'green' },
  { id: 'windows', name: 'Windows', detail: '98 / 2000 / XP', glyph: '⊞', color: 'blue' },
  { id: 'android', name: 'Android', detail: 'x86 / AOSP', glyph: '◈', color: 'violet' },
]


const appState = {
  selectedOS: 'linux',
  isoFile: null,
  floppyFile: null,
  memory: '2048',
  cpu: 2,
  disk: 32,
  status: 'idle',
  emulator: null,
  realBoot: false,
  logs: [
    { time: '14:36:08', type: 'info', text: 'きつね仮想へようこそ。起動するOSを選択してください。' },
    { time: '14:36:08', type: 'muted', text: 'エンジン: WebAssembly / ローカルセッションを初期化済み' },
  ],
  consoleLines: [
    { type: 'dim', text: 'KITSUNE VM BIOS v0.8.4' },
    { type: 'dim', text: 'Copyright (C) 2026 Kitsune Virtual Lab' },
    { type: 'blank', text: '' },
    { type: 'prompt', text: 'Press power to start your virtual machine_' },
  ],
}


let timers = []


const root = document.querySelector('#root')


function formatTime() {
  return new Intl.DateTimeFormat('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date())
}


function formatBytes(bytes) {
  if (!bytes) return '未選択'
  const units = ['B', 'KB', 'MB', 'GB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** exponent).toFixed(exponent ? 1 : 0)} ${units[exponent]}`
}

