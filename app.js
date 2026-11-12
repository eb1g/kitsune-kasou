"use strict";

// きつね仮想 — ブラウザ仮想マシン
// 標準モード: v86 (WebAssembly x86 エミュレーター, 32bit)
// 64bit実験モード: v64 (v86 の x86_64 対応フォーク)。起動が重く、対応OSも限られます。
// プリセットは同梱のフリーなイメージだけ。Windows / ReactOS / Android-x86 は
// 利用者が自分のファイルを選んだときだけ、その場で読み込んで起動する。

const PRESETS = {
  linux:    { label: "Linux (Buildroot)", engine: "v86", cdrom: { url: "images/linux.iso" },  boot_order: 0x213, memory: 32 },
  linux3:   { label: "Linux 3",           engine: "v86", cdrom: { url: "images/linux3.iso" }, boot_order: 0x213, memory: 64 },
  kolibri:  { label: "KolibriOS",         engine: "v86", fda:   { url: "images/kolibri.img" }, boot_order: 0x231, memory: 32 },
  freedos:  { label: "FreeDOS",           engine: "v86", fda:   { url: "images/freedos722.img" }, boot_order: 0x231, memory: 32 },
  alpine64: { label: "Alpine Linux 64bit（実験）", engine: "v64",
              bzimage: { url: "images64/vmlinuz-virt" }, initrd: { url: "images64/initramfs-alpine.gz" },
              cmdline: "console=tty0 console=ttyS0 panic=-1", memory: 512 },
};

// 64bitモード用スパースHDD (qcow2)。ファイル自体は小さいが、ゲストからは大容量に見える。
const QCOW2_DISKS = {
  "100": { url: "disks/blank-100gb.qcow2", size: 262144, label: "100 GB" },
  "500": { url: "disks/blank-500gb.qcow2", size: 262144, label: "500 GB" },
};

const farm = document.getElementById("farm");
const template = document.getElementById("box-template");
let counter = 0;
const boxes = new Set();

function setStatus(box, text, running) {
  const el = box.el.querySelector(".status");
  el.textContent = text;
  el.classList.toggle("running", !!running);
}

function focusBox(box) {
  for (const other of boxes) {
    if (other.emu && typeof other.emu.keyboard_set_status === "function") {
      try { other.emu.keyboard_set_status(other === box); } catch (e) { /* API差異は無視 */ }
    }
  }
}

// ---------- エミュレーター起動 ----------

let v64ModulePromise = null;
function loadV64() {
  if (!v64ModulePromise) v64ModulePromise = import("./lib64/libv86.mjs");
  return v64ModulePromise;
}

async function startEmulator(box, extraConfig) {
  if (box.emu) return;
  const is64 = box.engine === "v64";
  let V86Ctor = window.V86;
  if (is64) {
    setStatus(box, "64bitエンジン読み込み中…", true);
    try {
      const mod = await loadV64();
      V86Ctor = mod.V86 || mod.default;
    } catch (err) {
      setStatus(box, "64bitエンジンの読み込みに失敗: " + err.message, false);
      return;
    }
  }
  const cfg = Object.assign({
    memory_size: box.memoryMB * 1024 * 1024,
    screen_container: box.el.querySelector(".screen_container"),
    bios: { url: "bios/seabios.bin" },
    vga_bios: { url: "bios/vgabios.bin" },
    autostart: true,
    disable_speaker: true,
  }, is64 ? {
    wasm_path: "lib64/v86.wasm",
    graphics_adapter: "bochs_vga",
    vram_size: 8 * 1024 * 1024,
    cpu_type: "x86_64",
    cpu_cores: box.cpuCores || 1,
    acpi: true,
    // 既定の sb16 はプラグインファイル (lib64/v86-sb16.js) を読みに行き、
    // 置いていないと起動自体がエラーになるため、音声なしを明示する
    audio_device: "none",
  } : {
    wasm_path: "lib/v86.wasm",
    vga_memory_size: 2 * 1024 * 1024,
  }, extraConfig);
  setStatus(box, "起動中…", true);
  try {
    box.emu = new V86Ctor(cfg);
  } catch (err) {
    setStatus(box, "起動失敗: " + err.message, false);
    box.emu = null;
    return;
  }
  if (box.emu.add_listener) {
    box.emu.add_listener("emulator-ready", () => setStatus(box, "動作中", true));
    box.emu.add_listener("emulator-error", (err) => {
      if (!box.emu) return;
      setStatus(box, "エラー: " + (err && err.message ? err.message : "起動に失敗しました"), false);
    });
  }
  box.powerBtn.textContent = "⏻ 電源OFF";
  focusBox(box);
}

