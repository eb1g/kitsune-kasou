import './styles.css'

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

function getOs() {
  return osOptions.find((os) => os.id === appState.selectedOS)
}

function addLog(text, type = 'info') {
  appState.logs.push({ time: formatTime(), type, text })
  renderLogs()
}

function setConsole(lines) {
  appState.consoleLines = lines
  renderConsole()
}

function render() {
  const os = getOs()
  const state = stateLabels[appState.status]
  root.innerHTML = `
    <div class="app-shell">
      <div class="ambient ambient-one"></div>
      <div class="ambient ambient-two"></div>
      <header class="topbar">
        <a class="brand" href="#top" aria-label="きつね仮想 ホーム">
          <span class="brand-mark">${icons.fox}</span>
          <span class="brand-copy"><strong>きつね仮想</strong><small>Browser VM Studio</small></span>
        </a>
        <div class="topbar-right">
          <span class="outline-pill"><i class="pulse-dot"></i> ローカル実行</span>
          <span class="topbar-separator"></span>
          <span class="version">v0.8.4 beta</span>
          <button class="icon-button" id="resetAll" aria-label="セッションをリセット" title="セッションをリセット">${icons.refresh}</button>
        </div>
      </header>

      <main id="top">
        <section class="hero">
          <div class="hero-copy">
            <p class="eyebrow"><span>01</span> LOCAL VIRTUALIZATION LAB</p>
            <h1>OSを選んで、<br><span>すぐに起動。</span></h1>
            <p class="hero-description">ISOやIMGを読み込み、ブラウザの中で仮想OSを立ち上げる。<br>きつね仮想は、x86互換OSを軽く試せるローカルVMランチャーです。</p>
            <div class="hero-note"><span class="note-icon">${icons.check}</span><span>ファイルはこのブラウザ内で処理され、サーバーへ送信されません。</span></div>
          </div>
          <div class="hero-meta">
            <div class="system-card"><span class="system-label">ENGINE</span><strong>WASM</strong><span class="system-detail">x86 emulation ready</span></div>
            <div class="system-card"><span class="system-label">SESSION</span><strong>LOCAL</strong><span class="system-detail">private by default</span></div>
            <div class="system-card"><span class="system-label">STATUS</span><strong class="status-value ${state.tone}"><i class="status-dot"></i>${state.label}</strong><span class="system-detail">${appState.status === 'running' ? 'VM is online' : 'awaiting command'}</span></div>
          </div>
        </section>

        <section class="workspace-grid">
          <div class="control-column">
            <div class="section-heading"><div><p class="eyebrow"><span>02</span> CREATE INSTANCE</p><h2>新しい仮想マシン</h2></div><span class="instance-id">KITSUNE-001</span></div>

            <div class="panel os-panel">
              <div class="panel-topline"><div><span class="panel-kicker">OPERATING SYSTEM</span><h3>起動するOSを選択</h3></div><span class="required-label">必須</span></div>
              <div class="os-options">${osOptions.map((item) => `<button class="os-option ${item.id === appState.selectedOS ? 'selected' : ''}" data-os="${item.id}"><span class="os-glyph ${item.color}">${item.glyph}</span><span class="os-text"><strong>${item.name}</strong><small>${item.detail}</small></span><span class="radio-mark">${item.id === appState.selectedOS ? icons.check : ''}</span></button>`).join('')}</div>
            </div>

            <div class="panel image-panel">
              <div class="panel-topline"><div><span class="panel-kicker">BOOT MEDIA</span><h3>イメージファイル</h3></div><span class="format-hint">ISO / IMG</span></div>
              <div class="file-grid">
                <label class="dropzone ${appState.isoFile ? 'has-file' : ''}" for="isoInput">
                  <input id="isoInput" type="file" accept=".iso,application/x-iso9660-image" />
                  <span class="file-icon">${icons.upload}</span>
                  <span class="dropzone-copy"><strong>${appState.isoFile ? appState.isoFile.name : 'ISOファイルを選択'}</strong><small>${appState.isoFile ? `${formatBytes(appState.isoFile.size)} · 読み込み済み` : 'OSインストーラー / ディスクイメージ'}</small></span>
                  <span class="browse-label">参照</span>
                </label>
                <label class="dropzone compact ${appState.floppyFile ? 'has-file' : ''}" for="floppyInput">
                  <input id="floppyInput" type="file" accept=".img,application/octet-stream" />
                  <span class="file-icon floppy-icon">${icons.floppy}</span>
                  <span class="dropzone-copy"><strong>${appState.floppyFile ? appState.floppyFile.name : 'フロッピーを追加'}</strong><small>${appState.floppyFile ? `${formatBytes(appState.floppyFile.size)} · 読み込み済み` : '任意 · .img'}</small></span>
                  ${appState.floppyFile ? `<button class="clear-file" data-clear="floppy" aria-label="フロッピーを削除">×</button>` : ''}
                </label>
              </div>
              <button class="demo-link" id="demoImage">${icons.play} サンプルISOで試す <span>Ubuntu 24.04 LTS</span></button>
              <p class="field-error" id="fileError"></p>
            </div>

            <div class="panel config-panel">
              <div class="panel-topline"><div><span class="panel-kicker">VIRTUAL HARDWARE</span><h3>構成をカスタマイズ</h3></div><span class="format-hint">${appState.memory} MB · ${appState.cpu} CPU · ${appState.disk} GB</span></div>
              <div class="config-grid">
                <label class="config-field"><span class="field-label">${icons.memory} メモリ</span><span class="select-wrap"><select id="memorySelect"><option value="1024" ${appState.memory === '1024' ? 'selected' : ''}>1 GB</option><option value="2048" ${appState.memory === '2048' ? 'selected' : ''}>2 GB</option><option value="4096" ${appState.memory === '4096' ? 'selected' : ''}>4 GB</option><option value="8192" ${appState.memory === '8192' ? 'selected' : ''}>8 GB</option></select>${icons.chevron}</span></label>
                <label class="config-field"><span class="field-label">${icons.cpu} CPUコア</span><span class="stepper"><button data-cpu="down" aria-label="CPUを減らす">−</button><output>${appState.cpu}</output><button data-cpu="up" aria-label="CPUを増やす">＋</button></span></label>
                <label class="config-field disk-field"><span class="field-label">${icons.disk} 仮想ディスク <b>${appState.disk} GB</b></span><input id="diskRange" type="range" min="8" max="128" step="8" value="${appState.disk}" /><span class="range-scale"><small>8 GB</small><small>128 GB</small></span></label>
              </div>
            </div>

            <p class="validation-message" id="validationMessage"></p>
            <div class="action-row"><button class="secondary-button" id="clearButton">${icons.refresh} クリア</button><button class="primary-button ${appState.status !== 'idle' ? 'danger' : ''}" id="powerButton">${appState.status === 'idle' ? icons.power : appState.status === 'running' ? icons.power : icons.play}<span>${appState.status === 'idle' ? '仮想マシンを起動' : appState.status === 'running' ? '仮想マシンを停止' : '処理中…'}</span></button></div>
          </div>

          <aside class="right-column">
            <div class="section-heading side-heading"><div><p class="eyebrow"><span>03</span> INSTANCE OVERVIEW</p><h2>起動前サマリー</h2></div><span class="live-badge ${state.tone}"><i class="status-dot"></i>${state.label}</span></div>
            <div class="panel summary-panel">
              <div class="summary-machine"><span class="machine-icon ${os.color}">${os.glyph}</span><div><strong>${os.name} VM</strong><span>${appState.isoFile ? appState.isoFile.name : '起動メディア未選択'}</span></div><span class="machine-status ${state.tone}"></span></div>
              <div class="summary-divider"></div>
              <dl class="summary-list"><div><dt>ブートメディア</dt><dd>${appState.isoFile ? '<span class="ok-mark">'+icons.check+'</span> ISO 接続済み' : '未選択'}</dd></div><div><dt>フロッピー</dt><dd>${appState.floppyFile ? '<span class="ok-mark">'+icons.check+'</span> IMG 接続済み' : 'なし'}</dd></div><div><dt>メモリ</dt><dd>${Number(appState.memory).toLocaleString()} MB</dd></div><div><dt>CPU</dt><dd>${appState.cpu} コア</dd></div><div><dt>ディスク</dt><dd>${appState.disk} GB</dd></div></dl>
              <div class="summary-foot"><span class="foot-icon">${icons.alert}</span><span>x86互換イメージが対象です。実行にはブラウザのメモリとCPUを使用し、タブを閉じるとセッションは終了します。</span></div>
            </div>

            <div class="console-card panel"><div class="console-head"><span><i class="live-dot"></i> VM CONSOLE</span><span>${icons.external} x86 / ${appState.status === 'running' ? 'online' : 'standby'}</span></div><div class="console-screen" id="consoleScreen">${renderConsoleLines()}</div><div class="console-footer"><span>INPUT CAPTURE</span><span class="key-hint">クリックしてフォーカス</span></div></div>
          </aside>
        </section>

        <section class="logs-section"><div class="logs-head"><div><p class="eyebrow"><span>04</span> EVENT STREAM</p><h2>起動ログ</h2></div><span class="log-count" id="logCount">${appState.logs.length} events</span></div><div class="log-list" id="logList">${renderLogItems()}</div></section>

        <footer class="footer"><div class="footer-brand"><span class="footer-mark">${icons.fox}</span><span>きつね仮想</span></div><p>ブラウザで試す、ローカル仮想化。 <span>© 2026 Kitsune Virtual Lab</span></p><div class="footer-links"><a href="#top">About</a><a href="#top">Privacy</a><a href="#top">Docs ${icons.external}</a></div></footer>
      </main>
    </div>
  `
  bindEvents()
  if (appState.realBoot) mountV86Screen()
}

