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
    acpi: true,
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
    const cfg = { boot_order: type === "fda" ? 0x231 : type === "cdrom" ? 0x213 : 0x132 };
    cfg[type] = { buffer };
    if (type === "hda") {
      box.hddBuffer = buffer;
      box.el.querySelector('[data-act="hdd-save"]').disabled = false;
    }
    if (box.presetKey === "custom64") {
      // 64bitモード: qcow2 スパースHDD（CD-ROM接続のとき）
      const q = document.getElementById("custom-hdd-qcow2").value;
      if (type !== "hda" && q !== "0" && QCOW2_DISKS[q]) {
        try {
          cfg.hda = await qcow2Config(QCOW2_DISKS[q]);
          box.qcow2 = true;
        } catch (err) {
          setStatus(box, err.message, false);
          return;
        }
      }
    } else {
      // 標準モード: 空の仮想ハードディスク（raw）を追加
      const hddMB = parseInt(document.getElementById("custom-hdd").value, 10);
      if (type !== "hda" && hddMB > 0) {
        box.hddBuffer = new ArrayBuffer(hddMB * 1024 * 1024);
        cfg.hda = { buffer: box.hddBuffer };
        box.el.querySelector('[data-act="hdd-save"]').disabled = false;
      }
    }
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
  Delete: [0xe0, 0x53],
};
const MODIFIERS = new Set(["ShiftLeft", "ShiftRight", "ControlLeft", "ControlRight", "AltLeft", "AltRight", "MetaLeft"]);
// [表示, code, 横幅(任意)]
const OSK_ROWS = [
  [["Esc", "Escape"], ["F1", "F1"], ["F2", "F2"], ["F3", "F3"], ["F4", "F4"], ["F5", "F5"], ["F6", "F6"], ["F7", "F7"], ["F8", "F8"], ["F9", "F9"], ["F10", "F10"], ["F11", "F11"], ["F12", "F12"]],
  [["`", "Backquote"], ["1", "Digit1"], ["2", "Digit2"], ["3", "Digit3"], ["4", "Digit4"], ["5", "Digit5"], ["6", "Digit6"], ["7", "Digit7"], ["8", "Digit8"], ["9", "Digit9"], ["0", "Digit0"], ["-", "Minus"], ["=", "Equal"], ["⌫", "Backspace", 2]],
  [["Tab", "Tab", 1.5], ["Q", "KeyQ"], ["W", "KeyW"], ["E", "KeyE"], ["R", "KeyR"], ["T", "KeyT"], ["Y", "KeyY"], ["U", "KeyU"], ["I", "KeyI"], ["O", "KeyO"], ["P", "KeyP"], ["[", "BracketLeft"], ["]", "BracketRight"], ["\\", "Backslash", 1.5]],
  [["Caps", "CapsLock", 1.8], ["A", "KeyA"], ["S", "KeyS"], ["D", "KeyD"], ["F", "KeyF"], ["G", "KeyG"], ["H", "KeyH"], ["J", "KeyJ"], ["K", "KeyK"], ["L", "KeyL"], [";", "Semicolon"], ["'", "Quote"], ["Enter", "Enter", 2.2]],
  [["Shift", "ShiftLeft", 2.2], ["Z", "KeyZ"], ["X", "KeyX"], ["C", "KeyC"], ["V", "KeyV"], ["B", "KeyB"], ["N", "KeyN"], ["M", "KeyM"], [",", "Comma"], [".", "Period"], ["/", "Slash"], ["Shift", "ShiftRight", 2.8]],
  [["Ctrl", "ControlLeft", 1.3], ["⊞", "MetaLeft", 1.3], ["Alt", "AltLeft", 1.3], ["Space", "Space", 6], ["Alt", "AltRight", 1.3], ["Ctrl", "ControlRight", 1.3], ["←", "ArrowLeft"], ["↑", "ArrowUp"], ["↓", "ArrowDown"], ["→", "ArrowRight"]],
];

function breakCode(make) {
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
      ups.unshift(...breakCode(make));
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
      btn.textContent = label;
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

// ---------- マシンの箱 ----------

function createBox(presetKey, memoryMB) {
  counter += 1;
  const el = template.content.firstElementChild.cloneNode(true);
  const isCustom = presetKey === "custom" || presetKey === "custom64";
  const name = isCustom
    ? (presetKey === "custom64" ? "カスタムイメージ（64bit実験）" : "カスタムイメージ")
    : PRESETS[presetKey].label;
  el.querySelector(".box-title").textContent = `🦊 ${name} #${counter}（RAM ${memoryMB}MB）`;
  farm.appendChild(el);

  const box = {
    el, emu: null, presetKey, memoryMB, num: counter,
    engine: presetKey === "custom64" || (PRESETS[presetKey] && PRESETS[presetKey].engine === "v64") ? "v64" : "v86",
    powerBtn: el.querySelector('[data-act="power"]'),
  };
  boxes.add(box);
  buildKeyboard(box);

  el.querySelector(".screen_container").addEventListener("mousedown", () => { focusBox(box); lockMouse(box); });
  box.powerBtn.addEventListener("click", () => { box.emu ? stopEmulator(box) : bootPreset(box); });
  el.querySelector('[data-act="mouse"]').addEventListener("click", () => lockMouse(box));
  el.querySelector('[data-act="kbd"]').addEventListener("click", () => {
    const osk = el.querySelector(".osk");
    osk.hidden = !osk.hidden;
    focusBox(box);
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

const presetSel = document.getElementById("preset");
function syncLauncher() {
  const v = presetSel.value;
  const custom = v === "custom" || v === "custom64";
  document.getElementById("custom-row").hidden = !custom;
  document.getElementById("hdd-note").hidden = !custom;
  document.getElementById("hdd-raw-wrap").hidden = v !== "custom";
  document.getElementById("hdd-qcow-wrap").hidden = v !== "custom64";
  if (v === "alpine64") document.getElementById("memory").value = "512";
}
presetSel.addEventListener("change", syncLauncher);
document.getElementById("add-box").addEventListener("click", () => {
  const memoryMB = parseInt(document.getElementById("memory").value, 10);
  const box = createBox(presetSel.value, memoryMB);
  bootPreset(box);
});
syncLauncher();

// 最初に Linux を1台、起動した状態で表示する
window.addEventListener("load", () => {
  const box = createBox("linux", 64);
  bootPreset(box);
});