function stopEmulator(box) {
  if (!box.emu) return;
  const emu = box.emu;
  box.emu = null;
  Promise.resolve(emu.destroy ? emu.destroy() : emu.stop()).catch(() => {});
  setStatus(box, "停止中", false);
  box.powerBtn.textContent = "⏻ 電源ON";
  const sc = box.el.querySelector(".screen_container");
  sc.innerHTML = '<div style="white-space: pre; font: 14px monospace; line-height: 14px"></div><canvas style="display: none"></canvas>';
}

function lockMouse(box) {
  if (box.emu && typeof box.emu.lock_mouse === "function") {
    try { box.emu.lock_mouse(); } catch (e) { /* ブラウザが拒否した場合は何もしない */ }
  }
}

async function qcow2Config(disk) {
  // qcow2 の size にはファイル自体のバイト数を渡す（ゲストには仮想サイズが見える）
  let size = disk.size || 0;
  if (!size) {
    try {
      const res = await fetch(disk.url, { method: "HEAD" });
      size = parseInt(res.headers.get("Content-Length") || "0", 10);
    } catch (e) { /* 下でエラーにする */ }
  }
  if (!size) throw new Error("ディスクファイルのサイズを取得できませんでした");
  return { url: disk.url, async: true, size, format: "qcow2" };
}

async function bootPreset(box) {
  if (box.presetKey === "custom" || box.presetKey === "custom64") {
    const file = document.getElementById("custom-file").files[0];
    if (!file) { setStatus(box, "イメージファイルを選んでください", false); return; }
    const type = document.getElementById("custom-type").value;
    const buffer = await file.arrayBuffer();
    const cfg = {};
    cfg[type] = { buffer };
    if (type === "hda") {
      box.hddBuffer = buffer;
      box.el.querySelector('[data-act="hdd-save"]').disabled = false;
    }
    let hasHdd = type === "hda";
    if (box.presetKey === "custom64") {
      // 64bitモード: qcow2 スパースHDD（CD-ROM接続のとき）
      const qEl = document.getElementById("custom-hdd-qcow2");
      const q = qEl ? qEl.value : "0";
      if (type !== "hda" && q !== "0" && QCOW2_DISKS[q]) {
        try {
          cfg.hda = await qcow2Config(QCOW2_DISKS[q]);
          box.qcow2 = true;
          hasHdd = true;
        } catch (err) {
          setStatus(box, err.message, false);
          return;
        }
      }
    } else {
      // 標準モード: 空の仮想ハードディスク（raw）を追加
      const hddEl = document.getElementById("custom-hdd");
      const hddMB = hddEl ? parseInt(hddEl.value, 10) : 0;
      if (type !== "hda" && hddMB > 0) {
        // 既に同じサイズのHDDがあれば中身ごと使い回す（電源入れ直しで初期化しない）
        if (!box.hddBuffer || box.hddBuffer.byteLength !== hddMB * 1024 * 1024) {
          box.hddBuffer = new ArrayBuffer(hddMB * 1024 * 1024);
        }
        cfg.hda = { buffer: box.hddBuffer };
        box.el.querySelector('[data-act="hdd-save"]').disabled = false;
        hasHdd = true;
      }
    }
    // 起動順序: HDDがある場合はHDD優先にする。空のHDDは起動できずCD/フロッピーに
    // フォールスルーするので、インストール開始時はCDから起動し、セットアップが
    // HDDを起動可能にした後の再起動ではHDDから続きが起動する（最初に戻らない）。
    cfg.boot_order = hasHdd ? 0x132 : type === "fda" ? 0x231 : 0x213;
    box.customCfg = cfg;
    startEmulator(box, cfg);
    return;
  }
  const p = PRESETS[box.presetKey];
  const cfg = { boot_order: p.boot_order };
  for (const k of ["cdrom", "fda", "hda", "bzimage", "initrd"]) if (p[k]) cfg[k] = p[k];
  if (p.cmdline) cfg.cmdline = p.cmdline;
  box.presetCfg = cfg;
  startEmulator(box, cfg);
}