function renderLogItems() {
  return appState.logs.slice().reverse().map((log) => `<div class="log-item"><span class="log-time">${log.time}</span><span class="log-type ${log.type}">${log.type === 'info' ? 'INFO' : log.type === 'success' ? 'OK' : 'SYS'}</span><span class="log-text">${log.text}</span></div>`).join('')
}

function renderLogItemsToElement() {
  const list = document.querySelector('#logList')
  if (list) list.innerHTML = renderLogItems()
  const count = document.querySelector('#logCount')
  if (count) count.textContent = `${appState.logs.length} events`
}

function renderLogs() { renderLogItemsToElement() }

function renderConsoleLines() {
  return appState.consoleLines.map((line) => `<div class="console-line ${line.type}">${line.text || '&nbsp;'}</div>`).join('')
}

function renderConsole() {
  const screen = document.querySelector('#consoleScreen')
  if (screen) {
    screen.innerHTML = renderConsoleLines()
    screen.scrollTop = screen.scrollHeight
  }
}

function updateStatusChrome() {
  const state = stateLabels[appState.status]
  const statusValue = document.querySelector('.status-value')
  const liveBadge = document.querySelector('.live-badge')
  const machineStatus = document.querySelector('.machine-status')
  const powerButton = document.querySelector('#powerButton')
  const consoleMeta = document.querySelector('.console-head > span:last-child')
  if (statusValue) {
    statusValue.className = `status-value ${state.tone}`
    statusValue.innerHTML = `<i class="status-dot"></i>${state.label}`
  }
  if (liveBadge) {
    liveBadge.className = `live-badge ${state.tone}`
    liveBadge.innerHTML = `<i class="status-dot"></i>${state.label}`
  }
  if (machineStatus) machineStatus.className = `machine-status ${state.tone}`
  if (powerButton) {
    powerButton.className = `primary-button ${appState.status === 'running' ? 'danger' : ''}`
    powerButton.disabled = appState.status === 'stopping'
    powerButton.querySelector('span').textContent = appState.status === 'idle' ? '仮想マシンを起動' : appState.status === 'running' ? '仮想マシンを停止' : appState.status === 'booting' ? '起動を停止' : '処理中…'
  }
  if (consoleMeta) consoleMeta.innerHTML = `${icons.external} x86 / ${appState.status === 'running' ? 'online' : 'standby'}`
}

function mountV86Screen() {
  const screen = document.querySelector('#consoleScreen')
  if (!screen || !appState.isoFile || appState.isoFile.demo) return
  if (!window.V86) {
    appState.realBoot = false
    showError('実行エンジンを読み込めませんでした。ネットワーク接続を確認して再試行してください。')
    return
  }
  screen.innerHTML = '<div id="v86Screen" class="v86-screen-container"><div></div><canvas></canvas></div>'
  const options = {
    wasm_path: 'https://copy.sh/v86/build/v86.wasm',
    screen_container: document.querySelector('#v86Screen'),
    bios: { url: 'https://copy.sh/v86/bios/seabios.bin' },
    vga_bios: { url: 'https://copy.sh/v86/bios/vgabios.bin' },
    cdrom: { buffer: appState.isoFile },
    fda: appState.floppyFile ? { buffer: appState.floppyFile } : undefined,
    memory_size: Number(appState.memory) * 1024 * 1024,
    vga_memory_size: 8 * 1024 * 1024,
    autostart: true,
    disable_speaker: true,
  }
  try {
    appState.emulator = new window.V86(options)
    appState.emulator.add_listener('download-progress', (progress) => {
      const percent = progress.total ? Math.round(progress.loaded / progress.total * 100) : 0
      if (percent === 100 || progress.file_index === progress.file_count - 1) addLog(`v86: ${progress.file_name.split('?')[0].split('/').pop()} を読み込み中… ${percent}%`, 'muted')
    })
    appState.emulator.add_listener('emulator-ready', () => {
      appState.status = 'running'
      addLog(`${getOs().name} を実際のx86エミュレーターで起動しました。`, 'success')
      updateStatusChrome()
    })
    appState.emulator.add_listener('emulator-started', () => {
      if (appState.status === 'booting') {
        appState.status = 'running'
        addLog('ゲストOSのCPU実行を開始しました。コンソールをクリックして操作できます。', 'success')
        updateStatusChrome()
      }
    })
    appState.emulator.add_listener('download-error', (error) => {
      appState.status = 'idle'
      appState.realBoot = false
      addLog(`v86の読み込みに失敗しました: ${error.file_name}`, 'muted')
      showError('BIOSまたはWebAssemblyエンジンの読み込みに失敗しました。')
      render()
    })
  } catch (error) {
    appState.status = 'idle'
    appState.realBoot = false
    addLog(`エミュレーターの初期化に失敗しました: ${error.message}`, 'muted')
    showError('このブラウザでは実OS起動を開始できませんでした。')
    render()
  }
}