// ---------- 画面キーボード（Windows風） ----------
// キーは KeyboardEvent.code 名で定義し、PS/2 スキャンコード(set1)に変換して送る。
const SCAN = {
  Escape: [0x01],
  Digit1: [0x02], Digit2: [0x03], Digit3: [0x04], Digit4: [0x05], Digit5: [0x06],
  Digit6: [0x07], Digit7: [0x08], Digit8: [0x09], Digit9: [0x0a], Digit0: [0x0b],
  Minus: [0x0c], Equal: [0x0d], Backspace: [0x0e], Tab: [0x0f],
  KeyQ: [0x10], KeyW: [0x11], KeyE: [0x12], KeyR: [0x13], KeyT: [0x14],
  KeyY: [0x15], KeyU: [0x16], KeyI: [0x17], KeyO: [0x18], KeyP: [0x19],
  BracketLeft: [0x1a], BracketRight: [0x1b], Enter: [0x1c], ControlLeft: [0x1d],
  KeyA: [0x1e], KeyS: [0x1f], KeyD: [0x20], KeyF: [0x21], KeyG: [0x22],
  KeyH: [0x23], KeyJ: [0x24], KeyK: [0x25], KeyL: [0x26],
  Semicolon: [0x27], Quote: [0x28], Backquote: [0x29], ShiftLeft: [0x2a], Backslash: [0x2b],
  KeyZ: [0x2c], KeyX: [0x2d], KeyC: [0x2e], KeyV: [0x2f], KeyB: [0x30],
  KeyN: [0x31], KeyM: [0x32], Comma: [0x33], Period: [0x34], Slash: [0x35],
  ShiftRight: [0x36], AltLeft: [0x38], Space: [0x39], CapsLock: [0x3a],
  F1: [0x3b], F2: [0x3c], F3: [0x3d], F4: [0x3e], F5: [0x3f], F6: [0x40],
  F7: [0x41], F8: [0x42], F9: [0x43], F10: [0x44], F11: [0x57], F12: [0x58],
  MetaLeft: [0xe0, 0x5b], ControlRight: [0xe0, 0x1d], AltRight: [0xe0, 0x38],
  ArrowUp: [0xe0, 0x48], ArrowLeft: [0xe0, 0x4b], ArrowRight: [0xe0, 0x4d], ArrowDown: [0xe0, 0x50],
  Delete: [0xe0, 0x53], Insert: [0xe0, 0x52], Home: [0xe0, 0x47], End: [0xe0, 0x4f],
  PageUp: [0xe0, 0x49], PageDown: [0xe0, 0x51], Pause: [0xe1, 0x1d, 0x45],
  ZenkakuHankaku: [0x29], IntlYen: [0x7d], IntlRo: [0x73],
  Convert: [0x79], NonConvert: [0x7b], KanaMode: [0x70],
};
const MODIFIERS = new Set(["ShiftLeft", "ShiftRight", "ControlLeft", "ControlRight", "AltLeft", "AltRight", "MetaLeft"]);
// 日本語配列（JIS）キーボード。[表示, code, 横幅(任意)]、表示の "|" の後ろは小さく出すサブ表記
const OSK_ROWS = [
  [["ESC", "Escape"], ["F1", "F1"], ["F2", "F2"], ["F3", "F3"], ["F4", "F4"], ["F5", "F5"], ["F6", "F6"], ["F7", "F7"], ["F8", "F8"], ["F9", "F9"], ["F10", "F10"], ["F11", "F11"], ["F12", "F12"], ["Pause", "Pause"], ["Insert", "Insert"], ["Delete", "Delete"]],
  [["半角/全角", "ZenkakuHankaku", 1.6], ["1|!", "Digit1"], ["2|\"", "Digit2"], ["3|#", "Digit3"], ["4|$", "Digit4"], ["5|%", "Digit5"], ["6|&", "Digit6"], ["7|'", "Digit7"], ["8|(", "Digit8"], ["9|)", "Digit9"], ["0", "Digit0"], ["-", "Minus"], ["^", "Equal"], ["¥", "IntlYen"], ["Back Space", "Backspace", 2]],
  [["Tab", "Tab", 1.5], ["Q|た", "KeyQ"], ["W|て", "KeyW"], ["E|い", "KeyE"], ["R|す", "KeyR"], ["T|か", "KeyT"], ["Y|ん", "KeyY"], ["U|な", "KeyU"], ["I|に", "KeyI"], ["O|ら", "KeyO"], ["P|せ", "KeyP"], ["@", "BracketLeft"], ["[", "BracketRight"]],
  [["Caps Lock|英数", "CapsLock", 1.9], ["A|ち", "KeyA"], ["S|と", "KeyS"], ["D|し", "KeyD"], ["F|は", "KeyF"], ["G|き", "KeyG"], ["H|く", "KeyH"], ["J|ま", "KeyJ"], ["K|の", "KeyK"], ["L|り", "KeyL"], [";", "Semicolon"], [":", "Quote"], ["]", "Backslash"], ["Enter", "Enter", 2.1]],
  [["Shift", "ShiftLeft", 2.2], ["Z|つ", "KeyZ"], ["X|さ", "KeyX"], ["C|そ", "KeyC"], ["V|ひ", "KeyV"], ["B|こ", "KeyB"], ["N|み", "KeyN"], ["M|も", "KeyM"], [",|ね", "Comma"], [".|る", "Period"], ["/|め", "Slash"], ["\\|ろ", "IntlRo"], ["Shift", "ShiftRight", 2.6]],
  [["Ctrl", "ControlLeft", 1.3], ["⊞|Win", "MetaLeft", 1.3], ["Alt", "AltLeft", 1.3], ["無変換", "NonConvert", 1.7], ["Space", "Space", 5], ["変換", "Convert", 1.7], ["カタカナ|ひらがな", "KanaMode", 1.9], ["Alt", "AltRight", 1.3], ["Ctrl", "ControlRight", 1.3]],
  [["Home", "Home"], ["PgUp", "PageUp"], ["PgDn", "PageDown"], ["End", "End"], ["←", "ArrowLeft"], ["↑", "ArrowUp"], ["↓", "ArrowDown"], ["→", "ArrowRight"]],
];

const BREAK_OVERRIDES = { Pause: [0xe1, 0x9d, 0xc5] };
function breakCode(make, code) {
  if (code && BREAK_OVERRIDES[code]) return BREAK_OVERRIDES[code];
  return make.length === 2 ? [0xe0, make[1] | 0x80] : [make[0] | 0x80];
}

function sendCombo(box, codes) {
  if (!box.emu) return;
  if (typeof box.emu.keyboard_send_scancodes === "function") {
    const downs = [], ups = [];
    for (const code of codes) {
      const make = SCAN[code];
      if (!make) continue;
      downs.push(...make);
      ups.unshift(...breakCode(make, code));
    }
    if (downs.length) box.emu.keyboard_send_scancodes(downs.concat(ups));
  } else if (typeof box.emu.keyboard_send_keys === "function") {
    box.emu.keyboard_send_keys(codes);
  }
}

function buildKeyboard(box) {
  const wrap = box.el.querySelector(".osk");
  box.mods = new Set();
  for (const rowDef of OSK_ROWS) {
    const row = document.createElement("div");
    row.className = "osk-row";
    for (const [label, code, flex] of rowDef) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "osk-key";
      if (label.includes("|")) {
        const [main, sub] = label.split("|");
        btn.innerHTML = "";
        btn.appendChild(document.createTextNode(main));
        const sm = document.createElement("small");
        sm.textContent = sub;
        btn.appendChild(sm);
      } else {
        btn.textContent = label;
      }
      if (flex) btn.style.flex = `${flex} 1 0`;
      btn.dataset.code = code;
      btn.addEventListener("pointerdown", (ev) => {
        ev.preventDefault();
        focusBox(box);
        if (!box.emu) return;
        if (MODIFIERS.has(code)) {
          if (box.mods.has(code)) { box.mods.delete(code); btn.classList.remove("active"); }
          else { box.mods.add(code); btn.classList.add("active"); }
          return;
        }
        sendCombo(box, [...box.mods, code]);
        // 修飾キーは1回の入力で解除（Windowsの画面キーボードと同じ挙動）
        box.mods.clear();
        wrap.querySelectorAll(".osk-key.active").forEach((b) => b.classList.remove("active"));
      });
      row.appendChild(btn);
    }
    wrap.appendChild(row);
  }
}