function bindEvents() {
  document.querySelectorAll('[data-os]').forEach((button) => button.addEventListener('click', () => {
    if (appState.status !== 'idle') return
    appState.selectedOS = button.dataset.os
    addLog(`${getOs().name} を起動対象に設定しました。`, 'info')
    render()
  }))

  document.querySelector('#isoInput')?.addEventListener('change', (event) => {
    const file = event.target.files[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.iso')) {
      showError('ISO形式のファイルを選択してください。')
      event.target.value = ''
      return
    }
    appState.isoFile = file
    addLog(`ISOをマウントしました: ${file.name}`, 'success')
    render()
  })

  document.querySelector('#floppyInput')?.addEventListener('change', (event) => {
    const file = event.target.files[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.img')) {
      showError('フロッピーはIMG形式のファイルを選択してください。')
      event.target.value = ''
      return
    }
    appState.floppyFile = file
    addLog(`IMGフロッピーを接続しました: ${file.name}`, 'success')
    render()
  })

  document.querySelector('#demoImage')?.addEventListener('click', () => {
    appState.isoFile = { name: 'ubuntu-24.04-live.iso', size: 1.8 * 1024 ** 3, demo: true }
    addLog('デモISOを読み込みました: ubuntu-24.04-live.iso', 'success')
    render()
  })

  document.querySelectorAll('[data-clear]').forEach((button) => button.addEventListener('click', (event) => {
    event.preventDefault()
    appState[`${button.dataset.clear}File`] = null
    render()
  }))

  document.querySelector('#memorySelect')?.addEventListener('change', (event) => { appState.memory = event.target.value; render() })
  document.querySelector('#diskRange')?.addEventListener('input', (event) => { appState.disk = Number(event.target.value); const hint = document.querySelector('.format-hint'); if (hint) hint.textContent = `${appState.memory} MB · ${appState.cpu} CPU · ${appState.disk} GB` })
  document.querySelectorAll('[data-cpu]').forEach((button) => button.addEventListener('click', () => { appState.cpu = Math.min(8, Math.max(1, appState.cpu + (button.dataset.cpu === 'up' ? 1 : -1))); render() }))
  document.querySelector('#clearButton')?.addEventListener('click', clearSession)
  document.querySelector('#resetAll')?.addEventListener('click', clearSession)
  document.querySelector('#powerButton')?.addEventListener('click', handlePower)
}

function showError(message) {
  const target = document.querySelector('#validationMessage') || document.querySelector('#fileError')
  if (target) { target.innerHTML = `${icons.alert} ${message}`; target.classList.add('visible') }
  addLog(message, 'muted')
}

function clearSession() {
  timers.forEach(clearTimeout)
  timers = []
  if (appState.emulator) {
    appState.emulator.stop().catch(() => {})
    appState.emulator.destroy().catch(() => {})
  }
  appState.emulator = null
  appState.realBoot = false
  appState.isoFile = null
  appState.floppyFile = null
  appState.status = 'idle'
  appState.logs = [{ time: formatTime(), type: 'info', text: 'セッションをクリアしました。新しい仮想マシンを作成できます。' }]
  setConsole([{ type: 'dim', text: 'KITSUNE VM BIOS v0.8.4' }, { type: 'dim', text: 'Copyright (C) 2026 Kitsune Virtual Lab' }, { type: 'blank', text: '' }, { type: 'prompt', text: 'Press power to start your virtual machine_' }])
  render()
}