// ---------- localStorage への状態保存 ----------
// 状態データは gzip 圧縮して base64 で localStorage に保存する。
// localStorage の上限（一般に 5〜10MB程度）を超えると保存は失敗する。
function lsKey(box) {
  return `kitsune-vm-state-${box.presetKey}-${box.memoryMB}`;
}

function bufferToBase64(buf) {
  const bytes = new Uint8Array(buf);
  let bin = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}

function base64ToBuffer(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

async function packState(state) {
  if (typeof CompressionStream === "function") {
    try {
      const gz = await new Response(
        new Blob([state]).stream().pipeThrough(new CompressionStream("gzip"))
      ).arrayBuffer();
      return { gz: true, b64: bufferToBase64(gz) };
    } catch (e) { /* 圧縮できない環境ではそのまま保存 */ }
  }
  return { gz: false, b64: bufferToBase64(state) };
}

async function unpackState(payload) {
  const raw = base64ToBuffer(payload.data);
  if (payload.gz && typeof DecompressionStream === "function") {
    return await new Response(
      new Blob([raw]).stream().pipeThrough(new DecompressionStream("gzip"))
    ).arrayBuffer();
  }
  return raw;
}

// ---------- マシンの箱 ----------

function renderTitle(box) {
  const name = box.customName || box.defaultName;
  const coreNote = box.is64Box && box.cpuCores > 1 ? `・CPU ${box.cpuCores}コア` : "";
  box.el.querySelector(".box-title").textContent = `🦊 ${name} #${box.num}（RAM ${box.memoryMB}MB${coreNote}）`;
}

function createBox(presetKey, memoryMB, cpuCores, customName) {
  counter += 1;
  const el = template.content.firstElementChild.cloneNode(true);
  const isCustom = presetKey === "custom" || presetKey === "custom64";
  const is64Box = presetKey === "custom64" || (PRESETS[presetKey] && PRESETS[presetKey].engine === "v64");
  const defaultName = isCustom
    ? (presetKey === "custom64" ? "カスタムイメージ（64bit）" : "カスタムイメージ（32bit）")
    : PRESETS[presetKey].label;
  farm.appendChild(el);

  const box = {
    el, emu: null, presetKey, memoryMB, cpuCores: cpuCores || 1, num: counter,
    defaultName, customName: customName || "", is64Box,
    engine: presetKey === "custom64" || (PRESETS[presetKey] && PRESETS[presetKey].engine === "v64") ? "v64" : "v86",
    powerBtn: el.querySelector('[data-act="power"]'),
  };
  boxes.add(box);
  renderTitle(box);
  const titleEl = el.querySelector(".box-title");
  titleEl.title = "ダブルクリックで名前を変更";
  titleEl.addEventListener("dblclick", () => {
    const next = prompt("マシンの名前", box.customName || box.defaultName);
    if (next === null) return;
    box.customName = next.trim();
    renderTitle(box);
  });
  buildKeyboard(box);

  el.querySelector(".screen_container").addEventListener("mousedown", () => { focusBox(box); lockMouse(box); });
  box.powerBtn.addEventListener("click", () => { box.emu ? stopEmulator(box) : bootPreset(box); });
  el.querySelector('[data-act="kbd"]').addEventListener("click", () => {
    const osk = el.querySelector(".osk");
    osk.hidden = !osk.hidden;
    focusBox(box);
  });
  const bootHddBtn = el.querySelector('[data-act="boot-hdd"]');
  if (bootHddBtn && presetKey === "custom") bootHddBtn.hidden = false;
  if (bootHddBtn) bootHddBtn.addEventListener("click", () => {
    // 同じディスク内容のまま、起動順序だけHDD優先にして起動し直す
    if (!box.customCfg) return;
    const cfg = Object.assign({}, box.customCfg, { boot_order: 0x132 });
    box.customCfg = cfg;
    stopEmulator(box);
    startEmulator(box, cfg);
  });
  el.querySelector('[data-act="hdd-save"]').addEventListener("click", () => {
    if (!box.hddBuffer) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([box.hddBuffer], { type: "application/octet-stream" }));
    a.download = `kitsune-hdd-${box.num}.img`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  });
  el.querySelector('[data-act="restart"]').addEventListener("click", () => { if (box.emu && box.emu.restart) box.emu.restart(); });
  el.querySelector('[data-act="cad"]').addEventListener("click", () => {
    sendCombo(box, ["ControlLeft", "AltLeft", "Delete"]);
  });
  el.querySelector('[data-act="save"]').addEventListener("click", async () => {
    if (!box.emu || !box.emu.save_state) return;
    const state = await box.emu.save_state();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([state], { type: "application/octet-stream" }));
    a.download = `kitsune-vm-${box.num}.state.bin`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  });
  el.querySelector('[data-act="ls-save"]').addEventListener("click", async () => {
    if (!box.emu || !box.emu.save_state) { setStatus(box, "起動してから保存してください", false); return; }
    setStatus(box, "ブラウザに保存中…", true);
    try {
      const state = await box.emu.save_state();
      const packed = await packState(state);
      const payload = JSON.stringify({
        v: 1, gz: packed.gz, preset: box.presetKey, memory: box.memoryMB,
        savedAt: new Date().toISOString(), data: packed.b64,
      });
      localStorage.setItem(lsKey(box), payload);
      setStatus(box, `ブラウザに保存しました（${(payload.length / 1024 / 1024).toFixed(1)} MB）`, true);
    } catch (err) {
      setStatus(box, "保存失敗: ブラウザの保存容量の上限を超えた可能性があります", false);
    }
  });
  el.querySelector('[data-act="ls-restore"]').addEventListener("click", async () => {
    let payload = null;
    try { payload = JSON.parse(localStorage.getItem(lsKey(box)) || "null"); } catch (e) { /* 壊れたデータは無視 */ }
    if (!payload || !payload.data) { setStatus(box, "このマシンの保存データがブラウザにありません", false); return; }
    setStatus(box, "ブラウザから復元中…", true);
    try {
      const buf = await unpackState(payload);
      if (!box.emu) { await bootPreset(box); }
      if (box.emu && box.emu.restore_state) {
        await box.emu.restore_state(buf);
        setStatus(box, "動作中（ブラウザ保存から復元）", true);
      }
    } catch (err) {
      setStatus(box, "復元失敗: " + err.message, false);
    }
  });
  el.querySelector('[data-act="restore"]').addEventListener("change", async (ev) => {
    const f = ev.target.files[0];
    if (!f) return;
    if (!box.emu) { await bootPreset(box); }
    const buf = await f.arrayBuffer();
    if (box.emu && box.emu.restore_state) { await box.emu.restore_state(buf); setStatus(box, "動作中（復元済み）", true); }
  });
  el.querySelector('[data-act="full"]').addEventListener("click", () => {
    const sc = el.querySelector(".screen_container");
    if (sc.requestFullscreen) sc.requestFullscreen();
  });
  el.querySelector('[data-act="close"]').addEventListener("click", () => {
    stopEmulator(box);
    boxes.delete(box);
    el.remove();
  });
  return box;
}

// ---------- ランチャー ----------
// 古いキャッシュの index.html と混ざっても起動処理が止まらないよう、
// 要素の取得はすべて存在チェック付きで行う。
const $id = (id) => document.getElementById(id);
const presetSel = $id("preset");
const memorySel = $id("memory");
const cpuSel = $id("cpu-cores");
const nameInput = $id("machine-name");

function syncLauncher() {
  if (!presetSel) return;
  const v = presetSel.value;
  const custom = v === "custom" || v === "custom64";
  const row = $id("custom-row"); if (row) row.hidden = !custom;
  const raw = $id("hdd-raw-wrap"); if (raw) raw.hidden = v !== "custom";
  const qc = $id("hdd-qcow-wrap"); if (qc) qc.hidden = v !== "custom64";
  if (v === "alpine64" && memorySel) memorySel.value = "512";
}

if (presetSel) {
  presetSel.addEventListener("change", syncLauncher);
  // ランチャーの選択（OS・RAM・CPUコア）を localStorage に覚えておく
  try {
    const saved = JSON.parse(localStorage.getItem("kitsune-launcher") || "null");
    if (saved) {
      if (saved.preset) presetSel.value = saved.preset;
      if (saved.memory && memorySel) memorySel.value = saved.memory;
      if (saved.cpu && cpuSel) cpuSel.value = saved.cpu;
    }
  } catch (e) { /* 保存が無ければ既定値 */ }
  const saveLauncher = () => {
    try {
      localStorage.setItem("kitsune-launcher", JSON.stringify({
        preset: presetSel.value,
        memory: memorySel ? memorySel.value : "",
        cpu: cpuSel ? cpuSel.value : "",
      }));
    } catch (e) { /* 保存できない環境では何もしない */ }
  };
  presetSel.addEventListener("change", saveLauncher);
  if (memorySel) memorySel.addEventListener("change", saveLauncher);
  if (cpuSel) cpuSel.addEventListener("change", saveLauncher);
}

const addBtn = $id("add-box");
if (addBtn) {
  addBtn.addEventListener("click", () => {
    // 押した瞬間に箱を作って起動する
    const memoryMB = memorySel ? parseInt(memorySel.value, 10) || 64 : 64;
    const cpuCores = cpuSel ? parseInt(cpuSel.value, 10) || 1 : 1;
    const name = nameInput ? nameInput.value.trim() : "";
    const box = createBox(presetSel ? presetSel.value : "linux", memoryMB, cpuCores, name);
    bootPreset(box);
  });
}
syncLauncher();

// 最初に Linux を1台、起動した状態で表示する
window.addEventListener("load", () => {
  const box = createBox("linux", 64, 1, "");
  bootPreset(box);
  // 64bitエンジンは裏で先読みしておく（追加した瞬間に起動できるように）
  const preload = () => { loadV64().catch(() => {}); };
  if (typeof requestIdleCallback === "function") requestIdleCallback(preload, { timeout: 3000 });
  else setTimeout(preload, 1500);
});