function handlePower() {
  if (appState.status === 'running' || (appState.status === 'booting' && appState.realBoot)) {
    stopVm()
    return
  }
  if (appState.status !== 'idle') return
  if (!appState.isoFile) {
    showError('起動するISOファイルを選択するか、サンプルISOを読み込んでください。')
    return
  }
  const os = getOs()
  if (!appState.isoFile.demo) {
    appState.status = 'booting'
    appState.realBoot = true
    addLog(`${os.name} ISOをv86へ渡しています。ローカルで実際にブートします…`, 'info')
    setConsole([{ type: 'amber', text: 'Preparing real x86 emulator…' }, { type: 'dim', text: `Boot media: ${appState.isoFile.name}` }, { type: 'dim', text: 'BIOS: SeaBIOS / VGA BIOS: vgabios' }, { type: 'blank', text: '' }, { type: 'amber', text: 'Downloading emulator runtime…' }, { type: 'cursor', text: '▌' }])
    render()
    updateStatusChrome()
    return
  }
  appState.status = 'booting'
  addLog(`${os.name} VM の電源を入れています…`, 'info')
  setConsole([{ type: 'dim', text: 'KITSUNE VM BIOS v0.8.4' }, { type: 'dim', text: 'Memory test ................. OK' }, { type: 'dim', text: `CPU ${appState.cpu} cores .............. OK` }, { type: 'dim', text: `Boot media: ${appState.isoFile.name}` }, { type: 'blank', text: '' }, { type: 'amber', text: 'Starting virtual machine…' }, { type: 'cursor', text: '▌' }])
  render()
  timers.push(setTimeout(() => { addLog('仮想CPUとメモリを割り当てました。', 'info'); setConsole([{ type: 'dim', text: 'KITSUNE VM BIOS v0.8.4' }, { type: 'dim', text: 'Memory test ................. OK' }, { type: 'dim', text: `CPU ${appState.cpu} cores .............. OK` }, { type: 'dim', text: `Boot media: ${appState.isoFile.name}` }, { type: 'blank', text: '' }, { type: 'green', text: 'Loading boot sector .......... OK' }, { type: 'green', text: 'Mounting virtual disk ........ OK' }, { type: 'amber', text: 'Loading guest kernel…' }, { type: 'cursor', text: '▌' }]); render() }, 900))
  timers.push(setTimeout(() => { appState.status = 'running'; addLog(`${os.name} VM が稼働中です。コンソールに接続しました。`, 'success'); setConsole([{ type: 'dim', text: 'KITSUNE VM BIOS v0.8.4' }, { type: 'green', text: 'Boot sequence completed ........ OK' }, { type: 'green', text: `Guest OS: ${os.name} / x86` }, { type: 'dim', text: `Memory: ${Number(appState.memory).toLocaleString()} MB · CPU: ${appState.cpu}` }, { type: 'blank', text: '' }, { type: 'green', text: `${os.name} is ready.` }, { type: 'prompt', text: 'kitsune@vm:~$ _' }]); render() }, 2100))
}

function stopVm() {
  if (appState.realBoot && appState.emulator) {
    appState.status = 'stopping'
    addLog('実OSエミュレーターを停止しています…', 'info')
    updateStatusChrome()
    Promise.resolve(appState.emulator.stop()).catch(() => {}).finally(() => {
      return Promise.resolve(appState.emulator.destroy()).catch(() => {})
    }).finally(() => {
      appState.emulator = null
      appState.realBoot = false
      appState.status = 'idle'
      addLog('実OSを停止しました。ISOは選択したままです。', 'success')
      setConsole([{ type: 'dim', text: 'KITSUNE VM BIOS v0.8.4' }, { type: 'dim', text: 'Guest powered off safely.' }, { type: 'blank', text: '' }, { type: 'prompt', text: 'Press power to start your virtual machine_' }])
      render()
    })
    return
  }
  appState.status = 'stopping'
  addLog('仮想マシンを安全に停止しています…', 'info')
  setConsole([{ type: 'amber', text: 'Sending shutdown signal…' }, { type: 'dim', text: 'Syncing virtual disk .......... OK' }, { type: 'cursor', text: '▌' }])
  render()
  timers.push(setTimeout(() => { appState.status = 'idle'; addLog('仮想マシンを停止しました。セッションは保持されています。', 'success'); setConsole([{ type: 'dim', text: 'KITSUNE VM BIOS v0.8.4' }, { type: 'dim', text: 'Guest powered off safely.' }, { type: 'blank', text: '' }, { type: 'prompt', text: 'Press power to start your virtual machine_' }]); render() }, 1000))
}

render()
